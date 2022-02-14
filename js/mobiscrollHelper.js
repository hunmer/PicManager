var mobiscrollHelper = {
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


}


mobiscrollHelper.test();