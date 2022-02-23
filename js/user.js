var g_user = {
    setIcon: (src) => {
        $('#img_user').attr('src', src || g_config.user.icon);
    },
    init: () => {
        if (g_user.inited) return;
        g_user.inited = true;

        if (typeof(g_config.user) != 'object') {
            g_config.user = {
                name: randomString(6),
                icon: './img/user.jpg'
            }
            local_saveJson('config', g_config);
        }

        addLang({

            "用户设置": {
                "zh": "",
                "jp": "ユーザー設定",
                "en": ""
            },

            "用户名": {
                "zh": "",
                "jp": "名前",
                "en": ""
            },

            "用户名_占位符": {
                "zh": "",
                "jp": "名前を入力",
                "en": ""
            },


            "成功设置": {
                "zh": "",
                "jp": "セットアップ成功",
                "en": ""
            },
        })

        registerAction('user_uploadIcon', (dom, action, params) => {
            g_file.openDialog('icon', false, { width: 50, quality: 0.5 });
        });
        registerAction('user_setProfile', (dom, action, params) => {
            var v = checkInputValue($('#user_input_name'));
            if (!v) return;
            var icon = $('#user_icon').attr('src');
            var oldName = me();
            g_config.user = {
                name: v[0],
                icon: icon,
            }
            local_saveJson('config', g_config);
            g_user.setIcon();
            if (g_room.isConnected()) {
                if (oldName != name) { // 更换名字
                    g_room.leaveRoom();
                } else {
                    g_room.send({ type: 'updateIcon', data: icon })
                }
            }

            if (isModalOpen('modal-custom', 'user')) halfmoon.toggleModal('modal-custom');
            toastPAlert(_l('成功设置'), 'alert-success');
        });

        g_user.setIcon();
    },
    modal: () => {
        modalOpen({
            id: 'modal-custom',
            fullScreen: true,
            type: 'user',
            width: '80%',
            title: _l('用户设置'),
            canClose: true,
            html: `
                      <div class="text-center" >
                          <img id='user_icon' data-action="user_uploadIcon" src="` + g_config.user.icon + `" class="user-icon rounded-circle">
                      </div>

                      <div class="input-group mt-10">
                        <div class="input-group-prepend">
                          <span class="input-group-text">` + _l('用户名') + `</span>
                        </div>
                        <input type="text" id="user_input_name" class="form-control" placeholder="` + _l('用户名_占位符') + `" value="` + g_config.user.name + `">
                      </div>
                      <button class="btn btn-primary btn-block mt-10" data-action="user_setProfile">` + _l('保存') + `</button>
                        `,
            onClose: () => {
                return true;
            }
        });
    }
}

g_user.init();
// g_user.modal();