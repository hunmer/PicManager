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

window.alert1 = function(opts) {
    if (typeof(opts) != 'object') opts = { html: opts }
    opts = Object.assign({
        title: '提示',
        html: '',
        buttons: ['set'],
    }, opts);
    buildDialog(opts);
}

// alert({
//     html: 'aa',
//     buttons: [{
//         text: _l('确定'),
//         handler: function(event){
//             alert('ok');
//         }
//     }]
// });
window.confirm1 = function(opts, callback) {
    var b = typeof(opts) == 'object';
    if (!b) opts = { html: opts };
    opts = Object.assign({
        title: '请选择',
        buttons: b ? ['set', 'cancel'] : [{
            text: _l('确定'),
            handler: function(event, instance) {
                if (callback(true) == false) return;
                instance.hide();
            }
        }, {
            text: _l('取消'),
            handler: function(event, instance) {
                if (callback(false) == false) return;
                instance.hide();
            }
        }],
    }, opts);
    buildDialog(opts);
}

// confirm('aa', (value) => {
//     alert(value);
// })

// confirm({
//     html: 'aa',
//     buttons: [{
//         text: _l('确定'),
//         handler: function(event){
//            alert('ok');
//         }
//     }, {
//         text: _l('取消'),
//         handler: function(event){
//            alert('cancel');
//         }
//     }],
// });
window.prompt1 = function(opts, callback) {
    if (typeof(opts) != 'object') {
        opts = { title: opts };
    }
    opts = Object.assign({
        title: '请输入',
        html: '',
        buttons: [{
            text: _l('确定'),
            handler: function(event, instance) {
                if (typeof(callback) == 'function' && callback($('#textarea_prompt').val(), event) === false) return;
                instance.hide();
            }
        }, 'cancel'],
    }, opts);
    opts.html = `<textarea id="textarea_prompt" rows="3" class="form-control alt-dm" placeholder="...">` + opts.html + `</textarea>`,
        opts.dailog = buildDialog(opts).parents('.mbsc-fr-c').css({
            padding: 0,
            marginRight: '15px',
            marginBottom: '15px'
        });
    setTimeout(() => $('#textarea_prompt').focus(), 500);

}

// prompt1('aa', (value) => {
//     alert(value);
//     return true;
// })

function buildDialog(opts) {
    var dialog = mobiscroll_($('#mobi_div').html(`
        <div id="widget">
            <div class="md-dialog">
                ` + opts.html + `
            </div>
        </div>
        `), 'widget', {
        closeOnOverlayTap: false,
        headerText: opts.title,
        buttons: opts.buttons,
    });
    dialog.parents('.mbsc-fr-w').addClass('bg-dark p-10'); // bootstarp 莫名透明
    return dialog;
}


var _audio = $('#audio')[0];



function back() {
    startVibrate(40);
    if(g_mark.isShow()){
        g_mark.hide();
    } else
    if(_viewer.fulled){ // 全屏
        $('.viewer-fullscreen-exit').click()
    } else
    if(g_gallery.previewViewer){
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

    if($('#menu_main').css('display') != 'none'){
        showMenu('#menu_main', true)
    }
    // 切换侧边栏的时候 内嵌viewer也跟着调整大小
    var width = isSidebarShowed() ? $('.sidebar').width() : '0';
    $('#imageEdit').css('width', `calc(100vw - ${width}px)`);
    $(window).resize();

}

halfmoon.toggleModal1 = halfmoon.toggleModal;
halfmoon.toggleModal = function(...args) {
    // 关闭modal前的对话框确定
    if(args[0] == 'modal-custom' && isModalOpen('modal-custom', 'dialog_addExpFromImage') && args.length == 1){
        if($('#textarea_comment').val() != '' || $('.cameraImgs img').length){
            if(!confirm('放弃编辑吗？')) return;
        }
    }

    halfmoon.toggleModal1(args);
    startVibrate(50);
}

function getCurrentGallery(){
    switch(g_cache.showing){
        case 'gallery':
            return g_gallery.grid;

        case 'site':
            return g_site.grid;
    }
}

$(function() {
    g_setting.init();
    FastClick.attach(document.body);
    window.addEventListener("popstate", function(event) {
        window.history.pushState(null, null, "index.html");
        if (!back()) { // 不能后退了
            g_autojs.log('hide');
        }
    });

    $('#input_img').on('change', function(event) {
        var that = this;
        var config = $(that).attr('data-config');
        if (config) {
            config = JSON.parse(config);
        } else {
            config = { width: 800, quality: 0.7 };
        }
        lrz(that.files[0], config)
            .then(function(rst) {
                switch ($(that).attr('data-type')) {
                    case 'camera':
                        g_rpg.uploadImage(rst.base64);
                        break;
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    });

    $(document).
    on('keyup', function(e) {
            switch (e.key.toLowerCase()) {
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
            doAction(this, $(this).attr('data-action'));
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
                    var grid =  getCurrentGallery();
                    if (grid.data('isotope').sortHistory[0] != 'original-order') {
                        // 有用插件排过序,恢复
                        grid.isotope({ sortBy: 'original-order' });
                    } else {
                        if(g_cache.showing == 'gallery'){
                            g_database.loadItems(g_database.filterImage(g_config.filter));
                        }
                        
                    }
                    break;
                case 'sort_reverse':
                    if (g_cache.showing == 'site' || !g_page.getOpts('gallery').hasMore) { // 没有更多了
                        getCurrentGallery().isotope({ sortBy: 'reverse' });
                    } else {
                        if(g_cache.showing == 'gallery'){
                            // 直接改变数据
                            g_database.loadItems(g_database.filterImage(g_config.filter).reverse());
                        }
                    }
                    break;
                case 'debug':
                case 'fullScreen':
                case 'nomedia':
                    g_autojs.log('setOption', { key: key, value: this.checked });
                    break;
            }
            g_config[key] = this.checked;
            local_saveJson('config', g_config);
        })

    $(window).resize(function(event) {

        for (var d of $('.overflow-h')) {
            var d = $(d);
            var m = d.attr('data-maxheight');
            if (isNaN(parseInt(m))) {
                m = $(window).height() - d.offset().top - $(m).height() - 50;
            }
            d.css('height', Math.min($(window).height() - d.offset().top, m) + 'px');
        }
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

    if (g_config.lastOpenFolder && g_folders[g_config.lastOpenFolder]) {
        g_database.loadFolder(g_config.lastOpenFolder);
        return;
    }
    $(`[data-action="setFilter"][data-value='` + JSON.stringify(g_config.filter || {}) + `']`).click();

    // showContent('site');

});

function isMobile() {
    var i = window.innerHeight / window.innerWidth;
    return i >= 1.75;

    if (i >= 1.75) { // 手机竖屏
        return 'm-h'
    }
}

function doAction(dom, action, params) {
    var action = action.split(',');
    if (g_actions[action[0]]) {
        g_actions[action[0]](dom, action, params);
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

function showContent(id) {
   
    switch (id) {
        case 'gallery':
            toggleMenu('#menu_main', false);

            if (!g_cd.getOpts('image')) {
                _r(g_cache, 'timer_autoStart', 'timeout');
            }

            $('#dropdown_more').hide();
            $('[data-action="back"]').prop('disabled', true);
            break;

        case 'detail':
            if(!_viewer) return; // 未加载过图片
            toggleMenu('#menu_main', true);
            window.history.pushState(null, null, "?gallery");
            $('#dropdown_more').show();
            break;

        case 'site':
            g_site.init();
            window.history.pushState(null, null, "?site");
            break;

        case 'search':
            break;

        default:
            return;
    }
    g_cache.showing = id;
    for(var d of $('.toolbar')){
        d.classList.toggle('hide1', d.id != 'toolbar_'+id);
    }
    for(var d of $('.subContent')){
        d.classList.toggle('hide1', d.id != 'subContent_'+id);
    }
    $('#menu_main i.text-primary').removeClass('text-primary');
    getAction('showContent,'+id).addClass('text-primary');
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
            if(opts.autoClear) $(this).find('.modal-title').html('');
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
    if (g_cache.mobiscroll.indexOf(id) == -1) g_cache.mobiscroll.push(id);
    var dom = selector.mobiscroll()[type](Object.assign({
        theme: 'bootstrap',
        display: 'center',
        animate: 'fade',
        lang: 'zh',
    }, opts));
    if (show) dom.mobiscroll('show')[0];
    setTimeout(() => {
        $('.mbsc-fr-w').addClass('bg-dark p-10');
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

function showMenu(id, show){
        $(id+' .fa-arrow-left').toggleClass('hide', true);
    $(id).css({
        left: 'calc(50vw - ' + $(id).width() / 2 + 'px)',
        right: 'unset',
        display: show ? '' : 'none'
    });
}

function toggleMenu(id, hide){
    $(id+' .fa-arrow-left').toggleClass('hide', !hide);
    if(!hide){
        return showMenu(id, true);
    }

    $(id).css({
        right: hide ? 0 - ($(id).width() - 20) + 'px' : 'unset',
        left: hide ? 'unset' : '',
    });
}

