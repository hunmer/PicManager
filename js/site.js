var g_site = {
    inited: false,
    hosts: ['yande', 'konachan', 'sakugabooru', 'sankakucomplex', 'danbooru', 'behoimi', 'safebooru', 'gelbooru', 'worldcosplay', 'kawaiinyan', 'bilibili', 'anime_picture', 'lolibooru', 'zerochan', 'shuushuu', 'e926', 'e621', 'hypnohub', 'rule34'],
    init: function() {
        if (this.inited) return;
        this.inited = true;

        $(`<div id="subContent_site" class="subContent">
                <div class="gallery" id="gallery_site" style="">
                </div>
                <div class="menu" id="menu_site" style="right: 0px;
                display: grid;
                padding: 0px;
                top: 60px;
                opacity: .3;
                max-height: 40%;
                height: auto;"></div>

                <div class="menu" id="menu_sitePicMenu" style="right: 30px;
                display: none;
                z-index: 99999;
                padding: 0px;
                bottom: 30px;
                opacity: .3;
                max-height: 40%;
                height: auto;">
                    <a onclick="g_database.importImagesFromUrls(g_site.preview.element.dataset.origin);" class="btn btn-primary p-0 rounded-circle" style="width: 35px;height: 35px;">
                        <i class="fa fa-plus fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                    </a>
                </div>
        </div>`).appendTo('.content-wrapper');
        

        registerAction('site_select', (dom, action) => {
            g_site.loadSite($(dom).data('site'))
        });
        registerAction('site_img_action', (dom, action) => {
            // todo 选择目录，统一搞一个接口把..
            var img = $(dom).parents('.grid-item').find('img');
            g_database.importImagesFromUrls(img.data('origin'), false);

            var btn =  $(dom).find('.fa-plus');
            if(btn.length){
                btn.toggleClass('fa-plus fa-check');
                btn.parent().toggleClass('btn-primary btn-success');
            }
        });
        registerAction('site_img_click', (dom, action) => {
            g_site.preview = new Viewer(dom, {
                backdrop: 'static',
                toolbar: 0,
                navbar: 0,
                title: 0,
                toggleOnDblclick: true,
                viewed(){
                   $('#menu_sitePicMenu').show();
                },
                hide() {
                   $('#menu_sitePicMenu').hide();
                    g_site.preview.destroy();
                    delete g_site.preview;
                },
                url(image) {
                    return image.dataset.origin;
                },
            });
            g_site.preview.show();

            // if (isMobile() || $(dom).hasClass('img_selected')) {
            //     return g_site.loadImage(md5);
            // }
            // $('.img_selected').removeClass('img_selected');
            // $(dom).addClass('img_selected');
        });
        this.initHtml();
    },
    loadImage: function(img) {

    },
    initHtml: function() {
        var h = `<div class="hideScroll" style="margin-top: 6px;margin-bottom: 6px;">`;
        for (let host of this.hosts) {
            h += `
                <div data-action="site_select" data-site="${host}" class="m-5" style="width: 35px;height: 35px;">
                    <img src="res/${host}.ico" style="border-radius: 50%;" class="fit-image p-5">
                </div>
            `;
        }
        h += `</div>
       
        `;

        /*

     <div data-action="" style="width: 35px;height: 35px;margin-left: 8px;">
            <i class="fa fa-ellipsis-v fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
        </div>
        */
        $('#menu_site').html(h);
    },
    loadSite: function(site) {
        // todo 滚动
        $('.site_select').removeClass('site_select');
        $('[data-action="site_select"][data-site="'+site+'"]').addClass('site_selected')[0].scrollIntoViewIfNeeded();

        var self = this;
        self.clearGallery();
        g_page.setList('site', {
            // 
            // http://127.0.0.1/moePic/api.php
            // {lastId}
            url: 'https://neysummer-moepic.glitch.me/api.php?host=' + site + '&type=post&page={page}&limit=40&safe=false&lastId=&r18=1',
            lastId: '',
            page: 1,

            index: 0, // 默认页数
            lastIndex: 0, // 最后加载的索引
            pagePre: 10, // 每页加载
            timeout: 1000 * 30,
            element: '.content-wrapper', // 绑定元素
            requestData: function() {
                if(this.loading) return;
                this.loading = true;
                var url = this.url.replace('{page}', this.page).replace('{lastId}', this.lastId);
                console.log(url);
                // errorMsg: ""
                // hasMore: true
                // lastId: 928450
                // limit: "40"
                // page: "1"
                // r18: 28
                // res: 
                // safe: 32
                // unload: 8
                if(g_site.request && g_site.request.readyState == 1) g_site.request.abort();
                g_site.request = $.ajax({
                    url: url,
                    dataType: 'json',
                })
                .done((json) => {
                    this.lastId = json.lastId;
                    this.page = parseInt(json.page) + 1;
                    // console.log(json.res);
                    if(json.errorMsg){
                        return toastPAlert(json.errorMsg, 'alert-danger');
                    }
                    for (var item of json.res) {
                        // 如果动态加载数据,要保证插入的数据总在最后
                        // 对象用数字主键会改变顺序，这里直接用数组
                        this.datas.push(item);
                    }
                    g_page.nextPage('site');
                })
                .fail(function() {
                  // toastPAlert('请求失败!', 'alert-danger');
                }).
                always(() => {
                    this.loading = false;
                })
                
            },
            datas: [],
            bottomHtml: `
                <div class="grid-item w-full">
                    <h4 class="text-center mt-20">到底啦...</h4>
                </div>
            `,
            parseItem: function(index, key, data) {
                return g_site.getImageHtml(data, index);
            },
            done: function(h) {
                var data = {};
                if (this.lastIndex > 0) {
                    data.insertMode = 'append';
                }
                g_site.loadHtml(h, data);
            }
        });
        g_page.nextPage('site');
    },
    getImageHtml: (d, index) => {
        return `
        <div class="grid-item" data-index="${index}">
            <div style="height: ` + arrayRandom([150, 175, 200]) + `px;background-color: ` + getRandomColor() + `;">
              <img class="photo lazyload" data-action="site_img_click" src="` + d.preview_url + `" data-origin="${d.jpeg_url || d.sample_url || d.jpeg_url || d.file_url }">
            </div>
            <a class="btn btn-square rounded-circle btn-primary" data-action="site_img_action" style="opacity: .2;position: absolute;bottom: 8px;right: 8px; width: 30px;height: 30px;" role="button"> <i style="line-height: 30px;" class="fa fa-plus fa-2x" aria-hidden="true"></i></a>
        </div>`;
    },
    loadHtml: (h, opts) => {
        var items = $(h);
        if (!g_site.grid || opts.insertMode == undefined) {
            // 初始化
            g_site.grid = $('#gallery_site').html(items).isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                // resize: true,
                transitionDuration: 200,
                getSortData: {
                    // index: '[data-index]',
                    reverse: function(itemElem) {
                        var index = $(itemElem).attr('data-index');
                        return 0 - parseInt(index);
                    }
                }
            });
        } else {
            if (opts.insertMode == 'append') {
                g_site.grid.append(items).isotope('appended', items);
            } else
            if (opts.insertMode == 'prepend') {
                g_site.grid.prepend(items).isotope('prepended', items);
            }
        }
        g_site.grid.find('.lazyload').lazyload()
        gridProgress(g_site.grid, 'site');
    },
    clearGallery: () => {
        if (g_site.grid) {
            g_site.grid.isotope('destroy');
            delete g_site.grid;
        }
        $('#gallery_site').html('');
    },
   
}