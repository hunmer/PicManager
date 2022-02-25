 

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
         g_room.cache.rm.dialog.mobiscroll('hide');
         delete g_room.cache.rm;
     }

     registerActionList('room', {
         room_deleteImage: (dom, action, params) => {
             if (g_room.cache.rm) {
                 g_room.send({ type: 'deleteImage', data: { id: g_room.cache.rm.id } });
                 _hideActionList();
             }
         },
         room_downloadImage: (dom, action, params) => {
             var md5 = g_room.cache.rm.id;
             var dom = g_room.getImage(md5).find('.photo');
             if (!dom.length) return toastPAlert(_l('对象不存在'), 'alert-danger');
             _hideActionList();
             var url = dom.data('origin') || dom.data('src');
             if (url.startsWith('{host}')) { // 可以下载数据
                 getImageBlob(g_room.getImageUrl(url), (blob) => {
                     downloadData(blob, md5 + '.jpg');
                 }, () => {
                     alert(_l('发生错误'));
                 });
             } else {
                 window.open(url, '_blank');
             }
         },
         room_playerList: (dom, action, params) => {
             var pls = g_room.getData('players', {});
             var names = Object.keys(pls);
             if (names.length == 0) return;

             var r = {};
             // todo 显示房主
             var owner = g_room.getData('owner');
             for (var name in pls) {
                 r[name] = {
                     icon: g_room.getImageUrl(pls[name].icon),
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
                         g_room.send({
                             type: 'kickPlayer',
                             data: { target: pl }
                         });
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
         room_share: (dom, action, params) => {
             var url = location.host + location.pathname + '?r=' + g_room.getData('room');
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
         room_game_playerIcon: (dom, action, params) => {
             var pl = $(dom).data('user');
             if ($(dom).hasClass('selected_player') || pl == me()) {
                 // 解锁
                 return g_room.applyPlayerMark(me(), g_mark.showingData.m);
             }
             g_room.send({
                 type: 'getPlayerMark',
                 data: {
                     target: pl
                 }
             });
         },
         room_img_heart: (dom, action, params) => {
             if ($(dom).hasClass('room_img_heart_mine')) { // 禁止重复选择
                 return;
             }
             g_room.send({
                 type: 'heart',
                 data: {
                     id: $(dom).parents('[data-md5]').data('md5')
                 }
             });
         },
         room_exit: (dom, action, params) => {
             window.history.pushState(null, null, "?room");
             g_room.leaveRoom(true);
         },
         // room_openInlineViewer: (dom, action, params) => {
         //     var game = g_room.roomData.game;
         //     if (game && game.type == 'copy' && game.data.src != undefined) {
         //         confirm1('当前游戏模式不是自由模式,你确定要使用其他的参考图吗?', sure => {
         //             if (sure) {
         //                 g_room.openInlineViewer(g_room.viewer.viewer.querySelector('img').src);
         //                 g_room.viewer.hide();
         //             }
         //         })
         //     }
         // },
         'room_countdown': (dom, action, params) => {
             // if (g_room.isRoomMaster()) {
             var imgs = g_room.roomData.imgs;
             var keys = Object.keys(imgs);
             if (!keys.length) return toastPAlert(_l('请先上传'));

             const onSelcted = (val) => {
                 g_room.data.min = $('#range_room_time input').mobiscroll('getVal') * 60; // 游戏时间
                 switch (val) {
                     case 0:
                         g_room.send({
                             type: 'startVote',
                             data: {
                                 time: g_room.data.min
                             }
                         });
                         break;

                     case 1:
                         const fun = () => {
                             var random = imgs[arrayRandom(keys)];
                             confirm1({
                                 title: _l('确定吗'),
                                 html: `<img src="${g_room.getImageUrl(random.src)}" class="w-full">`,
                                 buttons: ['set', {
                                     text: _l('再来一次'),
                                     handler: () => {
                                         fun();
                                     }
                                 }, 'cancel']
                             }, sure => {
                                 if (!sure) return;
                                 g_room.send({
                                     type: 'startGame',
                                     data: {
                                         game: {
                                             type: 'copy',
                                             data: random,
                                             time: g_room.data.min
                                         },
                                     }
                                 });
                             })
                         }
                         fun();

                         break;

                     case 2:
                         g_room.send({
                             type: 'startGame',
                             data: {
                                 game: {
                                     type: 'copy',
                                     data: {},
                                     time: g_room.data.min
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
         'room_chat_img_click': (dom, action, params) => {
             g_room.chatImgviewer = new Viewer(dom, {
                 title: 0,
                 ready() {
                     $('.navbar-fixed-bottom').css('zIndex', 2);
                     $('#room_chat').css('zIndex', 0);
                 },
                 hide() {
                     $('#room_chat').css('zIndex', 9999);
                     g_room.chatImgviewer.destroy();
                     delete g_room.chatImgviewer;

                 },

                 url(image) {
                     if (image.dataset.origin) return g_room.getImageUrl(image.dataset.origin);
                 },
             });
             g_room.chatImgviewer.show();

         },
         'room_subContent': (dom, action, params) => {
             g_room.showSubContent($(dom).data('value'));
         },
         'room_toggleChatUI': (dom, action, params) => {
             // if($('#msg_list').html() == '') return;
             g_room.msg_toBottom();
             g_room.toggleChat();
         },
         'room_msg_playAudio': (dom, action, params) => {
             soundTip(dom.dataset.url);
         },
         'qm': (dom, action, params) => {
             halfmoon.deactivateAllDropdownToggles();
             g_room.sendMsg({
                 msg: $(dom).html(),
             });
         },
         'room_sendMsg': (dom, action, params) => {
             var msg = $('#msg').val();
             if (!isEmpty(msg)) {

                 if (msg.length > 100) return toastPAlert(_l('字数过长'), 'alert-danger');
                 g_room.sendMsg({
                     msg: msg,
                 });
             }

         },
         'room_listRoom': (dom, action, params) => {
            var div = getAction('room_listRoom');
            if(div){
                 div.find('img').attr('src', 'res/sticker/1/loading.png');
                  div.find('h4').html(_l('点击刷新'));
            }
             g_room.send({
                 type: 'listRoom',
             })

         },
         'room_editRoom': (dom, action, params) => {
             var d = g_room.getData();
             if (!d || !d.isOwner) {
                 d = {
                     title: _l('新建房间名', me()),
                     desc: '',
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
                    
                     ${action[1] ? `
                        <div class="row mt-10">
                            <img id="input_room_bg" class="w-full col-6 p-5" src="${d.bg || ''}">
                            <select class="form-control form-control-lg col-6 h-auto" id="select-room-bg" oninput="g_room.optionSelected(this);" size="8">
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
                   
                        <a class="btn btn-primary" role="button" data-action="room_createRoom">${action[1] ? _l('保存') : _l('新建')}</a>
                      </div>
                </div>
                        `,
                 onClose: () => {
                     return true;
                 }
             });

         },
         'room_img_click': (dom, action, params) => {
             var p = $(dom).parents('.grid-item');
             g_room.viewer = new Viewer($('#room_' + g_room.currentContent)[0], {
                 backdrop: 'static',
                 title: 0,
                 toggleOnDblclick: true,
                 initialViewIndex: p.index(), // 设置默认打开当前图片
                 ready() {
                     if (!g_room.isHideMessage()) {
                         getAction('room_toggleChatUI').click();
                     }
                     g_room.initMenu('viewer');
                 },
                 viewed() {
                     $('.navbar-fixed-bottom').css('zIndex', 2);
                     $('#room_chat').addClass('withViewer');
                 },
                 hide() {
                     $('#room_chat').removeClass('withViewer');
                     g_room.viewer.destroy();
                     delete g_room.viewer;
                     g_room.initMenu(g_room.currentContent);

                 },
                 filter(image) {
                     return image.dataset.origin;
                 },
                 url(image) {
                     return g_room.getImageUrl(image.dataset.origin);
                 },
             });
             g_room.viewer.targetImg = {
                 md5: p.data('md5'),
                 img: p.find('img').data('origin')
             };
             g_room.viewer.show();
         },
         'room_saveImg': (dom, action, params) => {
             const openDialog = (url, md5) => {
                 var r = {};
                 r[md5] = {
                     i: url,
                     t: ['room']
                 }
                 g_database.showSaveDialog(r);
                 $(dom).removeClass('btn-primary').html(_l('已收集'));
             }
             var data = g_room.getCuttentImage(dom);
             if (data.url.startsWith('{host}')) { // 可以下载数据
                 getImgToBase64(g_room.getImageUrl(data.url), base64 => {
                     openDialog(base64, data.md5);
                     // getMD5(dataURLtoFile(base64, 'file.jpg'), (md5) => {});
                 });
             } else {
                 openDialog(data.url, data.md5);
             }
         },
         'room_setCover': (dom, action, params) => {
             g_file.openDialog('room_setCover', false, {
                 cropper: { aspectRatio: 16 / 9 },
                 callback: () => {
                     $('#input_room_cover').attr('src', _cropper.getCroppedCanvas({ width: 200, height: 120 }).toDataURL('image/webp'));
                 },
             });
         },
         'room_createRoom': (dom, action, params) => {
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
                 confirm: g_room.cache.confirmCreateRoom
             }
             g_room.send({
                 type: 'createRoom',
                 data: data
             })
         },
         'room_joinRoom': (dom, action, params) => {
             var room = $(dom).parents('[data-room]').data('room');
             if(room == 'r18'){
                if(!confirm(_l('年龄验证'))) return;
             }
             g_room.requestJoinRoom(room);
         },
         'room_addImgs': (dom, action, params) => {
             g_file.openDialog(action.join(','), true);
         },
         'room_sendImage': (dom, action, params) => {
             g_file.openDialog('room_sendImage', true);
         },
     });


 })();