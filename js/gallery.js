var _viewer;
var g_gallery = {
        grid: undefined,
        hover: {},
        hidePreview: () => {
            if (g_gallery.preview) g_gallery.preview.hide();
        },
        init: () => {

            g_gallery.rm = $(`
            <div style="position: fixed;top: 0; left: 0;width: 100%;height: 100%;z-index: 99999;display: none;background-color: rgba(0, 0, 0, .5);" onclick="
            if(event.target == this){
             var x = event.clientX;
            var y = event.clientY;
            var l = $('#rm_photo').offset().left;
            var t = $('#rm_photo').offset().top;
            if(!(x >= l && x <= l + $('#rm_photo').width() && y >= t && y <= t + $('#rm_photo').height())){
                this.style.display = 'none';
            }
        }
            ">
                <div id="rm_target" class="position-absolute"></div>
                <div id="rm_photo" class="w-125 bg-white row position-absolute p-5 border rounded w-auto" >
                    <button class="btn btn-block btn-secondary mt-10" data-action="img_setFolder" type="button" data-mulitable="1"><i class="fa fa-trash-o" aria-hidden="true"></i>
                        设置目录
                    </button>
                    <button class="btn btn-block btn-primary mt-10" data-action="tagImage" type="button"><i class="fa fa-tag" aria-hidden="true"></i>
                        标签
                    </button>
                     <button class="btn btn-block btn-primary mt-10" data-action="img_share" type="button"><i class="fa fa-share" aria-hidden="true"></i>
                        分享
                    </button>
                    <button class="btn btn-block btn-danger mt-10" data-action="img_delete" type="button" data-mulitable="1"><i class="fa fa-trash-o" aria-hidden="true"></i>
                        删除
                    </button>
                </div>
            </div>
        `).appendTo('body');
            g_gallery.preview = $(`<div style="width: 100%;position: fixed;left: 0;z-index: 2;display: none;"></div>`).appendTo('body');

            if (g_cache.isPC) {
                $('#sidebar-right-hover').on('mouseover mouseout', function(event) {
                    if (event.type == "mouseover") { // 进入

                        g_cache.sidebarHover = setTimeout(() => {
                            $('#sidebar-right-hover').hide();
                            var sidebar = $('#div_detail');
                            if (sidebar.hasClass('hide')) {
                                sidebar.attr('data-ishover', true);
                                g_gallery.switchDetailBar(true);
                            }
                        }, 150)
                    } else {
                        clearTimeout(g_cache.sidebarHover)
                    }
                });

                $('#div_detail').on('mouseout', function(event) {
                    var sidebar = $('#div_detail');
                    if (!$(event.relatedTarget).parents('#div_detail').length) { // 不是父元素下的子元素触发的
                        if (event.clientX <= sidebar.offset().left) { // 如果鼠标是向左边移动
                            if (sidebar.attr('data-ishover')) {
                                sidebar.attr('data-ishover', null);
                                g_gallery.switchDetailBar(false);
                            }
                        }

                    }

                });

                $(document).on('mouseover mouseout', '.photo', function(event) {
                    var d = g_gallery.hover;
                    if (event.type == "mouseover") { // 进入
                        if (d.timer) clearTimeout(d.timer);
                        d.timer = setTimeout(() => {
                            delete d.timer;
                            var dom = $('.photo:hover');
                            if (dom.length) {
                                var offset = dom.offset();
                                var parent = $('#gallery_list');
                                var style = {
                                    left: parent.offset().left,
                                };
                                // 计算div的顶部与高度
                                var wh = $(window).height();
                                if (offset.top < wh / 2) { // 小于屏幕一半
                                    x = offset.top + dom.height() + 10;
                                    style.top = x;
                                    style.height = wh - x;
                                } else {
                                    x = offset.top - 10;
                                    style.bottom = x;
                                    style.height = x;
                                }

                                // 计算图片合理显示位置
                                var l = parent.offset().left;
                                x = offset.left - l;
                                var img = $(`<img src="` + g_database.getImageUrl($(dom).parents('[data-md5]').data('md5'), '', false) + `" style="height: 100%;position: absolute;">`);
                                img.on('load', function(event) { // 图片加载完毕
                                    if (x + this.width * style.height / this.height > parent.width()) { // 超出屏幕
                                        img.css('right', l + 'px');
                                    } else {
                                        img.css('left', x + 'px');
                                    }
                                    g_gallery.preview.fadeIn('slow');
                                })
                                g_gallery.preview.css(style).html(img);
                            }
                        }, 1000);
                        return;
                    }
                    if (d.timer) clearTimeout(d.timer) & delete d.timer;
                    g_gallery.preview.fadeOut('slow');
                });
            }


            registerAction('switchDetailBar', (dom, action, params) => {
                g_gallery.switchDetailBar();
            });
            registerAction('switchImageTools', (dom, action, params) => {
                var show = $(dom).toggleClass('text-primary').hasClass('text-primary');
                $('#toolbar_pic_items').css('display', show ? 'inherit' : 'none')
                $('#badge_cd').toggleClass('hide1', show || !g_cd.getOpts('image'));
            });


            registerAction('errorImages', (dom, action, params) => {
                    var h = ``;
                    for (var md5 of g_gallery.errorImgs) {
                        h += `
                         <div class="alert alert-danger mb-10" data-md5="${md5}" role="alert">
                          <h4 class="alert-heading">图片加载错误</h4>
                          ${md5}
                            <i onclick="g_gallery.removeErrorImg('${md5}')" class="fa fa-trash-o text-danger float-right"></i>
                        </div>   
                            `;
                    }
                    modalOpen({
                        id: 'modal-custom',
                        fullScreen: true,
                        type: 'errorImgs',
                        width: '80%',
                        title: '错误图片',
                        canClose: true,
                        html: h + `
                        <div class="text-right mt-10">
                            <a onclick="g_gallery.removeAllErrorImg()" class="btn btn-danger" role="button">删除文件</a>
                            <a class="btn btn-primary" role="button" onclick="g_gallery.errorImgs = []; g_gallery.updateErrImage();">清除通知</a>
                            
                          </div>
                        `,
                        onClose: () => {
                            return true;
                        }
                    });
            });
        registerAction('img_share', (dom, action, params) => {
            g_autojs.log('shareFile', g_database.getLocalFile(g_gallery.rmMd5))
            g_gallery.showMenu(false);
        });
        registerAction('mulit_select', (dom, action, params) => {
            $(dom).toggleClass('btn-primary');
        });




        registerAction('img_setFolder', (dom, action, params) => {
            var h = '';
            var dialog = mobiscroll_($('#mobi_div').html(mobiscrollHelper.buildGroupSelect({
                id: '',
                data: g_database.getFolderGroup()
            })), 'select', {
                group: true,
                closeOnOverlayTap: false,
                headerText: '选择目录',
                buttons: [{
                    text: _l('确定'),
                    handler: 'set'
                }, {
                    text: _l('取消'),
                    handler: 'cancel'
                }],
            });
            dialog.parents('.mbsc-fr-w').addClass('bg-dark p-10'); // bootstarp 莫名透明
            g_database.folder_rm = {
                folder: d.data('folder'),
                dialog: dialog,
            }


            var doms = $('#gallery_list .grid-item .img_selected')
            if (!confirm('是否删除' + doms.length + '张图片?')) return;
            for (var d of doms) {
                var md5 = $(d).parents('[data-md5]').data('md5');
                g_gallery.grid.isotope('remove', d);
                g_autojs.log('deleteImage', g_database.getLocalFile(md5))
                g_database.removeImgData(md5);
            }
            setTimeout(() => g_gallery.grid.isotope('layout'), 200);
            g_gallery.showMenu(false);
            if (g_cache.showing == 'detail') back();
        });

        registerAction('img_delete', (dom, action, params) => {
            if(dom.tagName != 'IMG'){ // 按钮触发删除
                dom = $('.grid-item[data-md5="'+g_gallery.rmMd5+'"] img');
            }
            var doms = $('#gallery_list .grid-item .img_selected')
            if(!doms.length) doms = [dom]; // 没有多选

            if (!confirm('是否删除' + doms.length + '张图片?')) return;
            for (var d of doms) {
                var item = $(d).parents('[data-md5]');
                var md5 = item.data('md5');
                g_gallery.grid.isotope('remove', item);
                g_autojs.log('deleteImage', g_database.getLocalFile(md5))
                g_database.removeImgData(md5);
            }
            setTimeout(() => g_gallery.grid.isotope('layout'), 200);
            g_gallery.showMenu(false);
            if (g_cache.showing == 'detail') back();
        });

        registerAction('openLink', (dom, action, params) => {
            var url = $('#detail_link').val();
            if (url != '') {
                window.open(url, '_blank');
            }
        });

        registerAction('tagImage', (dom, action, params) => {
            g_tag.openDialog(g_gallery.rmMd5 || g_database.showingImage);
            g_gallery.showMenu(false);
        });

        registerAction('markImage', (dom, action, params) => {
            g_mark.openDialog(g_database.showingImage);
            g_gallery.showMenu(false);
        });
        registerAction('flipX', (dom, action, params) => {
            _viewer.scaleX(_viewer.imageData.scaleX == -1 ? 1 : -1);
        });

        registerAction('flipY', (dom, action, params) => {
            _viewer.scaleY(_viewer.imageData.scaleY == -1 ? 1 : -1);
        });

        registerAction('rotateLeft', (dom, action, params) => {
            _viewer.rotate(-25);
        });

        registerAction('rotateRight', (dom, action, params) => {
            _viewer.rotate(25);
        });

        registerAction('resetViewer', (dom, action, params) => {
            _viewer.reset();
        });


        registerAction('gallery_img_click', (dom, action, params) => {
            if (getAction('mulit_select').hasClass('btn-primary')) {
                return $(dom).toggleClass('img_selected')
            }

            var md5 = $(dom).parents('[data-md5]').attr('data-md5');
            if (isMobile() || $(dom).hasClass('img_selected')) {
                return g_database.loadImage(md5);
            }
            $('.img_selected').removeClass('img_selected');
            $(dom).addClass('img_selected');
            g_database.loadImageDetail(md5);
        });


        registerContextMenu('#gallery_list .grid-item[data-md5]', (dom, event) => {
            g_gallery.showMenu();
            g_gallery.rmMd5 = $(dom).attr('data-md5');

            var doms = $('#gallery_list .grid-item .img_selected');
            var buttons = $('#rm_photo button');
            if (doms.length > 1) {
                for (var d of buttons) d.hidden = !d.dataset.mulitable;
            } else {
                var offset = $(dom).offset();
                var src = $(dom).find('img').attr('src');
                var is404 = src == './img/404.jpg';

                var preview = $('#rm_target');
                if (!is404) {
                    preview.css({
                        top: offset.top - 10,
                        left: offset.left - 10,
                        width: $(dom).width() + 20,
                        height: $(dom).height() + 20,
                    }).html($(`<img src="` + src + `" class="w-full">`));
                }

                buttons.prop('hidden', false);
                preview.toggleClass('hide', !is404);
            }

            var div = $('#rm_photo');
            var i = div.width() / 2;
            var x = event.pageX;
            var mw = $(window).width();
            if (x + i > mw) {
                x = mw - div.width() - 10;
            } else {
                x -= i;
            }

            // var y = event.pageY + 20;
            var y = event.pageY;
            var h = div.height();
            var mh = $(window).height();
            if (mh - y < h) {
                y -= h;
            } else {
                y -= h / 2;
            }

            addAnimation(div.css({
                left: x + 'px',
                top: y + 'px',
            }), 'flipInX', () => {});
        });

        registerAction('openViewer', (dom, action, params) => {
            g_gallery.previewViewer = new Viewer(dom, {
                backdrop: 'static',
                toolbar: 0,
                navbar: 0,
                title: 0,
                toggleOnDblclick: false,
                hide(){
                    g_gallery.previewViewer.destroy();
                    delete g_gallery.previewViewer;
                },
                // url(image) {
                //     return image.src.replace('saves/_', 'saves/');
                //   },
            });
            g_gallery.previewViewer.show();
        });


    },

    showMenu: (show = true) => {
        delete g_gallery.rmMd5;
        g_gallery.rm.css('display', show ? 'unset' : 'none');
        halfmoon.deactivateAllDropdownToggles();
        //startVibrate(100);
    },
    openImage: () => {
        g_gallery.hidePreview();
        g_cache.openImageAt = new Date().getTime();
        showContent('detail');
        if (_viewer) _viewer.destroy();

        var img = $('#imageEdit img')[0];
        _viewer = new Viewer(img, {
            inline: true,
            toolbar: 0,
            navbar: 0,
            title: 0,
            url(image) {
                var url = image.src.replace('https://i.pinimg.com/236x/', 'https://i.pinimg.com/originals/')
                return url;
            },
            // transition:false,
            ready() {
                img.hidden = true;
            },
            viewed() {
                $('.viewer-backdrop').backgroundBlur({
                    blurAmount: 10, // 模糊度
                    imageClass: 'tinted-bg-blur',
                    overlayClass: 'tinted-bg-overlay',
                    duration: 1500, // 图片淡出时间
                    endOpacity: 1 // 图像最终的不透明度
                }).backgroundBlur(g_database.getImageUrl(g_database.showingImage));

                $('#detail_picSize .text-right').html(_viewer.imageData.naturalWidth + 'x' + _viewer.imageData.naturalHeight);
            },
            toggleOnDblclick: false,
        });
        _viewer.show();

        ////////////////
        _r(g_cache, 'timer_autoStart', 'timeout');
        g_cache.timer_autoStart = setTimeout(() => {
            if (!g_cd.getOpts('image')) {
                if (confirm('是否自动开始计时?')) {
                    g_cd.startImageTimer((new Date().getTime() - g_cache.openImageAt) / 1000);
                }
            }
        }, 60000 * 5); // 
    },


    switchDetailBar: (show) => {
        var div = $('#div_detail');
        var showed = !div.hasClass('hide');
        if (show == undefined) {
            show = !div.toggleClass('hide').hasClass('hide');
        } else
        if (show) {
            if (showed) return;
            div.removeClass('hide');
        } else {
            if (!showed) return;
            div.addClass('hide');
        }
        var content = $('.content-wrapper');
        if (show) {
            loadDetailImage();
            content.css('width', content.width() - $('#div_detail').width() + 'px');
        } else {
            content.css('width', '');
        }

        setTimeout(() => $('#sidebar-right-hover').css('display', show ? 'none' : ''), 500);
        $(window).resize();
    },

    clearGallery: () => {
        if (g_gallery.grid) {
            g_gallery.grid.isotope('destroy');
            delete g_gallery.grid;
        }
        $('#gallery_list').html('');
    },

    loadHtml: (h, opts) => {
        var items = $(h);
        if (!g_gallery.grid || opts.insertMode == undefined) {
            // 初始化
            g_gallery.grid = $('#gallery_list').html(items).isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                // resize: true,
                transitionDuration: 200,
                getSortData: {
                  // filename: '.file-name',
                  // index: '[data-index]',
                  reverse: function( itemElem ) {
                    var index = $( itemElem ).attr('data-index');
                    return 0 - parseInt( index );
                  }
                }

            });
        } else {
            if (opts.insertMode == 'append') {
                g_gallery.grid.append(items).isotope('appended', items);
            } else
            if (opts.insertMode == 'prepend') {
                g_gallery.grid.prepend(items).isotope('prepended', items);
            }
        }
        g_gallery.grid.find('.lazyload').lazyload()
        g_gallery.gridProgress();
    },

    getImageHtml: (md5, d, index) => {
        var img = g_database.getImageUrl(md5, d.i)
        return `<div class="grid-item" data-md5="` + md5 + `" data-index="${index}">
                    <div style="height: ` + arrayRandom([150, 175, 200]) + `px;background-color: ` + getRandomColor() + `;">
                      <img class="photo lazyload" data-action="gallery_img_click" src="` + img + `" alt="` + d.t + `" title="` + d.t + `">
                        </div>
                      </div>`;

        // <a class="btn btn-square rounded-circle btn-primary" data-action="collction_photo_actions" style="position: absolute;bottom: 16px;right: 16px;" role="button"> <i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>
    },
    errorImgs: [],
    addErrorImg: function(md5) {
        if (this.errorImgs.indexOf(md5) == -1) {
            $('[data-action="errorImages"]').removeClass('hide')
            .find('.badge').html(this.errorImgs.push(md5));
        }
    },
    removeAllErrorImg: function(){
        confirm1('你确定要删除所有错误文件信息吗?', (value) => {
            if(value){
                for(var md5 of this.errorImgs){
                    g_database.removeImgData(md5);
                    $(`.alert[data-md5="${md5}"]`).remove();
                }
              this.errorImgs.length = [];
              this.updateErrImage();
            }
        })
    },
    removeErrorImg: function(md5){
        var i = this.errorImgs.indexOf(md5);
        if(i != -1) this.errorImgs.splice(i, 1);
        g_database.removeImgData(md5);
        $(`.alert[data-md5="${md5}"]`).remove();
      this.updateErrImage();
    },
    updateErrImage: function(){
          var c = this.errorImgs.length;
        if(c == 0 && isModalOpen('modal-custom', 'errorImgs')){
            halfmoon.toggleModal('modal-custom');
        }
        $('[data-action="errorImages"]').toggleClass('hide', c == 0).find('.badge').html(c);
    },
    gridProgress: () => {
        g_gallery.grid.imagesLoaded()
            .progress(function(instance, image) {
                var par = image.img.parentElement;
                if (!image.isLoaded) {
                    // 图片加载错误
                    var item = par.parentElement;
                    g_gallery.addErrorImg(item.dataset.md5);
                    return g_gallery.grid.isotope('remove', item);
                }
                $(par).css({ height: '', backgroundColor: '' });
                _r(g_cache, 'layoutInitTimer', 'timeout');
                g_cache.layoutInitTimer = setTimeout(() => {
                    g_gallery.grid.isotope('layout');
                }, 3000);
            })
            .always(function(instance) {
                _r(g_cache, 'layoutInitTimer', 'timeout');
                g_gallery.grid.isotope('layout');
                delete g_page.loading['gallery'];

                setTimeout(() => {
                    var content = $('.content-wrapper');
                    if (content[0].scrollHeight <= content.height()) { // 如果还没出现滚动条
                        // 继续加载
                        g_page.nextPage('gallery');
                    }
                }, 500);

                //$(g_page.getOpts('gallery').element).scroll(); // 如果还在页面底部，则继续加载数据
            })


    },
}
g_gallery.init();