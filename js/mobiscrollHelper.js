var mobiscrollHelper = {

    init: () => {

    },
    test: () => {
        $(function() {

            // var groups = ['a', 'b', 'c', 'd'];
            // var h = $(mobiscrollHelper.buildMulitSelect({
            //     id: 'mulitselect-demo',
            //     name: '分类',
            //     data: groups,
            //     selected: []
            // })).prepend('body');
            // var dialog = mobiscroll_(h, 'select', {
            //     minWidth: 200,
            //     preset: "select",
            //     closeOnOverlayTap: false,
            //     headerText: '为目录设置分类',
            //     buttons: [{
            //         text: _l('确定'),
            //         handler: function(event, instance) {
            //             instance.getVal()
            //         }
            //     }, {
            //         text: _l('取消'),
            //         handler: 'cancel'
            //     }],
            // });
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
        var h = '<select name="' + opts.name + '" id="' + opts.id + '">';
        for (var key in opts.data) {
            h += '<option value="' + key + '"' + (opts.selected && opts.selected == key ? ' selected' : '') + '>' + opts.data[key] + '</option>';
        }
        return h + '</select>';
    },

    buildMulitSelect: (opts) => {
        opts = Object.assign({ id: 'mulitselect-demo', data: {} ,selected: []}, opts);
        console.log(opts);
        var h = '<select name="' + opts.name + '" id="' + opts.id + '" multiple>';
        for (var key in opts.data) {
            h += '<option value="' + key + '"' + (opts.selected.indexOf(key) != -1 ? ' selected' : '') + '>' + opts.data[key] + '</option>';
        }

        return h + '</select>';
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
    select: function(opts){
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
                        opts.callback && opts.callback(instance);
                    }
                }, {
                    text: _l('取消'),
                    handler: 'cancel'
                }],
            }, opts.opts));
            return dialog;
    },
    // 给默认的按钮加上回调
    initButtonFun: function(opts, callback){
        for(var i in opts.buttons){
            var btn = opts.buttons[i];
            if(btn == 'set'){
                opts.buttons[i] = {
                    text: _l('确定'),
                    handler: function(event, instance) {
                        if (callback && callback(true) == false) return;
                        instance.hide();
                    }
                }
            }else
            if(btn == 'cancel'){
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
    password: function(opts, callback){
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
       
    }
}


window.alert1 = function(opts) {
    if (typeof(opts) != 'object') opts = { html: opts }
    opts = Object.assign({
        title: '提示',
        html: '',
        buttons: ['set'],

    }, opts);
    mobiscrollHelper.initButtonFun(opts);
    return buildDialog(opts);
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

// todo 监测按钮事件在进行回调？
window.confirm1 = function(opts, callback) {
    var b = typeof(opts) == 'object';
    if (!b) opts = { html: opts };
    opts = Object.assign({
        title: '请选择',
        buttons: ['set', 'cancel'],
         onEnterKey: () => {
            $('.mbsc-fr-btn0').click();
        }
    }, opts);

    mobiscrollHelper.initButtonFun(opts, callback);
    return buildDialog(opts);
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
    if (typeof(opts) != 'object' && typeof(callback) != 'function') {
        opts = { title: opts, html: callback };
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
            })
        }
    });
    return dialog;
}


mobiscrollHelper.init();
mobiscrollHelper.test();

$(document).ready(function() {


    return;
mobiscrollHelper.select({
        name: '选择计时方式',
        data: ['投票', '随机', '自由'],
        selected: 1,
        callback: (instance) => {
            console.log(instance.getVal());
            switch(parseInt(instance.getVal())){
                case 0:
                    g_room.send({
                        type: 'startVote',
                        data: {}
                    });
                    break;

                case 1:
                    var imgs = g_room.roomData.imgs;
                    var keys = Object.keys(imgs);
                    const fun = () => {
                        var random = imgs[arrayRandom(keys)];
                        confirm1({
                            title: '是否选择这张图?',
                            html: `<img src="${random.src}" class="w-full">`,
                            buttons: ['set', {
                                text: '再抽',
                                handler: function(event, instance) {
                                    fun();
                                }
                            }, 'cancel']
                        }, sure => {
                            console.log(sure);
                            if(sure){
                                 g_room.onRevice({
                                    type: 'countdown_start',
                                    data: random
                                });
                            } 
                        })
                    }
                    fun();
                   
                    break;

                case 2:
                    
                    break;
            }
            //instance.hide();
        },
        opts: {
            headerText: 'title',
        },
    });
});
