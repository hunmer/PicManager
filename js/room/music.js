var g_music = {
    list: [],
    index: -1,
    api: 'https://neysummer-api.glitch.me/',
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
            self.parsePlaylist(JSON.parse(dom.dataset.json));
        });
        registerAction('music_toggle', (dom, action, params) => {
            if (self.audio) {
                if (self.audio.paused) {
                    self.audio.play()
                } else {
                    self.audio.pause();
                }
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
            if(modal){
                modal.find('.text-success').removeClass('text-success');
                modal.find('[data-index="'+index+'"]').addClass('text-success');
            }
            this.playMusic(this.list[index])
        }
    },

    getParmsFromUrl: function(url) {
        // https://music.163.com/#/playlist?id=897784673
        const includes = (str, arr) => !arr.some(s => str.indexOf(s) == -1);
        if (includes(url, ['music.163.com', 'playlist'])) {
            return ['netease', cutString(url + '&', 'id=', '&')];
        }
    },

    confirmURL: function() {
        var self = this;
        //prompt1('歌单地址', url => {
        //    if (!isEmpty(url)) {
        var url = 'https://music.163.com/#/playlist?id=897784673';
        var params = self.getParmsFromUrl(url);
        console.log(params);
        if (!params) return alert1(_l('暂不支持'));
        self.parsePlaylist(params);
        // }
        //});
    },

    parsePlaylist: function(params) {
        var self = this;
        self.params = params;
        $.getJSON(g_api + `music.php?server=${params[0]}&type=playlist&id=${params[1]}`, function(json, textStatus) {
            if (textStatus != 'success') return toastPAlert(_l('错误'), 'alert-danger');
            console.log(json);
            self.playList(json);
            self.showList(json);
        });
    },

    playMusic: function(song) {
        if (!this.audio) this.initEvent();
        this.audio.source = this.audio.src = g_api + `music.php?server=${song.source}&type=url&id=${song.id}`;
        $('#music_player').find('img').attr('src', g_api + `music.php?server=${song.source}&type=cover&id=${song.pic_id}`);
        $('#music_player').find('.text').html(song.name);
    },

    playList: function(list) {
        this.list = list;
        this.playIndex(0);
        this.showList(list);
    },

    clearAll: function() {
        var modal = isModalOpen('modal-custom-1', 'musicList');
        if (modal) {
            modal.find('tbody').html('');
        }
        if (this.audio) {
            this.audio.remove();
        }
        delete this.params;
    },
    share: function(){
        if(!this.params) return toastPAlert(_l('没有数据', 'alert-danger'));
        g_room.send({
            type: 'musicList',
            data: this.params
        });
        toastPAlert(_l('分享成功'), 'alert-success');
    },
    showList: function(list) {
        if(!list) list = this.list;
        var playing = this.index;

        var page = 0;
        var modal;
        var max = 30;
        var maxPage = Math.ceil(list.length / 30);
        const setPage = (add) => {
            page += add;
            if (page < 0) page = 0;
            if (page > maxPage) page = maxPage;
            var h = '';
            for (var i = 0; i < max; i++) {
                var i1 = i + page * 30;
                if (i1 >= list.length - 1) break;
                var item = list[i1];
                h += `
                    <tr class="${i1 == playing ? 'text-success' : ''}" data-action="music_click" data-index="${i1}">
                      <th>${i1+1}</th>
                      <td>${item.name}</td>
                    </tr>
                `;
            }
            if (!modal) {
                modal = modalOpen({
                    id: 'modal-custom-1',
                    type: 'musicList',
                    width: '100%',
                    title: _l('音乐列表'),
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
                    </nav>

                    <div class="text-right mt-10">
                         <a class="btn btn-primary" onclick="g_music.share()" role="button">分享歌单</a>
                        <a class="btn btn-primary" onclick="g_music.confirmURL()" role="button">解析歌单</a>
                        <a class="btn btn-danger" onclick="g_music.clearAll()" role="button">删除所有</a>
                     </div>
                 `,
                    onShow: (con) => {
                        con.find('#music_prevPage').on('click', () => setPage(-1));
                        con.find('#music_nextPage').on('click', () => setPage(1));
                    }
                });
            }
            modal.find('tbody').html(h);
            modal.find('#music_currentPage').html((page+1)+'/'+max);
            modal.find('#music_prevPage').toggleClass('disabled', page == 0);
            modal.find('#music_nextPage').toggleClass('disabled', page == list.length - 1);
        }
        setPage(0);
    }

}

g_music.init();