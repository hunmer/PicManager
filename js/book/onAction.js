 (() => {
    var self = g_book;
     registerActionList('book', {
        'book_loadList': (dom, action) => {
            loadRes([
            { url: './js/book/bookList.js', type: 'js' },
        ], () => {
            self.page = 1;
            self.maxPage = Math.ceil(Object.keys(g_book.data).length / self.pageMax);
           self.toPage(1);
        }, false)
         },
        'book_subContent': (dom, action) => {
             g_book.showSubContent($(dom).data('value'));
         },
        'book_coverClick': (dom, action) => {
           g_book.loadBook(dom.dataset.id, () => {
            $('#toolbar_book').html(g_book.viewing.n);
            g_book.showSubContent('viewer');
            g_book.toPage(g_book.viewing.page);
           });
        },
        'book_prevPage': (dom, action) => {
            g_book.prevPage();
         },
         'book_nextPage': (dom, action) => {
            g_book.nextPage();
         },
         'book_selectPage': (dom, action) => {
            mobiscrollHelper.step({
                headerText: _l('输入页数'),
                defaultValue: g_book.getPage(),
                max: g_book.getMaxPage(),
                min: 1,
            }, val => {
                g_book.toPage(parseInt(val));
            })
         },
         'book_share': (dom, action) => {
            if(!g_book.viewing) return toastPAlert(_l('没有选中任何'), 'alert-danger');
            if(!g_room.isConnected()) return toastPAlert(_l('没有连接房间'), 'alert-danger');
           // if(!g_room.isRoomMaster()) return toastPAlert(_l('没有权限'), 'alert-danger');
            g_room.send({
                type: 'book',
                data: g_book.viewing
            });
         },
         'book_action': (dom, action) => {
             var dialog = mobiscrollHelper.widget_actionWithIcon({
                 data: [{
                         action: 'book_share',
                         icon: 'text-primary fa-share',
                         text: _l('book_分享至房间')
                     }
                 ],
                 opts: {
                     headerText: _l('选择操作'),
                 }
             });
         },

         
     })



 })();