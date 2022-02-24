 (() => {

     registerActionList('pose', {
        'pose_subContent': (dom, action, params) => {
             g_pose.showSubContent($(dom).data('value'));
         },
        'pose_coverClick': (dom, action, params) => {
            if(g_pose.isSelecting()){
                g_pose.onSelectImage($(dom));
            }else{
                g_pose.openInlineViewer(dom.dataset.id);
            }
        },
        'pose_selectMode': (dom, action, params) => {
            if(!$(dom).toggleClass('btn-primary').hasClass('btn-primary')){
                g_pose.unselectAll();
            }
        },
        'pose_prevPage': (dom, action, params) => {
            g_pose.prevPage();
         },
         'pose_nextPage': (dom, action, params) => {
            g_pose.nextPage();
         },
         'pose_selectPage': (dom, action, params) => {
            mobiscrollHelper.step({
                headerText: _l('输入页数'),
                defaultValue: g_pose.page || 1,
                max: g_pose.maxPage,
                min: 1,
            }, val => {
                g_pose.toPage(val);
            })
         },
         'pose_share': (dom, action, params) => {
            var selected = g_pose.getSelectedVal();
            if(!selected.length) return toastPAlert(_l('没有选中任何'), 'alert-danger');
            if(!g_pose.isConnected()) return toastPAlert(_l('没有连接房间'), 'alert-danger');

            g_pose.unselectAll();
         },
         'pose_countdown': (dom, action, params) => {
            var selected = g_pose.getSelectedVal();
            if(!selected.length) return toastPAlert(_l('没有选中任何'), 'alert-danger');
            g_pose.startGame(selected);
            g_pose.unselectAll();
         },
         '': (dom, action, params) => {
            
         },

         
     })



 })();