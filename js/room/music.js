var g_music = {
    list: [],
    index: -1,
    // api: 'https://neysummer-api.glitch.me/',
    api: './api/',
    init: function() {
        var self = this;
        registerAction('music_click', (dom, action, params) => {
            self.playIndex(dom.dataset.index);
        });
        registerAction('music_list', (dom, action, params) => {
            self.showList();
        });
        registerAction('music_prev', (dom, action, params) => {
            self.prev();
        });
        registerAction('music_next', (dom, action, params) => {
            self.next();
        });
        registerAction('music_parse', (dom, action, params) => {
            var data = JSON.parse(dom.dataset.json);
            const fun = () => {
                self.parsePlaylist(data, false);
                g_room.send({
                    type: 'startPlayList',
                    data: {
                        id: $(dom).parents('[data-mid]').data('mid')
                    }
                });
            }
            if (self.params && data.id == self.params.id && data.source == self.params.source) {
                confirm1(_l('是否再次加载'), reload => {
                    if (reload) fun();
                });
            } else {
                fun();
            }
        });
        registerAction('music_toggle', (dom, action, params) => {
            if (!self.audio) return toastPAlert(_l('没有播放歌曲'), 'alert-danger');
            if (self.audio.paused) {
                self.audio.play()
            } else {
                self.audio.pause();
            }
        });
    },
    initEvent: function() {
        var self = this;
        var div = $('#music_player');

        var audio = this.audio = $('<audio autoplay></audio>').appendTo('body')[0];
        audio.onplay = () => {
            getAction('music_toggle').removeClass('fa-play').addClass('fa-pause');
        }
        audio.onpause = () => {
            getAction('music_toggle').addClass('fa-play').removeClass('fa-pause');
        }
        audio.oncanplay = () => {
            audio.retry = 0;
        }
        // audio.ontimeupdate = () => {
        //     var s = audio.currentTime;
        //     $('#audio_progress').css('width', parseInt(s / audio.duration * 100) + '%');
        // }

        audio.onended = () => {
            self.next();
        }

        audio.onerror = () => {
            if (audio.retry == undefined) audio.retry = 0;
            if (++audio.retry > 3) {
                self.next();
            } else {
                audio.src = audio.source;
            }
        }
    },

    next: function() {
        this.playIndex(++this.index);
    },

    prev: function() {
        this.playIndex(--this.index);
    },

    playIndex: function(index) {
        index = parseInt(index);
        if (this.list[index]) {
            this.index = index;

            var modal = isModalOpen('modal-custom-1', 'musicList');
            if (modal) {
                modal.find('.text-success').removeClass('text-success');
                modal.find('[data-index="' + index + '"]').addClass('text-success');
            }

            this.playMusic(this.list[index])
        }
    },

    getParmsFromUrl: function(url) {
        // https://music.163.com/#/playlist?id=897784673
        var params;
        const includes = (str, arr) => !arr.some(s => str.indexOf(s) == -1);
        if (includes(url, ['music.163.com', 'playlist'])) {
            params = ['netease', cutString(url + '&', 'id=', '&')];
        } else {
            return;
        }
        return { source: params[0], id: params[1] };
    },

    confirmURL: function() {
        var self = this;
        prompt1('歌单地址(网易云)', url => {
            if (!isEmpty(url)) {
                var url = 'https://music.163.com/#/playlist?id=897784673';
                var params = self.getParmsFromUrl(url);
                if (!params) return alert1(_l('暂不支持'));
                self.parsePlaylist(params);
            }
        });
    },

    parsePlaylist: function(params, show = true) {
        var self = this;
        $.getJSON(this.api + `music.php?server=${params.source}&type=playlist&withDetail=1&id=${params.id}`, function(json, textStatus) {
            if (textStatus != 'success') return toastPAlert(_l('错误'), 'alert-danger');
            self.clearAll();
            var list = JSON.parse(json.list);
            params.detail = json.detail;
            self.params = params;
            self.playList(list);
            if (show) self.showList(list, json.detail.name);
        });
    },

    playMusic: function(song) {
        if (!this.audio) this.initEvent();
        this.audio.source = this.audio.src = this.api + `music.php?server=${song.source}&type=url&id=${song.id}`;
        var div = $('#music_player');
        div.find('.fa-music').hide();
        var cover = this.api + `music.php?server=${song.source}&type=cover&id=${song.pic_id}`;
        div.find('.musicCocver').attr('src', cover).show();
        div.find('.text').html(song.name);

    },

    playList: function(list) {
        this.list = list;
        this.playIndex(0);
        toastPAlert(_l('开始自动播放'), 'alert-success');
    },

    clearAll: function() {
        var modal = isModalOpen('modal-custom-1', 'musicList');
        if (modal) {
            modal.find('tbody').html('');
            halfmoon.toggleModal('modal-custom-1');
        }
        var div = $('#music_player');
        div.find('.fa-music').show();
        div.find('.musicCocver').hide();
        if (this.audio) {
            this.audio.remove();
        }
        delete this.params;
    },
    share: function() {
        if (!this.params) return toastPAlert(_l('没有数据', 'alert-danger'));
        g_room.sendMsg({
            meta: {
                type: 'musicList',
                data: Object.assign({ songs: this.list.length }, this.params),
            },
            asDefault: g_room.isRoomMaster() && confirm(_l('是否把此歌单设为推荐歌单'))
        });
        toastPAlert(_l('分享成功'), 'alert-success');
    },
    showList: function(list, title = '') {
        if (!list) list = this.list;
        var page = 0;
        var modal;
        var max = 30;
        var maxPage = Math.ceil(list.length / 30);
        const setPage = (add) => {
            page += add;
            if (page < 0) page = 0;
            if (page > maxPage) page = maxPage;

            if (!modal) {
                modal = modalOpen({
                    id: 'modal-custom-1',
                    type: 'musicList',
                    width: '100%',
                    title: title || _l('音乐列表'),
                    html: `
                <div style="height: 200px; overflow-y: auto">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>${_l('歌名')}</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </table>
                </div>
                    ${maxPage ? `
                    <nav class="mt-10">
                      <ul class="pagination pagination-rounded m-0 text-right">
                        <li class="page-item" id="music_prevPage">
                          <a class="page-link">
                            <i class="fa fa-angle-left" aria-hidden="true"></i>
                          </a>
                        </li>
                        <li id="music_currentPage" class="page-item">
                          <a class="page-link">...</a>
                        </li>
                        <li id="music_nextPage" class="page-item">
                          <a class="page-link">
                            <i class="fa fa-angle-right" aria-hidden="true"></i>
                          </a>
                        </li>
                      </ul>
                    </nav>` : ''}

                    <div class="text-right mt-10">
                        <a class="btn btn-primary ${!maxPage ? 'hide' : ''}" onclick="g_music.share()" role="button">分享歌单</a>
                        <a class="btn btn-primary" onclick="g_music.confirmURL()" role="button">解析歌单</a>
                        <a class="btn btn-danger ${!maxPage ? 'hide' : ''}" onclick="g_music.clearAll()" role="button">删除所有</a>
                     </div>
                 `,
                    onShow: (con) => {
                        con.find('#music_prevPage').on('click', () => setPage(-1));
                        con.find('#music_nextPage').on('click', () => setPage(1));
                    }
                });
            }
            var h = '';
            for (var i = 0; i < max; i++) {
                var i1 = i + page * 30;
                if (i1 >= list.length - 1) break;
                var item = list[i1];
                h += `
                    <tr class="${i1 == this.index ? 'text-success' : ''}" data-action="music_click" data-index="${i1}">
                      <th>${i1+1}</th>
                      <td>${item.name}</td>
                    </tr>
                `;
            }

            modal.find('tbody').html(h);
            modal.find('#music_currentPage').html((page + 1) + '/' + max);
            modal.find('#music_prevPage').toggleClass('disabled', page == 0);
            modal.find('#music_nextPage').toggleClass('disabled', page == list.length - 1);
        }
        setPage(0);
    }

}

g_music.init();