
mobiscroll.settings = {
     theme: 'bootstrap',
     lang: 'zh',
     themeVariant: 'dark'
};

function sendRequest(opts) {
    return $.ajax(Object.assign({
            dataType: 'json'
        }, opts))
        .done(function(json) {
            opts.done && opts.done(json);
        })
        .fail(function() {
            opts.fail && opts.fail();
        })
        .always(function() {
            opts.always && opts.always();
        });
}



var _audio = $('#audio')[0];
var g_back = {};

function back() {
    startVibrate(40);
    for(var name in g_back){
        if(g_back[name]() === true) return true;        
    }
    if (g_mark.isShow()) {
        g_mark.hide();
    } else
    if (g_site.preview) {
        g_site.preview.destroy();
        delete g_site.preview;
    } else
    if (_viewer && _viewer.fulled) { // 全屏
        $('.viewer-fullscreen-exit').click()
    } else
    if (g_gallery.previewViewer) {
        // 关闭图片预览
        g_gallery.previewViewer.destroy();
        delete g_gallery.previewViewer;
    } else
    if ($('.mbsc-fr').length) {
        mobiscroll_cancelAll();
    } else
    if ($('.modal.show').length) {
        halfmoon.toggleModal($('.modal.show')[0].id);
    } else
    if (isSidebarShowed()) {
        // pc 当前浏览图片 侧栏打开
        if (!isMobile() && g_cache.showing == 'detail') {
            showContent('gallery');
        } else {
            hideSidebar();
        }
    } else
    if (g_cache.showing == 'detail') {
        showContent('gallery');
    } else {
        return false;
    }

    return true;
}

function getAction(action) {
    return $('[data-action="' + action + '"]')
}

halfmoon.toggleSidebar1 = halfmoon.toggleSidebar;
halfmoon.toggleSidebar = function() {
    halfmoon.toggleSidebar1();


    // 切换侧边栏的时候 内嵌viewer也跟着调整大小
    var width = isSidebarShowed() ? $('.sidebar').width() : '0';
    
    // $('#room_chat').css('left', `${width + 10}px`);

    $('#imageEdit').css('width', `calc(100vw - ${width}px)`);

    var d = $('#menu_main');
    if(d.css('display') != 'none' && d[0].style.left != 'unset'){ // 如果菜单不在侧边
        g_menu.showMenu('#menu_main', true); // 调整菜单
    }
    $(window).resize();

}

halfmoon.toggleModal1 = halfmoon.toggleModal;
halfmoon.toggleModal = function(...args) {
    // 关闭modal前的对话框确定
    if (args[0] == 'modal-custom' && isModalOpen('modal-custom', 'dialog_addExpFromImage') && args.length == 1) {
        if ($('#textarea_comment').val() != '' || $('.cameraImgs img').length) {
            if (!confirm('放弃编辑吗？')) return;
        }
    }

    // 隐藏房间消息
    if(typeof(g_room) != 'undefined') g_room.toggleChat(true);

    halfmoon.toggleModal1(args);
    startVibrate(50);
}

function getCurrentGallery() {
    switch (g_cache.showing) {
        case 'gallery':
            return g_gallery.grid;

        case 'site':
            return g_site.grid;
    }
}

function resizeImage(file, config, callback) {
    return lrz(file, config)
        .then(rst => callback(rst))
        .catch(function(err) {
            console.log(err);
        });
}


$(function() {
    document.oncontextmenu = () => false;

    g_setting.init();
    if (isApp()) FastClick.attach(document.body);
    window.addEventListener("popstate", function(event) {
        window.history.pushState(null, null, "index.html");
        if (!back()) { // 不能后退了
            g_autojs.log('hide');
        }
    });

    $(document)
        // on('drop', function(e) {

        // })
        .on('keyup', function(e) {
            switch (e.key.toLowerCase()) {
                case 'f11':
                    if (isWindows()) toggleFullScreen();
                    break;
                case 'w':
                    if (e.ctrlKey) g_autojs.log('close');
                    break;
                case 'browserback':
                    g_autojs.log('history_back');
                    break;
                case 'arrowleft':
                    if (e.altKey) g_autojs.log('history_back');
                    break;
                case 'browserforward':
                    g_autojs.log('history_forward');
                    break;
                case 'arrowright':
                    if (e.altKey) g_autojs.log('history_forward');
                    break;

                case 'r':
                    if (e.ctrlKey) g_autojs.log('reload');
                    break;

                case 'f12':
                    g_autojs.log('devtool');
                    break;

                case 'f5':
                    g_autojs.log('reload');
                    break;
            }
        })
        .on('click', '[data-action]', function(event) {
            doAction(this, this.dataset.action, event);
            if(['button', 'a'].includes(this.nodeName.toLowerCase()) && !this.classList.contains('disabled')){
             addAnimation($(this), 'rubberBand');
            }
        })
        .on('change', '[data-checkbox]', function(event) {
            var key = $(this).attr('data-checkbox');
            switch (key) {
                case 'darkMode':
                    g_setting.setDarkMode(this.checked);

                    break;
                    // ! 新增的不会按照排序...
                    // 如果加载完毕，则用isotope自带的排序，可避免重新加载
                    // 如果没加载完成直接改变数据源的顺序吧。。。
                case 'sort_random':
                    getCurrentGallery().isotope('shuffle');
                    break;
                case 'sort_normal':
                    var grid = getCurrentGallery();
                    if (grid.data('isotope').sortHistory[0] != 'original-order') {
                        // 有用插件排过序,恢复
                        grid.isotope({ sortBy: 'original-order' });
                    } else {
                        if (g_cache.showing == 'gallery') {
                            g_database.loadItems(g_database.filterImage(g_config.filter));
                        }

                    }
                    break;
                case 'sort_reverse':
                    if (g_cache.showing == 'site' || !g_page.getOpts('gallery').hasMore) { // 没有更多了
                        getCurrentGallery().isotope({ sortBy: 'reverse' });
                    } else {
                        if (g_cache.showing == 'gallery') {
                            // 直接改变数据
                            g_database.loadItems(g_database.filterImage(g_config.filter).reverse());
                        }
                    }
                    break;
                case 'debug':
                case 'fullScreen':
                case 'nomedia':
                    g_autojs.log('setOption', { key: key, value: this.checked });
                    if(key == 'fullScreen') toggleFullScreen();
                    break;
            }
            g_config[key] = this.checked;
            local_saveJson('config', g_config);
        })

    $(window).resize(function(event) {
        // var x = this.innerWidth;
        var w = $(window).width();
        var h = $(window).height();
        $(':root').css({
            '--mh-40': h * 0.40 + 'px',
            '--mh-60': h * 0.60 + 'px',
            '--mw-80': w * 0.80 + 'px',
        });
       resizeCustomScroll();
        $('#rm_target').hide();
        switch (g_cache.showing) {
            case 'detail':
                fun = () => {
                    if (_viewer) _viewer.resize()
                }
                break;

            case 'gallery':
                if (_viewer) _viewer.destroy();
                fun = () => {
                    if (g_gallery.grid) g_gallery.grid.isotope('layout')
                }
                break;

            default:
                return;
        }
        setTimeout(fun, 200)
    });

    g_gallery.switchDetailBar(false);

    // if(!g_config.firstLogin){
    //     g_config.firstLogin = new Date().getTime();
    //     local_saveJson('config', g_config);
    //     doAction(null, 'setting');
    // }

    //loadContent();
});

function loadContent(){
      if(_GET['r']){
        g_room.cache.targetRoom = {
            room: _GET['r'],
            password: _GET['p'],
        }
        delete _GET['r'];
        delete _GET['p'];
        showContent('room');
    }else{
          if (g_config.lastOpenFolder && g_folders[g_config.lastOpenFolder]) {
            g_database.loadFolder(g_config.lastOpenFolder);
            return;
        }
        $(`[data-action="setFilter"][data-value='` + JSON.stringify(g_config.filter || {}) + `']`).click();      
    }
}

function resizeCustomScroll(){
     var bottom = 0;
        if($('.navbar-fixed-bottom').css('display') != 'none'){
            bottom += $('.navbar-fixed-bottom').height();
        }
        for (var d of $('.overflow-h')) {
            var d = $(d);
            d.css('height', `calc(100vh - ${d.offset().top}px - ${bottom}px)`);
        }
}

function isMobile() {
    var i = window.innerHeight / window.innerWidth;
    return i >= 1.75;

    if (i >= 1.75) { // 手机竖屏
        return 'm-h'
    }
}

function doAction(dom, action, event) {
    var action = action.split(',');
    if (g_actions[action[0]]) {
        g_actions[action[0]](dom, action, event);
    }
    switch (action[0]) {
        case 'showContent':
            showContent(action[1]);
            break;
        case 'minSize':
            g_autojs.log('min');
            break;

        case 'maxSize':
            g_autojs.log('max');
            break;

        case 'close':
            g_autojs.log('close');
            break;
    }
}

function _D() {
    console.log(arguments);
}

function registerContent(opts){
    $(opts.html).appendTo('.content-wrapper');
    g_cache.contents[opts.id] = opts;
}

function showContent(id) {
   

    $('.content-wrapper').css('overflowY', 'auto'); // 自定义滚动内容
    //$('.content-wrapper').css('overflowY', d.overflowY ? 'hidden' : 'auto'); // 自定义滚动内容
    switch (id) {
        case 'gallery':
            window.history.pushState(null, null, "?gallery");
            g_menu.toggleMenu('#menu_main', false);
            if (!g_cd.getOpts('image')) {
                _r(g_cache, 'timer_autoStart', 'timeout');
            }
            $('#dropdown_more').hide();
            $('[data-action="back"]').prop('disabled', true);
            break;

        case 'detail':
            if (!_viewer) return; // 未加载过图片
            g_menu.toggleMenu('#menu_main', true);
            window.history.pushState(null, null, "?detail");
            $('#dropdown_more').show();
            break;

        case 'site':
            g_site.init();
            window.history.pushState(null, null, "?site");
            break;

        case 'search':
            break;

        case 'room':
            g_room.init();
            window.history.pushState(null, null, "?room");
            break;

    }

    var d = g_cache.contents[id] || {};
    var bottom, dropdown = '';
    if(d){
        d.onShow && d.onShow();
        if(d.initNavBottom){
            bottom = d.initNavBottom();
        }
        if(d.dropDownHtml){
            dropdown = d.dropDownHtml();
        }
    }
    if(id != g_cache.showing){ // 更新视图
     $('.navbar-fixed-bottom').html(bottom).toggleClass('hide', bottom == '');
     $('#page-wrapper').toggleClass('with-navbar-fixed-bottom', bottom != '');
    $('#dropdown-top-right').html(dropdown);
    }

    g_cache.showing = id;
    for (var d of $('.toolbar')) {
        d.classList.toggle('hide1', d.id != 'toolbar_' + id);
    }
    for (var d of $('.subContent')) {
        d.classList.toggle('hide1', d.id != 'subContent_' + id);
    }
    $('#menu_main i.text-primary').removeClass('text-primary');
    getAction('showContent,' + id).addClass('text-primary');
}

function modalOpen(opts) {
    opts = Object.assign({
        title: 'title',
        html: '',
        width: '',
        height: '',
        fullScreen: false,
        canClose: true,
        autoClear: true,
        onClose: () => {},
        onShow: () => {},
    }, opts)
    var modal = $('#' + opts.id);
    modal.toggleClass('modal-full', opts.fullScreen);
    setImportantCss(modal.find('.modal-content')[0], {
        width: opts.width,
        height: opts.height
    });

    modal.find('.close').css('display', opts.canClose ? '' : 'none')[0].onclick = function(event) {
        if (opts.onClose()) {
            if (opts.autoClear) $(this).find('.modal-title').html('');
            halfmoon.toggleModal(opts.id);
        }
    }
    modal.find('.modal-title').html(opts.title).toggleClass('hide', opts.title == '');
    modal.attr('data-type', opts.type).find('.modal-html').html(opts.html);
    if (!isModalOpen(opts.id, opts.type)) {
        halfmoon.toggleModal(opts.id);
    }
    opts.onShow(modal);
    return modal;
}

g_cache.mobiscroll = [];

function mobiscroll_(selector, type, opts, show = true) {
    if (typeof(selector) == 'string') selector = $(selector);

    var id = selector.attr('id');
    if (g_cache.mobiscroll.indexOf(id) == -1) g_cache.mobiscroll.push(id); // 加入列表

    var dom = selector.mobiscroll()[type](Object.assign({
        display: 'center',
        animate: 'fade',
    }, opts));

    if (show) dom.mobiscroll('show')[0];
    setTimeout(() => {
        var con = $('.mbsc-fr-w');
        con.addClass('p-10 ' + (g_config.darkMode ? 'bg-dark' : 'bg-white'));
        if(opts.id) con.attr('id', opts.id);
    }, 50);
    // bootstarp 
    return dom;
}

function mobiscroll_cancelAll() {
    for (var id of g_cache.mobiscroll) {
        $('#' + id).mobiscroll('cancel');
    }
    g_cache.mobiscroll = [];
}