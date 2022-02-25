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

var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var request = require('request');
var images = require("images");

// if (fs.existsSync('./saves/')) {
//     fs.rmdirSync('./saves/', { recursive: true, force: true });

// }
var app = express();
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access_token'
    )
    if ('OPTIONS' === req.method) {
        res.send(200)
    } else {
        next()
    }
})
app.use(express.static(__dirname));

var g_cache = {
    timer: {},
    timeout: {},
    closeRoom: {},
    uploaded: {},
}
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(msg) {
        onMessage(msg, ws);
    });
    ws.on('close', function close() {
        if (ws._username) {
            var p = getPlayerDetail(ws);
            g_cache.timeout[p.uuid] = {
                timer: setTimeout(() => {
                    _room.removePlayer(p.player, p.room);
                }, 1000 * 10),
                room: p.room
            }
        }
    });
});

function getMd5(str) {
    return crypto.createHash('md5').update(str).digest("hex")
}

function getPlayerDetail(ws) {
    return {
        player: ws._username,
        room: ws._room,
        uuid: ws._uuid,
        icon: getFilePath(ws._username),
    }
}

function getSavePath(md5) {
    var s = './saves/' + md5;
    if (md5.indexOf('.') == -1) { // 没有扩展名
        s += '.jpg';
    }
    return s;
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
    }
}


function getGameData(room) {
    var ret = {};
    var roomData = _room.getRoom(room);
    for (var name in roomData.players) {
        ret[name] = {
            icon: getFilePath(getMd5(roomData.players[name]._uuid)),
            cnt: roomData.data[name] ? Object.keys(roomData.data[name]).length : 0
        }
    }
    return ret;
}

function isSystemRoom(room) {
    return ['lobby', 'chat', 'r15', 'r18'].includes(room);
}

function broadcast(room, type, data, props) {
    _room.sendBroadcast(room, {
        type: type,
        data: data,
        props: props
    })
}

function overGame(room) {
    if (g_cache.timer[room]) {
        clearInterval(g_cache.timer[room].task);
        delete g_cache.timer[room];
        broadcast(room, 'overGame', { reason: 'timeout' });
    }
}

function startGame(room, game, data) {
    overGame(room);
    var roomData = _room.getRoom(room, false);
    if (roomData) {
        var time = Math.max(game.time, 0);
        var increase = time == 0;
        g_cache.timer[room] = { // 这里直接创建个对象就可以动态修改数据了
            startTime: new Date().getTime(),
            time: time,
            increase: increase,
            task: setInterval(() => {
                var t = increase ? ++g_cache.timer[room].time : --g_cache.timer[room].time;
                if (!increase && t <= 0) {
                    delete roomData.game;
                    overGame(room);
                } else
                if (t % 60 == 0) {
                    // 同步
                    broadcast(room, 'syncTime', t);
                }
            }, 1000)
        }
        roomData.game = game;
        roomData.data = data;
        broadcast(room, 'startGame', {
            game: roomData.game,
            data: roomData.data,
        });
    }

}


function onMessage(msg, ws) {
    var r;
    try {
        r = JSON.parse(msg);
    } catch (e) {
        return;
    }

    // console.log(r);
    if (!r.uuid || !r.player) return;
    var d = r.data;
    // 
    var roomData;
    if (['getPlayerMark', 'updateMark', 'heart', 'startVote', 'exit', 'updateIcon', 'startGame', 'kickPlayer', 'deleteImage'].includes(r.type)) {
        var roomData = _room.getRoom(ws._room);
        if (!roomData) return;

        var isOwner = roomData.key == r.key;
        if (['startVote', 'startGame', 'kickPlayer'].includes(r.type)) { // 需要权限
            if (_room.getPlayerByName(roomData.owner, ws._room) && !isOwner) {
                return sendMsg(ws, ERR_NOT_PERMISSIOM);
            }
        }
    }

    switch (r.type) {
        case 'kickPlayer':
            if(d.target == undefined) return;
            if (!isOwner) return sendMsg(ws, ERR_NOT_PERMISSIOM);
            if (d.target == ws._username) return sendMsg(ws, ERR_CANT_KICK_YOURSELF);
            _room.removePlayer(d.target, ws._room, KICK_BY_OWNER);
            sendMsg(ws, SUCCESS_KICKED, [d.target]);
            break;
        case 'startGame':
            if(d.game == undefined) return;
            startGame(ws._room, d.game, {});
            break;
        case 'startVote':
            if(d.time == undefined) return;
            var voteTime = 60;
            broadcast(ws._room, 'startVote', { time: voteTime });
            setTimeout(() => {
                // 获取投票结果
                var r = roomData.vote;
                var ret = {};
                for (var k of Object.keys(r).sort((a, b) => {
                        return r[b].length - r[a].length
                    })) {
                    ret[k] = {
                        cnt: r[k].length, // todo 显示玩家头像
                        // todo 投票时禁止删除图片
                        value: roomData.imgs[k]
                    }
                }
                broadcast(ws._room, 'voteResult', ret);

                var keys = Object.keys(ret);
                if (keys.length) {
                    startGame(ws._room, {
                        type: 'copy',
                        data: ret[keys[0]].value,
                        time: d.time
                    }, {});
                }
            }, 1000 * voteTime);
            break;
            /* vote */
        case 'heart':
            if(d.id == undefined) return;
            for (var md5 in roomData.vote) {
                var i = roomData.vote[md5].indexOf(ws._username);
                if (i != -1) {
                    // todo 如果是单选的那就取消旧的， 如果不是则提示超出上限
                    roomData.vote[md5].splice(i, 1);
                    if (roomData.vote[md5].length == 0) delete roomData.vote[md5];
                    break;
                }
            }
            if (!roomData.vote[d.id]) roomData.vote[d.id] = [];
            roomData.vote[d.id].push(ws._username);
            broadcast(ws._room, 'voteList', roomData.vote);

            break;

            /* mark */
            // 获取玩家标记
        case 'getPlayerMark':
            if(d.target == undefined) return;
            roomData.data[d.target] && sendData(ws, {
                type: 'playerMark',
                data: {
                    target: d.target,
                    mark: roomData.data[d.target]
                }
            });
            break;
        case 'updateMark':
            if (Object.keys(d).length == 0) {
                if (!roomData.data[r.player]) return;
                delete roomData.data[r.player];
            } else {
                roomData.data[r.player] = d;
            }
            broadcast(ws._room, 'markList', getGameData(roomData));
            break;

        case 'deleteImage':
            if(d.id == undefined) return;
            if(!g_cache.uploaded[ws._room]) return;
            var img = g_cache.uploaded[ws._room][d.id];
            if(!img) return sendMsg(ws, ERR_FILE_NOT_EXISTS);
            if(img != ws._uuid && !isOwner) return sendMsg(ws, ERR_NOT_PERMISSIOM);
            delete g_cache.uploaded[ws._room][d.id];

            roomData = _room.getRoom(ws._room, false);
            delete roomData.imgs[d.id];

            sendMsg(ws, SUCC_IMAGE_DELETED);
            broadcast(ws._room, 'deleteImage', d.id);

            break;

        case 'room_addImgs,gallery':
        case 'room_addImgs,photo':
            if(!Array.isArray(d)) return;
            var res = {};
            var c = 0;
            var exists = 0;
            var uploaded = _room.getRoom(ws._room)[r.type == 'room_addImgs,gallery' ? 'imgs' : 'photos']; // todo
            const callback = (url, md5) => {
                if (md5) {
                    var img = {
                        src: url,
                        player: r.player,
                    }
                    res[md5] = img;
                    uploaded[md5] = img;

                    if(!g_cache.uploaded[ws._room]) g_cache.uploaded[ws._room] = [];
                    g_cache.uploaded[ws._room][md5] = ws._uuid; // 记录是谁上传的
                }
                if (++c == d.length) {
                    if (exists) sendMsg(ws, WARNING_IMAGE_EXISTSED, [exists]);
                    broadcast(ws._room, 'addImgs', res, { type: r.type });
                }
            }
            for (var img of d) {
                var md5 = getMd5(img);
                if (uploaded[md5]) {
                    // 图片已被上传过
                    exists++;
                    callback();
                } else
                if (img.startsWith('data:image')) {
                    saveBase64Image(md5, img, (err, file, md5, format) => {
                        // if (!err) {
                        resizeImage(file, format);
                        // }
                        callback(getFilePath(md5), md5);
                    });
                } else {
                    callback(img, md5);
                }
            }
            break;
        case 'listRoom':
            _room.updateLobby(ws);

            break;
        case 'exit':
            if (d != undefined && d.close && _room.isRoomOwner(roomData, r.key)) {
                _room.removeRoom(ws._room);
                return;
            }
            _room.removePlayer(ws._username, ws._room);
            _room.joinRoom('chat', null, ws);
            _room.updateLobby(ws);
            break;
        case 'updateIcon':
            if (d && d.startsWith('data:image/')) {
                saveBase64Image(getMd5(ws._uuid), d);
                return _room.playerEvent(ws._room, 'on-player-change-icon', getPlayerDetail(ws));
            }
            break;
        case 'login':
            var player = delHtmlTag(r.player);
            ws._username = player;
            ws._uuid = r.uuid;
            ws._loginAt = new Date().getTime();

            var targetRoom;
            if (g_cache.timeout[r.uuid]) {
                clearTimeout(g_cache.timeout[r.uuid].timer);
                targetRoom = g_cache.timeout[r.uuid].room;
                delete g_cache.timeout[r.uuid];
            }

            if (d.icon && d.icon.startsWith('data:image/')) {
                saveBase64Image(getMd5(r.uuid), d.icon)
            }

            _room.updateLobby(ws);

            // _room.joinRoom('chat', '', ws);
            setTimeout(() => {
                _room.joinRoom(targetRoom || 'chat', null, ws);
            }, 500)
            break;

        case 'musicList':
             var ret = {
                player: r.player,
                icon: getFilePath(getMd5(r.uuid)),
            }
            broadcast(ws._room, 'musicList', ret, d);
            break;

        case 'chatMsg':
            var roomData = _room.getRoom(ws._room, false);
            if (roomData) {

                const callback = () => {
                    var ret = {
                        isOwner: roomData.owner == ws._username,
                        msg: delHtmlTag(d.msg),
                        img: d.img,
                        audio: d.audio,
                        time: new Date().getTime(),
                        player: r.player,
                        icon: getFilePath(getMd5(r.uuid))
                    }
                    broadcast(ws._room, 'chatMsg', ret);

                    for (var i = roomData.msgs.length; i > 10; i--) {
                        roomData.msgs.shift();
                    }
                    roomData.msgs.push(ret);
                }
                if (typeof(d.img) == 'string' && d.img.startsWith('data:image')) {
                    saveBase64Image(getMd5(d.img), d.img, (err, file, md5, format) => {
                        // if (!err) {
                        resizeImage(file, format);
                        d.img = [getFilePath(md5), getFilePath(md5 + '.jpg.thumb')];
                        callback();
                        // }
                    });
                } else {
                    callback();
                }
            }
            break;

        case 'joinRoom':
            _room.joinRoom(d.room, d.password || '', ws);
            break;
        case 'createRoom':
            _room.createRoom(d, ws, r.key);
            break;

    }
    if (r.part) {
        sendData(ws, { type: 'part' });
    }
}

function resizeImage(file, format, size = 200, quality = 50) {
    if (['jpeg', 'png', 'gif'].includes(format)) {
        images(file)
            .resize(size)
            .save(file + '.thumb', 'jpg', {
                quality: quality
            });
    } else {
        fs.copyFileSync(file, file + '.thumb');
    }
}

function saveBase64Image(fileName, data, callback) {
    var file = getSavePath(fileName);
    //if (!fs.existsSync(file)) {
    mkdirsSync(path.dirname(file));
    var bin = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    if (callback) {
        fs.writeFile(file, bin, err => {
            callback(err, file, fileName, data.substr(0, data.indexOf(';')).split('/')[1]);
        });
    } else {
        fs.writeFileSync(file, bin);
        return fs.existsSync(file);
    }

    //}
}

function delHtmlTag(str) {
    if (typeof(str) == 'string') {
        return str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
    }
}

function _o(...args) {
    console.log(args);
}

function getFilePath(uuid, def = 'img/user.jpg') {
    var file = getSavePath(uuid);
    return fs.existsSync(file) ? '{host}' + file : def
}

function sendMsg(ws, code, params) {
    sendData(ws, {
        type: 'msg',
        data: {
            code: code,
            params: params,
        }
    })
}

/*
TODO: 


*/

String.prototype.replaceAll = function(s1, s2) {
    var str = this;
    while (str.indexOf(s1) != -1) {
        str = str.replace(s1, s2);
    }
    return str;
}
// game: {
//     type: 'copy',
//     data: {
//         src: './a/1.jpg',
//         player: 'maki'
//     }
// },

var _room = {
    init: function() {
        this.list = {
            chat: {
                room: 'chat',
                msgs: [],
                players: {},
                blockIps: []
            }
        }
        this.setRoomProps('lobby', {
            cover: './img/cover.jpg',
            tags: ["全年龄"],
        },true)
        // this.setRoomProps('r15', {
        //     cover: './img/r15.jpg',
        //     tags: ["R15", "限制级"],
        // },true)
        // this.setRoomProps('r18', {
        //     cover: './img/r18.jpg',
        //     tags: ["R18", "成人级"],
        // },true);
    },
    uuids: [],
    uuid: function() {
        while (true) {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
            s[8] = s[13] = s[18] = s[23] = "-";
            var uuid = s.join("");
            if (this.uuids.indexOf(uuid) == -1) {
                break;
            }
        }
        this.uuids.push(uuid);
        return uuid;
    },
    isRoomOwner: function(room, key) {
        var d = this.getRoom(room);
        return d && d.key == key;
    },
    setRoomProps: function(room, data, create = false) {
        if (create) {
            this.list[room] = Object.assign({
                room: room,
                owner: '',
                title: '',
                desc: '',
                cover: '',
                bg: '',
                maxPlayers: 0,
                msgs: [],
                data: {},
                vote: {},
                createAt: new Date().getTime(),
                players: {}, // clients
                imgs: {},
                photos: {},
                tags: [],
                blockIps: [],
            }, data);
            return;
        }
        var d = this.getRoom(room, false);
        if (!d) return;
        for (var k of ['title', 'maxPlayers', 'password', 'desc', 'cover', 'bg', 'tags']) {
            if (data[k] == undefined) continue;
            var val = data[k];
            if (['cover', 'bg'].includes(k) && val.startsWith('data:image')) {
                var md5 = getMd5(val);
                if (saveBase64Image(md5, val)) {
                    d[k] = getFilePath(md5);
                }
            } else {
                if (k == 'tags') val = val.replaceAll('，', ',').split(',').splice(0, 5);
                d[k] = val;
            }
        }
        // 给大厅的所有玩家发送更新
        _room.updateLobby();
        // 房间玩家背景更新
        broadcast(room, 'bg', d['bg']);
    },

    getRooms: function() {
        return Object.values(this.list);
    },

    createRoom: function(data, ws, roomKey) {

        data.title = delHtmlTag(data.title);
        data.desc = delHtmlTag(data.desc);
        if (!isSystemRoom(ws._room) && ws._room && roomKey) {
            var r = this.getRoom(ws._room);
            // 验证
            if (r && r.key == roomKey) {
                // 修改房间属性
                this.setRoomProps(ws._room, data);
                sendMsg(ws, SUCC_ROOM_SETTING_APPLY, [data.title]);
            }
            return;
        }

        // 如果此人已创建过房间,将会关闭旧的房间
        for (var temp of _room.getRooms()) {
            if (temp.ownerUuid == ws._uuid) {
                if (data.confirm) {
                    this.removeRoom(temp);
                    break;
                } else {
                    return sendMsg(ws, CONFIRM_CREATE_ROOM, [temp.title]);
                }
            }
        }

        var room = this.uuid(),
            key = this.uuid();
        this.setRoomProps(room, {
            owner: ws._username,
            title: data.title.toString(),
            desc: data.desc.toString(),
            password: data.password.toString(),
            cover: data.cover.toString() || './res/cover.jpg',
            maxPlayers: parseInt(data.maxPlayers),
            tags: data.tags.toString().split(',').splice(0, 5),
            ip: ws._socket.remoteAddress,
            ownerUuid: ws._uuid,
            key: key, // 房主密钥
        }, true)

        sendData(ws, {
            type: 'createRoom',
            data: {
                room: room, // 房间标识
                key: key,
                password: data.password
            }
        });
        sendMsg(ws, SUCC_CREATE_ROOM, [data.title]);

        // 给大厅的所有玩家发送更新
    },
    updateLobby: function(ws) {
        var data = this.listRoom();
        if (ws) {
            sendData(ws, {
                type: 'listRoom',
                data: data
            });
        } else {
            broadcast('chat', 'listRoom', data);
        }
    },
    joinRoom: function(room, password, ws) {
        var d = this.getRoom(room, false);
        if (!d) return sendMsg(ws, ERR_ROOM_NOT_EXISTS);

        // 退出旧房间
        if (ws._room && ws._room != room) {
            this.removePlayer(ws._username, ws._room);
        }

        var isOwner = ws._uuid == d.ownerUuid;
        if(d.blockIps.includes(ws._socket.remoteAddress) && !isOwner){ // 把我网络封了咋进呢
            return sendMsg(ws, ERR_IN_BLOCK_LIST);
        }

        if (ws._username == d.owner && !isOwner) {
            return sendMsg(ws, ERR_ACCOUNT_PROTECT);
        }

        var another = d.players[ws._username];
        if (another) {
            if (ws._uuid != another._uuid) {
                return sendMsg(ws, ERR_NAME_ALREADY_EXISTSED, [ws._username]);
            }
            // 重连
            another.close();
            delete d.players[ws._username];
        }

        if(d.maxPlayers && Object.keys(d.players).length >= d.maxPlayers){
            return sendMsg(ws, ERR_ROOM_PLAYER_MAXED);
        }

        // TODO 不刷新页面短线重连不用输入密码
        // password == null 跳过密码
        if (password != null && d.password && !isOwner) {
            if (password == '') {
                // 请求玩家输入密码
                return sendData(ws, { type: 'requestPassword', data: { room: room } });
            }
            if (d.password != password) {
                return sendMsg(ws, ERR_WRONG_PASSWORD);
            }
        }

        d.players[ws._username] = ws;
        ws._room = room;

        var detail = this.getRoomDetail(Object.assign({}, d), false);
        detail.isOwner = isOwner;
        sendData(ws, {
            type: 'joinRoom',
            room: room,
            data: detail
        });
        this.playerEvent(room, 'on-player-join', getPlayerDetail(ws));
        if (g_cache.closeRoom[room]) {
            clearTimeout(g_cache.closeRoom[room]);
            delete g_cache.closeRoom[room];
        }

    },

    playerEvent: function(room, event, p) {
        var d = this.getRoom(room);
        if (!d) return;
        this.sendBroadcast(room, {
            type: event,
            data: {
                player: p.player,
                icon: getFilePath(getMd5(p.uuid))
            },
            props: this.getNameList(d.players),
        });
    },
    getRoom: function(room, clone = true) {
        var data = typeof(room) == 'object' ? room : this.list[room];
        return clone ? Object.assign({}, data) : data;
    },
    removeRoom: function(room) {
        var d = this.getRoom(room);
        if (d) {
            overGame(d.room);;
            this.sendBroadcast(d.room, {
                type: 'on-room-close',
                roomTitle: d.title
            });
            delete this.list[d.room];
            this.updateLobby();

        }
    },
    getRoomPlayers: function(room) {
        var d = this.getRoom(room);
        return d ? Object.values(d.players) : [];
    },
    sendBroadcast: function(room, data) {
        data = getData(data);
        for (var ws of this.getRoomPlayers(room)) {
            sendData(ws, data);
        }
    },
    getRoomDetail: function(d, fromLobby = true) {
        if (typeof(d) != 'object') {
            d = this.getRoom(d);
        }
        // 去除隐私信息
        delete d.ip;
        delete d.key;
        delete d.ownerUuid;
        delete d.vote;
        delete d.blockIps;
        if (d.password != undefined) {
            d.password = d.password.length > 0;
        }
        if (fromLobby) {
            delete d.data; // 游戏数据
            delete d.msgs; // 聊天记录
           delete d.bg;
           delete d.imgs;
           delete d.photos;
            if (d.game) d.game = d.game.type; // 游戏类型
        } else {
            if (d.game && g_cache.timer[d.room]) d.game.time = g_cache.timer[d.room].time; // 剩余游戏时间
            if (d.data) d.data = getGameData(d)
        }
        d.players = this.getNameList(d.players);
        return d;
    },
    getNameList: function(players) {
        // 把client转换成名字
        var list = {};
        for (var name in players) {
            list[name] = {
                icon: getFilePath(getMd5(players[name]._uuid)),
            };
        }
        return list;
    },
    getPlayerByName: function(name, room) {
        var d = this.getRoom(room);
        if (d && d.players[name]) {
            return d.players[name];
        }
    },
    removePlayer: function(name, room, code = KICK_BY_SYSTEM) {
        var d = this.getRoom(room, false);
        if (d) {
            if (d.players[name]) {
                var client = d.players[name];
                sendMsg(client, code);
                if (code == KICK_BY_OWNER) { // 房主踢的
                    // 加入黑名单
                    d.blockIps.push(client._socket.remoteAddress);
                }

                delete d.players[name];
                this.playerEvent(d.room, 'on-player-quit', getPlayerDetail(client));
                if (Object.keys(d.players).length == 0 && !isSystemRoom(d.room)) {
                    g_cache.closeRoom[room] = setTimeout(() => {
                        _room.removeRoom(room);
                    }, 1000 * 60 * 30);
                }

                return true;
            }
        }
        return false;
    },
    listRoom: function() {
        var r = {};
        for (let room in this.list) {
            if (room != 'chat') {
                r[room] = this.getRoomDetail(room);
            }
        }
        return r;
    },

}

_room.init();

function getData(data) {
    return typeof(data) == 'object' ? JSON.stringify(data) : data;
}

function sendData(ws, data, close = false) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        var data = getData(data);
        // console.log('send -> ' + ws._username + ' -> ' + data);
        ws.send(data);
        if (close) {
            ws.close();
        }
    }
}
wss.on('close', function close() {
    clearInterval(interval);
    console.log('server closed!');
});

server.listen(8000, function listening() {
    console.log('server start at port: 8000');
});