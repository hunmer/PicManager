var g_rpg = {
    init: () => {
        var d = {
            exp: 1000, // 未分配经验
            ability: 0, // 基础能力值
            charsets: [], // 角色
        };
        // g_player = d;
        g_player = local_readJson('player', d);
        var d = {
            charsets: {
                角色1: {
                    name: '角色1',
                    age: 18,
                    prefix: '',
                    tags: [], // 角色自带标签
                    story: '',
                    voices: {

                    },
                    message: {


                    },
                    image: {
                        icon: '',
                        large: '',
                    }

                }

            }, // 角色
        };
        g_shops = d;
        // g_shops = local_readJson('shops', d);
        registerAction('uploadImage', (dom, action, params) => {
            $('#input_img').prop('multiple', true).attr({
                'data-type': 'camera',
                'data-config': JSON.stringify({ quality: 0.7 })
            }).click();
        });
        registerAction('uploadImagefromNetwork', (dom, action, params) => {
            // 服务器IP 
            $.getJSON('http://127.0.0.1:41596/getServerIp', function(json, textStatus) {
                if (textStatus == 'success' && json.ip) {
                    json.ip+='/upload/'

                    loadJs('js/qrcode.min.js', () => {
                        var modal = modalOpen({
                            id: 'modal-custom-1',
                            type: 'dialog_uploadImagefromNetwork',
                            width: '80%',
                            title: '局域网上传',
                            html: `
                            <div class="text-center">
                                <p>你可以使用其他设备来上传图片</p>
                                <div id="qrcode" class="mx-auto" style="width: 128px; height: 128px;" ></div>
                                <p>${json.ip}</p>
                            </div>
                            `,
                            onShow: () => {
                                new QRCode("qrcode", {
                                    text: json.ip,
                                    width: 128,
                                    height: 128,
                                    colorDark: "#000000",
                                    colorLight: "#ffffff",
                                    correctLevel: QRCode.CorrectLevel.H
                                });
                            },
                            onClose: () => {
                                return true;
                            }
                        })
                    });
                    return;
                }
                alert('服务器未开启!');
            });
            // 生成二维码

        });
        registerAction('rpg_addExpFromImage', (dom, action, params) => {
            var val = g_rpg.dialogData['all'].getValue(true);
            g_rpg.addValue({ exp: val, ability: 10 });

            for (var img of $('.cameraImgs').find('img[data-md5]')) {
                g_database.saveImageToLocal({
                    src: img.src,
                    title: 'title',
                    tag: ['临摹'],
                    props: {
                        f: [g_cd.getImageValue('key')], // 关联原图
                        tl: g_cd.getImageValue('startAt'), // 关联时间记录
                    }
                }, (data) => {
                    toastPAlert(`恭喜你获得了${val}点经验`, 'alert-success', 2000);

                });
            }
            g_cd.cancelTimer('image', true);

        });
        // g_rpg.saveDialog({
        //     tags: ['a', 'b', 'c'],
        //     comment: 'aaaaaa',
        //     time: 3700
        // });
    },

    openCharestDialog: () => {
        var h = `<div classs="row">`;
        for (var d of g_shops.charsets) {
            var b = g_player.charsets[d.name];
            h += `
                <div class="col-4">
                    <div>
                        <img src="${d.image.large}" alt="${d.name}">
                    </div>
                    <button class="mt-10 btn btn-primary"` + (b ? ' disabled>已拥有' : '>购买') + `></button>
                </div>
            `
        }
        var modal = modalOpen({
            id: 'modal-custom',
            type: 'charset-list',
            title: '角色图鉴',
            html: h,
            onShow: () => {},
            onClose: () => {
                return true;
            }
        });
    },

    getPrefix: () => {

    },
    addValue: (opts) => {
        for (var k in opts) {
            if (g_player[k]) g_player[k] += opts[k];
        }
        local_saveJson('player', g_player);
        // todo 新窗口或者动态增长效果
    },
    updateDialog: (name) => {
        var text = g_rpg.dialogData[name].getText();
        if (typeof(text) == 'string') {
            $('tr[data-name="' + name + '"] .text-right').html(text);
        }
        if (name != 'all') g_rpg.updateDialog('all'); // 更新合计
    },
    uploadImage: (src) => {
        var md5 = getMD5(src);
        if ($('.cameraImgs').find('img[data-md5="' + md5 + '"]').length) {
            return alert1('图片已存在!');
        }
        $('.cameraImgs').prepend(`
            <div class="m-10">
                <div style="width: 75px;height: 78px;position:relative;">
                    <a class="btn btn-square rounded-circle btn-danger" onclick="$(this).parents('.m-10').remove();g_rpg.updateDialog('photo');" style="position: absolute;top: 0;right: 0;" role="button"> <i class="fa fa-trash-o" aria-hidden="true"></i></a>
                    <img data-md5="` + md5 + `" src="` + src + `" class="fit-image" data-action="openViewer">
                </div>
            </div>`);
        g_rpg.updateDialog('photo');
    },
    saveDialog: (d) => {
        var data = {
            tags: {
                title: `<i class="fa fa-tags mr-10" aria-hidden="true"></i>标签`,
                data: d.tags,
                tip: '150经验 * 标签数',
                getValue: function() {
                    return this.data.length;
                },
                getText: function(number) {
                    var i = this.getValue();
                    var r = i * 150;
                    if (number) return r;
                    return i + ' x 150 = ' + i * 150;
                }
            }, // 标记的标签
            time: {
                title: `<i class="fa fa-clock-o mr-10" aria-hidden="true"></i>时间`,
                data: d.time,
                tip: '100经验 * 分钟数',
                getValue: function() {
                    return Math.round(this.data / 60);
                },
                getText: function(number) {
                    var i = this.getValue();
                    var r = i * 100;
                    if (number) return r;
                    return i + ' x 100 = ' + i * 100;
                }
            }, // 花费的时间
            comment: {
                title: `<i class="fa fa-comment-o mr-10" aria-hidden="true"></i>评论`,
                tip: `<textarea id="textarea_comment" class="form-control" rows="2" title="80经验 * 文字数" placeholder="80经验 * 文字数" onkeyup="g_rpg.updateDialog('comment');">` + d.comment + `</textarea>`,
                getValue: function() {
                    var d = $('#textarea_comment');
                    if (!d.length) return 0;
                    return d.val().length;
                },
                getText: function(number) {
                    var i = this.getValue();
                    var r = i * 80;
                    if (number) return r;
                    return i + ' x 80 = ' + i * 80;
                }
            }, // 评论
            photo: {
                title: `<i class="fa fa-camera mr-10" aria-hidden="true"></i>照片`,
                tip: `
                    <div class=" cameraImgs" style="display: inline-flex">
                        <a class=" m-10" data-action="uploadImage">
                            <i class="fa fa-plus fa-5x fa-border" aria-hidden="true"></i>
                        </a>
                        <a class=" m-10" data-action="uploadImagefromNetwork">
                            <i class="fa fa-wifi fa-5x fa-border" aria-hidden="true"></i>
                        </a>
                    </div>
                `,
                getValue: function() {
                    return $('.cameraImgs img').length;
                },
                getText: function(number) {
                    var i = this.getValue();
                    var r = i * 1000;
                    if (number) return r;
                    return i + ' x 1000 = ' + r;
                }
            }, // 评论
            all: {
                // '<img src="'+g_database.getImageUrl(g_cd.opts['image'].key)+'" class="fit-image">'
                title: '',
                tip: `当前经验: ${g_player.exp}`,
                getValue: function() {
                    var i = 0;
                    for (var name in g_rpg.dialogData) {
                        if (name != 'all') {
                            var c = g_rpg.dialogData[name].getText(true);
                            i += c;
                        }
                    }
                    return i;
                },
                getText: function(number) {
                    var i = this.getValue();
                    if (number) return i;
                    return '合计: ' + i;
                }
            }, // 
        }
        g_rpg.dialogData = data;
        var modal = modalOpen({
            id: 'modal-custom',
            type: 'dialog_addExpFromImage',
            width: '100%',
            title: '结算',
            html: `
                <table class="table" >
                  <thead>
                    <tr>
                      <th class="w-100">*</th>
                      <th>经验转换</th>
                      <th class="text-right">获取的经验</th>
                    </tr>
                  </thead>
                  <tbody>

                     ` + (() => {
                var h = '';
                for (var name in data) {
                    var d = data[name];
                    h += `
                            <tr data-name="` + name + `">
                              <th>` + d.title + `</th>
                              <td>` + d.tip + `</td>
                              <td class="text-right">
                               ` + d.getText() + `
                              </td>
                            </tr>
                            `;
                }
                return h;
            })() + `
                        </tbody>
                    </table>
                    <div class="text-right mt-10">
                        <a class="btn" role="button" onclick="halfmoon.toggleModal('modal-custom')">取消</a>
                        <a data-action="rpg_addExpFromImage" class="btn btn-primary" role="button">结算</a>
                      </div>
            `,
            onShow: () => {
                g_rpg.updateDialog('comment');
                g_rpg.updateDialog('photo');
            },
            onClose: () => {
                return true;
            }
        });
    }

}

g_rpg.init();