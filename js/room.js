const SUCC_ROOM_SETTING_APPLY = 1;
const ERR_ROOM_NOT_EXISTS = 2;
const SUCC_CREATE_ROOM = 3;
const CONFIRM_CREATE_ROOM = 4;
const ERR_NOT_PERMISSIOM = 5;
const KICK_BY_OWNER = 6;
const KICK_BY_SYSTEM = 7;
const ERR_CANT_KICK_YOURSELF = 8;
const SUCCESS_KICKED = 9;
const ERR_IN_BLOCK_LIST = 11;
const SUCC_IMAGE_DELETED = 10;
const ERR_FILE_NOT_EXISTS = 12;
const WARNING_IMAGE_EXISTSED = 13;
const ERR_ACCOUNT_PROTECT = 14;
const ERR_WRONG_PASSWORD = 15;
const ERR_NAME_ALREADY_EXISTSED = 16;
const ERR_ROOM_PLAYER_MAXED = 17;

var g_room = {
    host: '//picmanager-room.glitch.me',
    // host: '//192.168.31.77:8000',
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
            html: `
               
            <div id="subContent_room" class="subContent">
                <div id="bottom_stricker" class="bg-dark overflow-x-scroll overflow-y-hidden w-full h-125" style="display: none;position: fixed;bottom: 40px;">
                    <div class="row w-auto h-125" style="display: flex">
                    </div>
                </div>

                <div id="room_chat" class="ml-10" style="position: fixed;bottom:70px;z-index: 2100;">
                        <div id="room_event_tip" style="max-width: 300px;display: flex;align-items: center;" class="p-10">
                            <div></div>
                        </div>
                        <div id="msg_list" class="animated fadeIn border rounded shadow" animated='fadeIn' style="padding-bottom: 50px;max-width: 300px;height: 300px;overflow-y: scroll;overflow-x: hidden; color: #ffffff;background-color: rgba(0, 0, 0, .4)">
                        </div>
                        <div class="d-flex">
                          <div class="mr-auto">
                            <i data-action="room_toggleChatUI" class="fa fa-caret-square-o-down fa-2x ml-10" aria-hidden="true"></i>
                            <i id="msg_chat_range_switch" class="fa fa-eye fa-2x ml-10 hide" aria-hidden="true" onclick=" $('#msg_chat_range').toggleClass('hide');"></i>
                            <span id="room_msg_unread" class="badge badge-danger badge-pill" style="display:none;position: absolute;right: -6px;bottom: -6px;" onclick="getAction('room_toggleChatUI').click()">0</span> 
                          </div>

                          <div class="mr-auto">
                            <input type="range" id="msg_chat_range" min="25" max="100" class="hide ml-20" oninput="$('#msg_list').css('backgroundColor', 'rgba(0, 0, 0, '+this.value / 100+')');">
                          </div>

                        </div>
                    </div>

                <div id="room_list" class="row animated bounceIn pb-100" animated='bounceIn'>
                </div>

                <div id="room_main" class="animated fadeIn" animated='fadeIn' style="width: 100%;display: none;">

                     <div class="btn-toolbar rounded" role="toolbar"> 
                      <div class="btn-group mx-auto w-full">
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="gallery">${_l('参考图')}</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="photo">${_l('照片')}</button>
                        <button class="btn btn-square" type="button" data-action="room_subContent" data-value="game">${_l('游戏')}</button>
                      </div>
                    </div>

                    <div id="room_content" class="overflow-x-hidden overflow-y-scroll w-full overflow-h" style="padding-bottom: 200px;">
                          <div id="room_subContent_gallery" class="room_subContent hide animated fadeIn" animated='fadeIn'>
                            <div id="room_gallery">
                                
                            </div>
                          </div>
                          <div id="room_subContent_photo" class="room_subContent hide animated fadeIn" animated='fadeIn'>
                            <div id="room_photo">
                            </div>
                        </div>
                            <div id="room_subContent_game" class="room_subContent hide animated fadeIn" animated='fadeIn'>
                            </div>
                    </div>
                    
                </div>
                <div class="menu bottom_right_menu" id="menu_roomMenu" style="right: 20px;
                z-index: 2100;
                padding: 0px;
                bottom: 55px;
                max-height: 40%;
                height: auto;">
                    <div class="dropdown dropleft">
                        <a class="btn p-0 rounded-circle" style="width: 35px;height: 35px;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-music fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                        </a>
                      <div class="dropdown-menu dropdown-menu-up w-200 shadow" id="music_player">
                        <div class="textScroll d-relative" >
                            <img class="w-full  rounded-top" src="img/user.jpg">
                            <span class="d-block text"></span>
                        </div>
                        <div class="row dropdown-content p-10">
                             <i data-action="music_prev" class="fa fa-arrow-left fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                             <i data-action="music_toggle" class="fa fa-play fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                             <i data-action="music_next" class="fa fa-arrow-right fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                             <i data-action="music_list" class="fa fa-list fa-2x" style="line-height: 35px;" aria-hidden="true"></i>
                        </div>
                      </div>
                    </div>
                   <div class="icon_list bottom_right_menu"></div>
                </div>
            </div>`,
            initNavBottom: () => {
                return `
                    <div id="bottom_room" class="row" style="max-width: 75%;width:100%;margin: 0 auto;border-radius: 20px;display: flex;align-items: center;">
                        <i data-action="show_stricker" class="fa fa-smile-o font-size-18 mr-10" aria-hidden="true"></i>

                        <input type="text" id='msg' class="form-control col-8" placeholder="${_l('输入消息')}" onclick="if(g_room.viewer){ var val = prompt('${_l('输入消息')}');if(!isEmpty(val)) g_room.sendMsg(val)}" onkeydown="if(event.keyCode == 13) doAction(null, 'room_sendMsg')" style="background-color: unset;border: unset;padding-right: 35px;" oninput="this.inputed = true;checkStrickerTags(this)" onblur="if(!g_room.viewer && this.inputed == undefined){g_room.toggleChat(true)} delete this.inputed;" onfocus="g_room.toggleChat(false)">

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
                </div>`;
            },
            dropDownHtml: () => {
                return `
                <div class="dropdown" id="dropdown_room">
                   <span class="badge-group" role="group" data-toggle="dropdown">
                      <a id="room_time" class="badge badge-primary badge-pill">00:00</a>
                      <a class="badge badge-secondary badge-pill"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>
                    </span>
                    <div class="dropdown-menu dropdown-menu-center pr-10">
                        <a class="dropdown-item" data-action="">信息</a>
                        <a class="dropdown-item" data-action="room_share">${_l('分享')}</a>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-content">
                            <button class="btn btn-block btn-danger" data-action="room_exit" type="button"><i class="fa fa-sign-out fa-flip-horizontal mr-10" aria-hidden="true"></i>退出</button>
                        </div>
                    </div>
                </div>
                `;
            },
            onShow: () => {
                $('[data-action="history_newNote"]').hide();
                // g_menu.toggleMenu('#menu_main', true);
                $('#menu_main').hide();
                g_room.init();
                if (! g_config.firstRoom) { // 第一次进入房间系统
                    g_room.showGuide();
                }
            },
            overflowY: true,
        });
    },
    disconect: function() {
        // todo 
        this.connection.close();
        this.connection.onclose = () => {}
        if (this.reconnect) clearTimeout(this.reconnect);
    },
    loadScripts: function(callback) {
        loadRes([
            { url: './js/room/onAction.js', type: 'js' },
            { url: './js/room/onReviceMessage.js', type: 'js' },
            { url: './js/room/music.js', type: 'js' }
        ], () => {
            callback && callback();
        }, false)
    },
    setEventMsg: (html) => {
        $('#room_event_tip').html(html).fadeIn('slow');
        selfDestroyFun(g_room.cache, 'timer_eventMsg', clearTimeout, (_obj, _key) => {
            return setTimeout(() => {
                $('#room_event_tip').fadeOut('slow').html('');
                delete _obj[_key];
            }, 2000);
        })
    },
    init: function() {
        if (this.inited) return;
        this.inited = true;
        this.preload();

        g_room.loadScripts(() => {
            var self = g_room;
            g_back['room'] = () => {
                if (g_room.inlineViewer && g_room.inlineViewer.fulled) {
                    g_room.inlineViewer.exit()
                }
                if (g_room.chatImgviewer) {
                    g_room.chatImgviewer.hide();
                    return true;
                }
                if (g_room.viewer) {
                    g_room.viewer.hide();
                    return true;
                }
                if (g_cache.showing == 'room') {
                    var room = g_room.getData('room');
                    if (room != undefined) {
                        if (room == 'chat') {
                            g_room.disconect();
                            showContent('gallery');
                        } else {
                            getAction('room_exit').click();
                        }
                        return true;
                    }
                }
            }

            $(document)
                .on('wheel', '.hideScroll', function(e) {
                    e.currentTarget.scrollBy(e.originalEvent.deltaY / 2, 0);
                })
            $(`
            <div class="toolbar text-center hide" id="toolbar_room">
                <div class="row w-full" style="align-items: center;">
                    <div id="room_title" class="col-3 text-left textScroll">
                        <span class="text"></span>
                    </div>
                   <div id="room_players" data-action="room_playerList" class="col-5 pl-10 pr-10 hideScroll w-full" style="display: inline-flex;height: 40px;overflow-y: hidden;overflow-x: scroll;align-items: center;">
                    </div>
                </div>
            </div>
            `).appendTo('#navbar-content')

            self.setRoomList();
            self.toggleChat(true);
            self.connect();
        })

    },

    initMenu: function(type, data) {
        if (!data) {
            switch (type) {
                case 'gallery':
                    data = [
                        { action: "room_countdown", class: "btn-primary", icon: "fa-hourglass-start" },
                        { action: "room_addImgs,gallery", class: "btn-success", icon: "fa-plus" }
                    ];
                    if (g_room.getData('isOwner')) {
                        data.unshift({ action: "room_editRoom,1", class: "btn-primary", icon: "fa-ellipsis-h" });
                    }
                    break;

                case 'photo':
                    data = [
                        { action: "room_addImgs,photo", class: "btn-success", icon: "fa-plus" }
                    ];
                    break;

                case 'game':
                    data = [];
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
        return initMenu('#menu_roomMenu .icon_list', data);
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
        if (!url) url = (self.host.indexOf('glitch.me') != -1 ? 'wss:' : 'ws:') + self.host;
        if (self.connection) self.connection.close();

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
            self.setConnecting(true);
            var div = getAction('room_listRoom');
            if(div){
                 div.find('img').attr('src', 'res/sticker/1/fail.png');
                  div.find('h4').html(_l('点我可以刷新哦'));
            }
            clearTimeout(self.reconnect);
            self.reconnect = setTimeout(() => self.connect(), 1000 * 3);
        }

        socket.onclose = (e) => {
            g_room.leaveRoom();
            onError();
        }
    },

    isConnected: function() {
        var connection = this.connection;
        return connection && connection.readyState == 1;
    },

    send: function(data) {
        data.player = this.getName();
        data.uuid = this.getUUID();
        data.room = this.currentRoom;
        data.key = g_config.roomKey;
        console.log(data);
        if (this.isConnected()) {
            this.connection.send(JSON.stringify(data));
        } else {
            g_room.connect();
        }
    },
    getImage: function(md5) {
        return $('#room_content .grid-item[data-md5="' + md5 + '"]');
    },
    getImageUrl: function(url) {
        return url.replace('{host}.', 'http:' + this.host);
    },
    getThumb: function(url) {
        return url.startsWith('{host}.') ? this.getImageUrl(url) : url;
        // return url.startsWith('{host}') ? this.getImageUrl(url) + '.thumb' : url;
    },
    getData: function(k, def) {
        if (this.roomData) {
            if (k == undefined) return this.roomData;
            return this.roomData[k] || def;
        }
        return def;
    },
    setData: function(k, v) {
        if (this.roomData) {
            this.roomData[k] = v;
        }
    },
    initPlayersIcon: function(players) {
        if (!players) players = this.getData('players');
        $('#room_players').html(this.getPlayersIcon(players));
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

    // TODO 重进会丢失标记数据

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
        setTimeout(() => {
            if (g_room.inlineViewer) g_room.inlineViewer.destroy();
            g_room.inlineViewer = initViewer($('#div_markImg img')[0], {
                inline: true,
            }, {
                blurBg: true,
                // todo 缩略图
                bgUrl: src,
            });
            g_room.inlineViewer.show();

        }, 500);
    },
    startGame: function(game, data) {
        g_room.roomData.game = game;
        g_room.roomData.data = data;
        switch (game.type) {
            case 'copy': // 默写
                if (game.data.src == undefined) { // 自由
                    toastPAlert(_l('自由模式开始'), 'alert-primary');
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
                        g_room.updateMark();
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
                            toastPAlert(text, 'alert-primary');
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
            if (t % 60 == 0) {
                addAnimation(span, 'flash');
            }
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
        return $('#room_time').html(t).attr('class', 'badge badge-pill ' + classes);
    },
    // onRevice: (data) => {},
    saveRoomKey: function(key) {
        g_config.roomKey = key;
        local_saveJson('config', g_config);
    },
    broadcastMsg: function(opts) {
        opts = Object.assign({
            icon: './img/sound.ico',
            msg: '',
            time: new Date().getTime(),
            event: true,
        }, opts);
        g_room.onRevice({
            type: 'chatMsg',
            data: opts,
        });
    },

    removeImage: function(md5) {
        var dom = this.getImage(md5);
        if (dom.length) {
            for (var id in g_room.grid) {
                g_room.grid[id].isotope('remove', dom[0]);
            }
            this.isotopeResize();
        }
    },

    isotopeResize: function(target) {
        for (var id in g_room.grid) {
            if (target != undefined && id != target) continue;
            g_room.grid[id].isotope(target === null ? 'destroy' : 'layout');
        }
        if (target == null) {
            g_room.grid = [];
            g_page.removeOpts('room_gallery');
            g_page.removeOpts('room_photo');
        }
    },

    loadHtml: (id, h, opts) => {
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
        var saved = g_imgCache.has(key);
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
                ${d.md5 && g_database.imageExists(d.md5) ? '' : `<a class="btn ${saved ? '' : 'btn-primary'} float-right" data-action="room_saveImg" role="button">${saved ? _l('已收集') : _l('收集')}</a>` }
            </div>
        </div>`;
    },
    getPlayerIcon: function(name) {
        var pls = this.roomData.players;
        return pls[name] ? g_room.getImageUrl(pls[name].icon) : './img/user.jpg';
    },
    setRoomList: function(d) {
        // TODO 当前正在进行的游戏，以及游戏标签
        var h = '';
        g_room.data.roomList = d;
        if (d) {
            for (var room in d) {
                var r = d[room];
                if (room == 'r15') {
                    r.title = _l('r15_标题');
                    r.desc = _l('r15_介绍');
                } else
                if (room == 'r18') {
                    r.title = _l('r18_标题');
                    r.desc = _l('r18_介绍');
                } else
                if (room == 'lobby') {
                    r.title = _l('默认房间_标题');
                    r.desc = _l('默认房间_介绍');
                }
                h += `
                    <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3" data-room="${room}">
                      <div class="card p-0">
                        <img src="${g_room.getImageUrl(r.cover)}" class="w-full h-150 rounded-top"> 
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
                                
                                <span class="text-muted">
                                    <i class="fa fa-clock-o mr-5" aria-hidden="true"></i>${getFormatedTime(0, r.createAt)}
                                </span>
                            </div>
                            ` + (() => {
                                if (!r.tags) return '';
                                var s = '<div>';
                                for (var tag of r.tags) s += `
                                    <span class="badge ml-5 mt-5">
                                        <i class="fa fa-hashtag text-primary mr-5" aria-hidden="true"></i>${tag}
                                    </span>`;
                                return s + '</div>';
                            })() + `
                            <div class="text-right mt-10">
                                 <span class="badge ml-5 mt-5">
                                    <i class="fa fa-users text-danger mr-5" aria-hidden="true"></i>${Object.keys(r.players).length}/${r.maxPlayers || '∞'}
                                </span>

                                <a data-action="room_joinRoom" class="btn btn-primary">${_l('加入')}</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                `;
            }
        } else {
            h = `<div data-action="room_listRoom" class="text-center">
                <img src="res/sticker/1/loading.png" class="w-half">
                <h4>${_l('点我可以刷新哦')}</h4>
            `;
        }
        $('#room_main').hide();
        $('#room_list').html(h).show();
        g_room.initMenu('lobby');

    },
    leaveRoom: function(fromUser = false) {
        const fun = (data) => {
            halfmoon.deactivateAllDropdownToggles();
            $('.content-wrapper').css('overflowY', 'auto');
            if (g_room.isConnected()) this.send({ type: 'exit', data: data });
            this.setRoomList();
            delete g_room.roomData;
            $('#room_main').hide();
            g_room.toggleChat(true);
            g_room.isotopeResize(null);
            $('#room_players').html('')
            $('#room_title span').html('');
            g_room.setTime(0);
            g_room.initMenu('lobby');
            clearInterval(g_room.cache.timer);
        }
        if (fromUser) {
            confirm1(`
                <div class="text-center">
                    <img src="./res/sticker/1/pa.png" class="h-200">
                    <p>${_l('是否退出房间', getTime((new Date().getTime() - this.joinTime) / 1000))}</p>
                </div>
                `, sure => {
                if (sure) {
                    if (g_room.isRoomMaster()) {
                        return confirm1(_l('是否关闭房间'), close => fun({ close: close }));
                    }
                    fun();
                }
            })
        } else {
            fun();
        }
    },
    parseChatMessage: function(d) {

        var content = d.player != undefined ? d.player + ' : ' : '';
        if (d.msg) {
            content += d.msg;
        } else
        if (d.img) {
            if (!Array.isArray(d.img)) d.img = [d.img];
            content += `
                <div style="position: relative">
                    <img src="${g_room.getImageUrl(d.img[1] || d.img[0])}" data-origin="${d.img[0]}" style="max-width: 70%;" data-action="room_chat_img_click">`;
            if (d.audio) {
                content += `
                <a style="position: absolute;right: 10px;width: 30px;height: 30px;" class="btn btn-success rounded-circle preview_btn" data-action="room_msg_playAudio" data-url="${d.audio}">
                    <i class="fa fa-play" aria-hidden="true"></i>
                </a>`
            }
            content += '</div>'
        }
        return `
        <div class="chat-msg d-flex animated fadeInLeft" animated='fadeInLeft'>
            <img src="${g_room.getImageUrl(d.icon)}" class="mr-10 rounded-circle user-icon-small" >
            <div class="flex-fill">${d.isOwner ? `<span class="badge badge-secondary mr-10">${_l('房主')}</span>` : ''}${content}</div>
            <span class="flex-fill text-right" style="align-self: flex-end;">${getFormatedTime(0, d.time)}</span>
        </div>`;
    },
    joinRoom: function(room, d) {
        this.joinTime = new Date().getTime();
        this.unread = 0;
        this.currentRoom = room;
        this.roomData = d;

        // 初始化聊天记录
        var h = '';
        for (var msg of d.msgs) {
            h += this.parseChatMessage(msg);
        }
        $('#msg_list').html(h);
        $('#room_gallery, #room_photo, #room_subContent_game').html(`
            <img src="res/sticker/1/shan.png" class="d-block mx-auto">
            <h4 class="text-center">${_l('什么都没有')}</h4>
        `);

        var inLobby = room == 'chat';
        g_room.toggleChat(inLobby || h == '');
        if (inLobby) {
            // 如果玩家在大厅待了一段时间 自动断开链接
            g_room.cache.disconectTimer = setTimeout(() => {
                g_room.disconect();
                g_room.leaveRoom();
            }, 1000 * 60 * 5);

            var t = g_room.cache.targetRoom;
            if (t) {
                g_room.requestJoinRoom(t['room'], t['password']);
                delete g_room.cache.targetRoom;
            }
            return;
        }
        window.history.pushState(null, null, `?r=${room}`);

        if (g_room.cache.disconectTimer) {
            clearTimeout(g_room.cache.disconectTimer);
            delete g_room.cache.disconectTimer;
        }

        $('#room_list').hide();
        $('#room_title span').html(d.title);
        g_room.initPlayersIcon(d.players);
        g_room.showSubContent('gallery'); // 默认展示画廊
        g_room.initMenu(g_room.currentContent);

        g_setting.setBg(d.bg || '');
        $('#room_main').show();

        g_room.reviceImgs('room_gallery', d.imgs);
        g_room.reviceImgs('room_photo', d.photos);
        if (d.game) {
            g_room.startGame(d.game, d.data)
        }

        $('.content-wrapper').css('overflowY', 'hidden'); // 自定义滚动内容
    },
    reviceImgs: function(id, imgs) {
        if (!imgs || !Object.keys(imgs).length) return;
        Object.assign(g_room.roomData[id == 'room_gallery' ? 'imgs' : 'photos'], imgs);
        console.log(imgs);
        if (!g_page.getOpts(id)) {
            $('#' + id).html('');
            g_page.setList(id, {
                props: { id: id },
                index: 0, // 默认页数
                lastIndex: 0, // 最后加载的索引
                pagePre: 20, // 每页加载
                timeout: 3000,
                element: '#room_content', // 绑定元素
                datas: id == 'room_gallery' ? () => g_room.roomData['imgs'] : () => g_room.roomData['photos'],
                bottomHtml: ``,
                parseItem: function(index, key, data) {
                    return g_room.getImageHtml(data, index, key);
                },
                done: function(h) {
                    var data = {};
                    if (this.lastIndex > 0) data.insertMode = 'append';
                    g_room.loadHtml(this.props.id, h, data);
                }
            });
        }
        g_page.nextPage(id);
    },
    reviceMsg: function(d) {
        console.log(d);
        var r;
        switch (d.code) {

            case ERR_WRONG_PASSWORD:
                r = [_l('密码错误'), 'alert-danger']
                break;
            case ERR_NAME_ALREADY_EXISTSED:
                r = [_l('名称已被使用'), 'alert-danger']
                break;
            case WARNING_IMAGE_EXISTSED:
                r = [_l('图片已被上传', d.params), 'alert-danger']
                break;
            case ERR_ACCOUNT_PROTECT:
                r = [_l('房主的账号受到特殊保护'), 'alert-danger']
                break;
            case SUCC_IMAGE_DELETED:
                r = [_l('成功删除'), 'alert-success']
                break;
            case ERR_FILE_NOT_EXISTS:
                r = [_l('对象不存在'), 'alert-danger']
                break;
            case ERR_IN_BLOCK_LIST:
                r = [_l('你被禁止加入'), 'alert-danger']
                break;
            case SUCCESS_KICKED:
                r = [_l('成功踢除', d.params), 'alert-success'];
                break;
            case ERR_CANT_KICK_YOURSELF:
                r = [_l('对象不能是自己'), 'alert-danger'];
                break;
            case KICK_BY_OWNER:
                r = [_l('你被房主请出了房间'), 'alert-danger']
                g_room.leaveRoom();
                break;
            case ERR_ROOM_NOT_EXISTS:
                r = [_l('对象不存在'), 'alert-danger']
                break;
            case SUCC_ROOM_SETTING_APPLY:
                if (isModalOpen('modal-custom', 'room_editRoom')) halfmoon.toggleModal('modal-custom');
                r = [_l('成功修改'), 'alert-success']
                break;
            case SUCC_CREATE_ROOM:
                r = [_l('成功创建房间', d.params), 'alert-success']
                break;
            case ERR_ROOM_PLAYER_MAXED:
                r = [_l('房间满人'), 'alert-danger']
                break;
            case CONFIRM_CREATE_ROOM:
                return confirm1(_l('是否关闭旧房间', d.params), sure => {
                    if (sure) {
                        g_room.cache.confirmCreateRoom = true;
                        doAction(null, 'room_createRoom');
                    }
                })



            default:
                return;
        }
        toastPAlert(r[0], r[1]);
    },

    sendMsg: function(data) {
        soundTip('sendMsg.mp3');
        if (typeof(data) != 'object') data = { msg: data };
        $('#msg').val('');
        g_room.send({
            type: 'chatMsg',
            data: data
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
                g_room.isotopeResize('room_photo');
                break;

            case 'game':
                break;
        }
        resizeCustomScroll();
    },
    toggleChat: (hide) => {
        if (hide == undefined) hide = !g_room.isHideMessage();
        if (!hide && g_menu.isMenuShow('menu_main') && !g_menu.isInSlider('menu_main')) {
            g_menu.toggleMenu('#menu_main', true);
        }
        $('#msg_chat_range').hide()

        getAction('room_toggleChatUI').attr('class', 'fa fa-2x fa-' + (hide ? 'weixin' : 'caret-square-o-down'));
        $('#msg_list').toggleClass('hide', hide);
        $('#msg_chat_range_switch').toggleClass('hide', hide);
        $('#room_chat').css('minWidth', hide ? 'unset' : '250px'); // 最小宽度
        $('.navbar-fixed-bottom').css('zIndex', hide ? 2 : 9999); // 让底部栏在viewer内显示
        if (hide) {
            $('#room_msg_unread').html('0').hide();
        }
    },

    isRoomMaster: function() {
        return this.getData('owner') == me();
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

    optionSelected: function(select) {
        if (select.value == 'custom') {
            g_file.openDialog('room_setBg', false, {
                callback: (base64) => {
                    // {width: 200, height: 120}
                    $('#input_room_bg').attr('src', base64);
                },
            });
        } else {
            $('#input_room_bg').attr('src', select.value);
        }
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


    addImages: function(data, type, done) {

        g_room.partSend(data, res => {
            this.send({
                type: type == 'room_sendImage' ? 'chatMsg' : type,
                data: type == 'room_sendImage' ? { img: res } : [res],
                part: true,
            });
        }, done);
    },
    /* 逐一上传  */
    partSend: function(data, callback, done) {
        var len = Object.keys(data).length;
        if (!len) return;
        this.cache.partSend = data;
        this.cache.partSend_finshed = [];
        this.cache.partSend_callback = callback;
        this.cache.partSend_done_callback = done;
        g_autojs.showImportProgress(len, _l('上传中'));
        this.partSend_next();
    },
    partSend_next: function(callback) {
        var list = this.cache.partSend;
        var keys = Object.keys(list);
        if (keys.length == 0) {
            console.log('over');
            if (this.cache.partSend_done_callback) {
                this.cache.partSend_done_callback();
                delete this.cache.partSend_done_callback;
            }
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
        g_room.send({
            type: 'joinRoom',
            data: {
                room: room,
                password: password || ''
            }
        })
    },

    showGuide: function() {
        g_config.firstRoom = new Date().getTime();
        local_saveJson('config', g_config);

        var list = [
            `<div class="text-center">
        {img}
        简单来说就是一个画画自习室。
        可以一边画画一边与其他画友交流的小房间，让动笔变得没那么艰难与无聊。
    </div>`,

            `<div class="text-center">
        {img}
        成员们都可以上传各自参考图，也可以进行计时训练。
        甚至可以一起在线标注图片或者进行指定主题创作
    </div>`,

            `<div class="text-center">
        {img}
        创作完后你也可以发照片,
        成员们可以帮你把错误的地方标注出来，进行更改
    </div>`,

            `<div class="text-center">
        {img}
        每完成一张画后,我们都帮你记录下来。
        你引用的图片，花费的时间，设置的标签，以及别人或者自己的评价
    </div>`,

            `<div class="text-center">
        {img}
        它更是一个你的图片管理库,你可以保存别人的图也可以导入自己的图。
        房间系统只是冰山一角(累哭)
    </div>`,

            `<div class="text-center">
        {img}
        总之，是否能够好好利用还是看个人。
        当然，你有什么好的想法也可以跟<a href="" target="_blank">我们</a>进行反馈。
    </div>`,
        ];
        var modal;
        var page = 0;
        var max = list.length - 1;
        const next = (add) => {
            if (add < 0 && page == 0) return;
            if (add > 0 && page == max) return halfmoon.toggleModal('modal-custom');
            page += add;
            if (!modal) {
                var modal = modalOpen({
                    id: 'modal-custom',
                    type: 'dialog_guide',
                    width: '80%',
                    canClose: false,
                    title: `${_l('这是什么东西')} <div id="guide_progress" class="bg-primary" style="height: 3px;top:0;position: relative;width: 0%;"></div>`,
                    html: `<div id="guide_content"></div>
                       <div class="text-right mt-10">
                        <a class="btn disabled" id="guide_prevPage" role="button">上一个</a>
                        <a class="btn btn-primary" id="guide_nextPage"  role="button">下一个</a>
                      </div>
                `,
                    onShow: (modal) => {
                        modal.find('#guide_prevPage').on('click', () => next(-1));
                        modal.find('#guide_nextPage').on('click', () => next(1));
                    },
                    onClose: () => {
                        return true;
                    }
                });
            }
            $('#guide_prevPage').toggleClass('disabled', page == 0);
            $('#guide_nextPage').html(page == max ? '开始使用' : '下一个');
            modal.find('#guide_progress').css('width', (page / max) * 100 + '%');
            modal.find('#guide_content').html(list[page].replace('{img}', `<img src="./res/guide/${page}.png" class="d-block mx-auto animated bounceIn" animated='bounceIn'>`));
            return page;
        }
        next(0);
    }

}
// g_room.preload();