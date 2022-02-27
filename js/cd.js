var g_cd = {
    opts: {},
    getOpts: (name) => {
        if (g_cd.opts[name]) return g_cd.opts[name]
    },
    getImageValue: (key = 'key') => {
        return g_cd.getOpts('image')[key];
    },
    init: () => {

        g_cache.foucsTime = 0;
        // 
        var data = {
            // 结束时间
            1643354569527: {
                key: '', // 图片id
                time: 0,
                duration: 0,
                startAt: 1643354169527, // 开始时间
                notes: {
                    1643354569527: 'note1',
                    1643354572527: 'note2',
                }, // 笔记
            }
        }
        g_cds = local_readJson('times', data);
        registerAction('history_newNote', (dom, action) => {
            var data = g_cd.getOpts('image');
            if (data) {
                // 如果不再图片页则点击跳转
                if (g_cache.showing != 'detail') {
                    return g_database.loadImage(data['key']);
                }

                prompt1('输入笔记', (value) => {
                    if (typeof(value) == 'string' && value.length) {
                        // todo 禁止输入重复的文本
                        opts.notes[new Date().getTime()] = value;
                        toastPAlert('记录成功', 'alert-success', 3000);
                    }
                });
            } else {
                g_cd.startImageTimer();

            }
        });

        registerAction('history_view', (dom, action) => {
            g_cd.openDialog_detail(g_database.showingImage);
        });

        registerAction('history_viewNotes', (dom, action) => {
            var key = $(dom).parents('[data-time]').data('time');
            var data = g_cds[key];
            var h = '';
            for (var t in data.notes) {
                h += '[' + getFormatedTime(0, t) + '] ' + data.notes[t] + "\r\n";
            }
            alert(h || '没有数据!');
        });
        registerAction('history_save', (dom, action) => {
            confirm1('结束计时吗?',  (value) => {
                if (!value) return;
                confirm1('是否保存计时?', async (value) => {
                    if (!value) return g_cd.cancelTimer('image', false);
                    var d = await g_database.getImgData(g_cd.opts['image'].key);
                    g_rpg.saveDialog({
                        tags: d.t || [],
                        comment: '',
                        time: g_cd.times['image']
                    });
                });
            });
        });

        registerAction('history_remove', (dom, action) => {
            confirm1('是否删除?', (value) => {
                if (value) {
                    var parent = $(dom).parents('[data-time]');
                    var key = parent.data('time');
                    delete g_cds[key];
                    local_saveJson('times', g_cds);
                    parent.remove();
                }
            })
        });

        registerAction('timer_start', (dom, action) => {
            g_cd.startImageTimer();
        });
    },
    startImageTimer: (start = 0) => { // start = 开始默认经过的时间
        halfmoon.deactivateAllDropdownToggles();
        var k = g_database.showingImage;
        if (!k) return;

        var m = prompt1('输入分钟', (m) => {
            if (m == null) return;
            m = m == '' ? 0 : parseInt(m);
            if (!isNaN(m)) {
                _r(g_cache, 'timer_autoStart', 'timeout');
                if (start > 0 && !confirm('是否从 ' + getTime(start) + ' 开始?')) {
                    start = 0;
                }
                if (isModalOpen('modal-custom', 'praticeHistory')) halfmoon.toggleModal('modal-custom');
                var d = {
                    key: k,
                    notes: {},
                    onStart: () => {
                        getAction('history_save').removeClass('hide');
                        g_cd.cancelTimer('rest');
                    },
                    onUpdate: (time) => {
                        if (++g_cache.foucsTime % (60 * 90) == 0 && !isModalOpen('modal-custom-1', 'video')) {
                            modalOpen({
                                id: 'modal-custom-1',
                                fullScreen: true,
                                type: 'video',
                                title: '手腕操',
                                canClose: true,
                                html: `
                                    <video class="w-full" src="./img/video.mp4" autoplay
                                    controls></video>
                                `,
                                onShow: () => {},
                                onClose: () => {
                                    return true;
                                }
                            });
                        }
                        $('#badge_cd span').html(getTime(time, ':', ':', ''))
                    },
                    onClose: function(done) {
                        getAction('history_save').addClass('hide');
                        if (done) { // 如果完成了计时
                            var now = new Date().getTime();
                            g_cds[this.startAt] = {
                                key: this.key,
                                endAt: now,
                                time: now - this.startAt,
                                notes: this.notes,
                            }
                            local_saveJson('times', g_cds);
                            toastPAlert('计时结束', 'alert-primary', 3000);

                            if (isModalOpen('modal-custom', 'dialog_addExpFromImage')) {
                                halfmoon.toggleModal('modal-custom', true);
                            }

                        }
                    }
                }
                if (m > 0) { // 倒计时
                    d.duration = m * 60 - start;
                } else {
                    d.time = start;
                }
                g_cd.startTimer('image', d);
            }
        });

    },
    getImageList: () => {
        var r = [];
        for (var time of g_cd.getItems()) {
            var d = g_cds[time];
            if (d.key != '' && r.indexOf(d.key) == -1) r.push(d.key);
        }
        return r;
    },
    getItems: () => {
        return Object.keys(g_cds).sort((a, b) => {
            return b - a;
        });
    },
    // 显示查看记录入口
    initElement: (md5) => {
        var logs = g_cd.searchDetails(md5);
        var i = logs.length
        $('[data-action="history_view"]').toggleClass('hide', i == 0).html(i);
    },
    // 搜索图片记录
    searchDetails: (key) => {
        var r = [];
        for (var time in g_cds) {
            if (g_cds[time].key == key) {
                r.push(time)
            }
        }
        return r.sort((a, b) => {
            return b - a;
        });
    },
    openDialog_detail: (key) => {
        var datas = g_cd.searchDetails(key);
        if (!datas.length) {
            return toastPAlert('还没有任何记录', 'alert-danger');
        }
        var modal = modalOpen({
            id: 'modal-custom',
            type: 'praticeHistory',
            width: '100%',
            title: '练习记录',
            html: `
                <table class="table">
                  <thead>
                    <tr>
                      <th class="w-25">#</th>
                      <th>完成于</th>
                      <th>时长</th>
                      <th class="text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                     ` + (() => {
                var h = '';
                var i = 0;
                for (var time of datas) {
                    i++;
                    var d = g_cds[time];
                    var notes = d.notes ? Object.keys(d.notes).length : 0;
                    h += `
                            <tr data-time="` + time + `">
                              <th>` + i + `</th>
                              <td>` + getFormatedTime(5, d.endAt || time) + `</td>
                              <td>` + getTime(d.time / 1000) + `</td>
                              <td class="text-right">
                                ` + (notes ? '<span data-action="history_viewNotes" class="badge badge-primary mr-10">' + notes + '</span>' : '') + `
                                <i class="fa fa-trash-o text-danger text-right" aria-hidden="true" data-action="history_remove"></i>
                              </td>
                            </tr>
                            `;
                }
                return h;
            })() + `
                        </tbody>
                    </table>
                    <div class="text-right mt-10">
                        <a class="btn btn-primary" data-action="timer_start" role="button">开始</a>
                      </div>
            `,
            onClose: () => {
                return true;
            }
        });
    },
    times: {},
    startTimer: (key, opts) => {
        g_cd.cancelTimer(key, false);

        opts = Object.assign({
            time: 0,
            duration: 0,
            startAt: new Date().getTime(),
        }, opts);

        g_cd.times[key] = opts.duration || opts.time;
        var increase = opts.duration == 0;
        opts.timer = setInterval(() => {
            if (increase) {
                ++g_cd.times[key]
            } else {
                if (--g_cd.times[key] < 0) {
                    return g_cd.cancelTimer(key);
                }
            }
            opts.onUpdate(g_cd.times[key]);
        }, 1000);
        opts.onStart();
        g_cd.opts[key] = opts;
    },

    cancelTimer: (key, save = true) => {
        // 不知道为什么使用控制台插件不能准时输出消息
        if (!g_cd.opts[key]) return;
        clearInterval(g_cd.opts[key].timer);

        if (key == 'image') {
            g_cd.opts[key].finishedAt = new Date().getTime();
            g_cd.startTimer('rest', {
                time: 0,
                onUpdate: (time) => {
                    $('#badge_cd span').html(getTime(time, ':', ':', ''))
                },
                onStart: () => {
                    getAction('history_newNote').addClass('badge-secondary');
                },
                onClose: () => {
                    getAction('history_newNote').removeClass('badge-secondary');
                }
            });
        }
        g_cd.opts[key].onClose(save);
        delete g_cd.opts[key];

    }
}
g_cd.init();