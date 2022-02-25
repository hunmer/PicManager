g_room.onRevice = (data) => {
    console.log(data);
    if (data.msg) {
        toastPAlert(data.msg[0], data.msg[1]);
    }
    var type = data.type;
    var d = data.data;
    switch (type) {
        case 'bg':
            g_setting.setBg(g_room.getImageUrl(d));
            break;
        case 'requestPassword':
            mobiscrollHelper.password({ mask: '', closeOnOverlayTap: true }, (password) => {
                if (password != '') g_room.requestJoinRoom(d.room, password);
            })
            break;

        case 'part':
            g_room.partSend_next();
            break;

        case 'syncTime':
            g_room.setTime(d, 'badge-primary').show();
            break;
        case 'overGame':
            switch (d.reason) {
                case 'timeout':
                    toastPAlert(_l('计时完毕'), 'alert-secondary', 5000);
                    break;
            }
            g_room.setTime('OVER').show();
            break;
        case 'startGame': // 开始游戏
            g_room.startGame(d.game, d.data);
            break;
        case 'voteResult': // 投票结果
            $('.room_img_vote').addClass('hide'); // 隐藏投票按钮
            g_room.setTime('OVER').show();
            var keys = Object.keys(d);
            if (keys.length == 0) return toastPAlert(_l('无结果'), 'alert-danger');
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
                title: `${_l('投票结果')}<button class="btn btn-primary float-right" onclick="halfmoon.toggleModal('modal-custom')">${_l('开始')}</button>`,
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
            var span = g_room.setTime(_l('START'), 'badge-danger').show();
            g_room.voteTimer = setInterval(() => {
                span.html(--time);
                if (time == 0) {
                    clearInterval(g_room.voteTimer);
                }
            }, 1000);
            toastPAlert(_l('开始投票'), 'alert-primary', 5000);
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
            var dom = $(g_room.parseChatMessage(d)).appendTo('#msg_list');
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
            g_room.setRoomList(d);

            break;

        case 'login':
            showContent('room');
            break;

        case 'createRoom':
            if (isModalOpen('modal-custom', 'room_editRoom')) halfmoon.toggleModal('modal-custom');
            delete g_room.cache.confirmCreateRoom;
            g_room.saveRoomKey(d.key);
            g_room.requestJoinRoom(d.room, d.password);
            break;

        case 'joinRoom':
            g_room.joinRoom(data.room, data.data);
            break;

        case 'msg':
            g_room.reviceMsg(d);
            break;

        case 'updateIcon':
            g_room.initPlayersIcon(data);
            break;

        case 'deleteImage':
            g_room.removeImage(d)
            break;

        case 'musicList':
            d.msg = `我分享了歌单, 大家快来听呀!<button class="btn btn-block mt-10" data-json='${JSON.stringify(data.props)}' data-action="music_parse">收听</button>`;
             g_room.onRevice({
                type: 'chatMsg',
                data: d
            });
            break;

        case 'on-player-join':
        case 'on-player-change-icon':
        case 'on-player-quit':
            var a = { 'on-player-join': '加入了房间', 'on-player-change-icon': '更换了头像', 'on-player-quit': '退出了房间' }
            g_room.setEventMsg(`
                    <img src="${g_room.getImageUrl(d.icon)}" class="user-icon rounded-circle mr-10">
                    <span>${_l(a[type], d.player)}</span>
                `);
            g_room.setData('players', data.props);
            if ($('#dialog_select_playerList').length) {
                // 更新踢出玩家列表
                doAction(null, 'room_playerList');
            }
            g_room.initPlayersIcon(data.props);
            break;

        case 'on-room-close':
            toastPAlert(_l('房间已关闭', data.roomTitle), 'alert-danger');
            g_room.leaveRoom();
            break;

        case 'addImgs':
            g_room.reviceImgs(data.props.type == 'room_addImgs,gallery' ? 'room_gallery' : 'room_photo', d);
            break;

        case 'alert':
            toastPAlert(d.msg, d.class);
            break;
    }
}
