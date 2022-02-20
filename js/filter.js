var g_filter = {
    filters: g_config.filters || {
        0: {
            name: "全部",
            icon: "fa-inbox",
            value: "{}"
        },
        1: {
            name: "未分类",
            icon: "fa-file-photo-o",
            value: JSON.stringify({ tag_cnt: "data.t && data.t.length == 0" }),
        },
        2: {
            name: "未完善",
            icon: "fa-question",
            value: JSON.stringify({ tag_array: "data.t && searchArray(data.t, [`未完善`])" })
        },
        3: {
            name: "临摹",
            icon: "fa-file-photo-o",
            value: JSON.stringify({ tag_array: "data.t && searchArray(data.t, [`临摹`])" })
        },
        4: {
            name: "网络图片",
            icon: "fa-file-photo-o",
            value: JSON.stringify({ url: "data.i.startsWith(`http`)" })
        },
        5: {
            name: "最近",
            icon: "fa-history",
            value: JSON.stringify({ pratice: 1 })
        },
    },
    getFilterByName: function(name, key = false) {
        for (var t in this.filters) {
            var d = this.filters[t];
            if (d.name == name) {
                return key ? t : d;
            }
        }
        return -1;
    },
    getFilter: function(key) {
    	return this.filters[key];
    },
    removeFilter: function(k) {
    	if(Object.keys(this.filters).length == 1){
    		toastPAlert('至少保留一个过滤器!', 'alert-danger');
    		return false;
    	}
        if (this.filters[k]) {
            delete this.filters[k];
            this.save();
            return true;
        }
    },
    removeFilterByName: function(name) {
        var i = this.getFilterByName(name, 1);
        if (i) {
            removeFilter(i);
        }
    },
    saveFilter: function(data) {
        var i = this.getFilterByName(name, 1);
        if (i != -1 && i != data.old) {
            if (!confirm('已存在相同的名称的过滤器,是否覆盖?')) {
                return false;
            }
            data.old = i;
        }
        i = data.old || Object.keys(this.filters).length
        console.log(i);
        this.filters[i] = data;
        this.save();
        return i;
    },
    save: function() {
        g_config.filters = this.filters
        local_saveJson('config', g_config);
    },

    getSelectedFilter: function(){
    	return g_filter.folder_rm ? g_filter.folder_rm.filter : '';
    },
    init: function() {
        // this.list = g_config.filters;
        let hideFolder_rm = () => {
            if (g_filter.getSelectedFilter()) g_filter.folder_rm.dialog.mobiscroll('hide');
        }
        registerAction('filter_edit', (dom, action, params) => {
            hideFolder_rm();
            var filter = action[1] || g_filter.getSelectedFilter();
            var d = g_filter.getFilter(filter) || {
            	name: '',
                icon: 'fa-inbox',
                value: '{"key": ""}',
            }
            console.log(d);

            modalOpen({
                id: 'modal-custom',
                type: 'filter_edit',
                width: '80%',
                title: '过滤器',
                canClose: true,
                html: `
                <div class="input-group">
				  <div class="input-group-prepend">
				    <span class="input-group-text">名字</span>
				  </div>
				  <input id="input_filter_name" type="text" class="form-control" placeholder="name" value="${d.name}">
				</div>

				<div class="input-group mt-10">
				  <div class="input-group-prepend">
				    <span class="input-group-text">表示式</span>
				  </div>
				  <textarea id="input_filter_value" class="form-control" placeholder="{xxx: "xxx"}">${JSON.stringify(JSON.parse(d.value),null, '\t')}</textarea>
				</div>
                <div class="text-right mt-10">
                    <a class="btn btn-primary" role="button" data-action="filter_save">保存</a>
                  </div>
                        `,
                onClose: () => {
                    return true;
                }
            });

        });
        registerAction('filter_save', (dom, action, params) => {
            var vals = checkInputValue(['#input_filter_name', '#input_filter_value']);
            if (vals) {
                console.log(vals);
                try {
                    JSON.parse(vals[1]);
                } catch {
                    return toastPAlert('错误的表达式!', 'alert-danger');
                }
                var filter = action[1] || g_filter.getSelectedFilter();
                if (g_filter.saveFilter({
                        old: filter,
                        name: vals[0],
                        icon: 'fa-inbox',
                        value: vals[1]
                    }) !== false) { // todo icon
                    halfmoon.toggleModal('modal-custom');
                    g_filter.initHtml();
                    toastPAlert('保存成功!', 'alert-success');
                }
            }
        });
        registerAction('filter_delete', (dom, action, params) => {
            hideFolder_rm();
            var filter = action[1] ||  g_filter.getSelectedFilter();
            if (filter) {
                if (confirm('确定删除吗?')) {
                    g_filter.removeFilter(filter);
                    g_filter.initHtml();
                }
            }
        });
        registerContextMenu('.sidebar-link[data-action="setFilter"]', (dom, event) => {
            var d = $(dom);
            var dialog = mobiscroll_($('#mobi_div').html(`
                <div id="widget">
                    <div class="md-dialog">
                        <h4 data-action="filter_edit" class="hover" >
                            <i class="fa fa-pencil mr-10"aria-hidden="true"></i>
                        编辑</h4>
                        <h4  data-action="filter_delete" class="text-danger hover">
                            <i class="fa fa-trash-o mr-10" aria-hidden="true"></i>
                        删除</h4>
                    </div>
                </div>
                `), 'widget', {
                closeOnOverlayTap: true,
                headerText: d.find('.filter-name').html(),
                buttons: [],
            });
            g_filter.folder_rm = {
                filter: d.data('filter'),
                dialog: dialog,
            }
        });
        this.initHtml();
    },

    initHtml: function() {
        var h = '';
        var list = this.filters;
        for (var index in list) {
            var d = list[index];
            h += `
			 <a class="sidebar-link sidebar-link-with-icon" data-action="setFilter" data-filter="${index}" data-value='${d.value}'}'>
                        <span class="sidebar-icon">
                            <i class="fa ${d.icon}" aria-hidden="true"></i>
                        </span>
                        <span class="filter-name">${d.name}</span>
                    </a>
			`
        }
        $('#sidebar_filters').html(h);
    },


}

g_filter.init();