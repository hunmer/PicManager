var g_autojs = {
    data: {},
    notif_id: 0,
    a_notif: {},
    log: (type, msg) => {
        var data = {
            type: type,
            msg: msg
        }
        if (typeof(_api) != 'undefined') {
            _api.method(data);
        } else {
            console.log(JSON.stringify(data));
        }
    },
    setOption: (key, value) => {
        g_autojs.log('setOption', { key: key, value: value });
    },
    notif: (id, opts, onClick) => {
        var data = Object.assign({
            id: id >= 0 ? id : ++g_autojs.notif_id,
            title: '',
            text: '',
            autoCancel: true,
            onGoing: false,
        }, opts);
        g_autojs.log('notification', data);
        data.onClick = onClick;
        g_autojs.a_notif[data.id] = data;
    },
    removeNotif: (id, run = true) => {
        if (g_autojs.a_notif[id]) {
            var data = g_autojs.a_notif[id];
            if (run && typeof(data.onClick) == 'function') data.onClick(id);
            if (data.onGoing && data.autoCancel) { // 不可关闭

            }
            delete g_autojs.a_notif[id];
            return true;
        }
        return false;
    },
    event: (name, checked) => {
        if (g_autojs.data.events[name]) {
            return g_autojs.data.events[name](checked);
        }
    },
    intent: (params) => {
        var id = params.replace('android.intent.action.id_', '').trim();
        if (!g_autojs.removeNotif(id)) {
            switch (id) {
                case 'clipboard':

                    break;
            }
        }
    },
    // 再次打开APP
    resume: (last, now) => {

        var t = (now - last) / 1000;
        //alert(getTime1(t));
    },
    // 进入后台
    pause: (last, now) => {},
    // ID从1开始,0好像被aj的前台服务给占了，不会更新而会新建
    initDefaultNotif: () => {
        // g_autojs.notif(1, {
        //       title: '离开时间 ' + getFormatedTime() + ', 要注意时间哦!',
        //       text: g_config.active_name ? '上个活动是 :' + g_config.active_name : '点击可返回APP',
        //       // autoCancel: false,
        //       // onGoing: true,
        //     });
    },
    // 加载设备数据
    load: (data) => {
        console.log(data);
        Object.assign(g_config.clientData, JSON.parse(data));
        local_saveJson('config', g_config);
    },
    reviceClipboard: (str) => {
        var str = decodeURI(str);
        if (str.length && str.indexOf('http') != -1) {
            g_database.importImagesFromUrls(str.split("\n"));
        }

    },
    ftb_show: () => {

    },
    ftb_hide: () => {

    },
    ftb_toggle: (show) => {

    },
    init: () => {
        g_autojs.data = {
            menu: {
                icon: "./favicon.ico",
                color: "",
                bgColor: '',
                btnSize: 30,
                padding: 8,
                animation: 510,
                autoClose: 3000,
            },
            events: {
                "按钮1": (checked) => {
                    g_autojs.log('importSavedPath', g_database.getAllImgs());
                },
                "按钮2": (checked) => {
                    g_autojs.log('openBroswer');
                },
                "按钮3": (checked) => {
                    g_autojs.log('switch');
                },
                "按钮4": (checked) => {
                    g_autojs.log('clearCache');
                },
                "按钮5": (checked) => {
                    g_autojs.log('clipboard');
                },
                "按钮6": (checked) => {
                    g_autojs.log('checkUpdate');
                },
                "按钮7": (checked) => {
                    g_autojs.log('exit');
                },
            },
            btns: {
                "按钮1": {
                    icon: "@drawable/ic_add_circle_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#019581',
                },
                //  icon: "@drawable/ic_play_arrow_black_48dp",
                // color: "#FFFFFF",
                // bgColor: '#41A4F5',
                // icon2: {
                //     icon: "@drawable/ic_stop_black_48dp",
                //     color: "#FFFFFF",
                //     bgColor: '#ED524E',
                // }

                "按钮2": {
                    icon: "@drawable/ic_language_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#41A4F5',
                },
                "按钮3": {
                    icon: "@drawable/ic_remove_red_eye_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#ED524E',
                },
                "按钮4": {
                    icon: "@drawable/ic_today_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#FCD633',
                },
                "按钮5": {
                    icon: "@drawable/ic_content_copy_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#BFBFBF',
                },
                "按钮6": {
                    icon: "@drawable/ic_system_update_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#BFBFBF',
                },
                "按钮7": {
                    icon: "@drawable/ic_input_black_48dp",
                    color: "#FFFFFF",
                    bgColor: '#BFBFBF',
                },
            }
        }


        registerAction('localFolder_remove', (dom, action, params) => {
            var path = $(dom).parent().prev().html();
            var i = g_config.clientData.paths.indexOf(path);
            if (i != -1) {
                g_config.clientData.paths.splice(i, 1);
                local_saveJson('config', g_config);
            }
            $(dom).parents('tr').remove();
        });


        registerAction('dialogGallery_img_click', (dom, action, params) => {
            $(dom).toggleClass('selected');
        });
        registerAction('localFolder_list', (dom, action, params) => {
            var modal = modalOpen({
                id: 'modal-custom',
                type: 'localFolder',
                width: '80%',
                title: '本地目录',
                html: `
                <table class="table">
                  <thead>
                    <tr>
                      <th class="w-25">#</th>
                      <th>Folder</th>
                      <th class="text-right"></th>
                    </tr>
                  </thead>
                  <tbody>

                     ` + (() => {
                    var h = '';
                    if (g_config.clientData.paths) {
                        for (var path of g_config.clientData.paths) {
                            h += `
                                <tr>
                                  <th><i class="fa fa-folder-o" aria-hidden="true"></i></th>
                                  <td>` + path + `</td>
                                  <td class="text-right">
                                    <i class="fa fa-trash-o text-danger text-right" aria-hidden="true" data-action="localFolder_remove"></i>
                                  </td>
                                </tr>
                                `;
                        }
                    }
                    return h;
                })() + `
                        </tbody>
                    </table>
                    <div class="text-right mt-10">
                        <a class="btn btn-primary" onclick="g_autojs.log('localFolder_set')" role="button">储存目录</a>
                        <a class="btn btn-primary" onclick="g_autojs.log('localFolder_add')" role="button">新增</a>
                      </div>
            `,
                onClose: () => {
                    return true;
                }
            });
        });
        // 安卓
        if (isApp()) {
            g_autojs.log('localFolder_list', JSON.stringify(g_config.clientData.paths));
            g_autojs.log('init', JSON.stringify({
                btns: g_autojs.data.btns,
                menu: g_autojs.data.menu,
            }));
        }
    },

    addImgFromUrls: (urls, data) => {
        g_autojs.importImages_data = data;
        if (typeof(urls) != 'object') urls = [urls];
        var showing = isModalOpen('modal-custom', 'addImgFromUrl');
        if (urls.length == 1 && !showing) {
            // 只导入一张不打开对话窗口
            return g_database.importImagesFromUrls(urls);
        }
        var h = '';
        for (var url of urls) {
            h += `
            <div class="grid-item">
                <div style="height: ` + arrayRandom([150, 175, 200]) + `px;background-color: ` + getRandomColor() + `;">
                  <img class="dialogGallery_img lazyload" data-action="dialogGallery_img_click" src="` + url + `" alt="` + url + `" title="` + url + `">
                </div>
            </div>`;
        }
        var onProgress = (modal) => {
            var loaded = 0;
            modal.find('.lazyload').lazyload()
            g_cache.dailogGallery.imagesLoaded().done(function(instance) {
                    g_cache.dailogGallery.isotope('layout');
                })
                .progress(function(instance, image) {
                    if (image.isLoaded) {
                        $(image.img).parents('div').css({ height: '', backgroundColor: '' });
                        g_cache.dailogGallery.isotope('layout');
                    }
                    loaded++;
                    $('#progress').html(loaded + '/' + instance.progressedCount);
                });
        }
        if (showing) {
            // 对话框展示中，把图片插到前面
            var items = $(h);
            onProgress(g_cache.dailogGallery.prepend(items).isotope('prepended', items));
        } else {
            var modal = modalOpen({
                id: 'modal-custom',
                type: 'addImgFromUrl',
                title: `
                <div class="row">
                    <div class="col text-left">
                        <a class="btn btn-primary" onclick="$('.dialogGallery_img').addClass('selected');" role="button">全选</a>
                        <a class="btn btn-primary" onclick="$('.dialogGallery_img').removeClass('selected');" role="button">全不选</a>
                    </div>
                    <div class="col text-center">导入图片</div>
                    <div class="col">
                        <span id="progress" class="float-right">0/0</span>
                    </div>
                </div>

            `,
                html: `
                <div id="dailogGallery" class="row">
                ` + h + `
                </div>
                <div class="text-right mt-10">
                    <a class="btn btn-primary" onclick="
                        var a=[];
                        for(var img of $('.dialogGallery_img.selected')) a.push(img.src);
                        g_database.importImagesFromUrls(a);
                        if(isModalOpen('modal-custom', 'addImgFromUrl')) halfmoon.toggleModal('modal-custom');
                    " role="button">导入</a>
                  </div>
            `,
                onShow: (modal) => {
                    g_cache.dailogGallery = modal.find('#dailogGallery').isotope({
                        itemSelector: '.grid-item',
                        percentPosition: true,
                        transitionDuration: 200,
                    });
                    onProgress(modal);
                },
                onClose: () => {
                    return true;
                }
            });
        }

    },
    localFolder_add: (path) => {
        path = path.replaceAll1('**', '\\');
        if (g_config.clientData.paths.indexOf(path) == -1) {
            g_config.clientData.paths.push(path);
            local_saveJson('config', g_config);
            doAction(null, 'localFolder_list');
            alert('成功添加扫描目录: ' + path + ',刷新生效!');
        } else {
            alert('目录已存在');
        }
    },
    localFolder_set: (path) => {
        path = path.replaceAll1('**', '\\');
        g_config.clientData.imgPath = path;
        local_saveJson('config', g_config);
        location.reload();
    },
    showImportProgress: (max) => {
        g_cache.importProgress = mobiscrollHelper.buildProgress({
            title: '导入图片中',
            max: max,
            onFinished: function() {
                // 由于没有传入数据。这里不做处理
                console.log('finish');
            }
        });
    },
    setImportProgress: (current) => {
        g_cache.importProgress && g_cache.importProgress.setProgress(current);
    },

    confirmUpdate: (url, files) => {
        if (typeof(files) == 'string') files = files.split(",");
        var max = files.length;
        if (max == 0) return alert1('无更新!');
        alert1({
            title: '可以更新 ' + max + ' 个文件',
            html: (() => {
                var h = '';
                for(var file of files){
                    h += `<span class="badge badge-primary m-5">${file}</span>`;
                }
                return h;
            })(),
            buttons: [{
                text: _l('更新'),
                handler: function(event) {
                    g_socket.send({
                        type: 'updateFiles',
                        url: url,
                        files: files,
                    });
                }
            }, 'cancel']
        })
    },
    showUpdateProgress: (max) => {
        g_cache.updateProgress = mobiscrollHelper.buildProgress({
            title: '更新中',
            max: max,
            onFinished: function() {
                location.reload();
            }
        });
    },
    setUpdateProgress: (current) => {
        g_cache.updateProgress && g_cache.updateProgress.setProgress(current);
    },
    checkUpdate: () => {
        prompt1('更新地址', g_config.updateUrl || '').then((url) => {
            if (!isEmpty(url)) {
                g_config.updateUrl = url;
                local_saveJson('config', g_config);
                g_autojs.log('checkUpdate', url);
            }
        })
    }
}

function getElementsUrl(elements) {
    var r = [];
    for (var d of elements) {
        r.push(d.src);
    }
    return r;
}
g_autojs.init();