var g_tag = {
    init: () => {
        var data = {
            tags: ['tag1', 'tag2', 'tag3', 'tag4'],
            groups: {
                group1: {
                    tags: ['tag1']
                },
            }
        }
        g_tags = local_readJson('tags', data);

        registerAction('tagGroup_delete', (dom, action, params) => {
            var parent = $(dom).parents('[data-group]');
            var group = parent.attr('data-group');
            confirm1('确定删除吗?', (value) => {
                if (value) {
                    delete g_tags.groups[group];
                    local_saveJson('tags', g_tags);
                    parent.remove();
                }
            });
        });

        registerContextMenu('.tagGroup .tag', (dom, event) => {
            var tag = $(dom).text();
            confirm1('是否删除 ' + tag + '?', (value) => {
                if(value){
                    var i = g_tags.tags.indexOf(tag);
                    if (i != -1) g_tags.tags.splice(i, 1);
                    for (var group of g_tag.getTagGrouped(tag)) {
                        var i = g_tags.groups[group].tags.indexOf(tag);
                        if (i != -1) g_tags.groups[group].tags.splice(i, 1);
                    }
                    local_saveJson('tags', g_tags);

                    var i = g_tag.showingData.t.indexOf(tag);
                    if (i != -1) g_tag.showingData.t.splice(i, 1);
                    g_tag.updateTagGroup();
                }
            });
        });

        
        registerAction('tag_toGroup', (dom, action, params) => {
            var target = $('[data-group="'+$(dom).text()+'"]');
            if(target.length){
                $(target).addClass('div-border')[0].scrollIntoViewIfNeeded();
                setTimeout(() => $(target).removeClass('div-border'), 3000);
            }
        });

        registerAction('tagGroup_add', (dom, action, params) => {
            prompt1('输入标签组', (group) => {
                if (typeof(group) == 'string' && group.length) {
                    g_tags.groups[group] = {
                        tags: []
                    }
                    local_saveJson('tags', g_tags);
                    g_tag.updateTagGroup();
                }
            });

        });
        registerAction('tagGroup_tagClick', (dom, action, params) => {
            var tag = $(dom).text();
            var checked = $(dom).toggleClass('badge-primary').hasClass('badge-primary');
            if ($('#modal-custom').attr('data-type') == 'tags') {
                g_tag.addTagToShowing(tag, checked);
            } else {

            }
        });

        // 当前图片标签列表的标签
        registerAction('tagClick', (dom, action, params) => {
            g_tag.addTagToShowing($(dom).text(), !$(dom).hasClass('badge-primary'));

        });

        // 搜索栏的标签
        registerAction('tagAddFromSearch', (dom, action, params) => {
            g_tag.addTagToShowing($(dom).text(), !$(dom).hasClass('badge-primary'));
        });

        
        registerAction('tagGroup_rename', (dom, action, params) => {
            var parent = $(dom).parents('[data-group]');
            var group = parent.attr('data-group');
            prompt1({title: '改名', html: group}, (name) => {
                if (typeof(name) == 'string' && name.length) {
                    if(name == group){
                        return;
                    }
                    if(g_tags.groups[name]){
                       alert('名称已经存在');
                       return false;
                    }
                    g_tags.groups[name] = g_tags.groups[group];
                    delete g_tags.groups[group];
                    local_saveJson('tags', g_tags);
                    g_tag.updateTagGroup();
                }
            });
        });
        registerAction('addTagToGroup', (dom, action, params) => {
            var parent = $(dom).parents('[data-group]');
            var group = parent.attr('data-group');
            prompt1('添加标签到 ' + group, (tag) => {
                if (typeof(tag) == 'string' && tag.length) {
                    if (parent.find('.tag[data-value="' + tag + '"]').length) {
                        return alert('标签已经存在');
                    }
                    var grouped = g_tag.getTagGrouped(tag);
                    if (grouped.length) {
                        return alert('标签已经存在与 ' + grouped[0]);
                    }
                    if (g_tags.tags.indexOf(tag) == -1) g_tags.tags.push(tag);
                    if (group != '未分组') { // 有指定组
                        if (g_tags.groups[group].tags.indexOf(tag) == -1) g_tags.groups[group].tags.push(tag);
                    }
                    local_saveJson('tags', g_tags);
                    g_tag.updateTagGroup();

                }
            }); // todo 搜索所有标签

        });
        // g_tag.openDialog('f9a22fe4cea56137e924b8e28daaa205');


    },

    updateTagGroup: () => {
        $('.tagGroup').replaceWith(g_tag.getGroupListHtml());
        g_tag.loadPicTags(g_tag.showingData.t);

    },

    // 获取含有标签的所有分组    
    getTagGrouped: (tag) => {
        return Object.keys(g_tags.groups).filter((group) => {
            return g_tags.groups[group].tags.indexOf(tag) != -1
        })
    },
    isTagSelected: (tag) => {
        return g_tag.getSelectedTag(tag).length > 0;
    },
    getSelectedTag: (tag) => {
        return $('#modal_tags .tag[data-value="' + tag + '"]');
    },
    // 添加标签到当前图片标签列表
    addTagToShowing: (tag, add = true) => {
        startVibrate(25);
        $('#input_tag').val('');
        var tags = g_tag.showingData.t || [];
        var i = tags.indexOf(tag);
        if (add) {
            if (i == -1) tags.push(tag);
        } else {
            if (i != -1) tags.splice(i, 1);
        }
        g_tag.showingData.t = tags;
        g_tag.loadPicTags(tags);
    },
    // 获取tag html结构
    getTagHtml: (opts) => {
        opts = Object.assign({
            withGroup: true
        }, opts)
        html = `<span class="badge {m} tag badge-pill ` + opts.class + `" data-value="` + opts.tag + `"` + (opts.action ? ' data-action="' + opts.action + '"' : '') + `>` + (opts.html || opts.tag) + `</span>`;
        if (opts.withGroup) {
            var group = g_tag.getTagGrouped(opts.tag);
            html = `
                <span class="badge-group {m}" role="group">
                  <a data-action="tag_toGroup" class="badge badge-success">` + (group.length ? group[0] : '未分组') + `</a>
                  ` + html.replace('{m}', '') + `
                </span>`
        }
        return html.replace('{m}', 'm-10');
    },
    // 获取没有被编入组的标签
    getNotGroupedTag: () => {
        var tags = g_tag.getAllTags();
        var grouped = g_tag.getAllTags(true);
        return tags.filter((i) => grouped.indexOf(i) == -1);
    },

    // 获取标签组html
    getGroupListHtml: () => {
        var groups = Object.assign({
            未分组: { tags: g_tag.getNotGroupedTag() }
        }, g_tags.groups);
        var groupHtml = `<div class="tagGroup">
            <div class="p-10">
                <i class="fa fa-plus" data-action="tagGroup_add" aria-hidden="true"></i>
            </div>
        `;
        var sort = ['未分组'].concat();
        // todo 自定义分组排序
        var list = Object.keys(groups);
        for (var k of sort) {
            // 先移除
            var i = list.indexOf(k);
            if (i != -1) list.splice(i, 1);
        }
        // 再添加到首部
        for (var i = sort.length - 1; i >= 0; i--) list.unshift(sort[i]);
        for (var group of list) {
            if (!groups[group]) continue;
            var d = groups[group];
            groupHtml += `
                <div class="row border-top border-bottom p-10" style="align-items: center;" data-group="` + group + `">
                    <div class="col" >
                        <span class="group-name">` + group + `</span>
                        <span class="badge badge-primary">` + d.tags.length + `</span>
                    </div>
                    <div class="col text-right">
                        <a data-action="addTagToGroup" class="btn btn-square rounded-circle mr-10"  role="button">
                            <i class="fa fa-plus " aria-hidden="true"></i>
                        </a>
                        <div class="dropdown text-right mt-15">
                                <i data-toggle="dropdown" class="fa fa-ellipsis-h" aria-hidden="true"></i>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" data-action="tagGroup_rename">編集</a>
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-content">
                                        <button class="btn btn-block btn-danger" data-action="tagGroup_delete" type="button">删除</button>
                                    </div>
                                </div>
                        </div>
                    </div>

                    <div class="col-12">
            `;
            for (var tag of d.tags) {
                groupHtml += g_tag.getTagHtml({
                    tag: tag,
                    action: 'tagGroup_tagClick',
                    withGroup: false
                });
            }
            groupHtml += `</div>
                </div>`
        }
        return groupHtml + '</div>';
    },
    // 打开主界面
    openDialog: async (key) => {
        g_tag.showingKey = key;
        var data = g_database.getImgData(key);
        if (!data) return;
        g_tag.showingData = data;
        var modal = modalOpen({
            id: 'modal-custom',
            fullScreen: true,
            type: 'tags',
            title: `
                 <div class="w-full text-right "> 
                    <a class="btn mr-5" role="button" onclick="g_tag.closeDialog(false, false);" >Close</a>
                    <a class="btn btn-primary" onclick="g_tag.closeDialog();" role="button">Save</a>
                  </div>
            `,
            width: '100%',
            height: '100%',
            canClose: false,
            html: `
                <div class="row">
                    <div class="col-sm-12 col-md-6 mb-10 border-right flex-center-vh">
                          <img id="dialog_tag_img" src="` + await g_database.getImageUrl(key, data.i, false) + `" style="width: 100%;margin: 0 auto;padding: 10px;">
                    </div>
                    <div class="col col-sm-6 col-md-3 p-10">
                        <input type="text" id="input_tag" class="form-control" placeholder="输入标签" onkeydown="if(event.keyCode==13) g_tag.addTagToShowing(this.value, true)" oninput="g_tag.searchTag(this.value);">
                        <hr class="m-10">
                        <div id="modal_tags">
                        </div>
                    </div>
                    <div class="col col-sm-6 col-md-3">
                       <div class="overflow-x-hidden overflow-y-scroll overflow-h" data-maxheight="` + ($(window).height() - 200) + `"> 
                          ` + g_tag.getGroupListHtml() + `
                        </div>
                    </div>
                </div>
            `,
            onShow: () => {
                setTimeout(() => $(window).resize(), 300);
            },
            onClose: () => {
                return true;
            }
        });

        g_tag.loadPicTags(data.t);
    },

    // 加载图片标签
    loadPicTags: (tags) => {
        var h = '';
        $('.tagGroup .badge[data-value].badge-primary').removeClass('badge-primary');
        if (tags) {
            for (var tag of tags) {
                h += g_tag.getTagHtml({
                    tag: tag,
                    action: 'tagClick',
                    class: 'badge-primary'
                });
                $('.tagGroup .tag[data-value="' + tag + '"]').addClass('badge-primary');
            }
        }
        $('#modal_tags').html(h);
    },

    // 关闭主界面
    closeDialog: (save = true, confirm = true) => {
        if (!save) {
            if (confirm && !confirm('不保留更改吗?')) {
                return halfmoon.toggleModal('modal-custom');
            }
        }
        var tags = [];
        for (var tag of $('#modal_tags .badge[data-value]')) {
            tags.push($(tag).attr('data-value'));
        }
        g_tag.showingData.t = tags;
        g_database.saveImgData(g_tag.showingKey, g_tag.showingData);
        delete g_tag.showing;
        halfmoon.toggleModal('modal-custom');
    },

    // 创建标签
    createTag: (s) => {
        if (s != '') {
            if (g_tags.tags.indexOf(s) == -1) {
                g_tags.tags.push(s);
            }
        }
    },

    // 搜索标签
    searchTag: (s) => {
        var tags = g_tag.showingData.t;
        if (s == '') return g_tag.loadPicTags(tags);

        var py = PinYinTranslate.start(s);
        var sz = PinYinTranslate.sz(s);
        var h = ``;
        for (var tag of g_tag.getAllTags().filter((t) => {
                return t.indexOf(s) != -1 || PinYinTranslate.start(t).indexOf(py) != -1 || PinYinTranslate.sz(t).indexOf(sz) != -1
            })) {
            h += g_tag.getTagHtml({
                tag: tag,
                action: 'tagAddFromSearch',
                class: tags && tags.indexOf(tag) != -1 ? 'badge-primary' : '',
                html: tag.replaceAll(s, '<span class="text-secondary">' + s + '</span>')
            });
        }
        $('#modal_tags').html(h);
    },

    // 获取所有标签
    getAllTags: (grouped = false) => {
        if (!grouped) return g_tags.tags;
        var tags = [];
        for (var group in g_tags.groups) {
            tags = tags.concat(g_tags.groups[group].tags);
        }
        return tags;
    }

}
g_tag.init();