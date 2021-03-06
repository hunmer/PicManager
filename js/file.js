var g_file = {
    callbacks: {},
    openDialog: (type, multiple = false, opts = {}) => {
        Object.assign({
            lrz: { quality: 0.7 },
            cropper: false,
        }, opts);
        if (opts.callback) {
            g_file.callbacks[type] = opts;
        }

        $('#input_img').prop('multiple', multiple).attr({
            'data-type': type,
            'data-config': JSON.stringify(opts.lrz)
        }).click();
    },
    init: () => {
        $(function() {

            $('#input_img').on('change', function(event) {
                g_file.parseFiles(this.files, $(this).attr('data-type'), $(this).attr('data-config'));
                this.value = '';
            });

            registerAction('dialog_openImageFile', (dom, action) => {
                g_file.openDialog('images', true);
            });

            const inArea = (event, target) => {
                var point = { x: event.pageX, y: event.pageY }

                var area = $(target).offset();
                area = {
                    l: area.left,
                    t: area.top,
                    w: $(target).width(),
                    h: $(target).height(),
                }

                return point.x > area.l && point.x < area.l + area.w && point.y > area.t && point.y < area.t + area.h;
            }

            //    const getTarget = (paths) => {
            //     for (var path of paths) {
            //         if (path.id == 'msg_list') {
            //             return [path.id, '上传到消息'];
            //         }
            //         if (path.id == 'room_subContent_gallery') {
            //             return [path.id, '上传到房间画廊'];
            //         } else
            //         if (path.id == 'room_subContent_photo') {
            //             return [path.id, '上传到房间照片'];
            //         } else {
            //             continue;
            //         }
            //         break;
            //     }
            // }

            const fileDragHover = (e) => {
                e.stopPropagation();
                e.preventDefault();
              //  console.log(getTarget(e.originalEvent.path))
                $('#file-drop').toggleClass('drop_active', inArea(e, '.content-wrapper'));
            }

            $('#file-drop').on('dragleave', e => fileDragHover(e));
            $('.content-wrapper').on('dragover', e => fileDragHover(e))
                .on('drop', function(e) {
                    e = e.originalEvent;

                    var files = e.target.files || e.dataTransfer.files;
                    g_file.parseFiles(files, 'images');
                    $('#file-drop').toggleClass('drop_active', false);
                    e.stopPropagation();
                    e.preventDefault();
                });

            $('.sidebar').on('dragover', e => {
                var text = '保存到素材库';
                var target = $(e.target);
                if (target.hasClass('.folder-name')) {
                    // 目录
                    var folder = $(target).parents('[data-folder]').data('folder');
                    text = '保存到目录 : ' + folder;
                } else
                if (true) {
                    // 过滤器
                }
                // console.log(e);
                e.stopPropagation();
                e.preventDefault();
                $('#file-drop').find('h2').html(text);
            }).on('dragleave', e => {
                // console.log('leave');
                // e.stopPropagation();
                // e.preventDefault();
                // $('#file-drop').toggleClass('hover', inArea(e, '.content-wrapper'));
            });
            $('.content-wrapper').on('dragover', e => fileDragHover(e))
        });

    },

    parseFiles: function(files, type, config) {

        var len = files.length;
        if (len == 0) return;

        var msgs = [];
        // todo 如果文件过大，提示是否压缩。
        // todo 导入时显示导入的目录（修改提示文字）
        // todo 移动鼠标可选择导入目录
        var cnt = 0;
        var datas = {};
        var temp_arr = [];
        var callback = (obj) => {
            const onProgress = (obj, parmas) => {
                var finished = ++cnt == len;
                g_autojs.setImportProgress(cnt);
                var base64 = obj.result || obj.base64;
                switch (type) {
                    case 'room_sendImage': // 发送照片到聊天
                    case 'room_addImgs,gallery': // 上传图片到房间画廊
                    case 'room_addImgs,photo': // 上传图片到房间照片
                        temp_arr.push(base64);
                        if (finished) g_room.addImages(temp_arr, type);
                        break;
                    case 'icon':
                        // 裁剪
                        cropImage(base64, {}, () => {
                            $('#user_icon').attr('src', _cropper.getCroppedCanvas({ width: 50, height: 50 }).toDataURL('image/webp'));
                        });
                        break;
                    case 'images':
                        datas[parmas.md5] = {
                            i: base64,
                            n: fileName,
                        }
                        if (finished) {
                            g_database.importImages(datas, (i) => {
                                if (i > 0) {
                                    toastPAlert('成功导入' + i + '张图片!', 'alert-success');
                                } else {
                                    toastPAlert('图片已经存在!', 'alert-danger');
                                }
                            });
                        }
                        break;
                    case 'camera':
                        g_rpg.uploadImage(base64);
                        break;

                    default: // 自定义
                        if (g_file.callbacks[type]) {
                            var opts = g_file.callbacks[type];
                            if (opts.cropper) {
                                cropImage(base64, opts.cropper, opts.callback);
                            } else {
                                opts.callback(base64);
                            }
                        }

                        break;
                }

                if (finished && msgs.length) {
                    alert1(msgs.join("</br>"))
                }
            }

            if (cnt == 0) {
                g_autojs.showImportProgress(len);
            }
            var file = obj.origin;
            var fileName = file.name;

            if (['images'].includes(type)) {
                getMD5(file, async (md5) => {
                    var pic = await g_database.getImgData(md5);
                    if (pic) {
                        msgs.push(`图片 ${fileName} , ${md5} 已存在!`);
                        return;
                    }
                    onProgress(obj, { md5: md5 });
                });
                return;
            }
            onProgress(obj);
        }

        const toBase64 = (file) => {
            let reader = new FileReader();
            reader.origin = file;
            reader.readAsDataURL(file);
            reader.onloadend = (e) => callback(reader);
        }

        if (config) {
            config = JSON.parse(config);
        } else {
            config = { width: 800, quality: 0.7 };
        }

        var paths = [];
        for (var i = 0, f; f = files[i]; i++) {
            if (f.path) { // 从electron接受文件
                if (f.path.substr(-2) == '\\') { // 目录
                    // todo 可以添加到监测目录
                    if (!confirm('你确定要导入目录: ' + f.paths + ' 里的图片吗?')) continue;
                }
                paths.push(f.path);
                continue;
            }
            if (!f.type.startsWith('image/')) continue;

            // if (['camera'].indexOf(type) == -1) {
            //     // todo 可定义是否启用
            //     // todo 自定义大小
            //     if (f.size > 2 * 1024 * 1024) {
            //         if (files.length == 1) {
            //             if (confirm('此照片过大,是否压缩?')) {
            //                 resizeImage(f, config, rst => callback(rst));
            //                 continue;
            //             }
            //         }
            //         // todo 多文件处理
            //     }
            //     toBase64(f);
            //     continue
            // }
            resizeImage(f, config, rst => callback(rst));
        }
        if (paths.length) {
            g_socket.send({ type: 'scanFiles', files: paths });
        }
    }

}

function cropImage(src, opts, callback) {

    modalOpen({
        id: 'modal-custom-1',
        fullScreen: true,
        type: 'user',
        width: '80%',
        title: _l('crop_裁剪图片'),
        canClose: true,
        html: `
                      <img id="cropImage" class="w-full" src="${src}">
                      <button class="btn btn-primary mt-10 btn-block" onclick="if(!_cropper || _cropper._callback() !== false) halfmoon.toggleModal('modal-custom-1'); _cropper.destroy(); delete _cropper;">` + _l('crop_保存') + `</button>
                        `,
        onShow: () => {
            loadRes([
                { url: 'js/cropper.min.js', type: 'js' },
                { url: 'css/cropper.min.css', type: 'css' },
            ], () => {
                _cropper = new Cropper($('#cropImage')[0], Object.assign({
                    aspectRatio: 1 / 1,
                    viewMode: 3,
                }, opts));
                _cropper._callback = callback;
            })
        },
        onClose: () => {
            return true;
        }
    });
}
var _cropper;
g_file.init();