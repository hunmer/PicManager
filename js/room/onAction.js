 

 registerContextMenu('#room_content .grid-item[data-md5]', (dom, event) => {
     var dialog = mobiscrollHelper.widget_actionWithIcon({
         data: [{
                 action: 'room_deleteImage',
                 icon: 'text-danger fa-trash-o',
                 text: _l('删除')
             },
             {
                 action: 'room_downloadImage',
                 icon: 'fa-download',
                 text: _l('保存')
             }
         ],
         opts: {
             headerText: _l('选择操作'),
         }
     });

     g_room.cache.rm = {
         id: $(dom).data('md5'),
         dialog: dialog,
     }

 });


 (() => {
     const _hideActionList = () => {
         self.cache.rm.dialog.mobiscroll('hide');
         delete self.cache.rm;
     }

     var self = g_room;

     registerActionList('room', {
        /* embed */
        
        'room_deleteEmbed': (dom, action) => {
            g_room.send({
                type: 'delEmbed',
                data: {
                    id: $(dom).parents('[data-embed]').data('embed')
                }
            })
        },
        'room_downloadEmbed': (dom, action) => {
            var data = self.roomData.media.embed[$(dom).parents('[data-embed]').data('embed')];
            if(!data) return;
            window.open(data.url, '_blank');
        },
        'room_loadEmbed': (dom, action) => {
            var id = $(dom).parents('[data-embed]').data('embed');
            var data = self.roomData.media.embed[id];
            if(!data) return;
            var embed;
            var url = data.url;
            var type = data.type;

            const includes = (str, arr) => !arr.some(s => str.indexOf(s) == -1);
            if (includes(url, ['.bilibili.com', '/video/'])) {
                embed = '//player.bilibili.com/player.html?bvid='+cutString(url + '/', '/video/', '/');
            }else
            if (includes(url, ['.youtube.com', 'watch?v='])) {
                embed = '//www.youtube.com/embed/'+cutString(url + '&', '?v=', '&');
            }
            if(embed){
                if(confirm('是否观看弹幕') ){
                    type = 'ifrmae';
                    url = embed;
                }
            }
            switch(type){
                case 'ifrmae':
                    $('#room_embed').html(`
                        <iframe style="width: 100%;height: 100%;min-height: 250px;border: unset;" scrolling="no" border="0" allowfullscreen="" mozallowfullscreen="true" webkitallowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" src="${url}" allowfullscreen></iframe>
                    `).removeClass('hide1');
                    break;

                case 'video':
                    var video = $('#room_video');
                     if (!video.length) {
                         $('#room_embed').html(`
                            <video id="room_video" class="w-full" controls></video>
                        `).removeClass('hide1');
                         if(data.ext == 'flv'){
                            loadRes([{url: 'js/flv.js', type: 'js'}], () => {
                                 var flvPlayer = flvjs.createPlayer({
                                    type: data.ext,
                                    url: data.src
                                });
                                flvPlayer.attachMediaElement($('#room_video')[0]);
                                flvPlayer.load();
                                flvPlayer.play();
                                self.cache.flvPlayer = flvPlayer;
                            })
                         }else{
                            $('#room_embed').find('video').attr('src', data.src);
                         }
                    }else{
                        video.attr('src', data.src); 
                    }
                    break;
            }
        },
        'room_subDialogContent': (dom, action) => {
             showSubContent('room_subDialogContent', $(dom).data('value'));
         },
        'room_shareEmbed': (dom, action) => {
            var dialog = isModalOpen('modal-custom', 'dialog_room_embed_share');
            self.send({
                type: 'shareEmbed',
                data: Object.assign({
                    time: new Date().getTime(),
                    source: 'custom',
                    title: dialog && $('#input_roomEmbed_name').val(),
                    description: dialog &&  $('#input_roomEmbed_desc').html(),
                }, self.cache.videoDetail || {})
            });
            if(dialog){
                halfmoon.toggleModal('modal-custom');
            }
         },
         room_addshareEmbed: (dom, action) => {
             var modal = modalOpen({
                 id: 'modal-custom',
                 type: 'dialog_room_embed_share',
                 width: '100%',
                 fullScreen: true,
                 title: _l('内容分享'),
                 html: `
                     <div class="btn-toolbar rounded" role="toolbar"> 
                      <div class="btn-group mx-auto w-full">
                        <button class="btn btn-square btn-primary" type="button" data-action="room_subDialogContent" data-value="VideoDetail">${_l('分享_视频信息')}</button>
                        <button class="btn btn-square" type="button" data-action="room_subDialogContent" data-value="shareHistory">${_l('分享_历史记录')}</button>
                      </div>
                    </div>

                    <div>
                          <div id="room_subDialogContent_VideoDetail" class="room_subDialogContent animated fadeIn" animated='fadeIn'>

                           <img class="d-block mx-auto w-three-quarter mt-10">

                           <div class="input-group mt-10">
                              <div class="input-group-prepend">
                                <span class="input-group-text">${_l('视频名称')}</span>
                              </div>
                              <input id="input_roomEmbed_name" type="text" class="form-control" placeholder="${_l('视频名称_占位符')}" value="">
                            </div>

                            <div class="input-group mt-10">
                              <div class="input-group-prepend">
                                <span class="input-group-text">${_l('视频说明')}</span>
                              </div>
                                <textarea class="form-control" id="input_roomEmbed_desc" rows="3" placeholder="${_l('视频说明_占位符')}"></textarea>
                            </div>

                            <div class="text-right mt-10">
                                <a class="btn btn-primary" onclick="prompt1({title: '${_l('输入视频URL')}', html:'https://www.bilibili.com/video/BV1u4411K7KQ/?p=2'}, url => g_room.parseVideoUrl(url))" role="button">${_l('解析网址')}</a>
                                <a class="btn btn-primary hide" data-action="room_shareEmbed">${_l('分享')}</a>
                            </div>
                          </div>
                           <div id="room_subDialogContent_shareHistory" class="room_subDialogContent hide animated fadeIn" animated='fadeIn'>
                          开发中...
                          </div>
                    </div>

                     
                        `,
                 onShow: () => {
                 },
                 onClose: () => {
                     return true;
                 }
             })

            // var url = '//player.bilibili.com/player.html?aid=55266745&bvid=BV1u4411K7KQ&cid=96638712&page=2';
            // $('#embed').attr('src', url).show();
        },

         room_deleteImage: (dom, action) => {
             if (self.cache.rm) {
                 self.send({ type: 'deleteImage', data: { id: self.cache.rm.id } });
                 _hideActionList();
             }
         },
         room_downloadImage: (dom, action) => {
             var md5 = self.cache.rm.id;
             var dom = self.getImage(md5).find('.photo');
             if (!dom.length) return toastPAlert(_l('对象不存在'), 'alert-danger');
             _hideActionList();
             var url = dom.data('origin') || dom.data('src');
             if (url.startsWith('{host}')) { // 可以下载数据
                 getImageBlob(self.getImageUrl(url), (blob) => {
                     downloadData(blob, md5 + '.jpg');
                 }, () => {
                     alert(_l('发生错误'));
                 });
             } else {
                 window.open(url, '_blank');
             }
         },
         room_playerList: (dom, action) => {
             var pls = self.getData('players', {});
             var names = Object.keys(pls);
             if (names.length == 0) return;

             var r = {};
             // todo 显示房主
             var owner = self.getData('owner');
             for (var name in pls) {
                 r[name] = {
                     icon: self.getImageUrl(pls[name].icon),
                     text: name == owner ? '<span class="text-secondary">' + name + '</span>' : name
                 }
             }

             var btns = [{
                 text: _l('取消'),
                 handler: (event, instance) => instance.hide()
             }];
             if (me() == owner) {
                 btns.unshift({
                     text: _l('踢出'),
                     cssClass: 'btn w-full btn-danger',
                     handler: (event, instance) => {
                         var pl = instance.getVal();
                         if (pl === null) pl = names[0]; // 如果没滚动就会返回null
                         if(confirm(_l('确定吗'))){
                            self.send({
                                 type: 'kickPlayer',
                                 data: { target: pl }
                             });
                         }
                         
                     }
                 });
             }
             var dialog = mobiscrollHelper.select_textAndImage({
                 imgClass: 'user-icon rounded-circle',
                 data: r,
                 opts: {
                     id: 'dialog_select_playerList',
                     defaultValue: ['maki'],
                     headerText: _l('玩家列表'),
                     buttons: btns
                 },
             });
         },
         room_share: (dom, action) => {
             var url = location.host + location.pathname + '?r=' + self.getData('room');
             loadRes([{ url: 'js/qrcode.min.js', type: 'js' }], () => {
                 var modal = modalOpen({
                     id: 'modal-custom-1',
                     type: 'dialog_uploadImagefromNetwork',
                     width: '80%',
                     title: _l('分享'),
                     html: `
                        <div class="text-center">
                            <div id="qrcode" class="mx-auto" style="width: 128px; height: 128px;" ></div>
                            <textarea class="form-control mt-10" id="room_input_share" rows="3" readOnly>${url}</textarea>
                        </div>

                         <div class="text-right mt-10">
                            <a class="btn btn-primary" role="button" onclick="$('#room_input_share')[0].select();document.execCommand('copy'); alert('${_l('复制成功')}')">${_l('复制')}</a>
                        </div>
                            `,
                     onShow: () => {
                         new QRCode("qrcode", {
                             text: url,
                             width: 128,
                             height: 128,
                             colorDark: "#000000",
                             colorLight: "#ffffff",
                             correctLevel: QRCode.CorrectLevel.H
                         });
                     },
                     onClose: () => {
                         return true;
                     }
                 })
             });
         },
         room_game_playerIcon: (dom, action) => {
             var pl = $(dom).data('user');
             if ($(dom).hasClass('selected_player') || pl == me()) {
                 // 解锁
                 return self.applyPlayerMark(me(), g_mark.showingData.m);
             }
             self.send({
                 type: 'getPlayerMark',
                 data: {
                     target: pl
                 }
             });
         },
         room_img_heart: (dom, action) => {
             if ($(dom).hasClass('room_img_heart_mine')) { // 禁止重复选择
                 return;
             }
             self.send({
                 type: 'heart',
                 data: {
                     id: $(dom).parents('[data-md5]').data('md5')
                 }
             });
         },
         room_exit: (dom, action) => {
             window.history.pushState(null, null, "?room");
             self.leaveRoom(true);
         },
         // room_openInlineViewer: (dom, action) => {
         //     var game = self.roomData.game;
         //     if (game && game.type == 'copy' && game.data.src != undefined) {
         //         confirm1('当前游戏模式不是自由模式,你确定要使用其他的参考图吗?', sure => {
         //             if (sure) {
         //                 self.openInlineViewer(self.viewer.viewer.querySelector('img').src);
         //                 self.viewer.hide();
         //             }
         //         })
         //     }
         // },
         'room_countdown': (dom, action) => {
             // if (self.isRoomMaster()) {
             var imgs = self.roomData.imgs;
             var keys = Object.keys(imgs);
             if (!keys.length) return toastPAlert(_l('请先上传'));

             const onSelcted = (val) => {
                 self.data.min = $('#range_room_time input').mobiscroll('getVal') * 60; // 游戏时间
                 switch (val) {
                     case 0:
                         self.send({
                             type: 'startVote',
                             data: {
                                 time: self.data.min
                             }
                         });
                         break;

                     case 1:
                         const fun = () => {
                             var random = imgs[arrayRandom(keys)];
                             confirm1({
                                 title: _l('确定吗'),
                                 html: `<img src="${self.getImageUrl(random.src)}" class="w-full">`,
                                 buttons: ['set', {
                                     text: _l('再来一次'),
                                     handler: () => {
                                         fun();
                                     }
                                 }, 'cancel']
                             }, sure => {
                                 if (!sure) return;
                                 self.send({
                                     type: 'startGame',
                                     data: {
                                         game: {
                                             type: 'copy',
                                             data: random,
                                             time: self.data.min
                                         },
                                     }
                                 });
                             })
                         }
                         fun();

                         break;

                     case 2:
                         self.send({
                             type: 'startGame',
                             data: {
                                 game: {
                                     type: 'copy',
                                     data: {},
                                     time: self.data.min
                                 },
                             }
                         });
                         break;
                 }
             }


             var submit = true; // 取消会变成false
             mobiscrollHelper.select({
                 data: [_l('投票'), _l('随机'), _l('自由')],
                 title: '',
                 selected: 1,
                 callback: (result, instance) => {
                     submit = result;
                     instance.cancel();
                 },
                 opts: { // 最外层的widget
                     headerText: _l('选择计时方式'),
                     showOnClick: false,
                     onClose: function(event, inst) {
                         if (submit) onSelcted(parseInt(inst.getVal())); // 除取消外
                     },
                     onShow: function(event, inst) {
                         $(`<div id="range_room_time" class="${g_config.darkMode ? 'bg-dark text-light' : ''}" mbsc-enhance>
                                <input  type="range" value="45" min="0" max="90" step="15" data-tooltip="true" data-step-labels="[0, 30, 45, 60, 90]">
                            </div>`).appendTo(event.target.querySelector('.mbsc-fr-c')).trigger('mbsc-enhance');
                     }
                 },
             });
             // }

         },
         'room_chat_img_click': (dom, action) => {
             self.chatImgviewer = new Viewer(dom, {
                 title: 0,
                 ready() {
                     $('.navbar-fixed-bottom').css('zIndex', 2);
                     $('#room_chat').css('zIndex', 0);
                 },
                 hide() {
                     $('#room_chat').css('zIndex', 9999);
                     self.chatImgviewer.destroy();
                     delete self.chatImgviewer;

                 },

                 url(image) {
                     if (image.dataset.origin) return self.getImageUrl(image.dataset.origin);
                 },
             });
             self.chatImgviewer.show();

         },
         'room_subContent': (dom, action) => {
             self.showSubContent($(dom).data('value'));
         },
         'room_toggleChatUI': (dom, action) => {
             // if($('#msg_list').html() == '') return;
             self.msg_toBottom();
             self.toggleChat();
         },
         'room_msg_playAudio': (dom, action) => {
             soundTip(dom.dataset.url);
         },
         'qm': (dom, action) => {
             halfmoon.deactivateAllDropdownToggles();
             self.sendMsg({
                 msg: $(dom).html(),
             });
         },
         'room_sendMsg': (dom, action) => {
             var msg = $('#msg').val();
             if (!isEmpty(msg)) {

                 if (msg.length > 100) return toastPAlert(_l('字数过长'), 'alert-danger');
                 self.sendMsg({
                     msg: msg,
                 });
             }

         },
         'music_player_click': (dom, action, event) => {
            var badge = $(dom).find('.badge');
            if(badge.css('display') != 'none'){
                badge.addClass('hide');
                var music = self.getData('media', {}).music;
                if(music){ // 房主推荐音乐
                    confirm1({
                        title: _l('房主的推荐歌单'),
                        html: `
                        <div class="text center textScroll">
                         <img src="${music.detail.cover}" class="d-block mx-auto h-300 rounded-top">
                         <h4 class="text">${music.detail.name}</h4>
                        </div>
                        `,
                    }, play => {
                        if(play) g_music.parsePlaylist(music, false);
                    })
                }
            }
         },
         'room_listRoom': (dom, action) => {
            var div = getAction('room_listRoom');
            if(div){
                 div.find('img').attr('src', 'res/sticker/1/loading.png');
                  div.find('h4').html(_l('点击刷新'));
            }
             self.send({
                 type: 'listRoom',
             })

         },
         'room_broadcast': (dom, action) => {
             alert1(self.getData('broadcast') || _l('暂无公告'));
         },
         'room_clearMsg': (dom, action) => {
            mobiscroll_cancelAll();
            self.send({type: 'clearMsg'});
         },
         'room_admin': (dom, action) => {
             var d = self.getData();
             if(!d.isOwner) return toastPAlert(_l('无权限'), 'alert-danger');
             var dialog = mobiscrollHelper.widget_actionWithIcon({
                 data: [{
                         action: 'room_clearMsg',
                         icon: 'text-danger fa-trash-o',
                         text: _l('清屏')
                     },
                     {
                         action: 'room_editRoom',
                         icon: 'text-success fa-cog',
                         text: _l('管理')
                     }
                 ],
                 opts: {
                     headerText: _l('选择操作'),
                 }
             });
         },
         'room_editRoom': (dom, action) => {
            mobiscroll_cancelAll();
             var d = self.getData();
             var create = !d || !d.isOwner;
             if (create) {
                 d = {
                     title: _l('新建房间名', me()),
                     desc: '',
                     broadcast: '',
                     bg: '',
                     cover: 'res/cover.jpg',
                     password: '',
                     maxPlayers: 10,
                     tags: ['休闲', '欢迎'],
                 }
             }

             modalOpen({
                 id: 'modal-custom',
                 type: 'room_editRoom',
                 width: '80%',
                 title: _l('room_房间设置'),
                 canClose: true,
                 html: `
                <div class="text-center">
                    <img data-action="room_setCover" id="input_room_cover" src="${d.cover}" class="img-fluid rounded-top h-150"> 
                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">${_l('房间名字')}</span>
                      </div>
                      <input id="input_room_name" type="text" class="form-control" placeholder="${_l('房间名字_占位符')}" value="${d.title}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">${_l('房间标签')}</span>
                      </div>
                      <input id="input_room_tag" type="text" class="form-control" placeholder="${_l('房间标签_占位符')}" value="${d.tags.join(',')}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">${_l('最大人数')}</span>
                      </div>
                      <input id="input_room_maxPlayers" type="number" class="form-control" placeholder="${_l('最大人数_占位符')}" value="${d.maxPlayers}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">${_l('四位密码')}</span>
                      </div>
                      <input id="input_room_password" type="number" class="form-control" onchange="this.value = this.value.substr(0, 4)" placeholder="${_l('四位密码_占位符')}" value="${d.password}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">${_l('房间介绍')}</span>
                      </div>
                      <textarea id="input_room_desc" class="form-control" placeholder="${_l('房间介绍_占位符')}">${d.desc}</textarea>
                    </div>

                     ${!create ? `
                         <div class="input-group mt-10">
                          <div class="input-group-prepend">
                            <span class="input-group-text">${_l('房间公告')}</span>
                          </div>
                          <textarea id="input_room_broad" class="form-control" placeholder="${_l('房间公告_占位符')}">${d.broadcast}</textarea>
                        </div>

                        <div class="row mt-10">
                            <img id="input_room_bg" class="w-full col-6 p-5" src="${d.bg || ''}">
                            <select class="form-control form-control-lg col-6 h-auto" id="select-room-bg" oninput="self.optionSelected(this);" size="4">
                              <option value="" selected disabled>${_l('背景图片')}</option>
                              <option value="custom">${_l('背景图片_自定义')}</option>
                              <option value="">无</option>
                              <option value="./res/1.jpg">1</option>
                              <option value="./res/2.jpg">2</option>
                              <option value="./res/3.jpg">3</option>
                              <option value="./res/4.jpg">4</option>
                              <option value="./res/5.jpg">5</option>
                              <option value="./res/6.jpg">6</option>
                              <option value="./res/7.jpg">7</option>
                              <option value="./res/8.jpg">8</option>
                              <option value="./res/9.jpg">9</option>
                            </select>
                        </div>
                    ` : ''}
                    <div class="text-right mt-10">
                   
                        <a class="btn btn-primary" role="button" data-action="room_createRoom">${create ? _l('新建') : _l('保存')}</a>
                      </div>
                </div>
                        `,
                 onClose: () => {
                     return true;
                 }
             });

         },
         'room_img_click': (dom, action) => {
             var p = $(dom).parents('.grid-item');
             self.viewer = new Viewer($('#room_' + self.currentContent)[0], {
                 backdrop: 'static',
                 title: 0,
                 toggleOnDblclick: true,
                 initialViewIndex: p.index(), // 设置默认打开当前图片
                 ready() {
                     if (!self.isHideMessage()) {
                         getAction('room_toggleChatUI').click();
                     }
                     self.initMenu('viewer');
                 },
                 viewed() {
                     $('.navbar-fixed-bottom').css('zIndex', 2);
                     $('#room_chat').addClass('withViewer');
                 },
                 hide() {
                     $('#room_chat').removeClass('withViewer');
                     self.viewer.destroy();
                     delete self.viewer;
                     self.initMenu(self.currentContent);

                 },
                 filter(image) {
                     return image.dataset.origin;
                 },
                 url(image) {
                     return self.getImageUrl(image.dataset.origin);
                 },
             });
             self.viewer.targetImg = {
                 md5: p.data('md5'),
                 img: p.find('img').data('origin')
             };
             self.viewer.show();
         },
         'room_saveImg': (dom, action) => {
             const openDialog = (url, md5) => {
                 var r = {};
                 r[md5] = {
                     i: url,
                     t: ['room']
                 }
                 g_database.showSaveDialog(r);
                 $(dom).removeClass('btn-primary').html(_l('已收集'));
             }
             var data = self.getCuttentImage(dom);
             if (data.url.startsWith('{host}')) { // 可以下载数据
                 getImgToBase64(self.getImageUrl(data.url), base64 => {
                     openDialog(base64, data.md5);
                     // getMD5(dataURLtoFile(base64, 'file.jpg'), (md5) => {});
                 });
             } else {
                 openDialog(data.url, data.md5);
             }
         },
         'room_setCover': (dom, action) => {
             g_file.openDialog('room_setCover', false, {
                 cropper: { aspectRatio: 16 / 9 },
                 callback: () => {
                     $('#input_room_cover').attr('src', _cropper.getCroppedCanvas({ width: 200, height: 120 }).toDataURL('image/webp'));
                 },
             });
         },
         'room_createRoom': (dom, action) => {
             var vals = checkInputValue(['#input_room_name', '#input_room_maxPlayers']);
             if (!vals) return;
             var password = $('#input_room_password').val();
             if (password != '' && password.length != 4) {
                 return toastPAlert(_l('密码不填或者需要四位数'), 'alert-danger');
             }
             var data = {
                 title: vals[0],
                 cover: $('#input_room_cover').attr('src'),
                 bg: $('#input_room_bg').attr('src'),
                 maxPlayers: parseInt(vals[1]),
                 password: password,
                 tags: $('#input_room_tag').val(),
                 desc: $('#input_room_desc').val(),
                 broadcast: $('#input_room_broad').val(),
                 confirm: self.cache.confirmCreateRoom
             }
             toast(_l('创建中'));
             self.send({
                 type: 'createRoom',
                 data: data
             })
         },
         'room_joinRoom': (dom, action) => {
             var room = $(dom).parents('[data-room]').data('room');
             if(room == 'r18'){
                if(!confirm(_l('年龄验证'))) return;
             }
             self.requestJoinRoom(room);
         },
         'room_addImgs': (dom, action) => {
             g_file.openDialog(action.join(','), true);
         },
         'room_sendImage': (dom, action) => {
             g_file.openDialog('room_sendImage', true);
         },
     });


 })();