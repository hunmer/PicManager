var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var request = require('request');
var images = require("images");

fs.rmSync('./saves/', { recursive: true, force: true });

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
}
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(msg) {
        onMessage(msg, ws);
    });
    ws.on('close', function close() {
        // 如果服务器主动关闭的话无法获取数据
        if (ws._username) {
            console.log(ws._username + '断开连接!');
            var p = getPlayerDetail(ws);
            g_cache.timeout[p.uuid] = {
                timer: setTimeout(() => {
                    console.log(_room.removePlayer(p.player, p.room));
                }, 1000 * 5),
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
        }
        g_cache.timer[room].task = setInterval(() => {
            var t = increase ? ++g_cache.timer[room].time : --g_cache.timer[room].time;
            if (!increase && t <= 0) {
                overGame(room);
            } else
            if (t % 60 == 0) {
                // 同步
                broadcast(room, 'syncTime', t);
            }
        }, 1000);
        roomData.game = game;
        roomData.data = data;
        broadcast(room, 'startGame', {
            game: roomData.game,
            data: roomData.data,
        });
    }

}

function onMessage(msg, ws) {
    var r = JSON.parse(msg);
    console.log(r);
    if (!r.uuid || !r.player) return;
    var d = r.data;
    // 
    var roomData;
    if (['getPlayerMark', 'updateMark', 'heart', 'startVote', 'exit', 'updateIcon', 'startGame'].includes(r.type)) {
        var roomData = _room.getRoom(ws._room);
        if (!roomData) return;


        if (['startVote', 'startGame'].includes(r.type)) { // 需要房主权限
            console.log(_room.getPlayerByName(roomData.owner, ws._room));
            if (_room.getPlayerByName(roomData.owner, ws._room) && roomData.key != r.key) {
                return sendData(ws, { type: 'alert', data: { msg: '你没有权限操作', class: 'alert-danger' } })
            }
        }
    }

    switch (r.type) {
        case 'startGame':
            startGame(ws._room, d.game, {});
            break;
        case 'startVote':
            var voteTime = 3;
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

        case 'room_addImgs,gallery':
        case 'room_addImgs,photo':
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
                }
                if (++c == d.length) {
                    if (exists) sendData(ws, { type: 'alert', data: { msg: exists + '张图片已经被上传过了!', class: 'alert-danger' } });
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
                    saveBase64Image(md5, img, (err, file, md5) => {
                        // if (!err) {
                            images(file)
                                .resize(200)
                                .save(file + '.thumb', 'jpg', {
                                    quality: 50
                                });
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
                console.log('房主关闭房间');
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

        case 'chatMsg':
            var roomData = _room.getRoom(ws._room, false);
            if (roomData) {

                const callback = () => {
                    var ret = {
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
                    saveBase64Image(getMd5(d.img), d.img, (err, file, md5) => {
                        // if (!err) {
                            images(file)
                                .resize(200)
                                .save(file + '.thumb', 'jpg', {
                                    quality: 50
                                });
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
            _room.createRoom(d, ws);
            break;

    }
    if (r.part) {
        sendData(ws, { type: 'part' });
    }
}

function saveBase64Image(fileName, data, callback) {
    var file = getSavePath(fileName);
    //if (!fs.existsSync(file)) {
    mkdirsSync(path.dirname(file));
    var bin = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    if (callback) {
        fs.writeFile(file, bin, err => {
            callback(err, file, fileName);
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

function getFilePath(uuid, def = 'img/chisato.jpg') {
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

const ERR_ROOM_NOT_EXISTS = 2;
const SUCC_ROOM_SETTING_APPLY = 1;
const SUCC_CREATE_ROOM = 3;
const CONFIRM_CREATE_ROOM = 4;
var _room = {
    list: {
        chat: {
            room: 'chat',
            msgs: [],
            players: {},
        },
        lobby: {
            // password: '4444',
            room: 'lobby', // 还是加个主键名会比较方便
            owner: 'admin',
            title: '默认房间默认房间默认房间默认房间',
            desc: '欢迎欢迎',
            cover: './res/cover.jpg',
            bg: './res/bg.jpg',
            maxPlayers: 0,
            msgs: [],
            data: {},
            vote: {},
            // game: {
            //     type: 'copy',
            //     data: {
            //         src: './a/1.jpg',
            //         player: 'maki'
            //     }
            // },
            createAt: new Date().getTime(),
            players: {}, // clients
            imgs: { '4124bc0a9335c27f086f24ba207a4912': { src: '{host}./a/10.jpg', player: 'maki' }, 'e62595ee98b585153dac87ce1ab69c3c': { src: '{host}./a/11.jpg', player: 'maki' } },
            photos: { '4124bc0a9335c27f086f24ba207a4912': { src: '{host}./a/1.jpg', player: 'maki' }, 'e62595ee98b585153dac87ce1ab69c3c': { src: '{host}./a/2.jpg', player: 'maki' } },
            // players: ['yande', 'konachan', 'sakugabooru', 'sankakucomplex', 'danbooru', 'behoimi', 'safebooru', 'gelbooru', 'worldcosplay', 'kawaiinyan', 'bilibili', 'anime_picture', 'lolibooru', 'zerochan', 'shuushuu', 'e926', 'e621', 'hypnohub', 'rule34'],
        }
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

    setRoomProps: function(room, data) {
        var d = this.getRoom(room, false);
        if (!d) return;
        for (var k of ['title', 'maxPlayers', 'password', 'desc', 'cover', 'bg']) {
            if (data[k] == undefined) continue;
            var val = data[k];
            if (['cover', 'bg'].includes(k) && val.startsWith('data:image')) {
                var md5 = getMd5(val);
                if (saveBase64Image(md5, val)) {
                    d[k] = getFilePath(md5);
                }
            } else {
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

    createRoom: function(data, ws) {

        data.title = delHtmlTag(data.title);
        data.desc = delHtmlTag(data.desc);
        if (!['chat', 'lobby'].includes(ws._room) && ws._room && ws._key) {
            // 验证
            if (this.isRoomOwner(ws._room, ws._key)) {
                // 修改房间属性
                this.setRoomProps(ws._room, data);
                sendMsg(ws, SUCC_ROOM_SETTING_APPLY, [data.title]);
            } else {
                // todo
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
        this.list[room] = {
            room: room,
            owner: ws._username,
            title: data.title.toString(),
            desc: data.desc.toString(),
            password: data.password.toString(),
            cover: data.cover.toString() || './res/cover.jpg',
            maxPlayers: parseInt(data.maxPlayers),
            createAt: new Date().getTime(),
            bg: './res/bg.jpg',
            msgs: [],
            data: {},
            vote: {},
            players: {},
            imgs: {},

            ip: ws._socket.remoteAddress,
            ownerUuid: ws._uuid,
            key: key, // 房主密钥
        }
        ws._key = key;

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
        if (ws._room) {
            this.removePlayer(ws._username, ws._room);
        }

        var isOwner = ws._uuid == d.ownerUuid;
        if (ws._username == d.owner && !isOwner) {
            return sendData(ws, { type: 'alert', data: { msg: '房主的账号受到特殊保护', class: 'alert-danger' } });
        }
        var another = d.players[ws._username];
        if (another) {
            if (ws._uuid != another._uuid) {
                return sendData(ws, { type: 'alert', data: { msg: '房间内此名称已被使用', class: 'alert-danger' } });
            }
            another.close();
        }
        // TODO 不刷新页面短线重连不用输入密码
        // password == null 跳过密码
        if (password != null && d.password && !isOwner) {
            if (password == '') {
                // 请求玩家输入密码
                return sendData(ws, { type: 'requestPassword', data: { room: room } });
            }
            if (d.password != password) {
                return sendData(ws, { type: 'alert', data: { msg: '密码错误', class: 'alert-danger' } });
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
            console.log('取消');
        }

    },

    playerEvent: function(room, event, p){
        var d = this.getRoom(room);
        if(!d) return;
         this.sendBroadcast(room, {
            type: event,
            data: {
                player: p.username,
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
            this.sendBroadcast(d.room, {
                type: 'on-room-close',
                roomTitle: d.title
            });
            console.log(`关闭房间 ${d.room}`)
            delete this.list[d.room];
            this.updateLobby();

        }
    },
    // xxx: function(){
    //     var pls = [];
    //     for(var ws of wss.clients){
    //         if(ws._username && !ws._room){
    //             pls.push(ws);
    //         }
    //     }
    //     return pls;
    // },
    getRoomPlayers: function(room) {
        var d = this.getRoom(room);
        var r = d ? d.players : [];
        console.log(`room: ${room} players: ${Object.keys(r).length}`);
        return Object.values(r);
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
        delete d.bg;
        if (d.password != undefined) {
            d.password = d.password.length > 0;
        }
        if (fromLobby) {
            delete d.data; // 游戏数据
            delete d.msgs; // 聊天记录
            if (d.game) d.game = d.game.type; // 游戏类型
        } else {
            if (d.game) d.game.time = g_cache.timer[d.room].time; // 剩余游戏时间
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
                icon: getFilePath(getMd5(players[name]._uuid))
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
    removePlayer: function(name, room) {
        var d = this.getRoom(room, false);
        if (d) {
            if (d.players[name]) {
                console.log('移除玩家 ' + name);
                var detail = getPlayerDetail(d.players[name]);
                delete d.players[name];
                this.playerEvent(d.room, 'on-player-quit', detail);
                if (Object.keys(d.players).length == 0 && !['chat', 'lobby'].includes(d.room)) {
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

function getData(data) {
    return typeof(data) == 'object' ? JSON.stringify(data) : data;
}

function sendData(ws, data, close = false) {
    if (ws.readyState === WebSocket.OPEN) {
        var data = getData(data);
        // console.log('send -> ' + ws._username + ' -> ' + data);
        ws.send(data);
        if (close) {
            ws.close();
        }
    }
}
// const interval = setInterval(function ping() {
//     var names = [];
//     wss.clients.forEach(function each(ws) {
//         if (ws._username) names.push(ws._username);
//     });
//     for (let uuid in logs) {
//         var d = logs[uuid];
//         if (names.indexOf(d.name) == -1) {
//             console.log(d.name + '断开连接!');
//             console.log(_room.removePlayer(d.name, d.room));
//             delete logs[uuid];
//         }
//     }
// }, 3000);

wss.on('close', function close() {
    clearInterval(interval);
    console.log('server closed!');
});

server.listen(41593, function listening() {
    console.log('server start at port: 41593');
});