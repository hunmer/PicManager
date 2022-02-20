var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var request = require('request');
var images = require("images");

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

}
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(msg) {
        onMessage(msg, ws);
    });
    ws.on('close', function close() {
        if (ws._username) {
            console.log(ws._username + '断开连接!');
            console.log(_room.removePlayer(ws._username, ws._room));
        }
    });
});

function getSavePath(md5) {
    return '/saves/' + md5 + '.jpg';
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
    for (var pl of roomData.players) {
        var name = pl._username;
        ret[name] = {
            icon: getPlayerIcon(pl._uuid),
            cnt: roomData.data[name] ? Object.keys(roomData.data[name]).length : 0
        }
    }
    return ret;
}

function onMessage(msg, ws) {
    var r = JSON.parse(msg);
    console.log(r);
    if (!r.uuid || !r.player) return;
    var d = r.data;
    // 
    var roomData;
    if (['getPlayerMark', 'updateMark', 'heart', 'startVote'].includes(r.type)) {
        var roomData = _room.getRoom(ws._room);
        if (!roomData) return;


         if (['startVote'].includes(r.type)) { // 需要房主权限
            if(!r.key || roomData.key != r.key){
                return sendData(ws, { type: 'alert', data: {msg: '你没有权限操作', class: 'alert-danger' }})
            }
        }
    }
   
    switch (r.type) {

        case 'startVote':
            _room.sendBroadcast(ws._room, msg);
            setTimeout(() => {
                // 获取投票结果
                
            }, 1000 * 5);
            break;
        /* vote */
        case 'heart':
            for(var md5 in roomData.vote){
                var i = roomData.vote[md5].indexOf(ws._username);
                if(i != -1){
                    // todo 如果是单选的那就取消旧的， 如果不是则提示超出上限
                     roomData.vote[md5].splice(i, 1);
                     if(roomData.vote[md5].length == 0) delete roomData.vote[md5];
                     break;
                }
            }
            if(!roomData.vote[d.id]) roomData.vote[d.id] = [];
            roomData.vote[d.id].push(ws._username);
            _room.sendBroadcast(ws._room, {
                type: 'voteList',
                data: roomData.vote
            });
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
            _room.sendBroadcast(ws._room, {
                type: 'markList',
                data: getGameData(roomData)
            });
            break;

        case 'addImgs':
            var res = {};
            var c = 0;
            var exists = 0;
            var uploaded = _room.getRoom(ws._room).imgs; // todo
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
                    console.log(res);
                    if (exists) sendData(ws, { type: 'alert', data: {msg: exists + '张图片已经被上传过了!', class: 'alert-danger' }});
                    _room.sendBroadcast(r.room, {
                        type: 'addImgs',
                        data: res
                    });
                }
            }
            for (var img of d) {
                var md5 = crypto.createHash('md5').update(img).digest("hex");

                if (uploaded[md5]) {
                    // 图片已被上传过
                    exists++;
                    callback();
                    continue;
                }


                if (img.startsWith('data:image')) {
                    saveBase64Image(getSavePath(md5), img, (err, file, bin) => {
                        if (!err) {
                            images(bin)
                                .resize(200)
                                .save(file + '.thumb', {
                                    quality: 50
                                });
                        }
                        callback('{host}' + file, md5);
                    });
                    continue;
                }
                callback(img, md5);
            }
            break;

        // case 'deleteImg':
        //     var file = './saves/' + data.md5 + '.jpg';
        //     fs.exists(file, function(exists) {
        //         if (exists) {
        //             fs.unlink(file, (err) => {
        //                 if (err == null) {
        //                     delete pics[data.md5];
        //                     fs.writeFile('pics.json', JSON.stringify(pics), (err) => {
        //                         if (err == null) {
        //                             broadcastMsg(JSON.stringify({ type: 'pics_datas', data: getPicDatas(), removed: data.md5 }));
        //                         }
        //                     });
        //                 }
        //             });
        //         }
        //     });
        //     break;
        case 'listRoom':
            break;
        case 'login':
            var player = delHtmlTag(r.player);
            ws._username = player;
            ws._uuid = r.uuid;
            ws._loginAt = new Date().getTime();

            if (d.icon && d.icon.startsWith('data:image/')) {
                saveBase64Image(getSavePath(r.uuid), d.icon, (err, file, bin) => {
                    if (!err) {
                        // images(bin)
                        //     .resize(50)
                        //     .save(file, {
                        //         quality: 100
                        //     });
                    }
                });
            }

            sendData(ws, {
                type: 'listRoom',
                data: _room.listRoom()
            })
            _o(`${player} 登录了`);
            _room.joinRoom('chat', '', ws);
            break;

        case 'chatMsg':
            var roomData = _room.getRoom(ws._room, false);
            if (roomData) {
                var ret = {
                    msg: delHtmlTag(d.msg),
                    img: d.img,
                    audio: d.audio,
                    time: new Date().getTime(),
                    player: r.player,
                    icon: getPlayerIcon(r.uuid)
                }
                _room.sendBroadcast(ws._room, {
                    type: 'chatMsg',
                    data: ret
                });

                for (var i = roomData.msgs.length; i > 10; i--) {
                    roomData.msgs.shift();
                }
                roomData.msgs.push(ret);
            }
            break;

        case 'joinRoom':
            _room.joinRoom(d.room, d.password, ws);
            break;
        case 'createRoom':
            _room.createRoom(d, ws);
            break;

    }
}

function saveBase64Image(file, data, callback) {
    if (!fs.existsSync(file)) {
        mkdirsSync(path.dirname(file));
        var bin = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        fs.writeFile(file, bin, err => {
            callback(err, file, bin);
        });
    }
}

function delHtmlTag(str) {
    if (typeof(str) == 'string') {
        return str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
    }
}

function _o(...args) {
    console.log(args);
}

function getPlayerIcon(uuid) {
    var icon =getSavePath(uuid);
    return fs.existsSync(icon) ? '{host}' + icon : 'img/chisato.jpg'
}

/*
TODO: 


*/

const ERR_ROOM_NOT_EXISTS = 2;
const SUCC_DEFAULT = 2;
const SUCC_CREATE_ROOM = 3;

var _room = {
    list: {
        chat: {
            msgs: [],
            players: [],
        },
        lobby: {
            // password: '4444',
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
            players: [], // clients
            imgs: { aa: { src: './a/10.jpg', player: 'maki' }, bb: { src: './a/11.jpg', player: 'maki' } }
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
        var d = this.getRoom(room) || {};
        this.list[room] = Object.assign(d, data);
    },

    createRoom: function(data, ws) {
        data.title = delHtmlTag(data.title);
        data.desc = delHtmlTag(data.desc);
        if (data.room && data.key) { // 有带房间标识和密钥
            // 验证
            if (this.isRoomOwner(data.room, data.key)) {
                // 修改房间属性
                this.setRoomProps(data.room, data);
                sendData(ws, {
                    type: 'msg',
                    code: SUCC_DEFAULT
                })
            }
            return;
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
            createAt: new Date().getTime(),
            bg: './res/bg.jpg',
            msgs: [],
            data: {},
            vote: {},
            players: [],
            imgs: {},

            ip: ws._socket.remoteAddress,
            ownerUuid: ws._uuid, 
            key: key, // 房主密钥
        });

        sendData(ws, {
            type: 'createRoom',
            data: {
                 room: room, // 房间标识
                 key: key,
                 password: data.password
            }
        });
        // 给大厅的所有玩家发送更新
        _room.sendBroadcast('chat', {
          type: 'listRoom',
            data: _room.listRoom()
        });
    },
    joinRoom: function(room, password, ws) {
        var d = this.getRoom(room, false);
        if (d && d.players.indexOf(ws) == -1) {
            if(d.password && d.password != password){
                return sendData(ws, { type: 'alert', data: {msg: '密码错误', class: 'alert-danger' }});
            }
            d.players.push(ws);
            ws._room = room;

            sendData(ws, {
                type: 'joinRoom',
                room: room,
                data: this.getRoomDetail(Object.assign({}, d), false)
            });
            this.sendBroadcast(room, {
                type: 'on-player-join',
                data: {
                    player: ws._username,
                    icon: getPlayerIcon(ws._username)
                }
            });
            return true;
        }
        sendData(ws, {
            type: 'msg',
            code: ERR_ROOM_NOT_EXISTS,
        });
    },
    getRoom: function(room, clone = true) {
        var data = typeof(room) == 'object' ? room : this.list[room];
        return clone ? Object.assign({}, data) : data;
    },
    removeRoom: function(room) {
        var d = this.getRoom(room);
        if (d) {
            this.sendBroadcast(room, {
                type: 'on-room-close',
                roomTitle: d.title
            })
            delete this.list[room];
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
        return d ? d.players : [];
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
        if(d.password != undefined){
            d.password = d.password.length > 0;
        }
        if (fromLobby) {
            delete d.data; // 游戏数据
            delete d.msgs; // 聊天记录
        } else {
            if (d.data) d.data = getGameData(d)
        }
        // 把client转换成名字
        var list = {};
        for (var ws of d.players) {
            var name = ws._username;

            list[name] = {
                icon: getPlayerIcon(ws._uuid)
            };
        }
        d.players = list;
        return d;
    },
    getPlayerByName: function(name, room) {
        var list = room ? this.getRoomPlayers(room) : wss.clients;
        for (var ws of list) {
            if (ws._username == name) return ws;
        }
    },
    removePlayer: function(ws, room) {
        var d = this.getRoom(room || ws._room, false);

        if (typeof(ws) != 'object') {
            ws = this.getPlayerByName(ws, room);
            if (!ws) return false;
        }
        var i = d.players.indexOf(ws);
        if (i != -1) {
            d.players.splice(i, 1);
            return true;
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

function sendData(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        var data = getData(data);
        console.log('send -> ' + ws._username + ' -> ' + data);
        ws.send(data);
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