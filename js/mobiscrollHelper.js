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
            // console.log(h);
            // var dialog = mobiscroll_(h, 'select', {
            //     minWidth: 200,
            //     preset: "select",
            //     closeOnOverlayTap: false,
            //     headerText: '为目录设置分类',
            //     buttons: [{
            //         text: _l('确定'),
            //         handler: function(event, instance) {

            //             console.log(event, instance);
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
        for (var item of opts) {
            h += '<option value="1">' + item + '</option>';
        }
        return h + '</select>';
    },

    buildMulitSelect: (opts) => {
        opts = Object.assign({ id: 'mulitselect-demo', data: {} }, opts);
        var h = '<select name="' + opts.name + '" id="' + opts.id + '" multiple>';
        var i = 0;
        for (var item of opts.data) {
            h += '<option value="' + i + '"' + (opts.selected.indexOf(item) != -1 ? ' selected' : '') + '>' + item + '</option>';
            i++;
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

  
}

mobiscrollHelper.init();
mobiscrollHelper.test();