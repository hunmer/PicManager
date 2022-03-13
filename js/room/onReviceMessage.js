g_room.onRevice = (data) => {
    var self = g_room;
    console.log(data);
    if (data.msg) {
        toastPAlert(data.msg[0], data.msg[1]);
    }
    var type = data.type;
    var d = data.data;
    switch (type) {
        case 'book':
            g_book.loadBook(d, () => {
                // $('#toolbar_book').html(d.n);
                // $().html();
                g_room.showSubContent('book');
                g_book.toPage(d.page);
            });
            break;
        case 'delEmbed':
            $('[data-embed="' + d + '"]').remove();
            break;
        case 'shareEmbed':
            g_room.addEmbed(d);
            break;
        case 'videoDetail':
            if (!d) return toastPAlert(_l('解析失败'), 'alert-danger');
            var json = JSON.parse(d);
            if (d.playlist) return toastPAlert(_l('暂时不支持列表'), 'alert-danger');
            // json.ext   flv 可能要用其他的播放器
            var detail = {
                type: 'video',
                source: json.extractor.toLowerCase(),
                uploader: json.uploader.trim(),
                title: json.title,
                desc: json.description,
                cover: json.thumbnail,
                duration: json.duration,
                url: json.webpage_url,
                time: json.timestamp,
                size: json.filesize,
                ext: json.ext,
                src: json.url,
            }
            self.cache.videoDetail = detail;
            var dialog = isModalOpen('modal-custom', '');
            if (!dialog) return;
            dialog.find('#input_roomEmbed_name').val(detail.title);
            dialog.find('img').attr('src', proxyImg(detail.cover)).show();
            dialog.find('textarea').html(detail.desc);
            dialog.find('[data-action="room_shareEmbed"]').removeClass('hide');
            break;
        case 'roomUpdate':
            var roomData = self.getData();
            if (roomData['bg'] != d.bg) {
                g_setting.setBg(self.getImageUrl(d.bg));
                self.setData('bg', d.bg);
            }
            if (roomData['broadcast'] != d.broadcast) {
                self.showBroadcast(d.broadcast);
                self.setData('broadcast', d.broadcast);
            }
            break;
        case 'requestPassword':
            mobiscrollHelper.password({ mask: '', closeOnOverlayTap: true }, (password) => {
                if (password != '') self.requestJoinRoom(d.room, password);
            })
            break;

        case 'part':
            self.partSend_next();
            break;

        case 'syncTime':
            self.setTime(d, 'badge-primary').show();
            break;
        case 'overGame':
            switch (d.reason) {
                case 'timeout':
                    toastPAlert(_l('计时完毕'), 'alert-secondary', 5000);
                    break;
            }
            self.setTime('OVER').show();
            break;
        case 'startGame': // 开始游戏
            self.startGame(d.game, d.data);
            break;
        case 'voteResult': // 投票结果
            $('.room_img_vote').addClass('hide'); // 隐藏投票按钮
            self.setTime('OVER').show();
            var keys = Object.keys(d);
            if (keys.length == 0) return toastPAlert(_l('无结果'), 'alert-danger');
            var i = 0;
            var h = '';
            for (var k of keys.slice(0, 3)) {
                h += `<div style="position: relative;" class="col-${i == 0 ? '12' : '6'}">
                            <img class="w-full rounded p-10" src="${self.getImageUrl(d[k].value.src)}">
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
            self.isotopeResize(); // 调整瀑布流

            // todo 根据投票类型提示更多的信息
            var time = d.time;
            var span = self.setTime(_l('START'), 'badge-danger').show();
            self.voteTimer = setInterval(() => {
                span.html(--time);
                if (time == 0) {
                    clearInterval(self.voteTimer);
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
            self.data.targetPlayerMark = d.mark;
            self.applyPlayerMark(d.target, d.mark);
            break;
        case 'markList':
            for (var pl in d) {
                if (self.data.targetPlayer == pl && Object.keys(self.data.targetPlayerMark).length != d[pl].cnt) {
                    //console.log('目标玩家更新');
                    self.send({
                        type: 'getPlayerMark',
                        data: {
                            target: pl
                        }
                    });
                }
                var dom = $('[data-action="room_game_playerIcon"][data-user="' + pl + '"]');

                if (!dom.length) {
                    $(`<div style="position: relative;" data-action="room_game_playerIcon" data-user="${pl}">
                            <img src="${self.getImageUrl(d[pl].icon)}" class="user-icon-big rounded-circle" >
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
            var dom = $(self.parseChatMessage(d)).appendTo('#msg_list');
            if (self.isHideMessage()) {
                $('#room_msg_unread').html(++self.unread).show();
            } else {
                if (d.audio && d.player != self.getName()) { // 自动播放音频
                    soundTip(d.audio);
                }
                setTimeout(() => self.msg_toBottom(), 150); // 自动到底部
            }
            break;
        case 'listRoom':
            self.setRoomList(d);

            break;

        case 'login':
            // showContent('room');
            // self.step();
            break;

        case 'clearMsg':
            $('#msg_list').html('');
            self.broadcastMsg({ msg: _l('管理员清屏') });
            self.setData('msgs', []);
            self.unread = 0;
            if (self.isRoomMaster()) {
                toastPAlert(_l('清屏成功'), 'alert-success');

            }
            break;

        case 'createRoom':
            if (isModalOpen('modal-custom', 'room_editRoom')) halfmoon.toggleModal('modal-custom');
            delete self.cache.confirmCreateRoom;
            self.saveRoomKey(d.key);
            self.requestJoinRoom(d.room, d.password);
            break;

            // 玩家点击别人分享的歌单
        case 'startPlayList':
            var msg = $('.chat-msg[data-mid="' + d.id + '"]');
            if (msg.length) {
                msg.find('.hideScroll').html(self.getPlayersIcon(d.players));
            }
            break;

        case 'joinRoom':
            self.joinRoom(data.room, data.data);
            break;

        case 'msg':
            self.reviceMsg(d);
            break;

        case 'updateIcon':
            self.initPlayersIcon(data);
            break;

        case 'deleteImage':
            self.removeImage(d)
            break;
        case 'on-player-join':
        case 'on-player-change-icon':
        case 'on-player-quit':
            var a = { 'on-player-join': '加入了房间', 'on-player-change-icon': '更换了头像', 'on-player-quit': '退出了房间' }
            self.setEventMsg(`
                    <img src="${self.getImageUrl(d.icon)}" class="user-icon rounded-circle mr-10">
                    <span>${_l(a[type], d.player)}</span>
                `);
            self.setData('players', data.props);
            if ($('#dialog_select_playerList').length) {
                // 更新踢出玩家列表
                doAction(null, 'room_playerList');
            }
            self.initPlayersIcon(data.props);
            break;

        case 'on-room-close':
            toastPAlert(_l('房间已关闭', data.roomTitle), 'alert-danger');
            self.leaveRoom();
            break;

        case 'addImgs':
            self.reviceImgs(data.props.type == 'room_addImgs,gallery' ? 'room_gallery' : 'room_photo', d);
            break;

        case 'alert':
            toastPAlert(d.msg, d.class);
            break;
    }
}