var g_poseCache = {};
var g_pose_selected = {};
// toPage(1);

var g_pose = {
    pageMax: 30,
    asias: {
        gender: ['male', 'female'],
        style: ['martial-arts-poses', 'sensual', 'superhero', 'casual', 'action', 'combat', 'pinup', 'fantasy', 'gymnastics', 'figure-drawing', 'horror'],
        action: ["riding", "flying", "jumping", "punching", "fighting", "floating", "dancing", "kneeling", "kicking", "lying", "running", "crouching", "sitting", "standing", "walking", "squating", "stretching", "bending", "handstand", "falling", "lunging"],
        props: ["skateboard", "none", "gun", "bow", "coffee-cup", "sword", "staff", "chair", "balance-beam"],
    },
    cache: {},
    preload: function() {
        registerAction('loadPlugin_pose', (dom, action, params) => {
            if (!g_pose.inited) {
                g_pose.init();
                showContent('pose');
            }
        });
        // $(function() {
        //     setTimeout(() => doAction(null, 'loadPlugin_pose'), 2000);
        // });
    },
    loadScripts: function(callback) {
        loadRes([
            { url: './js/pose/onAction.js', type: 'js' },
            { url: './js/pose/pose-list.js', type: 'js' },
        ], () => {
            callback && callback();
        }, false)
    },
    init: function() {
        if (this.inited) return;
        this.inited = true;

        this.registerContent();
        this.loadScripts(() => {
            // test
            var h = `
                <div class="dropdown dropup" id="dropdown_pose_filter">
                  <button class="btn" data-toggle="dropdown" type="button"  aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-filter" aria-hidden="true"></i>
                  </button>

                  <div class="dropdown-menu" aria-labelledby="dropdown_pose_filter">
                    <div class="dropdown-content p-10">
                        <div class="row w-full mt-10">
            `;

            for (var n in g_pose.asias) {
                h += `
                    <div class="form-group w-full">
                        <label>${n}</label>
                        <select class="form-control col-12" onchange="g_pose.applyFilter();" >
                `;
                for (var v of g_pose.asias[n].concat('...')) {
                    h += `<option value="${v}" selected>${v}</option>`;
                }
                h += `
                        </select>
                    </div>
                `;
            }
            h += '</div></div></div>'
            $('#bottom_pose').prepend(h);
            g_pose.applyFilter(g_config.poseFilter || {});
        });
    },
    registerContent: function() {
        registerContent({
            id: 'pose',
            html: `
                <div id="subContent_pose" class="subContent">
                     <div id="pose_main" class="animated fadeIn w-full" animated='fadeIn'>

                         <div class="btn-toolbar rounded" role="toolbar"> 
                          <div class="btn-group mx-auto w-full">
                            <button class="btn btn-square" type="button" data-action="pose_subContent" data-value="list">${_l('列表')}</button>
                            <button class="btn btn-square" type="button" data-action="pose_subContent" data-value="viewer">${_l('浏览')}</button>
                            <button class="btn btn-square" type="button" data-action="pose_subContent" data-value="search">${_l('搜索')}</button>
                          </div>
                        </div>

                        <div id="pose_content" class="overflow-x-hidden overflow-y-scroll w-full overflow-h">
                              <div id="pose_subContent_list" class="pose_subContent hide animated fadeIn" animated='fadeIn'>
                                <div id="pose_list">
                                    
                                </div>
                              </div>
                              <div id="pose_subContent_viewer" class="pose_subContent hide animated fadeIn" animated='fadeIn'>
                                <div id="pose_viewer">
                                    
                                </div>
                            </div>
                                <div id="pose_subContent_search" class="pose_subContent hide animated fadeIn" animated='fadeIn'>
                                </div>
                        </div>

                         <div class="menu bottom_right_menu" id="menu_poseMenu" style="right: 20px;
                            z-index: 99999;
                            padding: 0px;
                            bottom: 45px;
                            opacity: .3;
                            max-height: 40%;
                           
                            height: auto;">
                               
                            </div>
                        
                    </div>
                </div>
            `,
            initNavBottom: () => {
                return `
                    <div id="bottom_pose" class="d-flex w-full" style="margin: 0 auto;border-radius: 20px;display: flex;align-items: center;">

                    <div class="ml-10">
                        <a data-action="pose_selectMode" class="btn btn-square">
                           <i class="fa fa-check-square-o" aria-hidden="true"></i>
                        </a>
                    </div>

                        <nav class="ml-auto">
                          <ul class="pagination m-0">
                            <li class="page-item" data-action="pose_prevPage">
                              <a class="page-link">
                                <i class="fa fa-angle-left" aria-hidden="true"></i>
                              </a>
                            </li>
                            <li data-action="pose_selectPage" class="page-item active" aria-current="page">
                              <a class="page-link" tabindex="-1">1</a>
                            </li>
                            <li data-action="pose_nextPage" class="page-item">
                              <a class="page-link">
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                              </a>
                            </li>
                          </ul>
                        </nav>
                    </div>
                `;
            },
            onShow: () => {
                g_pose.init();
                $('.content-wrapper').css('overflowY', 'hidden'); // 自定义滚动内容
            },
            overflowY: true,
        })
    },

    onSelectImage: function(dom) {
        if (!this.selected) this.selected = new Set();
        var checked = dom.toggleClass('img_selected').hasClass('img_selected');
        this.selected[checked ? 'add' : 'delete'](dom.data('id'))
        g_pose.setSelectedText(this.selected.size);
    },
    getSelectedVal: function() {
        return this.selected ? Array.from(this.selected) : [];
    },
    setSelectedText: function(num) {
        getAction('pose_listSelected').html('<b style="font-size: 3rem !important;line-height: 1.5;">' + num + '</b>');
        if (num == 0) {
            delete this.selected;
        }
    },
    initMenu: function(type, data) {
        if (!data) {
            switch (type) {
                case 'list':
                    data = [
                        { action: "pose_share", class: "btn-secondary", icon: "fa-share" },
                        { action: "pose_countdown", class: "btn-primary", icon: "fa-hourglass-start" },
                        { action: "pose_listSelected", class: "btn-success", icon: "" }
                    ];
                    break;

                case 'viewer':
                    data = [];
                    break;

                case 'search':
                    data = [];
                    break;

                default:
                    return;
            }
        }
        return initMenu('#menu_poseMenu', data);
    },
    applyFilter: function(filter) {
        if (!filter) {
            filter = {};
            for (var select of $('#dropdown_pose_filter select')) {
                if (select.value != '...') {
                    filter[select.previousElementSibling.innerHTML] = select.value;
                }
            }
            g_config.poseFilter = filter;
            local_saveJson('config', g_config);
        }
        const check = (type, key, vals) => {
            if (g_pose.asias[type]) {
                if (!Array.isArray(vals)) vals = [vals];
                return vals.includes(g_pose.asias[type].indexOf(key))
            }
        }
        var res = {};
        var cnt = 0;
        for (var id in _poseList) {
            var item = _poseList[id];
            for (var k in filter) {
                var short = k.substr(0, 1);
                if (item[short] != undefined && check(k, filter[k], item[short])) {
                    res[id] = item;
                    cnt++;
                }
            }
        }
        this.page = 1;
        this.maxPage = Math.ceil(cnt / this.pageMax);
        this.parseData(res);
    },
    unselectAll: function() {
        $('#pose_list .img_selected').removeClass('img_selected');
        getAction('pose_selectMode').removeClass('btn-primary');
        this.setSelectedText(0);
    },
    parseData: function(data) {
        g_pose.data = data;
        this.toPage(1);
    },
    startGame: function(list) {
        this.currentIndex = 0;
        this.gameList = list;
        if (list.length) {
            this.nextImage();
            this.toggleTimer();
        }
        //$('#pose_query').html(this.getHtml(this.getDataById(list)));
        // g_pose.showSubContent('list');
    },
    overGame: function() {
        toggleTimer();
        toastPAlert(_l('计时结束'), 'alert-success');
    },
    toggleTimer: function(start = true) {
        if(this.cache.timer) clearInterval(this.cache.timer);
         $('#pose_time').html('').toggleClass('hide', !start);
        if (start) {
            this.cache.timer = setInterval(() => {
                var t = --this.time;
                $('#pose_time').html(t);
                if (t == 0) {
                    g_pose.nextImage();
                }
            }, 1000);
        }
    },
    nextImage: function() {
        if (++this.currentIndex >= this.gameList.length) {
            return this.overGame();
        }
        this.time = 5;
        this.openInlineViewer(this.gameList[this.currentIndex]);
    },
    openInlineViewer: function(id) {
        var d = this.data[id];
        if (!d) return;

        for (var i = 0; i < 35; i++) {
            this.preloadImage(d.u, i, 100);
        }
        var img = $('#pose_viewer img');
        var src = this.getImageUrl(d.u, 0, 512);
        if(!img.length){
            $('#pose_viewer').html(`
                <div style="position: relative;">
                    <b id="pose_time" style="color: #000000;font-size: 5rem;position: absolute;left: 10px;top: -4px;">60</b>
                    <img src="${src}" class="w-full">
                </div>

                <div id="pose_query">

                </div>
            `);
                  var timer;
            $(`<div id="slider_pose_path" class="w-full ${g_config.darkMode ? 'bg-dark text-light' : ''}" mbsc-enhance>
                    <input class="w-full ml-10 mr-10" type="range" data-live="true" value="0" min="0" max="35" step="1" data-tooltip="true">
                </div>`).insertBefore('#pose_query').trigger('mbsc-enhance')
                .find('input').on('change', function(event) {
                    var val = $('#slider_pose_path input').mobiscroll('getVal');
                    var img = $('#pose_viewer img').attr('src', g_pose.getImageUrl(d.u, val, 100));
                    timer & clearTimeout(timer);
                    timer = setTimeout(() => {
                        img.attr('src', g_pose.getImageUrl(d.u, val, 512));
                    }, 1000)
                })
        }else{
            img.attr('src', src);
        }
        this.showSubContent('viewer');
    },

    showSubContent: function(id, classes = 'pose_subContent') {
        if(g_pose.currentContent == id) return;
        g_pose.currentContent = id;
        g_pose.initMenu(id);
        showSubContent(classes, id);
        switch (id) {
            case 'list':
                break;

            case 'viewer':
                break;

            case 'game':
                break;
        }
        resizeCustomScroll();
    },

    prevPage: function() {
        if (this.page > 1) {
            this.toPage(this.page - 1);
        }
    },

    nextPage: function() {
        if (this.page < this.maxPage) {
            this.toPage(this.page + 1);
        }
    },

    preloadImage: function(url) {
        return new Promise(function(resolve, reject) {
            let img = new Image();
            img.onload = function() {
                resolve(img);
            }
            img.onerror = function() {
                //reject(src+'load failed');
            }
            img.src = url;
        })
    },

    toPage: function(page = 1, random = false) {
        this.page = page;
        getAction('pose_selectPage').find('a').html(page);
        getAction('pose_prevPage').toggleClass('disabled', page <= 1);
        getAction('pose_nextPage').toggleClass('disabled', page >= this.maxPage);
        $('#pose_list').html(`<h4 class="text-center mx-auto">${_l('加载中')}loading</h4>`);

        var ids = [];
        var list = Object.keys(g_pose.data);
        for (var i = 0; i < this.pageMax; i++) {
            if (random) {
                while (true) {
                    var k = arrayRandom(list);
                    if (!ids.includes(k)) {
                        list.splice(list.indexOf(k), 1);
                        ids.push(k);
                        break;
                    }
                }
            } else {
                var k = i + (page - 1) * this.pageMax;
                if (k > list.length - 1) break;
                ids.push(list[k]);
            }
        }
        var h = this.getHtml(this.getDataById(ids), this.isSelecting() ? g_pose.getSelectedVal() : []);
        $('#pose_list').html(h);
        g_pose.showSubContent('list');
    },

    getDataById: function(ids) {
        var poses = [];
        for (var id of ids) {
            var pose = g_pose.data[id];
            var slugs = ["normal", "nude", "muscle", "smooth"];
            if (pose.l) slugs.push('loomis');
            poses.push({
                id: id,
                uuid: pose.u,
                cnt: 36,
                slug: slugs
            });
        }
        return poses;
    },

    isSelecting: function() {
        return getAction('pose_selectMode').hasClass('btn-primary');
    },

    getHtml: function(poses, selected = []) {
        var h = '<div class="row">';
        for (var item of poses) {
            h += `
                <div class="col-4 ${selected.includes(Number(item.id)) ? 'img_selected' : ''}" data-id="${item.id}" data-action="pose_coverClick">
                    <img class="w-full p-10" src="${this.getImageUrl(item.uuid)}">
                </div>
            `
        }
        h += '</div>';
        return h;
    },

    getImageUrl: function(uuid, offset = 0, size = 100) {
        var model = g_pose.model || 'normal';
        return 'https://love.figurosity.com/muses/' + uuid.substr(0, 2) + '/' + uuid.substr(2, 2) + '/' + uuid.substr(4, 2) + '/' + uuid + '/' + model + '/' + size + '/pose-' + _s(offset || 1) + '.jpg';
    }

}
g_pose.preload();