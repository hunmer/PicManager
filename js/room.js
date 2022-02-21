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
    grid: {},
    cache: {},
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
                            <i data-action="room_toggleChatUI" class="fa fa-caret-square-o-down fa-2x ml-10" aria-hidden="true"></i>
                            <i id="msg_chat_range_switch" class="fa fa-eye fa-2x ml-10 hide" aria-hidden="true" onclick=" $('#msg_chat_range').toggleClass('hide');"></i>
                            <span id="room_msg_unread" class="badge badge-danger badge-pill" style="display:none;position: absolute;right: -6px;bottom: -6px;" onclick="getAction('room_toggleChatUI').click()">0</span> 
                          </div>

                          <div class="mr-auto">
                            <input type="range" id="msg_chat_range" min="0" max="100" class="hide ml-20" oninput="$('#msg_list').css('backgroundColor', 'rgba(0, 0, 0, '+this.value / 100+')');">
                          </div>

                        </div>
                    </div>

                <div id="room_list" class="row">
                    <a data-action="room_listRoom" class="btn btn-primary btn-block mt-10">刷新</a>
                </div>

                <div id="room_main" class="hide p-10" style="width: 100%;">

                     <div class="btn-toolbar p-5 bg-light-lm bg-very-dark-dm rounded" role="toolbar"> 
                      <div class="btn-group mx-auto w-full">
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="gallery">画廊</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="photo">照片</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="game">游戏</button>
                      </div>
                    </div>

                    <div id="room_content" class="overflow-x-hidden overflow-y-scroll w-full overflow-h" style="padding-bottom: 200px;">
                          <div id="room_subContent_gallery" class="room_subContent hide">
                            <div id="room_gallery">
                                <h2 class="text-center">还没有人上传...</h2>
                            </div>
                          </div>
                          <div id="room_subContent_photo" class="room_subContent hide">
                            <div id="room_photos">
                                <h2 class="text-center">还没有人上传...</h2>
                            </div>
                        </div>
                            <div id="room_subContent_game" class="room_subContent hide">
                                <h2 class="text-center">还未开始</h2>
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
                                <li data-action='qm'>OK</li>
                                <li data-action='qm'>NO!</li>
                                <li data-action='qm'>gkd!</li>
                                <li data-action='qm'>tql!</li>
                                <li data-action='qm'>xswl</li>
                                <li data-action='qm'>yyds</li>
                                <li data-action='qm'>nsdd</li>
                                <li data-action='qm'>awsl</li>
                                <li data-action='qm'>ghs</li>
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
                    <div id="room_title" class="col-3 text-left textScroll">
                        <span></span>
                    </div>
                   <div id="room_players" class="col pl-10 pr-10 hideScroll w-full" style="display: inline-flex;height: 40px;overflow-y: hidden;overflow-x: scroll;align-items: center;">
                    </div>
                    <div class="col-1"></div>
                    <div id="room_time" class="col-2">
                        <span class="badge badge-pill">00:00</span>
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
                        { action: "room_addImgs,gallery", class: "btn-primary", icon: "fa-plus" }
                    ];
                    break;

                case 'photo':
                    data = [
                        { action: "room_addImgs,photo", class: "btn-success", icon: "fa-plus" }
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
                        // { action: "room_openInlineViewer", class: "btn-secondary", icon: "fa-pencil" },
                        { action: "room_saveImg", class: "btn-primary", icon: "fa-inbox" },
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
        return url.replace('{host}.', 'http:' + this.host);
    },
    getThumb: function(url) {
        return url.startsWith('{host}.') ? this.getImageUrl(url) : url;
        // return url.startsWith('{host}') ? this.getImageUrl(url) + '.thumb' : url;
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
        return !$('[data-action="room_toggleChatUI"]').hasClass('fa-caret-square-o-down');
    },

    openInlineViewer: function(src) {
        src = g_room.getImageUrl(src);
        $('#room_subContent_game').html(`
            <div class="w-full" id="div_markImg">
                <img src="${src}" class="w-full" onclick="modalImgClick(event);">
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
        `);
        g_room.showSubContent('game');
        if (g_room.inlineViewer) g_room.inlineViewer.destroy();
        g_room.inlineViewer = initViewer($('#div_markImg img')[0], {
            inline: true,
        }, {
            blurBg: true,
            // todo 缩略图
            bgUrl: src,
        });
        g_room.inlineViewer.show();
    },
    startGame: function(game, data) {
        g_room.roomData.game = game;
        g_room.roomData.data = data;
        console.log(game);
        switch (game.type) {
            case 'copy': // 默写
                if (game.data.src == undefined) { // 自由
                    toastPAlert('自由模式!随意选择.', 'alert-primary');
                    break;
                }
                g_room.openInlineViewer(game.data.src);
                g_mark.opts = {
                    // 清空标记
                    onClearMark: function() {
                        g_mark.showingData.m = {};
                        g_room.updateMark();
                    },
                    // 删除标记
                    onDeleteMark: function(key) {
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
                        if (g_room.data.targetPlayer) {
                            alert1({ title: '玩家标记', html: text });
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
        var time = game.time;
        var increase = time == 0;
        clearInterval(g_room.cache.timer);
        var span = g_room.setTime('GO!', 'badge-primary').show();
        g_room.cache.timer = setInterval(() => {
            var t = increase ? ++time : --time;
            span.html(getTime(t, ':', ':', ''));
            if (!increase && t <= 0) {
                clearInterval(g_room.cache.timer);
            }
        }, 1000)
    },
    updateMark: function() {
        this.send({
            type: 'updateMark',
            data: g_mark.showingData.m
        });

    },
    setTime: (t, classes = '') => {
        var t1 = parseInt(t);
        if (!isNaN(t1)) t = getTime(t1, ':', ':', '');
        return $('#room_time').find('span').html(t).attr('class', 'badge badge-pill ' + classes);
    },
    onRevice: (data) => {
        console.log(data);
        if (data.msg) {
            toastPAlert(data.msg[0], data.msg[1]);
        }
        var type = data.type;
        var d = data.data;
        switch (type) {
            case 'part':
                g_room.partSend_next();
                break;

            case 'syncTime':
                g_room.setTime(d, 'badge-primary').show();
                break;
            case 'overGame':
                switch (d.reason) {
                    case 'timeout':
                        toastPAlert('计时完毕!', 'alert-secondary', 5000);
                        break;
                }
                g_room.setTime('计时结束').show();
                break;
            case 'startGame': // 开始游戏
                g_room.startGame(d.game, d.data);
                break;
            case 'voteResult': // 投票结果
                $('.room_img_vote').addClass('hide'); // 隐藏投票按钮
                g_room.setTime('投票结束').show();
                var keys = Object.keys(d);
                if (keys.length == 0) return toastPAlert('无结果!', 'alert-danger');
                var i = 0;
                var h = '';
                for (var k of keys.slice(0, 3)) {
                    h += `<div style="position: relative;" class="col-${i == 0 ? '12' : '6'}">
                            <img class="w-full rounded p-10" src="${g_room.getImageUrl(d[k].value.src)}">
                            <button class="btn btn-rounded btn-lg btn-success" type="button" style="position: absolute;top: 0;left: 0;">${d[k].cnt}</button>
                        </div>`;
                    i++;
                }
                modalOpen({
                    id: 'modal-custom',
                    type: 'room_voteResult',
                    fullScreen: true,
                    height: '100%',
                    width: '100%',
                    title: `投票结果<button class="btn btn-primary float-right" onclick="halfmoon.toggleModal('modal-custom')">开冲!</button>`,
                    canClose: true,
                    html: '<div class="row">' + h + '</div>',
                    onClose: () => {

                        return true;
                    }
                });
                break;
            case 'startVote': // 开始投票
                $('.room_img_vote').removeClass('hide'); // 显示投票按钮
                g_room.isotopeResize(); // 调整瀑布流

                // todo 根据投票类型提示更多的信息
                var time = d.time;
                var span = g_room.setTime('开始投票', 'badge-danger').show();
                g_room.voteTimer = setInterval(() => {
                    span.html(--time);
                    if (time == 0) {
                        clearInterval(g_room.voteTimer);
                    }
                }, 1000);
                toastPAlert('开始投票!', 'alert-primary', 5000);
                break;
            case 'voteList':
                // id: [playersNames...],
                for (var div of $('.room_img_heart')) {
                    $(div).removeClass('room_img_heart_mine');
                    $(div).find('i').toggleClass('fa-heart-o', true).toggleClass('fa-heart', false);
                    $(div).find('span').html('').hide();
                }
                for (var md5 in d) {
                    var div = $('#room_content .grid-item[data-md5="' + md5 + '"]').find('[data-action="room_img_heart"]').addClass('room_img_heart');
                    if (d[md5].includes(me())) {
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
                    if (g_room.data.targetPlayer == pl && Object.keys(g_room.data.targetPlayerMark).length != d[pl].cnt) {
                        //console.log('目标玩家更新');
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
                // TODO 当前正在进行的游戏，以及游戏标签
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
                g_room.broadcastMsg({msg: `加入了房间`, icon: g_room.getImageUrl(d.icon), player: d.player});
                break;

            case 'on-room-close':
                toastPAlert(`房间 ${data.roomTitle} 已被关闭`, 'alert-danger');
                g_room.leaveRoom();
                break;

            case 'addImgs':
                g_room.reviceImgs(data.props.type == 'room_addImgs,gallery' ? 'room_gallery' : 'room_photos', d);
                break;

            case 'alert':
                toastPAlert(d.msg, d.class);
                break;
        }
    },
    broadcastMsg: function(opts){
        opts = Object.assign({
             icon: './img/sound.ico',
             msg: '',
             time: new Date().getTime()
        }, opts);
        g_room.onRevice({
            type: 'chatMsg',
            data: opts
        });
    },

    isotopeResize: function(target) {
        for (var id in g_room.grid){
            if(target != undefined && id != target) continue;
             g_room.grid[id].isotope('layout');
        }
    },

    loadHtml: (id, h, opts) => {
        console.log(id);
        var items = $(h);
        if (!g_room.grid[id] || opts.insertMode == undefined) {
            // 初始化
            g_room.grid[id] = $('#' + id).html(items).isotope({
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
                g_room.grid[id].append(items).isotope('appended', items);
            } else
            if (opts.insertMode == 'prepend') {
                g_room.grid[id].prepend(items).isotope('prepended', items);
            }
        }
        g_room.grid[id].find('.lazyload').lazyload()
        gridProgress(g_room.grid[id], id);
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
        g_room.grid.isotope('destroy');
        $('#room_players').html('')
        $('#room_title span').html('');
        g_room.initMenu('lobby');
        clearInterval(g_room.cache.timer);
    },
    parseChatMessage: function(d) {

        var content = '';
        if (d.msg) {
            content = `<span>${d.player != undefined ? d.player + ' : ' : ''}${d.msg}</span>`;
        } else
        if (d.img) {
            if(!Array.isArray(d.img)) d.img = [d.img];
            content = `<img src="${g_room.getImageUrl(d.img[1])}" data-origin="${d.img[0] || ''}" style="max-width: 70%;" data-action="room_chat_img_click">`;
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
        $('#room_title span').html(d.title);
        g_room.showSubContent('gallery'); // 默认展示画廊
        g_room.initMenu(g_room.currentContent);


        var main = $('#room_main').show();
        if (d.cover) main.css({
            backgroundImage: `url(${d.cover}) no-repeat`,
            backgroundSize: 'cover'
        });

        g_room.reviceImgs('room_gallery', d.imgs);
        g_room.reviceImgs('room_photos', d.photos);
        if (d.game) {
            g_room.startGame(d.game, d.data)
        }


    },
    reviceImgs: function(id, imgs) {
        console.log(imgs);
        if (!g_page.getOpts(id)) {
            $('#'+id).html('');
            g_page.setList(id, {
                props: { id: id },
                index: 0, // 默认页数
                lastIndex: 0, // 最后加载的索引
                pagePre: 20, // 每页加载
                timeout: 3000,
                element: '#room_content', // 绑定元素
                datas: id == 'room_gallery' ? () => g_room.roomData['imgs'] : () => g_room.roomData['photos'],
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
                    if (this.lastIndex > 0) data.insertMode = 'append';
                    g_room.loadHtml(this.props.id, h, data);
                }
            });
        } else {
            Object.assign(g_room.roomData[id == 'room_gallery' ? 'imgs' : 'photos'], imgs);
        }
        g_page.nextPage(id);
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
                g_room.isotopeResize('room_gallery');
                break;

            case 'photo':
                g_room.isotopeResize('room_photos');
                break;

            case 'game':
                break;
        }
        resizeCustomScroll();
    },
    toggleChat: (hide) => {
        if (hide == undefined) hide = !g_room.isHideMessage();
        getAction('room_toggleChatUI').attr('class', 'fa fa-2x fa-' + (hide ? 'weixin' : 'caret-square-o-down'));
        $('#msg_list').toggleClass('hide', hide);
        $('#msg_chat_range_switch').toggleClass('hide', hide);
       
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

    getCuttentImage: (dom) => {
        if (g_room.viewer) {
            return g_room.viewer.targetImg
        }

        var par = $(dom).parents('.grid-item');
        return {
            md5: par.data('md5'),
            url: par.find('img').data('origin')
        }
    },

    registerAction: function() {

        // 打开图像到游戏界面
        // TODO: 更改图像后不会上传数据到标记列表
        // registerAction('room_openInlineViewer', (dom, action, params) => {
        //     var game = g_room.roomData.game;
        //     if (game && game.type == 'copy' && game.data.src != undefined) {
        //         confirm1('当前游戏模式不是自由模式,你确定要使用其他的参考图吗?', sure => {
        //             if (sure) {
        //                 g_room.openInlineViewer(g_room.viewer.viewer.querySelector('img').src);
        //                 g_room.viewer.hide();
        //             }
        //         })
        //     }
        // });
        registerAction('room_img_heart', (dom, action, params) => {
            if ($(dom).hasClass('room_img_heart_mine')) { // 禁止重复选择
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
                var imgs = g_room.roomData.imgs;
                var keys = Object.keys(imgs);
                if (!keys.length) return toastPAlert('请先上传图片!');

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
                                    title: '是否选择这张图?',
                                    html: `<img src="${random.src}" class="w-full">`,
                                    buttons: ['set', {
                                        text: '再抽',
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
                var dialog = mobiscrollHelper.select({
                    data: ['投票', '随机', '自由'],
                    title: '',
                    selected: 1,
                    callback: (result, instance) => {
                        submit = result;
                        instance.cancel();
                    },
                    opts: { // 最外层的widget
                        headerText: '选择计时方式',
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

                },
                url(image) {
                    if(image.dataset.origin) return g_room.getImageUrl(image.dataset.origin);
                },
            });
            g_room.chatImgviewer.show();
        });

        registerAction('room_subContent', (dom, action, params) => {
            g_room.showSubContent($(dom).data('value'));
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
                msg: $(dom).html(),
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
            g_room.viewer = new Viewer($('#room_gallery')[0], {
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
                async url(image) {
                    return g_room.getImageUrl(image.dataset.origin);
                },
            });
            g_room.viewer.targetImg = {
                md5: p.data('md5'),
                img: p.find('img').data('origin')
            };
            g_room.viewer.show();
        });
        registerAction('room_saveImg', (dom, action, params) => {
            // uhmmm. 这里应该直接获取服务器返回回来的md5的

            const openDialog = (url, md5) => {
                var r = {};
                r[md5] = {
                    i: url,
                    t: ['房间']
                }
                g_database.showSaveDialog(r);
            }
            var data = g_room.getCuttentImage(dom);
            console.log(data);
            if (data.url.startsWith('{host}')) { // 可以下载数据
                getImgToBase64(g_room.getImageUrl(data.url), base64 => {
                    openDialog(base64, data.md5);
                    // getMD5(dataURLtoFile(base64, 'file.jpg'), (md5) => {});
                });
            } else {
                openDialog(data.url, data.md5);
            }
            // 保存缓存图片时。需要下载服务器上的图片。避免流量浪费。查看大图使用image获取base64数据。
            // 上传本地图片时，先在服务器上计算md5.然后发给客户端，如果已存在相同md5就禁用保存按钮
        });
        registerAction('room_setCover', (dom, action, params) => {
            g_file.openDialog('room_setCover', false);
        });
        registerAction('room_createRoom', (dom, action, params) => {
            var vals = checkInputValue(['#input_room_name', '#input_room_maxPlayers', '#input_room_password']);
            if (!vals) return;
            var password = vals[2];
            if (password != '' && password.length != 4) {
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
            g_file.openDialog(action.join(','), true);
        });
        registerAction('room_sendImage', (dom, action, params) => {
            g_file.openDialog('room_sendImage', true);
        });
    },
    addImages: function(data, type) {
        g_room.partSend(data, res => {
            this.send({
                type: type,
                data: [res],
                part: true,
            });
        });
    },
    /* 逐一上传  */
    partSend: function(data, callback) {
        var len = Object.keys(data).length;
        if (!len) return;
        this.cache.partSend = data;
        this.cache.partSend_finshed = [];
        this.cache.partSend_callback = callback;
        g_autojs.showImportProgress(len, '传送中...');
        this.partSend_next();
    },
    partSend_next: function(callback) {
        var list = this.cache.partSend;
        var keys = Object.keys(list);
        if (keys.length == 0) {
            console.log('over');
            return;
        }
        var data;
        if (Array.isArray(list)) {
            data = list[keys[0]];
            list.splice(0, 1);
        } else {
            data = Object.assign({}, list[keys[0]]);
            delete list[keys[0]];
        }
        if (!callback) callback = this.cache.partSend_callback;
        callback(data);
        g_autojs.setImportProgress(this.cache.partSend_finshed.push(keys[0]));
    },

    requestJoinRoom: function(room, password) {
        if (password == undefined) {
            var data = g_room.data.roomList[room];
            if (data && data.password) {
                mobiscrollHelper.password({ mask: '', }, (password) => {
                    if (password != '') g_room.requestJoinRoom(room, password);
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