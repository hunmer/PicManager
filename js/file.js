var g_file = {
    init: () => {
        $(function() {

            $('#input_img').on('change', function(event) {
                g_file.parseFiles(this, $(that).attr('data-type'), $(that).attr('data-config'));
                this.value = '';
            });

            registerAction('dialog_openImageFile', (dom, action, params) => {
                $('#input_img').prop('multiple', true).attr({
                    'data-type': 'images',
                    'data-config': JSON.stringify({ quality: 0.7 })
                }).click();
            });

            const fileDragHover = (e) => {
                e.stopPropagation();
                e.preventDefault();
                $('#file-drop').toggleClass('hover', e.type === 'dragover');
            }
            // 
            $('#file-drop').on('dragleave', e => fileDragHover(e));
            $('.content-wrapper').on('dragover', e => fileDragHover(e))
                .on('drop', function(e) {
                    e = e.originalEvent;
                    var files = e.target.files || e.dataTransfer.files;
                    fileDragHover(e);
                    g_file.parseFiles(files, 'images');
                })
        });

    },

    parseFiles: function(files, type, config) {

        if (config) {
            config = JSON.parse(config);
        } else {
            config = { width: 800, quality: 0.7 };
        }
        var len = files.length;

        var msgs = [];
        // todo 如果文件过大，提示是否压缩。
        var cnt = 0;
        var datas = {};
        var callback = (obj) => {
            var file = obj.origin;
            var fileName = file.name;

            getMD5(file, (md5) => {
                var finished = ++cnt == len;
                if (g_database.getImgData(md5)) {
                    msgs.push(`图片 ${fileName} , ${md5} 已存在!`);
                    return;
                }
                var base64 = obj.result || obj.base64;
                switch (type) {
                    case 'images':
                        datas[md5] = {
                            i: base64,
                            t: fileName,
                        }
                        if (finished) {
                            g_database.importImages(datas);
                        }
                        break;
                    case 'camera':
                        g_rpg.uploadImage(base64);
                        break;
                }

                if (finished && msgs.length) {
                    alert1(msgs.join("</br>"))
                }
            })
        }
        const toBase64 = (file) => {
            let reader = new FileReader();
            reader.origin = file;
            reader.readAsDataURL(file);
            reader.onloadend = (e) => callback(reader);
        }

        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.startsWith('image/')) continue;
            if (['camera'].indexOf(type) == -1) {
                // todo 可定义是否启用
                // todo 自定义大小
                if (f.size > 2 * 1024 * 1024) {
                    if (files.length == 1) {
                        if (confirm('此照片过大,是否压缩?')) {
                            resizeImage(f, config, rst => callback(rst));
                            continue;
                        }
                    }
                    // todo 多文件处理
                }
                toBase64(f);
                continue
            }
            resizeImage(f, config, rst => callback(rst));
        }
    }

}
g_file.init();