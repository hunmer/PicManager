var g_book = {
    pageMax: 30,
    cache: {},
    preload: function() {
        registerAction('loadPlugin_book', (dom, action) => {
            if (!g_book.inited) {
                g_book.init();
               self.showSubContent('list');
            }
            showContent('book');
        });
         this.loadScripts(() => {
            self.showSubContent('list');
        });
        // $(function() {
        //     setTimeout(() => doAction(null, 'loadPlugin_book'), 2000);
        // });
    },
    loadScripts: function(callback) {
        loadRes([
            // { url: './js/book/bookList.js', type: 'js' },
            { url: './js/book/onAction.js', type: 'js' },
        ], () => {
            callback && callback();
        }, false)
    },
    destroy: function() {
        if (this.viewer) {
            this.viewer.destroy();
            delete this.viewer;
        }
    },
    init: function() {
        var self = this;
        if (this.inited) return;
        this.inited = true;
        this.registerContent();
       
    },
    initMenu: function(type, data) {
        if (!data) {
            switch (type) {
                case 'list':
                    data = [];
                    break;

                case 'viewer':
                     data = [
                        { action: "book_share", class: "btn-secondary", icon: "fa-share" },
                    ];
                    break;

                case 'search':
                    data = [];
                    break;

                default:
                    return;
            }
        }
        return initMenu('#menu_bookMenu', data);
    },
    registerContent: function() {
        $(`
          <div class="toolbar text-center hide" id="toolbar_book">
               
          </div>
          `).appendTo('#navbar-content')

        registerContent({
            id: 'book',
            html: `
                <div id="subContent_book" class="subContent">
                     <div id="book_main" class="animated fadeIn w-full" animated='fadeIn'>

                         <div class="btn-toolbar rounded" role="toolbar"> 
                          <div class="btn-group mx-auto w-full">
                            <button class="btn btn-square" type="button" data-action="book_subContent" data-value="list">${_l('book_列表')}</button>
                            <button class="btn btn-square" type="button" data-action="book_subContent" data-value="viewer">${_l('book_浏览')}</button>
                          </div>
                        </div>

                        <div id="book_content" class="overflow-x-hidden overflow-y-scroll w-full overflow-h">
                              <div id="book_subContent_list" class="book_subContent hide animated fadeIn" animated='fadeIn'>
                                <div id="book_list">
                                    <button class="btn btn-primary btn-block mt-10" data-action="book_loadList">Load</button>
                                </div>
                              </div>
                              <div id="book_subContent_viewer" class="book_subContent hide animated fadeIn" animated='fadeIn'>
                                <div id="book_viewer">
                                     <div class="w-full mt-10" id="div_bookImg">
                                        <img class="w-full">
                                    </div>
                                </div>
                            </div>
                                <div id="book_subContent_search" class="book_subContent hide animated fadeIn" animated='fadeIn'>
                                </div>
                        </div>

                         <div class="menu bottom_right_menu" id="menu_bookMenu" style="right: 20px;
                            z-index: 99999;
                            padding: 0px;
                            bottom: 60px;
                            opacity: .3;
                            max-height: 40%;
                           
                            height: auto;">
                               
                            </div>
                        
                    </div>
                </div>
            `,
            initNavBottom: () => {
                return `
                    <div id="bottom_book" class="d-flex w-full" style="margin: 0 auto;border-radius: 20px;display: flex;align-items: center;">

                        <nav class="ml-auto">
                          <ul class="pagination m-0">
                            <li class="page-item" data-action="book_prevPage">
                              <a class="page-link">
                                <i class="fa fa-angle-left" aria-hidden="true"></i>
                              </a>
                            </li>
                            <li data-action="book_selectPage" class="page-item active" aria-current="page">
                              <a class="page-link" tabindex="-1">1</a>
                            </li>
                            <li data-action="book_nextPage" class="page-item">
                              <a class="page-link">
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                              </a>
                            </li>
                          </ul>
                        </nav>
                    </div>
                `;
            },
            onShow: () => {
                g_book.init();
                $('.content-wrapper').css('overflowY', 'hidden'); // 自定义滚动内容
            },
            overflowY: true,
        })
    },

    getBook: function(id) {
        return this.data[id];
    },

    loadBook: function(id, callback) {
        if(typeof(id) == 'object'){
            this.viewing = id;
        }else
        if (!this.viewing || id != this.viewing.id) {
            this.viewing = Object.assign({
                id: id,
                page: 1
            }, this.getBook(id));
        }
        callback();
    },

    showSubContent: function(id, classes = 'book_subContent') {
        if (g_book.currentContent == id) return;
        g_book.currentContent = id;
        g_book.initMenu(id);
        showSubContent(classes, id);
        switch (id) {
            case 'list':
                this.setCuttentPage(this.page, this.maxPage);
                break;

            case 'viewer':
                if (this.viewing) {
                    this.setCuttentPage(this.viewing.page, this.viewing.p);
                }
                break;

        }
        resizeCustomScroll();
    },

    isViewList: function(){
       return  g_cache.showing == 'book' && this.currentContent == 'list';
    },

    getPage: function(){
        return this.isViewList() ? this.page : this.viewing.page;
    },

    getMaxPage: function(){
        return this.isViewList() ? this.maxPage : this.viewing.p;
    },

    prevPage: function() {
        var page = this.getPage();
        if (page > 1) {
            this.toPage(page - 1);
        }
    },

    nextPage: function() {
        var page = this.getPage();
        var max = this.getMaxPage();
        if (page < max) {
            this.toPage(page + 1);
        }
    },

    toBookPage: function(page = 1) {
        this.viewing.page = page;
        this.setShowingImage(this.viewing.i + page + '.png');
        this.setCuttentPage(page, this.viewing.p);
    },

    setCuttentPage: function(page, max) {
        getAction('book_selectPage').children().html(page);
        getAction('book_prevPage').toggleClass('disabled', page <= 1);
        getAction('book_nextPage').toggleClass('disabled', page >= max);
    },

    setShowingImage: function(url) {
        //  this.viewer.destroy();
        var id = g_cache.showing == 'room' ? 'div_bookImg_room' : 'div_bookImg';
        if(!this.cache[id]){
            this.cache[id] = initViewer($(`#${id} img`).attr('src', url)[0], {
                inline: true,
            }, {});
        }else{
            this.cache[id].image.src = url;
        }
        this.cache[id].show();
    },

    toPage: function(page = 1) {
        if (!this.isViewList()) {
            return this.toBookPage(page);
        }
        this.page = page;
        this.setCuttentPage(page, this.maxPage);
        var ids = [];
        var list = Object.keys(g_book.data);
        for (var i = 0; i < this.pageMax; i++) {
            var k = i + (page - 1) * this.pageMax;
            if (k > list.length - 1) break;
            ids.push(list[k]);
        }
        $('#book_list').html(this.getHtml(ids)).find('.lazyload').lazyload();
        g_book.showSubContent('list');
    },

    getHtml: function(books) {
        console.log(books);
        var h = '<div class="row">';
        for (var id of books) {
            var item = g_book.data[id];
            h += `
                <div class="col-4" data-id="${id}" data-action="book_coverClick">
                    <img class="w-full p-10 lazyload" src="./js/book/cover/${id}.jpg">
                </div>
            `
        }
        h += '</div>';
        return h;
    },
}
g_book.preload();