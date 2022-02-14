var g_setting = {
    init: function() {
        if(g_cache.isApp){
            $(`
                <div class="custom-switch mt-10">
                    <input type="checkbox" id="checkbox-nomedia" value="" data-checkbox="nomedia">
                    <label for="checkbox-nomedia">隐藏图片</label>
                </div>
                <div class="custom-switch mt-10">
                    <input type="checkbox" id="checkbox-debug" value="" data-checkbox="debug">
                    <label for="checkbox-debug">调试</label>
                </div>
                
                <div class="custom-switch mt-10">
                    <input type="checkbox" id="checkbox-fullScreen" value="" data-checkbox="fullScreen">
                    <label for="checkbox-fullScreen">全屏</label>
                </div>
                `).appendTo('[aria-labelledby="img_user"]');
        }else
        if(g_cache.isWindow){
            
        }else{
            // web
        }
        this.initConfig();
    },
    setDarkMode: function(dark) {
        if (dark == undefined) {
            dark = !$('body').hasClass('dark-mode')
        }
        $('body').toggleClass('dark-mode', dark);
        g_config.darkMode = dark;
        local_saveJson('config', g_config);
    },
    initConfig: function() {
        var dark;
        if (g_config.autoThmem) {
            var h = new Date().getHours();
            dark = h > 18 && h < 6;
        } else {
            dark = g_config.darkMode;
        }
        $('[data-checkbox="darkMode"]').prop('checked', dark);
        if (!dark) $('body').removeClass('dark-mode');
        if (g_config.bg) this.setBg(g_config.bg);
        $('#checkbox-debug').prop('checked', g_config.debug);
        $('#checkbox-nomedia').prop('checked', g_config.nomedia);
        $('#checkbox-fullScreen').prop('checked', g_config.fullScreen);
        toggleMenu('#menu_main', true);
    },

    setBg: function(bg) {
        var blur = '';
        if (bg != '') {
            bg = 'linear-gradient(rgb(35 35 35 / 25%), rgb(111 111 111 / 55%)), url(' + bg + ')';
            if (g_config.blur > 0) {
                blur = 'saturate(180%) blur(' + g_config.blur + 'px)';
            }
        }
        $('body').css('backgroundImage', bg).css('backdropFilter', blur);
    },


    setFontColor: function(color) {
        g_config.fontColor = color;
        this.initCss();
    },

    setBlur: function(i) {
        g_config.blur = parseInt(i);
        if (g_config.bg) {
            this.setBg(g_config.bg)
        }
    },

    initCss: function() {
        if (g_cache.css) g_cache.css.remove();
        var css = '';
        if (g_config.color) {
            for (var key of ['--dm-button-group-button-primary-border-color-hover', '--lm-button-group-button-primary-border-color-hover', '--primary-color', '--lm-button-primary-bg-color', '--dm-button-primary-bg-color', '--lm-alert-primary-border-color)', '--dm-alert-primary-border-color);']) {
                //  '--dm-button-primary-bg-color-hover', '--lm-button-primary-bg-color-hover'
                css += key + ':' + g_config.color + ';'
            }
        }

        if (g_config.fontColor) {
            for (var key of ['--lm-button-primary-text-color', '--dm-button-primary-text-color', '--dm-badge-primary-text-color', '--lm-badge-primary-text-color']) {
                css += key + ':' + g_config.fontColor + ';'
            }
        }
        css = ':root{' + css + '}';
        if (css) {
            g_cache.css = insertStyle(css);
        }
    }
}