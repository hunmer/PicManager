var mobiscrollHelper = {

    init: () => {

    },
    test: () => {
        $(function() {
            console.log(mobiscrollHelper.actionMenu({
                data: [{ icon: "image", title: 'title1', child: [{ icon: "file", text: "file 1" }] }]
            }));
            //     var groups = ['a', 'b', 'c', 'd'];
            //     var h = $(mobiscrollHelper.buildMulitSelect({
            //         id: 'mulitselect-demo',
            //         name: '分类',
            //         data: groups,
            //         selected: []
            //     })).prepend('body');
            //     var dialog = mobiscroll_(h, 'select', {
            //         minWidth: 200,
            //         preset: "select",
            //         closeOnOverlayTap: false,
            //         headerText: '为目录设置分类',
            //         buttons: [{
            //             text: _l('确定'),
            //             handler: function(event, instance) {
            //                 instance.getVal()
            //             }
            //         }, {
            //             text: _l('取消'),
            //             handler: 'cancel'
            //         }],
            //     });
        });
    },
    buildGroupSelect: (opts) => {
        opts = Object.assign({ id: 'selectGroupselect', data: {} }, opts);
        var h = '<select id="' + opts.id + '">';
        for (var group in opts.data) {
            h += `<optgroup label="` + group + `">`;
            for (var item of opts.data[group]) {
                h += '<option value="1">' + item + '</option>';
            }
            h += `</optgroup>`;
        }
        return h + '</select>';
    },
    buildSelect: (opts) => {
        opts = Object.assign({ id: 'select-demo', data: {} }, opts);
        var h = '<select name="' + opts.title + '" id="' + opts.id + '">';
        for (var key in opts.data) {
            h += '<option value="' + key + '"' + (opts.selected && opts.selected == key ? ' selected' : '') + '>' + opts.data[key] + '</option>';
        }
        return h + '</select>';
    },
    buildSelect_withImage: (opts) => {
        opts = Object.assign({ data: {} }, opts);
        var h = '<ul>';
        for (var key in opts.data) {
            var item = opts.data[key];
            h += `
            <li data-val="${key}">
                <img class="${opts.imgClass}" src="${item.icon}" />
                <p>${item.text}</p>
            </li>
            `;
        }
        return h + '</ul>';
    },

    buildMulitSelect: (opts) => {
        opts = Object.assign({ id: 'mulitselect-demo', data: {}, selected: [] }, opts);
        var h = '<select name="' + opts.title + '" id="' + opts.id + '" multiple>';
        for (var key in opts.data) {
            h += '<option value="' + key + '"' + (opts.selected.indexOf(key) != -1 ? ' selected' : '') + '>' + opts.data[key] + '</option>';
        }

        return h + '</select>';
    },

    buildActionMenu: (opts) => {
        // [{icon: "", title: '', child: [{icon: "", text: ""}]}]
        opts = Object.assign({ id: 'actionmenu-demo', data: {} }, opts);
        var h = '<ul id="' + opts.id + '">';
        for (var item of opts.data) {
            var isArray = Array.isArray(item.child);
            h += `
                <li data-type="${isArray ? 'folder' : 'picture'}" data-icon="${isArray ? 'folder' : item.icon}">` + item.title
            if (isArray) {
                h += `<ul>`;
                for (var child of item.child) {
                    h += `<li data-type="music" data-icon="${child.icon}">${child.text}</li>`;
                }
                h += '</ul>'
            }
            h += '</li>'
        }
        return h + '</ul>';
    },

    actionMenu: function(opts, callback) {
        var dialog = mobiscroll_(this.buildActionMenu(opts), 'listview', Object.assign({
            enhance: true,
        }, opts.opts));
        return dialog;
    },

    buildProgress: (opts) => {
        opts = Object.assign({
            id: 'progress-demo',
            title: 'title',
            max: 100,
            progress: 0,
            onProgressChange: (progress) => {},
            onFinished: () => {},
        }, opts);

        var dialog = alert1({
            title: opts.title,
            html: `
                <div class="progress h-25" id="${opts.id}">
                  <div class="progress-bar bg-primary rounded-0" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="${opts.max}">0%</div>
                </div>
            `,
            buttons: ['cancel'],
        });
        opts.dialog = dialog;
        opts.setProgress = function(num) {
            var progress = parseInt(num / this.max * 100);
            if (progress > 100) progress = 100;
            if (progress < 0) progress = 0;
            if (progress != this.progress) {
                this.progress = progress;
                if (this.onProgressChange(progress) !== false) {
                    this.dialog.find('.progress-bar').attr('aria-valuenow', progress).html(progress + '%').css('width', progress + '%');
                    if (progress >= 100) {
                        if (opts.onFinished() !== false) {
                            this.dialog.mobiscroll('hide');
                        }
                    }
                }
            }
        }
        return opts;
    },
    select_textAndImage: function(opts) {
        var h = $(mobiscrollHelper.buildSelect_withImage(Object.assign({
            data: [],


        }, opts))).prepend('body');
        var dialog = mobiscroll_(h, 'image', Object.assign({
            minWidth: 200,
            // defaultValue: [],
            closeOnOverlayTap: true,
            showLabel: false,
            // labels: [''], // 标题
            enhance: true, // 显示文字 
            buttons: [{
                text: _l('确定'),
                handler: function(event, instance) {
                    opts.callback && opts.callback(true, instance);
                }
            }, {
                text: _l('取消'),
                handler: function(event, instance) {
                    opts.callback && opts.callback(false, instance);
                }
            }],
        }, opts.opts));
        return dialog;
    },
    select: function(opts) {
        var h = $(mobiscrollHelper[opts.isMulti ? 'buildMulitSelect' : 'buildSelect'](Object.assign({
            data: [],
        }, opts))).prepend('body');
        var dialog = mobiscroll_(h, 'select', Object.assign({
            minWidth: 200,
            closeOnOverlayTap: false,
            headerText: '',
            buttons: [{
                text: _l('确定'),
                handler: function(event, instance) {
                    opts.callback && opts.callback(true, instance);
                }
            }, {
                text: _l('取消'),
                handler: function(event, instance) {
                    opts.callback && opts.callback(false, instance); // 不知道啥原因点击项目就关闭窗口了，只能检测是不是点击了取消
                }
            }],
        }, opts.opts));
        return dialog;
    },
    // 给默认的按钮加上回调
    initButtonFun: function(opts, callback) {
        for (var i in opts.buttons) {
            var btn = opts.buttons[i];
            if (btn == 'set') {
                opts.buttons[i] = {
                    text: _l('确定'),
                    handler: function(event, instance) {
                        if (callback && callback(true) == false) return;
                        instance.hide();
                    }
                }
            } else
            if (btn == 'cancel') {
                opts.buttons[i] = {
                    text: _l('取消'),
                    handler: function(event, instance) {
                        if (callback && callback(false) == false) return;
                        instance.hide();
                    }
                }
            }
        }
    },
    password: function(opts, callback) {
        var dialog = mobiscroll_('<div id="pin"></div>', 'numpad', Object.assign({
            headerText: _l('输入密码_标题'),
            template: 'dddd',
            allowLeadingZero: true,
            placeholder: '-',
            closeOnOverlayTap: false,
            mask: '*',
            buttons: ['set'],
            onSet: function(event, inst) {
                callback(event.valueText);
            }
        }, opts));
        return dialog;

    },
    step: function(opts, callback) {
        var dialog = mobiscroll_('<div id="step"></div>', 'number', Object.assign({
            headerText: _l('选择数字'),
            closeOnOverlayTap: false,
            step: 1,
            buttons: ['set'],
            onSet: function(event, inst) {
                callback(event.valueText);
            }
        }, opts));
        return dialog;
    },

    widget_actionWithIcon: function(opts) {
        var h = '';
        for (var item of opts.data) {
            h += `
            <h4 data-action="${item.action}" class="hover" >
                <i class="fa ${item.icon} mr-10"aria-hidden="true"></i>
            ${item.text}</h4>`;
        }
        var dialog = mobiscroll_($('#mobi_div').html(`
            <div id="widget">
                <div class="md-dialog">
                ${h}
                </div>
            </div>
         `), 'widget', Object.assign({
            closeOnOverlayTap: true,
            headerText: _l('请选择'),
            buttons: [],
        }, opts.opts));
        return dialog;
    }
}


window.alert1 = function(opts) {
    if (typeof(opts) != 'object') opts = { html: opts }
    opts = Object.assign({
        title: _l('提示'),
        html: '',
        layout: 'fixed',
        buttons: ['set'],

    }, opts);
    mobiscrollHelper.initButtonFun(opts);
    return buildDialog(opts);
}

// todo 监测按钮事件在进行回调？
window.confirm1 = function(opts, callback) {
    var b = typeof(opts) == 'object';
    if (!b) opts = { html: opts };
    opts = Object.assign({
        title: _l('请选择'),
        layout: 'fixed',
        buttons: ['set', 'cancel'],
        onEnterKey: () => {
            $('.mbsc-fr-btn0').click();
        }
    }, opts);
    mobiscrollHelper.initButtonFun(opts, callback);
    return buildDialog(opts);
}

window.prompt1 = function(opts, callback) {
    if (typeof(opts) != 'object' && typeof(callback) != 'function') {
        opts = { title: opts, html: callback };
    }
    opts = Object.assign({
        title: _l('请输入'),
        html: '',
        layout: 'fixed',
        buttons: [{
            text: _l('确定'),
            handler: function(event, instance) {
                if (typeof(callback) == 'function' && callback($('#textarea_prompt').val(), event) === false) return;
                instance.hide();
            }
        }, 'cancel'],
        onEnterKey: () => {
            $('.mbsc-fr-btn0').click();
        }
    }, opts);
    mobiscrollHelper.initButtonFun(opts, callback);

    opts.html = `<textarea id="textarea_prompt" rows="3" class="form-control alt-dm" placeholder="...">` + opts.html + `</textarea>`,
        opts.dailog = buildDialog(opts).parents('.mbsc-fr-c').css({
            padding: 0,
            marginRight: '15px',
            marginBottom: '15px'
        });
    setTimeout(() => $('#textarea_prompt').focus(), 500);
    return opts.dialog;

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
        onShow: () => {
            // 对话框去除并自定义回车键的功能(默认时关闭界面的)
            $('.mbsc-wdg').on('keydown', (e) => {
                if (e.key.toLowerCase() == 'enter') {
                    e.stopPropagation();
                    e.preventDefault();
                    opts.onEnterKey && opts.onEnterKey();
                }
            });
        },
        // 不能多开.
        // onClose: function(event, instance) {
        //     instance.destroy();
        //     this.remove();
        // }
    });
    return dialog;
}


mobiscrollHelper.init();
mobiscrollHelper.test();