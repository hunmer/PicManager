const ERR_ROOM_NOT_EXISTS = 2;
const SUCC_DEFAULT = 2;
const SUCC_CREATE_ROOM = 3;

var g_room = {
    host: '//127.0.0.1:41593',
    unread: 0,
    currentRoom: undefined,
    editingRoom: undefined,
    roomKey: g_config.roomKey,
    data: {
        roomList: {}
    },
    preload: function() {
        registerContent({
            id: 'room',
            // shadow p-10 border rounded

            /*
                <div>Item 2</div>
                          <div><i data-action="room_toggleChatUI" class="fa fa-arrow-left fa-2x ml-10" aria-hidden="true"></i></div> 
            */
            html: `
            <div id="subContent_room" class="subContent">
                <div id="bottom_stricker" class="bg-dark overflow-x-scroll overflow-y-hidden w-full h-125" style="display: none;position: fixed;bottom: 40px;">
                    <div class="row w-auto h-125" style="display: flex">
                    </div>
                </div>

                <div id="room_chat" class="ml-10" style="pointer-events: none1;position: fixed;bottom:45px;z-index: 9999;min-width: 250px;max-width: 75%;">
                        

                        <div id="msg_list" style="height: 300px;overflow-y: scroll;overflow-x: hidden;">
                        </div>
                        <div class="d-flex">
                          <div class="mr-auto">
                            <i data-action="room_toggleChatUI" class="fa fa-window-minimize fa-2x ml-10" aria-hidden="true"></i>
                            <span id="room_msg_unread" class="badge badge-danger badge-pill" style="display:none;    position: absolute;right: -6px;bottom: -6px;" onclick="getAction('room_toggleChatUI').click()">0</span> 
                          </div> 
                        </div>
                    </div>

                <div id="room_list" class="row">
                    <a data-action="room_listRoom" class="btn btn-primary btn-block mt-10">刷新</a>
                </div>

                <div id="room_main" class="hide p-10" style="width: 100%;">

                     <div class="btn-toolbar p-5 bg-light-lm bg-very-dark-dm rounded" role="toolbar"> 
                      <div class="btn-group mx-auto w-full">
                        <button class="btn btn-square" type="button" data-action="room_subContent,gallery">画廊</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent,photo">照片</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent,game">游戏</button>
                      </div>
                    </div>

                    <div id="room_content" class="overflow-x-hidden overflow-y-scroll w-full overflow-h" style="padding-bottom: 200px;">
                          <div id="room_subContent,gallery" class="room_subContent hide">
                            <div id="room_images"></div>
                          </div>
                          <div id="room_subContent,photo" class="room_subContent hide">
                            <div id="room_photos"></div>
                            </div>
                            <div id="room_subContent,game" class="room_subContent hide">
                                <div class="w-full" id="div_markImg">
                                    <img src="./a/1.jpg" class="w-full" onclick="modalImgClick(event);">
                                </div>
                                <div class="row text-center mt-10">
                                  <div class="col-1"><i data-action="mark_setMark,n" class="fa fa-2x fa-dot-circle-o" aria-hidden="true"></i></div>
                                  <div class="col-1"><i data-action="mark_setMark,c" class="fa fa-2x fa-circle-o" aria-hidden="true"></i></div>
                                <div class="col-1"><i data-action="mark_setMark,s" class="fa fa-2x fa-square-o" aria-hidden="true"></i></div>
                                <div class="col-1"><i data-action="mark_clear" class="fa fa-2x fa-trash-o text-danger" aria-hidden="true"></i></div>
                                </div>
                                <div id="room_game_playerIconList" class="w-full overflow-y-hidden overflow-x-auto h-75 mt-10 pl-10 pr-10" style="display: flex;grid-column-gap: 15px;">
                                </div>
                                <div id="mark_noteList" class="p-10">
                                </div>
                            </div>

                    </div>
                    
                </div>
                <div class="menu" id="menu_playes" style="right: 0px;
                display: grid;
                padding: 0px;
                top: 60px;
                opacity: .3;
                max-height: 40%;
                height: auto;"></div>

                <div class="menu bottom_right_menu" id="menu_roomMenu" style="right: 20px;
                z-index: 99999;
                padding: 0px;
                bottom: 45px;
                opacity: .3;
                max-height: 40%;
               
                height: auto;">
                   
                </div>
            </div>`,
            initNavBottom: () => {
                $('.navbar-fixed-bottom').html(`
                    <div id="bottom_room" class="row" style="max-width: 75%;width:100%;margin: 0 auto;border-radius: 20px;display: flex;align-items: center;">
                        <i data-action="show_stricker" class="fa fa-smile-o font-size-18 mr-10" aria-hidden="true"></i>

                        <input type="text" id='msg' class="form-control col-8" placeholder="输入消息..." onclick="if(g_room.viewer){ var val = prompt('文本');if(!isEmpty(val)) g_room.sendMsg(val)}" onkeydown="if(event.keyCode == 13) doAction(null, 'room_sendMsg')" style="background-color: unset;border: unset;padding-right: 35px;" oninput="checkStrickerTags(this)" onfocus="g_room.toggleChat(false)" onblur="g_room.toggleChat(true)">

                        <div class="dropdown dropup"  style="transform: translate(-150%,0);">
                            <i data-toggle="dropdown" class="fa fa-comments-o font-size-18 text-left" aria-hidden="true"></i>
                          <div class="dropdown-menu dropdown-menu-up">
                            <ul>
                                <li data-action='qm'>はい！</li>
                                <li data-action='qm'>わかった！</li>
                                <li data-action='qm'>なるほどね～</li>
                                <li data-action='qm'>いいね！</li>
                                <li data-action='qm'>後でね！</li>
                                <li data-action='qm'>どうなるの？</li>
                                <li data-action='qm'>どうする？</li>
                                <li data-action='qm'>もうすぐ完成です～</li>
                                <li data-action='qm'>どうです？</li>
                            </ul>
                          </div>
                        </div>
                        <i class="fa fa-picture-o font-size-18 " aria-hidden="true"  style="transform: translate(-20%,0);" data-action="room_sendImage"></i>
                        <button class="btn btn-primary col float-right ml-10" type="button" data-action="room_sendMsg" style="max-width: 90%;border-radius: 20px;">
                            <i class="fa fa-paper-plane" aria-hidden="true"></i>
                        </button>
                </div>
                `).show();
            },
            onShow: () => {
                $('#menu_main').hide();
                g_room.init();
            },
            overflowY: true,
        });
    },
    init: function() {

        var self = this;
        if (self.inited) return;
        self.inited = true;
        g_room.registerAction();

        $(document)
            .on('wheel', '.hideScroll', function(e) {
                e.currentTarget.scrollBy(e.originalEvent.deltaY / 2, 0);
            })

        /*

     <a data-action="mulit_select" class="btn btn-square rounded-circle" role="button">
                    <i class="fa fa-check-square-o" aria-hidden="true"></i>
                </a>

            <div class="dropdown dropleft float-right" id="dropdown_more">
                <button class="btn" data-toggle="dropdown">
                    <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item">
                        <span data-action="timer_start">计时</span>
                        <span data-action="history_view" class="badge badge-pill badge-primary ml-10 hide">0</span>
                    </a>
                    <a class="dropdown-item" data-action="tagImage">标签</a>
                    <a class="dropdown-item" data-action="markImage">编辑</a>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-content">
                        <button class="btn btn-block btn-danger" data-action="room_exit" type="button">退出</button>
                    </div>
                </div>
        */
        $(`
            <div class="toolbar text-center hide" id="toolbar_room">
                <div class="row w-full" style="align-items: center;">
                    <div id="room_title" class="col-3 text-left text-truncate d-inline-bloc"></div>
                   <div id="room_players" class="col pr-10 hideScroll w-full" style="display: inline-flex;height: 40px;overflow-y: hidden;overflow-x: scroll;align-items: center;">
                    </div>
                    <div class="col-1"></div>
                    <div id="room_time" class="col-2">
                        <span class="badge badge-primary badge-pill">00:00</span>
                    </div>
                </div>
            </div>

            `).appendTo('#navbar-content')
        var imgs = {};
        for (var i = 0; i < 20; i++) {
            imgs[i] = {
                src: './a/' + i + '.jpg',
                player: 'maki'
            }
        }
        self.connect();

        return;
        self.joinRoom('test', {
            owner: 'admin',
            title: '默认房间',
            desc: '欢迎欢迎',
            cover: './res/cover.jpg',
            bg: './res/bg.jpg',
            maxPlayers: 0,
            createAt: new Date().getTime(),
            msgs: [],
            players: {
                maki: {
                    icon: './img/maki.jpg',
                },
                chisato: {
                    icon: './img/chisato.jpg',
                },

            },
            // game: {
            //     type: 'copy',
            //     data: {
            //         src: './a/1.jpg',
            //         player: 'maki'
            //     }
            // },
            imgs: imgs,
            //imgs: {aa: { src: './a/10.jpg', player: 'maki' }, bb: { src: './a/11.jpg', player: 'maki' }}
        });


    },

    initMenu: function(type, data) {
        if (!data) {
            switch (type) {
                case 'gallery':
                    data = [
                        { action: "room_countdown", class: "btn-primary", icon: "fa-hourglass-start" },
                        { action: "room_addImgs", class: "btn-primary", icon: "fa-plus" }
                    ];
                    break;

                case 'photo':
                    data = [
                        { action: "", class: "btn-success", icon: "fa-plus" }
                    ];
                    break;

                case 'game':
                    data = [
                        { action: "", class: "btn-scrondary", icon: "fa-hourglass-start" },
                    ];
                    break;

                case 'lobby':
                    data = [
                        { action: "room_editRoom", class: "btn-primary", icon: "fa-plus" }
                    ];
                    break;
                case 'viewer':
                    data = [
                        { action: "room_saveImg", class: "btn-primary", icon: "fa-plus" }
                    ];
                    break;

                default:
                    return;
            }
        }
        return initMenu('#menu_roomMenu', data);
    },
    getUUID: function() {
        if (!g_config.uuid) {
            g_config.uuid = uuid();
            local_saveJson('config', g_config);
        }
        return g_config.uuid;
    },
    getName: function() {
        return me();
    },
    setConnecting: (loading) => {

    },
    connect: function(url) {
        var self = this;
        if (!url) url = 'ws:' + self.host;
        var socket = self.connection = new WebSocket(url);

        socket.onopen = () => {
            self.setConnecting(false);
            clearTimeout(self.reconnect);
            self.send({
                type: 'login',
                data: {
                    icon: g_config.user.icon
                }
            });
        }

        socket.onmessage = (e) => {
            self.onRevice(JSON.parse(e.data));
        }

        const onError = (e) => {
            // todo 退出房间
            console.log('断开链接')
            self.setConnecting(true);
            self.reconnect = setTimeout(() => self.connect(), 1000 * 3);
        }
        // socket.onerror = (e) => {
        //     console.log('error')
        // }
        socket.onclose = (e) => {
            g_room.leaveRoom(false);
            onError();
        }
        // socket.onclose = onError(event);
    },

    send: function(data) {
        data.player = this.getName();
        data.uuid = this.getUUID();
        data.room = this.currentRoom;
        data.key = g_config.roomKey;
        console.log(data);
        var connection = this.connection;
        if (connection && connection.readyState == 1) {
            connection.send(JSON.stringify(data));
        }
    },
    getImageUrl: function(url) {
        return url.replace('{host}', 'http:'+this.host );
    },
    getThumb: function(url) {
        return url.startsWith('{host}') ? this.getImageUrl(url) + '.thumb' : url;
    },
    getPlayersIcon: (players) => {
        var h = '';
        for (var p in players) {
            h += `
                <img src="${g_room.getImageUrl(players[p].icon)}" class="rounded-circle user-icon-small">
            `
        }
        return h;
    },
    isHideMessage: () => {
        return !$('[data-action="room_toggleChatUI"]').hasClass('fa-window-minimize');
    },
    startGame: function(game, data) {
        console.log(game);
        switch (game.type) {
            case 'copy': // 默写
                g_room.showSubContent('game');
                if (g_room.inlineViewer) g_room.inlineViewer.destroy();
                var img = $('#div_markImg img')[0];
                g_room.inlineViewer = initViewer(img, {
                    inline: true,
                }, {
                    blurBg: true,
                    // todo 缩略图
                    bgUrl: img.src,
                });
                g_room.inlineViewer.show();

                g_mark.opts = {
                    // 清空标记
                    onClearMark:  function() {
                        g_mark.showingData.m = {};
                        g_room.updateMark();
                    },
                    // 删除标记
                    onDeleteMark:  function(key) {
                        delete g_mark.showingData.m[key];
                        g_room.updateMark();
                    },
                    // 新增标记
                    onApplyMark: function() {
                        g_mark.showingData.m[g_mark.dot.attr('data-key')] = g_mark.editingData;
                        // 标记传给服务器同步， 玩家可以点击其他玩家展示其他玩家的标记。 标记数量显示在图标右下角
                        g_room.updateMark();
                        // g_database.saveImgData(g_mark.showingKey, g_mark.showingData);
                    },

                    // 设置标记模式
                    onSetMarkMode: function(type, active) {
                        g_mark.getBtns().toggleClass('hide', g_room.data.targetPlayer != undefined);
                        g_room.inlineViewer.viewer.style.display = active ? 'none' : '';
                        $('.img-mark-dots').css('display', active ? '' : 'none')
                    },

                    // 点击标记
                    beforeDotClick: (text) => {
                        if(g_room.data.targetPlayer){
                            alert1({title: '玩家标记', html: text});
                            return false;
                        }
                    }
                }

                g_room.onRevice({
                    type: 'markList',
                    data: data
                });

             
                break;
        }
    },
    updateMark: function() {
        this.send({
            type: 'updateMark',
            data: g_mark.showingData.m
        });

    },
    onRevice: (data) => {
        console.log(data);
        if (data.msg) {
            toastPAlert(data.msg[0], data.msg[1]);
        }
        var type = data.type;
        var d = data.data;
        switch (type) {
            case 'startVote': // 开始投票
                $('.room_img_vote').removeClass('hide');
                // todo 根据投票类型提示更多的信息
                toastPAlert('开始投票!', 'alert-primary', 5000);
                break;
            case 'voteList':
                // id: [playersNames...],
                for(var div of $('.room_img_heart')){
                    $(div).removeClass('room_img_heart_mine');
                    $(div).find('i').toggleClass('fa-heart-o', true).toggleClass('fa-heart', false);
                    $(div).find('span').html('').hide();
                }
                for(var md5 in d){
                    var div = $('#room_content .grid-item[data-md5="'+md5+'"]').find('[data-action="room_img_heart"]').addClass('room_img_heart');
                    if(d[md5].includes(me())){
                        div.addClass('room_img_heart_mine'); // 突出自己选择的
                    }
                    div.find('i').toggleClass('fa-heart-o', false).toggleClass('fa-heart', true);
                    div.find('span').html(d[md5].length).show();
                }
                break;
            case 'playerMark':
                g_room.data.targetPlayerMark = d.mark;
                g_room.applyPlayerMark(d.target, d.mark);
                break;
            case 'markList':
                for (var pl in d) {
                    if(g_room.data.targetPlayer == pl && Object.keys(g_room.data.targetPlayerMark).length != d[pl].cnt){
                        console.log('目标玩家更新');
                         g_room.send({
                            type: 'getPlayerMark',
                            data: {
                                target: pl
                            }
                        });
                    }
                    var dom = $('[data-action="room_game_playerIcon"][data-user="' + pl + '"]');

                    if (!dom.length) {
                        $(`<div style="position: relative;" data-action="room_game_playerIcon" data-user="${pl}">
                            <img src="${g_room.getImageUrl(d[pl].icon)}" class="user-icon-big rounded-circle" >
                            <span class="badge badge-primary badge-pill" style="padding: 2px;position: absolute;right: -7px;bottom: 5px;">${d[pl].cnt}</span>
                        </div>`).appendTo('#room_game_playerIconList');
                    } else {
                        dom.find('span').html(d[pl].cnt);
                    }
                }
                break;
            case 'countdown_start':

                break;
            case 'chatMsg':
                $(g_room.parseChatMessage(d)).appendTo('#msg_list');

                if (g_room.isHideMessage()) {
                    $('#room_msg_unread').html(++g_room.unread).show();
                } else {
                    if (d.audio && d.player != g_room.getName()) { // 自动播放音频
                        soundTip(d.audio);
                    }
                    setTimeout(() => g_room.msg_toBottom(), 150); // 自动到底部

                }
                break;
            case 'listRoom':
                var h = '';
                g_room.data.roomList = d;
                for (var room in d) {
                    var r = d[room];
                    h += `
                        <div class="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-2" data-room="${room}">
                          <div class="card p-0">
                            <img src="${r.cover}" class="w-full h-150 rounded-top"> 
                            <div class="content">
                              <h2 class="content-title">
                                ${r.title}
                              </h2>
                              <p class="text-muted">
                                ${r.desc}
                              </p>
                              <div>
                                <div class="hideScroll w-full pt-10" style="display: inline-flex;height: 40px;overflow-y: hidden;overflow-x: scroll;">
                                    ${g_room.getPlayersIcon(r.players)}
                                </div>
                                <div class="text-right">
                                    <a data-action="room_joinRoom" class="btn">加入</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    `;
                }
                $('#room_main').hide();
                $('#room_list').html(h).show();
                g_room.initMenu('lobby');
                break;

            case 'login':
                showContent('room');
                break;

            case 'createRoom':
                g_config.roomKey = d.key;
                g_room.requestJoinRoom(d.room, d.password);
                break;

            case 'joinRoom':
                g_room.joinRoom(data.room, data.data);
                break;

            case 'msg':
                g_room.reviceMsg(d);
                break;

            case 'on-player-join':
                g_room.broadcastMsg(`${d.player} 加入了房间`, g_room.getImageUrl(d.icon));
                break;

            case 'on-room-close':
                toastPAlert(`房间 ${data.roomTitle} 已被关闭`, 'alert-danger');
                g_room.leaveRoom();
                break;

            case 'addImgs':
                g_room.reviceImgs(d);
                break;

            case 'alert':
                toastPAlert(d.msg, d.class);
                break;
        }
    },
    broadcastMsg: (msg, icon = './img/sound.ico') => {
        g_room.onRevice({
            type: 'chatMsg',
            data: {
                icon: icon,
                time: new Date().getTime(),
                msg: msg,
            }
        });
    },

    loadHtml: (h, opts) => {
        var items = $(h);
        if (!g_room.grid || opts.insertMode == undefined) {
            // 初始化
            g_room.grid = $('#room_images').html(items).isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                transitionDuration: 200,
                getSortData: {
                    index: '[data-time]',
                    // reverse: function(itemElem) {
                    //     var index = $(itemElem).attr('data-index');
                    //     return 0 - parseInt(index);
                    // }
                }
            });
        } else {
            if (opts.insertMode == 'append') {
                g_room.grid.append(items).isotope('appended', items);
            } else
            if (opts.insertMode == 'prepend') {
                g_room.grid.prepend(items).isotope('prepended', items);
            }
        }
        g_room.grid.find('.lazyload').lazyload()
        gridProgress(g_room.grid, 'room');
        resizeCustomScroll();
    },

    getImageHtml: (d, index, key) => {
        var thumb = g_room.getThumb(d.src);
        return `
        <div class="grid-item" data-index="${index}" data-md5="${key}">
            <div style="height: ` + arrayRandom([150, 175, 200]) + `px;background-color: ` + getRandomColor() + `;">
              <img class="photo lazyload" data-action="room_img_click" src="${thumb}" data-origin="${d.src}">
            </div>
            <div class="w-full mt-5 text-center room_img_vote hide">
              <a class="btn btn-rounded" data-action="room_img_heart">
                <i class="fa fa-heart-o text-danger" aria-hidden="true"></i>
                <span class="badge badge-secondary badge-pill hide" style="position:absolute;">0</span>
              </a>
            </div>
            <div class="w-full mt-5">
                <img class="user-icon-small rounded-circle" src="${g_room.getPlayerIcon(d.player)}">
                ${d.md5 && g_database.imageExists(d.md5) ? '' : `<a class="btn btn-primary float-right" data-action="room_saveImg" role="button">保存</a>` }
            </div>
        </div>`;
    },
    getPlayerIcon: function(name) {
        var pls = this.roomData.players;
        return pls[name] ? g_room.getImageUrl(pls[name].icon) : './img/user.jpg';
    },
    leaveRoom: function() {
        $('#room_main').html('').hide();
        $('#room_list').show();
    },
    parseChatMessage: function(d) {

        var content = '';
        if (d.msg) {
            content = `<span>${d.player} : ${d.msg}</span>`;
        } else
        if (d.img) {
            content = `<img src="${d.img}" style="max-width: 70%;" data-action="room_chat_img_click">`;
            if (d.audio) {
                content += `
                <a class="btn btn-success rounded-circle preview_btn" data-action="room_msg_playAudio" data-url="${d.audio}">
                    <i class="fa fa-play" aria-hidden="true"></i>
                </a>`
            }
        }
        return `
                    <div class="chat-msg d-flex">
                        <img src="${g_room.getImageUrl(d.icon)}" class="mr-10 rounded-circle user-icon-small"  style="align-self: center;">
                        <div class="flex-fill">${content}</div>
                        <span class="flex-fill text-muted text-right" style="align-self: flex-end;">${getFormatedTime(0, d.time)}</span>
                    </div>`;
    },
    joinRoom: function(room, d) {
        this.unread = 0;
        this.currentRoom = room;
        this.roomData = d;

        var h = '';
        // 初始化聊天记录
        for (var msg of d.msgs) {
            h += this.parseChatMessage(msg);
        }
        $('#msg_list').html(h);

        if (room == 'chat') {
            return;
        }

        g_room.toggleChat(true);

        $('#room_list').hide();
        $('#room_players').html(g_room.getPlayersIcon(d.players))
        $('#room_title').html(d.title);
        g_room.showSubContent('gallery'); // 默认展示画廊
        g_room.initMenu(g_room.currentContent);


        /* 标题滚动 */
        if (g_room.scrollTitle) clearInterval(g_room.scrollTitle);
        var titleA = d.title + new Array(d.title.length).fill('').join(' ');
        var title = titleA;
        var stop = false;
        g_room.scrollTitle = setInterval(function() {
            if (!stop) {
                title = title.substring(1, title.length) + title.substring(0, 1);
                $('#room_title').html(title);
                if (titleA == title) {
                    // 暂停滚动
                    stop = true;
                    setTimeout(() => stop = false, 2000);
                }
            }
        }, 1000);

        var main = $('#room_main').show();
        if (d.cover) main.css({
            backgroundImage: `url(${d.cover}) no-repeat`,
            backgroundSize: 'cover'
        });

        g_room.reviceImgs(d.imgs);
        if (d.game) {
            g_room.startGame(d.game, d.data)
        }


    },
    reviceImgs: function(imgs) {
        console.log(imgs);
        if (!g_page.getOpts('room')) {
            g_page.setList('room', {
                index: 0, // 默认页数
                lastIndex: 0, // 最后加载的索引
                pagePre: 20, // 每页加载
                timeout: 3000,
                element: '#room_content', // 绑定元素
                datas: g_room.getPics,
                bottomHtml: `
                    <div class="grid-item w-full">
                        <h4 class="text-center mt-20">到底啦...</h4>
                    </div>
                `,
                parseItem: function(index, key, data) {
                    return g_room.getImageHtml(data, index, key);
                },
                done: function(h) {
                    var data = {};
                    if (this.lastIndex > 0) {
                        data.insertMode = 'append';
                    }
                    g_room.loadHtml(h, data);
                }
            });
        } else {
            Object.assign(g_room.getPics(), imgs);
        }
        g_page.nextPage('room');
    },
    getPics: function() {
        return g_room.roomData.imgs;
    },
    reviceMsg: function(d) {
        var r;
        switch (d.code) {
            case ERR_ROOM_NOT_EXISTS:
                r = {
                    msg: '房间不存在',
                    class: 'alert-danger'
                }
                break;

            case SUCC_DEFAULT:
                r = {
                    msg: '操作成功',
                    class: 'alert-success'
                }
                break;

            case SUCC_CREATE_ROOM:
                r = {
                    msg: '成功创建房间',
                    class: 'alert-success'
                }
                break;

            default:
                return;
        }
        toastPAlert(r.msg, r.class);
    },

    sendMsg: function(data) {
        if (typeof(data) != 'object') data = { msg: data };
        $('#msg').val('');
        g_room.send({
            type: 'chatMsg',
            data: Object.assign({
                // time: new Date().getTime(),
                // icon: './img/user.jpg'
            }, data)
        });
    },

    msg_toBottom: () => {
        $('#room_msg_unread').html('0').hide();
        var scroll = $('#msg_list')[0];
        scroll.scrollTop = scroll.scrollHeight;
    },

    showSubContent: function(id, classes = 'room_subContent') {
        g_room.currentContent = id;
        g_room.initMenu(id);

        showSubContent(classes, id);
         switch (id) {
            case 'gallery':
                g_room.grid && g_room.grid.isotope('layout');
                break;

            case 'photo':
                break;

            case 'game':
                break;
        }
        resizeCustomScroll();
    },
    toggleChat: (hide) => {
        if (hide == undefined) hide = !g_room.isHideMessage();
        getAction('room_toggleChatUI').attr('class', 'fa fa-2x fa-' + (hide ? 'weixin' : 'window-minimize'));
        $('#msg_list').toggleClass('hide', hide);
        $('#room_chat').css('minWidth', hide ? 'unset' : '250px'); // 最小宽度

        $('.navbar-fixed-bottom').css('zIndex', hide ? 2 : 9999); // 让底部栏在viewer内显示
    },

    isRoomMaster: function() {
        return true;
        return this.roomData.owner == me();
    },

    // 应用玩家标记
    applyPlayerMark: function(player, data) {
        $('.selected_player').removeClass('selected_player');
        if (player == me()) {
            delete g_room.data.targetPlayer;
        } else {
            g_room.data.targetPlayer = player; // 锁定目标玩家 禁止玩家编辑
            $('[data-action="room_game_playerIcon"][data-user="' + player + '"]').addClass('selected_player');
        }
        $('.img-mark-dots').remove();
        g_mark.opts.onSetMarkMode('', true); // 隐藏viewer
        g_mark.initMark({ m: data });
    },

    registerAction: function() {
        
        registerAction('room_img_heart', (dom, action, params) => {
            if($(dom).hasClass('room_img_heart_mine')){ // 禁止重复选择
                return;
            }
            g_room.send({
                type: 'heart',
                data: {
                    id: $(dom).parents('[data-md5]').data('md5')
                }
            });
        });
        // 点击头像获取标记

        registerAction('room_game_playerIcon', (dom, action, params) => {
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
            // g_room.onRevice({
            //     type: 'playerMark',
            //     data: {
            //         target: "chisato",
            //         mark: {
            //             "1645276944889": {
            //                 "t": "222",
            //                 "a": "c_55.87_73.33_29.17_39.03"
            //             },
            //             "1645276948947": {
            //                 "t": "33",
            //                 "a": "c_19.05_32.06_3.15_12.59"
            //             }
            //         }
            //     }
            // })
        });
        registerAction('room_countdown', (dom, action, params) => {
            if (g_room.isRoomMaster()) {
                if (!keys.length) return toastPAlert('请先上传图片!');


            }
        });

        registerAction('room_chat_img_click', (dom, action, params) => {
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

                }
            });
            g_room.chatImgviewer.show();
        });

        registerAction('room_subContent', (dom, action, params) => {
            g_room.showSubContent(action[1]);
        });
        registerAction('room_toggleChatUI', (dom, action, params) => {
            // if($('#msg_list').html() == '') return;
            g_room.msg_toBottom();
            g_room.toggleChat();
        });
        registerAction('room_msg_playAudio', (dom, action, params) => {
            soundTip(dom.dataset.url);
        });
        registerAction('qm', (dom, action, params) => {
            halfmoon.deactivateAllDropdownToggles();
            g_room.sendMsg({
                msg: dom.innerText,
            });
        });
        registerAction('room_sendMsg', (dom, action, params) => {
            var msg = $('#msg').val();
            if (!isEmpty(msg)) {

                if (msg.length > 100) return toastPAlert('最多100个字符', 'alert-danger');
                g_room.sendMsg({
                    msg: msg,
                });
            }

        });
        registerAction('room_listRoom', (dom, action, params) => {
            g_room.send({
                type: 'listRoom',
            })
        });

        registerAction('room_editRoom', (dom, action, params) => {
            g_room.editingRoom = action[1];
            var d = action[1] ? getCurrentRoom() : {
                title: me() + '的房间',
                desc: '',
                cover: 'res/cover.jpg',
                password: 1234,
                maxPlayers: 10,
            }

            modalOpen({
                id: 'modal-custom',
                type: 'room_editRoom',
                width: '80%',
                title: '房间设置',
                canClose: true,
                html: `
                <div class="text-center">
                    <img data-action="room_setCover" id="input_room_cover" src="${d.cover}" class="img-fluid rounded-top h-150"> 
                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">名字</span>
                      </div>
                      <input id="input_room_name" type="text" class="form-control" placeholder="房间名称" value="${d.title}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">最大人数</span>
                      </div>
                      <input id="input_room_maxPlayers" type="number" class="form-control" placeholder="0=不限制" value="${d.maxPlayers}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">四位密码</span>
                      </div>
                      <input id="input_room_password" type="number" class="form-control" onchange="this.value = this.value.substr(0, 4)" placeholder="不填不设置" value="${d.password}">
                    </div>

                    <div class="input-group mt-10">
                      <div class="input-group-prepend">
                        <span class="input-group-text">介绍</span>
                      </div>
                      <textarea id="input_room_desc" class="form-control" placeholder="...">${d.desc}</textarea>
                    </div>
                    <div class="text-right mt-10">
                        <a class="btn btn-primary" role="button" data-action="room_createRoom">${action[1] ? '保存' : '新建'}</a>
                      </div>
                </div>
                        `,
                onClose: () => {
                    return true;
                }
            });
        });

        registerAction('room_img_click', (dom, action, params) => {
            var p = $(dom).parents('.grid-item');
            g_room.viewer = new Viewer($('#room_images')[0], {
                backdrop: 'static',
                title: 0,
                toggleOnDblclick: true,
                initialViewIndex: p.index(), // 设置默认打开当前图片
                ready() {
                    if (!g_room.isHideMessage()) {
                        getAction('room_toggleChatUI').click();
                    }
                },
                viewed() {
                    $('.navbar-fixed-bottom').css('zIndex', 2);
                    g_room.initMenu('viewer');
                    $('#room_chat').addClass('withViewer');
                },
                hide() {
                    $('#room_chat').removeClass('withViewer');
                    g_room.viewer.destroy();
                    delete g_room.viewer;
                    g_room.initMenu(g_room.currentContent);

                },
                url(image) {
                    var url = image.dataset.origin;
                    return url;
                },
            });
            g_room.viewer.show();
        });
        registerAction('room_saveImg', (dom, action, params) => {
            var url = g_room.viewer ? $('.viewer-canvas img').attr('src') : $(dom).parents('.grid-item').find('img').data('origin');
            // 保存缓存图片时。需要下载服务器上的图片。避免流量浪费。查看大图使用image获取base64数据。
            // 上传本地图片时，先在服务器上计算md5.然后发给客户端，如果已存在相同md5就禁用保存按钮
            console.log(url);
            // if(url.indexOf())
            // g_database.showSaveDialog({
            //     i: url,
            //     t: ['房间']
            // });
        });
        registerAction('room_setCover', (dom, action, params) => {
            $('#input_img').prop('multiple', false).attr({
                'data-type': 'room_setCover',
                'data-config': JSON.stringify({ quality: 0.7 })
            }).click();
        });
        registerAction('room_createRoom', (dom, action, params) => {
            var vals = checkInputValue(['#input_room_name', '#input_room_maxPlayers', '#input_room_password']);
            if (!vals) return;
            var password = vals[2];
            if(password != '' && password.length != 4){
                return toastPAlert('密码不填或者需要四位数!', 'alert-danger');
            }
            var data = {
                title: vals[0],
                maxPlayers: parseInt(vals[1]),
                password: password,
                desc: $('#input_room_desc').val(),
                cover: $('#input_room_cover').val()
            }
            var room = g_room.editingRoom;
            if (room) { // 编辑信息中...
                data.room = room;
                data.key = g_room.roomKey;
            }
            halfmoon.toggleModal('modal-custom');
            g_room.send({
                type: 'createRoom',
                data: data
            })
        });
        registerAction('room_joinRoom', (dom, action, params) => {
            var room = $(dom).parents('[data-room]').data('room');
            g_room.requestJoinRoom(room);
        });
        registerAction('room_addImgs', (dom, action, params) => {
            var r = [];
            for (var i = 0; i < 4; i++) {
                r.push("./a/" + i + ".jpg")
            }
            g_room.send({
                type: 'addImgs',
                data: r
            });
        });
        registerAction('room_sendImage', (dom, action, params) => {
            g_room.sendMsg({
                img: "./a/1.jpg"
            });
        });
    },
    requestJoinRoom: function(room, password){
        if(password == undefined){
             var data = g_room.data.roomList[room];
            if(data && data.password){
                 mobiscrollHelper.password({mask: '',}, (password) => {
                    if(password != '') g_room.requestJoinRoom(room, password);
                })
                return;
            }
        }
         g_room.send({
                type: 'joinRoom',
                data: {
                    room: room,
                    password: password
                }
            })
     },

}
g_room.preload();