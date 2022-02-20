var g_folders = {};

var g_database = {
    preInit: () => {
        g_database.init();
    },
    init: () => {
        var now = new Date().getTime();
        g_folders = local_readJson('folders', {});
        if (Object.keys(g_folders) == 0) {
            // todo 把这个文件夹在搞特殊一点..
            g_folders[now] = {
                name: '稍等在画',
                desc: '咕咕咕',
                imgs: [],
            }
        }
        if (_GET['test'] && !g_database.getFolder('Folder2')) {
            // g_folders[now] = {
            //        name: 'Folder2',
            //        desc: '',
            //        imgs: [],
            //    }
            for (var i = 1; i < 90; i++) {
                // g_folders[now].imgs.push('test' + i);
                g_database.saveImgData('test' + i, {
                    n: 'test_' + i,
                    d: 'i am ' + i, // 备注
                    r: 'http://www.baidu.com', // 来源
                    i: './imgs/' + i + '.jpg?t=' + new Date().getTime(), // 图片
                    t: ['tag1', 'tag2'], // 标签
                    c: now, // 创建日期
                    m: {},
                    f: [], // 关联的其他图片的md5,主要用于标记临摹的原图
                    // tl: 1642758448233, // 关联临摹时间记录
                    // m: {
                    //  1642758448233: {
                    //      t: '100_100',
                    //      a: 'n_10_10',
                    //  },
                    //  1642758448333: {
                    //      t: '200_200',
                    //      a: 'n_20_20',
                    //  },
                    //  1642758669333: {
                    //      t: 'area',
                    //      a: 's_40_80_10_30', // 正方形, 起点x 终点x 起点y 终点y
                    //  },
                    //  1642758678333: {
                    //      t: 'area',
                    //      a: 'c_60_80_40_60', // 圆形 起点 终点
                    //  },
                    // }, // 评论
                });
            }
            local_saveJson('folders', g_folders);
        }
        g_database.initFolders();

        registerAction('setFilter', (dom, action, params) => {
            // hideSidebar();
            $('.active_text').removeClass('active_text')
            $(dom).addClass('active_text');
            g_database.setFilter($(dom).attr('data-value'));
        });


        registerAction('downloadData', (dom, action, params) => {
            if (isApp()) {
                g_autojs.log('saveData');
            } else {
                downloadData(getDataString(), 'PicManager_data.json');
            }
        });
        registerAction('resetData', (dom, action, params) => {
            if (confirm('你確定重置吗？')) {
                local_clearAll(confirm('是否保留图片目录?') ? ['config'] : []);
                if (!isApp()) {
                    location.reload();
                } else {
                    g_autojs.log('clearCache');

                }
            }
        });


        registerAction('loadFolder', (dom, action, params) => {
            // hideSidebar();
            g_database.loadFolder($(dom).attr('data-folder'));
        });

        let hideFolder_rm = () => {
            if (g_database.folder_rm.dialog) g_database.folder_rm.dialog.mobiscroll('hide');
        }

        registerAction('folder_delete', (dom, action, params) => {
            hideFolder_rm();
            var folder = action[1] || g_database.folder_rm.folder;
            if (folder) {
                if (confirm('确定删除吗?')) {
                    delete g_folders[folder];
                    local_saveJson('folders', g_folders);
                    g_database.initFolders();
                }
            }
        });


        registerAction('downloadUnsavedImages', (dom, action, params) => {
            confirm1('此操作会尝试下载图库中的网络图片到本地，确定吗?(可能需要开启代理)', (value) => {
                if (value) g_database.downloadUnsavedImages();
            });
        });
        registerAction('folder_rename', (dom, action, params) => {
            hideFolder_rm();
            var folder = action[1] || g_database.folder_rm.folder;
            if (folder) {
                var name = prompt('请输入新名字');
                if (typeof(name) == 'string' && name.length) {
                    if (g_database.getFolder(name)) {
                        alert('名字已经存在!');
                        return doAction(dom, action, params)
                    }
                    g_folders[folder].name = name;
                    local_saveJson('folders', g_folders);
                    g_database.initFolders();
                }
            }
        });

        registerAction('folder_setGroup', (dom, action, params) => {
            hideFolder_rm();

            var folder = action[1] || g_database.folder_rm.folder;
            if (folder) {
                var groups = Object.keys(g_config.folderGrpups);
                var h = mobiscrollHelper.buildMulitSelect({
                    id: 'mulitselect-demo',
                    data: groups,
                    selected: groups.filter((group) => {
                        return g_config.folderGrpups[group].indexOf(folder) != -1;
                    })
                });
                console.log(h);
                var dialog = mobiscroll_($('#mobi_div').html(h), 'select', {
                    minWidth: 200,
                    closeOnOverlayTap: false,
                    headerText: '为目录设置分类',
                    buttons: [{
                            text: _l('确定'),
                            handler: function(event, instance) {
                                var selected = instance.getVal();
                                for (var i = 0; i < groups.length; i++) {
                                    var group = groups[i];
                                    if (selected.indexOf(String(i)) != -1) {
                                        // 选中
                                    }

                                }

                            }
                        }, {
                            text: _l('取消'),
                            handler: 'cancel'
                        },
                        {
                            text: _l('新建分类'),
                            handler: function(event, instance) {
                                var name = prompt('输入分类名称');
                                if (typeof(name) == 'string' && name.length) {
                                    if (groups.indexOf(name) != -1) {
                                        return alert('名字已存在!');
                                    }
                                    g_config.folderGrpups[name] = [];
                                    local_saveJson('config', g_config);
                                    doAction(dom, 'folder_setGroup');
                                }
                            }
                        }
                    ],
                });
            }
        });

        registerContextMenu('.sidebar-link[data-action="loadFolder"]', (dom, event) => {
            var d = $(dom);
            var dialog = mobiscroll_($('#mobi_div').html(`
                <div id="widget">
                    <div class="md-dialog">
                        <h4 data-action="folder_rename" class="hover" ><i class="fa fa-pencil mr-10"aria-hidden="true"></i>
                        重命名</h4>
                        <h4 data-action="folder_setGroup" class="hover" ><i class="fa fa-inbox mr-10"aria-hidden="true"></i>
                            <span>设置分组</span><span class="badge badge-pill badge-primary ml-10">0</span></h4>
                        <h4  data-action="folder_delete" class="text-danger hover"><i class="fa fa-trash-o mr-10" aria-hidden="true"></i>
                            删除</h4>
                    </div>
                </div>
                `), 'widget', {
                closeOnOverlayTap: true,
                headerText: d.find('.folder-name').html(),
                buttons: [],
            });
            g_database.folder_rm = {
                folder: d.data('folder'),
                dialog: dialog,
            }
        });
       

        registerAction('newFolder', (dom, action, params) => {
            prompt1('创建新目录', (folder) => {
                if (typeof(folder) == 'string' && folder.length) {
                    if (g_database.getFolder(folder)) {
                        return alert('目录已经存在');
                    }
                    g_folders[new Date().getTime()] = {
                        name: folder,
                        imgs: []
                    }
                    local_saveJson('folders', g_folders);
                    g_database.initFolders();
                }
            });

        });
        // g_database.loadImage('test10');
        // return;
    },

    showSaveDialog: (data) => {
        if(!data.length) data = [data];
        var keys 
        var selected = [];
        var list = {}
        var folders = g_database.getFolders();
        for(folder in folders){
            var d = folders[folder];
            list[folder] = d.name;
            if(data.length == 1 && d.imgs.includes(data[0])){ // 选中
                selected.push(folder);
            }
        }
        console.log(list, selected);
            var h = $(mobiscrollHelper.buildMulitSelect({
                id: 'mulitselect-demo',
                name: data.length+'张图片',
                data: list,
                selected: selected
            })).prepend('body');
            var dialog = mobiscroll_(h, 'select', {
                minWidth: 200,
                closeOnOverlayTap: false,
                headerText: '设置保存目录',
                buttons: [{
                    text: _l('确定'),
                    handler: function(event, instance) {
                        var vals = instance.getVal();
                        console.log(vals);

                        // g_database.importImages(data, (i) => {
                        //     toastPAlert('成功导入'+i+'张图片!');
                        //     g_database.saveToFolder(vals);
                        // });
                    }
                }, {
                    text: _l('取消'),
                    handler: 'cancel'
                }],
            });
            console.log(dialog);
    },

    // 获取目录分组
    getFolderGroup: () => {
        return g_config.folderGrpups;
    },


    // 根据md5获取本地文件路径
    getLocalFile: async (key) => {
        var d = await g_database.getImgData(key);
        if (d && ['jpg', 'png'].indexOf(d.i) != -1) {
            return key.substr(0, 1) + '/' + key + '.' + d.i;
        }
    },

    // 获取所有为保存到本地的图片
    downloadUnsavedImages: async () => {
        var res = {};
        for (var md5 of await g_database.filterImage({ "url": "data.i.startsWith('http')" })) {
            res[md5] = await g_database.getImgData(md5)['i'];
        }
        g_socket.send({
            type: 'downloadImages',
            data: res
        });
    },
    saveImageToLocal: (opts, done) => {
        if (!opts.src) return;
        sendRequest({
            url: 'http://127.0.0.1:41596/',
            type: 'post',
            data: Object.assign({ type: 'image', title: '' }, opts),
            done: (data) => {
                done && done(data);
            }
        });
    },

    importImages: (datas, callback, filter = {}) => {
        console.log(datas);
        var i = 0;
        var now = new Date().getTime();
        for (var key in datas) {
            i++;
            datas[key].c = now;
            g_database.saveImgData(key, datas[key], false);
        }
        if (i > 0 && typeof(callback) == 'function') callback(i);
        if (i > 100) return location.reload();

        // 如果这些图片满足现在所展示的过滤界面则实时更新界面
        (async () => {
            // todo 导入的图片超出一定数量 只展示部分或者刷新？
            if (JSON.stringify(filter) == JSON.stringify(g_config.filter)) {
                var h = '';

                for (var md5 in datas) {
                    $('.grid-item[data-md5="' + md5 + '"]').remove();
                    h += await g_gallery.getImageHtml(md5, datas[md5])
                }
                g_gallery.loadHtml(h, { insertMode: 'prepend' });
            }
        })();
    },





    // 从手机导入图片
    importLocalImages: (datas) => {
        console.log(datas);
        if (typeof(datas) == 'string') datas = JSON.parse(datas);
        var r = {};
        //var overwrite = confirm('是否完全覆盖!?') && confirm('你确定吗?图片的附带数据(标签..)会被清空!!!');
        for (var d of datas) {
            // if(!overwrite && await g_database.getImgData(d.m)){
            //     continue;
            // }
            r[d.m] = {
                i: d.f,
                c: d.t,
                s: d.s
            }
        }
        g_database.importImages(r, (i) => {
            toastPAlert('成功导入' + i + '图片', 'alert-success', 2000, '导入成功');
        })
    },

    // 批量导入图片
    importImagesFromUrls: (urls, callback) => {

        if (typeof(urls) == 'string') urls = [urls];
        var r = {};
        for (var url of urls) {
            var c = g_autojs.importImages_data || {};
            var key = getMD5(url);
            r[key] = c[key] || {
                i: url,
            }
        }
        delete g_autojs.importImages_data;
        console.log(r);
        if (callback === undefined) {
            callback = (i) => {
                toastPAlert('成功导入' + i + '图片', 'alert-success', 2000, '导入成功');
            }
        }
        g_database.importImages(r, callback)
    },

    // 名字获取目录主键
    getFolder: (name) => {
        for (var key in g_folders) {
            if (g_folders[key].name == name) {
                return key;
            }
        }
    },

    getFolders: () => {
        return g_folders;
    },

    // 获取最近保存了图片的目录
    getRecentFolder: () => {
        return Object.keys(g_folders).sort((a, b) => {
            return g_folders[b].lastSaved || 0 - g_folders[a].lastSaved || 0;
        });
    },

    // 保存图片到目录
    saveToFolder: (folders, keys) => {
        if(!Array.isArray(folders)) folders = [folders];
        var i = 0;
        for(var folder of folders){
            for (var key of keys) {
                if (g_folders[folder].imgs.indexOf(key) == -1) {
                    i++;
                    g_folders[folder].imgs.push(key);
                }
            }
        }
        
        if (i) {
            local_saveJson('folders', g_folders);
            g_database.initFolders();
        }
    },

    // 选择了图片
    selectImage: async (md5) => {
        if (g_database.showingData && g_database.showingData.md5 == md5) return g_database.showingData;
        var d = await g_database.getImgData(md5);
        if (d) {
            g_database.showingImage = md5;
            g_database.showingData = d;
            return d;
        }
        return false;
    },

    // 加载图片
    loadImage: async (md5) => {
        var d = await g_database.selectImage(md5)
        if (d) {
            $('#div_detail img').attr('src', await g_database.getImageUrl(md5, d.i));
            $('#detail_link').val(d.r);

            g_cd.initElement(md5);
            loadImage(await g_database.getImageUrl(md5, d.i, false));
        }

    },

    getImageUrl: async (md5, url, thumb = true) => {
        // url 如果是文件格式 则是本地文件
        if (!url) {
            var d = await g_database.getImgData(md5);
            url = d.i;
        }
        if (url.startsWith('data:')) return url;

        if (['jpg', 'png'].indexOf(url) != -1 && location.protocol == 'file:') {
            return g_config.clientData.imgPath + '/' + md5.substr(0, 1) + '/' + md5 + '.' + url + (thumb ? '.thumb' : '');
        }

        return getImageUrl(url, thumb);
    },

    // 加载图片信息
    loadImageDetail: (md5) => {
        g_database.selectImage(md5).then(d => {
            if (d) {
                if (!$('#div_detail').hasClass('hide')) {
                    $('#tag_count').html(d.t.length);
                    $('#textarea_title').html(d.n);
                    $('#textarea_desc').html(d.d);
                    $('#detail_createAt .text-right').html(getFormatedTime(5, d.c));
                    g_database.loadTags();
                    loadDetailImage();
                }
            }
        })

    },

    loadTags: () => {
        var h = '';
        for (var tag of g_database.showingData.t) {
            h += `<span class="badge badge-pill">` + tag + `</span>`;
        }
        $('#tags').html(h);
    },

    // 加载所有目录
    initFolders: () => {
        var h = ``;
        for (var key in g_folders) {
            var d = g_folders[key];
            h += `
            <a data-action="loadFolder" data-folder="` + key + `" class="sidebar-link sidebar-link-with-icon row` + (g_database.folder == key ? ' active_text' : '') + `">
                    <span class="sidebar-icon col-auto">
                        <i class="fa fa-folder-open-o" aria-hidden="true"></i>
                    </span>
                    <span class="col folder-name">` + d.name + `</span>
                    <span class="col text-right">` + d.imgs.length + `</span>
                </a>
             `;
        }
        $('#folders').html(h);
    },

    // 加载目录
    loadFolder: (key) => {
        if (g_folders[key]) {
            delete g_config.filter;
            g_config.lastOpenFolder = key;
            local_saveJson('config', g_config);

            g_database.folder = key;
            $('.active_text').removeClass('active_text')
            $('[data-action="loadFolder"][data-folder="' + key + '"]').addClass('active_text');

            // $('.navbar-brand').html(`
            //  <i class="fa fa-folder-open-o mr-10" aria-hidden="true"></i>
            //              <span class="d-none d-sm-flex">lyricRecorder</span>
            // `);

            g_database.setFilter({
                folder: key
            });
        }
    },
    getImgsData: async (keys, sort = 0) => {
        var r = {};
        var l = [];
        for (var md5 of keys) {
            r[md5] = await g_database.getImgData(md5);
            l.push(md5);
        }
        switch (sort) {
            case 1: // 新到旧
                l = l.sort((a, b) => {
                    return r[b].c - r[a].c;
                });
                break;

            case 2: // 旧到新
                l = l.sort((a, b) => {
                    return r[a].c - r[b].c;
                });
                break;

            default:
                return r;
        }
        var n = {};
        for (var md5 of l) {
            n[md5] = r[md5];
        }
        return n;
    },
    // 加载多个图片
    loadItems: (items) => {
        showContent('gallery');
        g_database.getImgsData(items, 1).then(datas => {
            g_page.setList('gallery', {
                index: 0, // 默认页数
                lastIndex: 0, // 最后加载的索引
                pagePre: 10, // 每页加载
                timeout: 3000,
                element: '.content-wrapper', // 绑定元素
                datas: datas,
                bottomHtml: `
                <div class="grid-item w-full">
                    <h4 class="text-center mt-20">到底啦...</h4>
                </div>
            `,
                parseItem: function(index, key, data) {
                    return g_gallery.getImageHtml(key, data, index);
                },
                done: function(h) {
                    var data = {};
                    if (this.lastIndex > 0) {
                        data.insertMode = 'append';
                    }
                    g_gallery.loadHtml(h, data);
                }
            });
            g_page.nextPage('gallery');
        })

    },



    filterImage: async (filter) => {
        if (filter['pratice']) {
            return g_cd.getImageList();
        }

        var imgs = new Set(filter['folder'] ? g_database.getFoldersImgs(filter['folder']) : await g_database.getAllImgs())
        var opts = Object.keys(filter);
        for (var md5 of imgs.keys()) {
            var data = await g_database.getImgData(md5);
            // eval判断，不符合条件的删除
            loop:
                for (var opt of opts) {
                    switch (opt) {
                        case 'tag_cnt': // 标签数量
                            var l = data['t'] ? data['t'].length : 0;
                            if (!eval(filter['tag_cnt'].replaceAll('{i}', l))) {
                                imgs.delete(md5);
                                break loop;
                            }
                            break;

                        default:
                            if (!eval(filter[opt])) {
                                imgs.delete(md5);
                                break loop;
                            }
                            break;
                    }
                }
        }

        return Array.from(imgs);
    },

    // 过滤图片

    setFilter: async function(filter) {
        if (typeof(filter) != 'object') filter = JSON.parse(filter);
        delete g_config.lastOpenFolder;
        g_config.filter = filter;
        local_saveJson('config', g_config);
        g_database.loadItems(await g_database.filterImage(filter));
    },

    // 获取目录下的所有图片
    getFoldersImgs: function(keys) {
        if (!keys) {
            keys = Object.keys(g_folders);
        } else
        if (typeof(keys) != 'array') {
            keys = [keys];
        }

        var res = [];
        for (var key of keys) {
            res = res.concat(g_folders[key].imgs);
        }
        return res;
    },

    // 获取目录下的所有图片
    getAllImgs: async function(cache = true) {
        // if (cache && g_imgCache.size) {
        //     return g_imgCache;
        // }
        var res = [];
        for (var name of g_store.tables) {
            var keys = await g_store.keys(name);
            res = res.concat(keys);
        }
        g_imgCache = new Set(res);
        local_saveJson('keys', Array.from(g_imgCache));
        return res;
    },

    imageExists: (key) => {
        return g_imgCache.has(key);
    },

    // 获取图片数据
    getImgData: (md5) => {
        var k = md5.substr(0, 1).toLowerCase();
        return g_store.get(k, md5);
    },

    // 删除图片
    removeImgData: function(md5, update = true) {
        g_imgCache.delete(md5);
        var k = md5.substr(0, 1).toLowerCase();
        g_store.remove(k, md5);
        if (update) {
            // todo: 如果正在预览图片
            $('.grid-item[data-md5="' + md5 + '"]').remove();
        }
    },


    // 保存图片数据
    saveImgData: function(md5, data) {
        g_imgCache.add(md5);

        // _D('save', arguments);
        var k = md5.substr(0, 1).toLowerCase();

        // if(data.i.startWith('data:image/') && ){
        //     // 

        // }else{
        g_store.set(k, md5, data);
        //}
        return k;
    },



}

g_database.preInit();