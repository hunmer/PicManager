var g_user = {
    setIcon: (src) => {
        $('#img_user').attr('src', src || g_config.user.icon);
    },
    init: () => {
        if (g_user.inited) return;
        g_user.inited = true;

        addLang({
             "user_成功设置": {
                "zh": "成功设置",
                "jp": "",
                "en": ""
            },
            "user_用户名": {
                "zh": "用户名",
                "jp": "",
                "en": ""
            },
            "user_用户名_占位符": {
                "zh": "...",
                "jp": "",
                "en": ""
            },
            "user_保存": {
                "zh": "保存",
                "jp": "",
                "en": ""
            },
            "user_用户设置": {
                "zh": "用户设置",
                "jp": "",
                "en": ""
            }
        })

        registerAction('user_uploadIcon', (dom, action, params) => {
            $('#input_img').attr({
                'data-config': JSON.stringify({ width: 50, quality: 0.5 }),
                'data-type': 'icon'
            })[0].click();
        });
        registerAction('user_setProfile', (dom, action, params) => {
            var v = checkInputValue($('#user_input_name'));
            if (!v) return;
            g_config.user = {
                name: v[0],
                icon: $('#user_icon').attr('src'),
            }
            local_saveJson('config', g_config);
            g_user.setIcon();

            if(isModalOpen('modal-custom', 'user')) halfmoon.toggleModal('modal-custom');
            toastPAlert(_l('user_成功设置'), 'alert-success');
        });

        g_user.setIcon();
    },
    modal: () => {
        modalOpen({
            id: 'modal-custom',
            fullScreen: true,
            type: 'user',
            width: '80%',
            title: _l('user_用户设置'),
            canClose: true,
            html: `
                      <div class="text-center" >
                          <img id='user_icon' data-action="user_uploadIcon" src="` + g_config.user.icon + `" class="user-icon rounded-circle">
                      </div>

                      <div class="input-group mb-10">
                        <div class="input-group-prepend">
                          <span class="input-group-text">` + _l('user_用户名') + `</span>
                        </div>
                        <input type="text" id="user_input_name" class="form-control" placeholder="` + _l('user_用户名_占位符') + `" value="` + g_config.user.name + `">
                      </div>
                      <button class="btn btn-primary btn-block" data-action="user_setProfile">` + _l('user_保存') + `</button>
                        `,
            onClose: () => {
                return true;
            }
        });
    }
}

g_user.init();
// g_user.modal();