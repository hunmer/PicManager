var _audio_stricker;
var g_emoji = {
    list: {},
    init: () => {
        g_stricker = local_readJson('stricker', { "id_1202706": { "id": 1202706, "name": "いたわりコーギー2", "author": "株式会社DK", "stickers": [8235812, 8235813, 8235814, 8235815, 8235816, 8235817, 8235818, 8235819, 8235820, 8235821, 8235822, 8235823, 8235824, 8235825, 8235826, 8235827, 8235828, 8235829, 8235830, 8235831, 8235832, 8235833, 8235834, 8235835, 8235836, 8235837, 8235838, 8235839, 8235840, 8235841, 8235842, 8235843, 8235844, 8235845, 8235846, 8235847, 8235848, 8235849, 8235850, 8235851] }, "id_9802": { "id": 9802, "name": "キズナアイ ボイススタンプ", "author": "キズナアイ", "stickers": [22854240, 22854241, 22854242, 22854243, 22854244, 22854245, 22854246, 22854247, 22854248, 22854249, 22854250, 22854251, 22854252, 22854253, 22854254, 22854255, 22854256, 22854257, 22854258, 22854259, 22854260, 22854261, 22854262, 22854263], "hasAnimation": false, "hasSound": true }, "id_1267037": { "id": 1267037, "name": "語彙力がない男子", "author": "株式会社DK", "stickers": [10825944, 10825945, 10825946, 10825947, 10825948, 10825949, 10825950, 10825951, 10825952, 10825953, 10825954, 10825955, 10825956, 10825957, 10825958, 10825959, 10825960, 10825961, 10825962, 10825963, 10825964, 10825965, 10825966, 10825967, 10825968, 10825969, 10825970, 10825971, 10825972, 10825973, 10825974, 10825975, 10825976, 10825977, 10825978, 10825979, 10825980, 10825981, 10825982, 10825983] }, "id_8474340": { "id": 8474340, "name": "ポッキーにゃ", "author": "buddle", "stickers": [212758086, 212758087, 212758088, 212758089, 212758090, 212758091, 212758092, 212758093, 212758094, 212758095, 212758096, 212758097, 212758098, 212758099, 212758100, 212758101, 212758102, 212758103, 212758104, 212758105, 212758106, 212758107, 212758108, 212758109] }, "id_1666763": { "id": 1666763, "name": "武士カノジョ（改）", "author": "株式会社DK", "stickers": [21878968, 21878969, 21878970, 21878971, 21878972, 21878973, 21878974, 21878975, 21878976, 21878977, 21878978, 21878979, 21878980, 21878981, 21878982, 21878983, 21878984, 21878985, 21878986, 21878987, 21878988, 21878989, 21878990, 21878991, 21878992, 21878993, 21878994, 21878995, 21878996, 21878997, 21878998, 21878999, 21879000, 21879001, 21879002, 21879003, 21879004, 21879005, 21879006, 21879007] }, "id_9349486": { "id": 9349486, "name": "無口男子2", "author": "株式会社DK", "stickers": [241080302, 241080303, 241080304, 241080305, 241080306, 241080307, 241080308, 241080309, 241080310, 241080311, 241080312, 241080313, 241080314, 241080315, 241080316, 241080317, 241080318, 241080319, 241080320, 241080321, 241080322, 241080323, 241080324, 241080325, 241080326, 241080327, 241080328, 241080329, 241080330, 241080331, 241080332, 241080333, 241080334, 241080335, 241080336, 241080337, 241080338, 241080339, 241080340, 241080341] }, "id_6909522": { "id": 6909522, "name": "-闇男子2-", "author": "株式会社DK", "stickers": [162488798, 162488799, 162488800, 162488801, 162488802, 162488803, 162488804, 162488805, 162488806, 162488807, 162488808, 162488809, 162488810, 162488811, 162488812, 162488813, 162488814, 162488820, 162488822, 162488827, 162488829, 162488831, 162488833, 162488835, 162488837, 162488839, 162488840, 162488841, 162488842, 162488843, 162488844, 162488845, 162488846, 162488847, 162488848, 162488849, 162488850, 162488851, 162488852, 162488853] }, "id_10237162": { "id": 10237162, "name": "キズナアイ #02", "author": "キズナアイ", "stickers": [269717750, 269717751, 269717752, 269717753, 269717754, 269717755, 269717756, 269717757, 269717758, 269717759, 269717760, 269717761, 269717762, 269717763, 269717764, 269717765, 269717766, 269717767, 269717768, 269717769, 269717770, 269717771, 269717772, 269717773, 269717774, 269717775, 269717776, 269717777, 269717778, 269717779, 269717780, 269717781] }, "id_10301577": { "id": 10301577, "name": "レトロ男子", "author": "株式会社DK", "stickers": [271723982, 271723983, 271723984, 271723985, 271723986, 271723987, 271723988, 271723989, 271723990, 271723991, 271723992, 271723993, 271723994, 271723995, 271723996, 271723997, 271723998, 271723999, 271724000, 271724001, 271724002, 271724003, 271724004, 271724005, 271724006, 271724007, 271724008, 271724009, 271724010, 271724011, 271724012, 271724013, 271724014, 271724015, 271724016, 271724017, 271724018, 271724019, 271724020, 271724021] }, "id_11574068": { "id": 11574068, "name": "いじわる男子", "author": "株式会社DK", "stickers": [308215486, 308215487, 308215488, 308215489, 308215490, 308215491, 308215492, 308215493, 308215494, 308215495, 308215496, 308215497, 308215498, 308215499, 308215500, 308215501, 308215502, 308215503, 308215504, 308215505, 308215506, 308215507, 308215508, 308215509, 308215510, 308215511, 308215512, 308215513, 308215514, 308215515, 308215516, 308215517, 308215518, 308215519, 308215520, 308215521, 308215522, 308215523, 308215524, 308215525] }, "id_13083342": { "id": 13083342, "name": "ゆめかわ男子", "author": "株式会社DK", "stickers": [346275254, 346275255, 346275256, 346275257, 346275258, 346275259, 346275260, 346275261, 346275262, 346275263, 346275264, 346275265, 346275266, 346275267, 346275268, 346275269, 346275270, 346275271, 346275272, 346275273, 346275274, 346275275, 346275276, 346275277, 346275278, 346275279, 346275280, 346275281, 346275282, 346275283, 346275284, 346275285, 346275286, 346275287, 346275288, 346275289, 346275290, 346275291, 346275292, 346275293] }, "id_7875762": { "id": 7875762, "name": "かまって男子2", "author": "株式会社DK", "stickers": [193613694, 193613695, 193613696, 193613697, 193613698, 193613699, 193613700, 193613701, 193613702, 193613703, 193613704, 193613705, 193613706, 193613707, 193613708, 193613709, 193613710, 193613711, 193613712, 193613713, 193613714, 193613715, 193613716, 193613717, 193613718, 193613719, 193613720, 193613721, 193613722, 193613723, 193613724, 193613725, 193613726, 193613727, 193613728, 193613729, 193613730, 193613731, 193613732, 193613733] }, "id_13220592": { "id": 13220592, "name": "毒舌男子7-敬語ver-", "author": "株式会社DK", "stickers": [349451558, 349451559, 349451560, 349451561, 349451562, 349451563, 349451564, 349451565, 349451566, 349451567, 349451568, 349451569, 349451570, 349451571, 349451572, 349451573, 349451574, 349451575, 349451576, 349451577, 349451578, 349451579, 349451580, 349451581, 349451582, 349451583, 349451584, 349451585, 349451586, 349451587, 349451588, 349451589, 349451590, 349451591, 349451592, 349451593, 349451594, 349451595, 349451596, 349451597] }, "id_14522961": { "id": 14522961, "name": "ゆめかわ男子-ミニver.-3", "author": "株式会社DK", "stickers": [380516054, 380516055, 380516056, 380516057, 380516058, 380516059, 380516060, 380516061, 380516062, 380516063, 380516064, 380516065, 380516066, 380516067, 380516068, 380516069, 380516070, 380516071, 380516072, 380516073, 380516074, 380516075, 380516076, 380516077, 380516078, 380516079, 380516080, 380516081, 380516082, 380516083, 380516084, 380516085, 380516086, 380516087, 380516088, 380516089, 380516090, 380516091, 380516092, 380516093] }, "id_15228400": { "id": 15228400, "name": "もっふり＊たれ耳うさぎさんの敬語", "author": "tattsun", "stickers": [397523462, 397523463, 397523464, 397523465, 397523466, 397523467, 397523468, 397523469, 397523470, 397523471, 397523472, 397523473, 397523474, 397523475, 397523476, 397523477, 397523478, 397523479, 397523480, 397523481, 397523482, 397523483, 397523484, 397523485, 397523486, 397523487, 397523488, 397523489, 397523490, 397523491, 397523492, 397523493, 397523494, 397523495, 397523496, 397523497, 397523498, 397523499, 397523500, 397523501] }, "id_15010980": { "id": 15010980, "name": "みんなに使える敬語スタンプ１", "author": "a418t", "stickers": [392272750, 392272751, 392272752, 392272753, 392272754, 392272755, 392272756, 392272757, 392272758, 392272759, 392272760, 392272761, 392272762, 392272763, 392272764, 392272765, 392272766, 392272767, 392272768, 392272769, 392272770, 392272771, 392272772, 392272773, 392272774, 392272775, 392272776, 392272777, 392272778, 392272779, 392272780, 392272781, 392272782, 392272783, 392272784, 392272785, 392272786, 392272787, 392272788, 392272789] }, "id_15863955": { "id": 15863955, "name": "ひねくれうさぎの大人な敬語", "author": "ともぞー", "stickers": [412984590, 412984591, 412984592, 412984593, 412984594, 412984595, 412984596, 412984597, 412984598, 412984599, 412984600, 412984601, 412984602, 412984603, 412984604, 412984605, 412984606, 412984607, 412984608, 412984609, 412984610, 412984611, 412984612, 412984613, 412984614, 412984615, 412984616, 412984617, 412984618, 412984619, 412984620, 412984621, 412984622, 412984623, 412984624, 412984625, 412984626, 412984627, 412984628, 412984629] }, "id_1456606": { "id": 1456606, "name": "なつのこ", "author": "株式会社DK", "stickers": [17216554, 17216555, 17216556, 17216557, 17216558, 17216559, 17216560, 17216561, 17216562, 17216563, 17216564, 17216565, 17216566, 17216567, 17216568, 17216569, 17216570, 17216571, 17216572, 17216573, 17216574, 17216575, 17216576, 17216577, 17216578, 17216579, 17216580, 17216581, 17216582, 17216583, 17216584, 17216585, 17216586, 17216587, 17216588, 17216589, 17216590, 17216591, 17216592, 17216593] }, "id_1253810": { "id": 1253810, "name": "ほのぼの吹き出しクマ", "author": "株式会社DK", "stickers": [10293344, 10293345, 10293346, 10293347, 10293348, 10293349, 10293350, 10293351, 10293352, 10293353, 10293354, 10293355, 10293356, 10293357, 10293358, 10293359, 10293360, 10293361, 10293362, 10293363, 10293364, 10293365, 10293366, 10293367, 10293368, 10293369, 10293370, 10293371, 10293372, 10293373, 10293374, 10293375, 10293376, 10293377, 10293378, 10293379, 10293380, 10293381, 10293382, 10293383] }, "id_9136624": { "id": 9136624, "name": "動く大好きな❤きずな❤へ送る名前3", "author": "さあや❤名前スタンプ", "stickers": [234551486, 234551487, 234551488, 234551489, 234551490, 234551491, 234551492, 234551493, 234551494, 234551495, 234551496, 234551497, 234551498, 234551499, 234551500, 234551501, 234551502, 234551503, 234551504, 234551505, 234551506, 234551507, 234551508, 234551509], "hasAnimation": true, "hasSound": false } });
        g_stricker_options = local_readJson('stricker_options', {
            likes: [],
            tags: {},
            hisoty_emoji: [],
            history: [],
            last: {
                id: undefined,
                sid: undefined,
            }
        });
        g_cache.tags = Object.entries(g_stricker_options.tags);
        g_emoji.registerAction();
        _audio_stricker = $('<audio autoplay></audio>').appendTo('body')[0];
        g_emoji.prompt();
    },
    hide: () => {
        $('#modal-stricker').hide();
        $('[data-action="show_stricker"]').removeClass('text-primary');
    },
    show: () => {
        $('#modal-stricker').show();
        $('[data-action="show_stricker"]').addClass('text-primary');
    },
    isShowing: () => {
        return $('#modal-stricker').css('display') != 'none';
    },
    playAudio: (src) => {
        _audio_stricker.src = src;
    },
    loadEmojis: (type) => {
        var file = 'emojis/' + type + '.json';
        g_emoji.lastEmojiType = type;
        if (window.location.protocol == 'file:') {
            loadJs(file);
        } else {
            $.ajax({
                url: file,
                type: "GET",
                dataType: "jsonp"
            });
        }

    },
    loadJSON: (json) => {
        g_emoji.data = json;
        var l = {
            people: '😀',
            nature: '🐱',
            foods: '🍎',
            activity: '⚾',
            places: '🚖',
            objects: '👝',
            symbols: '💠',
            flags: '🏁',
        }

        var tab = '<span class="_emoji" data-action="stricker_toEmoji" data-id="history">🕓</span>';
        var h = '';
        for (var detail of json['categories']) {
            tab += '<span class="_emoji" data-action="stricker_toEmoji,' + detail.id + '">' + l[detail.id] + '</span>';
            h += `<div id='emoji_type_` + detail.id + `' class="row w-full h-200 emoji_type text-center" style="font-size: 20px;align-items: center;display: ` + (detail.id == 'people' ? 'flex' : 'none') + `;"></div>`;
        }
        $('#emoji_content_emoji').html(h);
        $('#emoji_tab_emoji').html(tab);
        setTimeout(() => {
            g_emoji.loadEmojiCate('people');
        }, 500);
    },
    loadEmojiCate: (cate) => {
        var h = '';
        var type = g_emoji.lastEmojiType;
        for (var detail of g_emoji.data['categories']) {
            if (detail.id == cate) {
                for (var emoji of detail['emojis']) {
                    var d = g_emoji.data['emojis'][emoji];
                    h += '<span class="col-2" data-action="emoji_send">' + (type == 'all' ? String.fromCodePoint(parseInt(d.b, 16)) : '<img width="20px" class="mb-10 mx-auto" src="https://raw.githubusercontent.com/iamcal/emoji-data/master/img-' + type + '-64/' + d.b.toLowerCase() + '.png">') + '</span>';
                }
            }
        }
        $('#emoji_type_' + cate).html(h);

        $('.emoji_tab_active').removeClass('emoji_tab_active');
        var dom = $('[data-action="stricker_toEmoji,' + cate + '"]');
        $(dom).addClass('emoji_tab_active');

        if (g_emoji.lastEmojiTab) {
            $('#emoji_type_' + g_emoji.lastEmojiTab).css('display', 'none');
        }
        g_emoji.lastEmojiTab = cate;
        $('#stricker_content')[0].scrollTo(0, 0);
        $('#emoji_type_' + cate).css('display', 'flex');
    },

    addToHistory_emoji: (s) => {
        var a = g_stricker_options.hisoty_emoji || [];
        var i = a.indexOf(s);
        if (i != -1) a.splice(i, 1);
        a.splice(0, 0, s);
        if (a.length > 20) a.pop();
        g_stricker_options.hisoty_emoji = a;
        local_saveJson('stricker_options', g_stricker_options);
    },
    registerAction: () => {

        registerAction('emoji_send', (dom, action, params) => {
            var data = {};
            var d = $(dom).find('img');

            if (d.length) {
                data.img = d.attr('src');
            } else {
                data.msg = dom.innerText;
            }

            g_room.sendMsg(data);
            g_emoji.hide();

        });
        registerAction('stricker_toEmoji', (dom, action, params) => {
            g_emoji.loadEmojiCate(action[1]);
        });
        registerAction('stricker_toType', (dom, action, params) => {
            if (!g_emoji.list[action[1]]) {
                switch (action[1]) {
                    case 'stricker':
                        initStrickers();
                        if (g_stricker_options.last.id != '') {
                            var btn = $('[data-action="stricker_toTab"][data-id="' + g_stricker_options.last.id + '"]')[0];
                            if (btn) {
                                btn.click();
                                btn.scrollIntoView();
                            }
                        }
                        for (var img of $('#stricker_tabs .loading')) {
                            reloadImage(img);
                        }
                        break;

                    case 'emoji':
                        g_emoji.loadEmojis('all');
                        break;
                }
            }
            $('.emoji_active').removeClass('emoji_active');
            $(dom).addClass('emoji_active');
            for (var div of $('.emoji_content')) {
                if (div.id == 'emoji_content_' + action[1]) {
                    $(div).show();
                } else {
                    $(div).hide();
                }
            }
            for (var div of $('.emoji_tab')) {
                if (div.id == 'emoji_tab_' + action[1]) {
                    $(div).css('display', 'flex');
                } else {
                    $(div).css('display', 'none');
                }
            }
            for (var div of $('.emoji_nav')) {
                if (div.id == 'emoji_nav_' + action[1]) {
                    $(div).show();
                } else {
                    $(div).hide();
                }
            }

        });
        registerAction('sendStricker', (dom, action, params) => {
            var img = $('.selected').attr('src');
            if (img.indexOf('img/reload.png') != -1) {
                toastPAlert('読み込み中', 'alert-secondary');
                return;
            }
            sendStricker();
            $('#stricker_footer').hide();
            g_emoji.hide();
            local_saveJson('stricker_options', g_stricker_options); // 保存最后选择的贴图
        });
        registerAction('previewStricker_bottom', (dom, action, params) => {
            if (dom.src.indexOf('img/reload.png') != -1) {
                dom.src = $(dom).attr('data-src');
                reloadImage(dom);
            } else {
                if (!$(dom).hasClass('selected')) {
                    checkStrickerMeta($(dom).attr('data-id'), $(dom).attr('data-sid'), dom);
                    $(dom).addClass('selected');
                    return;
                }
                $('#msg').val('');
                sendStricker();
            }
        });
        registerAction('previewStricker', (dom, action, params) => {
            if (dom.src.indexOf('img/reload.png') != -1) {
                dom.src = $(dom).attr('data-src');
                reloadImage(dom);
            } else {
                if ($(dom).hasClass('selected')) {
                    sendStricker();
                    g_emoji.hide();

                    return;
                }
                $('.selected').removeClass('selected');
                $(dom).addClass('selected');

                var sid = $(dom).attr('data-sid');
                g_stricker_options.last.sid = sid;

                reloadImage($('#stricker_footer').css('display', 'flex').find('img').attr({
                    'data-src': dom.src,
                    'data-id': g_stricker_options.last.id,
                    'data-sid': sid,
                })[0]);


                checkStrickerMeta(g_stricker_options.last.id, sid, $('#stricker_footer img'));

                var key = ($(dom).attr('data-id') || g_stricker_options.last.id) + ',' + g_stricker_options.last.sid;
                $('#modal-stricker input[type=checkbox]').prop('checked', g_stricker_options.likes.indexOf(key) != -1)
                $('#modal-stricker textarea').val(g_stricker_options.tags[key] != undefined ? g_stricker_options.tags[key] : '');
            }
        });
        registerAction('stricker_toTab', (dom, action, params) => {
            $('.selected').removeClass('selected');
            g_cache.reloadImage = [];
            clearInterval(g_cache.reloadImage_timer);
            g_cache.reloadImage_timer = 0;

            $('[data-action="stricker_toTab"].stricker_active').removeClass('stricker_active')
            $(dom).addClass('stricker_active');


            var id = $(dom).attr('data-id');
            $('[data-action="stricker_delete"], [data-action="stricker_left"], [data-action="stricker_right"], [data-action="stricker_openURL"]').css('display', ['like', 'search'].indexOf(id) != -1 ? 'none' : 'unset')
            $('#modal-stricker .modal-title span').html(id == 'like' ? 'お気に入り' : id == 'search' ? '検索' : id == 'history' ? '歴史' : g_stricker['id_' + id].name);

            for (var div of $('.stricker_content')) {
                if (div.id == 'stricker_' + id) {
                    g_stricker_options.last.id = id;
                    for (var img of $(div).show().find('.loading')) {
                        reloadImage(img);
                    }
                } else {
                    $(div).hide();
                }
            }
        });

        registerAction('stricker_openURL', (dom, action, params) => {
            if (parseInt(g_stricker_options.last.id) > 0) {
                window.open('https://store.line.me/stickershop/product/' + g_stricker_options.last.id, '_blank');
            }

        });
        registerAction('addStrick', (dom, action, params) => {
            confirm('[' + $(dom).attr('data-title') + '] を追加しますか?').then((d) => {
                if (d.button == 'ok') {
                    queryStricker($(dom).attr('data-id'));
                }
            });
        });

        registerAction('show_stricker_search', (dom, action, params) => {
            prompt('キーワード&URL', 'kizuna').then((d) => {
                if (d.text != '') {
                    searchStrick(search);
                }
            });
        });

        registerAction('pin_to_msg_confirm', (dom, action, params) => {
            prompt(_l('pin到消息')).then((d) => {
                if (d.text != '') {
                    g_emoji.hide();
                    if (d.text.length == 2 && /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi.test(d.text)) {
                        g_emoji.addToHistory_emoji(d.text);
                    }
                    g_chat.rm.css('display', 'none');

                    for (var id of g_chat.rm_showing) {
                        g_chat.pin_to_msg(id, d.text);

                    }

                }
            })
        });
        registerAction('show_stricker', (dom, action, params) => {
            if (g_emoji.isShowing()) {
                g_emoji.hide();
            } else {
                $('#stricker_footer').css('display', 'none');
                g_emoji.show();
                if (!g_emoji.lastEmojiTab) {
                    setTimeout(() => {
                        $('[data-action="stricker_toType,emoji"]').click();
                    }, 500);
                }
            }
        });

    },

    prompt: () => {
        $(`<div id="modal-stricker" style="border-top: 1px solid #bbbbbb;position: fixed;bottom: 0;left:0;width: 100%;z-index: 99999; display: none;">
        <div>
            <div class="p-10 theme">
                <div class="w-full mx-auto h-50">
                		<div id="emoji_nav_stricker" class="emoji_nav row" style="display: none;">
	                    <h5 class="modal-title text-center col-7">
	                        <span class="text-truncate d-inline-block w-200"></span>
	                    </h5>
	                    <i data-action="stricker_openURL" class="fa fa-external-link-square col-1 font-size-20 text-center h-fit " aria-hidden="true"></i>
	                    <i class="fa fa-trash-o col-1 font-size-20 text-center h-fit " aria-hidden="true" data-action="stricker_delete"></i>
	                    <i class="fa fa-arrow-left col-1 font-size-20 text-center h-fit " aria-hidden="true" data-action="stricker_left"></i>
	                    <i class="fa fa-arrow-right col-1 font-size-20 text-center h-fit " aria-hidden="true" data-action="stricker_right"></i>
	                    <i class="fa fa-search col-1 font-size-20 text-center h-fit " aria-hidden="true" data-action="show_stricker_search"></i>
	                  </div>
                		<div id="emoji_nav_emoji" class="emoji_nav row mb-10">
                				<div class="input-group">
											  <select class="form-control flex-reset w-auto" onchange="g_emoji.loadEmojis(this.value)"> 
											    <option value="" disabled>` + _l('表情类别') + `</option>
											    <option value="twitter">Twitter</option>
											    <option value="google">Google</option>
											    <option value="facebook">Facebook</option>
											    <option value="apple">Apple</option>
											    <option value="all" selected>All</option>
											  </select>
											  <input type="text" class="form-control" placeholder="` + _l('表情搜索') + `">
											   <div class="input-group-append">
											    <button class="btn btn-primary" type="button"><i class="fa fa-search" aria-hidden="true" data-action="show_stricker_search"></i></button>
											  </div>
											</div>
	                  </div>
                </div>

                <div>
                    <div id='stricker_tabs' class="overflow-x-scroll overflow-y-hidden w-full h-50">
	                        <div id="emoji_tab_stricker" class="emoji_tab w-auto h-50 pb-10" style="display: none;" onmousewheel="this.parentElement.scrollBy(event.deltaY, 0)" >
		                            <span class="hide" data-action="stricker_toTab" data-id="search">
		                                <i class="fa fa-search" aria-hidden="true"></i>
		                            </span>

		                            <span data-action="stricker_toTab" data-id="like">
		                                <i class="fa fa-heart" aria-hidden="true"></i>
		                            </span>
		                            <span data-action="stricker_toTab" data-id="history">
		                                <i class="fa fa-history" aria-hidden="true"></i>
		                            </span>
		                        </div>
		                       <div id="emoji_tab_emoji" class="emoji_tab w-80 h-50 pb-10" style="display: none;justify-content: center;font-size:20px" onmousewheel="this.parentElement.scrollBy(event.deltaY, 0)" >
		                       		
                        			</div>
                    </div>
                    <div id='stricker_content' class="overflow-auto w-full h-200 mt-2">
                    	<div class="emoji_content" id="emoji_content_stricker">
	                        <div id='stricker_search' class="row w-full h-200 stricker_content" style="align-items: center;display: none;">
	                        </div>
	                        <div id='stricker_like' class="row w-full h-200 stricker_content" style="align-items: center;display: none;">
	                        </div>
	                        <div id='stricker_history' class="row w-full h-200 stricker_content" style="align-items: center;display: none;">
	                        </div>
                        </div>
                        <div class="emoji_content pt-10" style="display: none;" id="emoji_content_emoji">
	                        <div id='emoji_type_like' class="row w-full h-200 emoji_type" style="align-items: center;display: none;">
		                        </div>

                       
                        </div>
                    </div>
                    <div id='stricker_footer' class="row w-full mt-10">
                        <div class="col-4 p-10">
                            <img class="border rounded lazyload" src='./res/anime.png'>
                            <div class="custom-switch mt-10">
                                    <input type="checkbox" id="checkbox_like" onchange="likeStrickerImg(this)">
                                    <label for="checkbox_like">like</label>
                                </div>
                        </div>
                        <div class="col-8">
                            <div class="form-group">
                                <label for="tags">タグ</label>
                                <textarea class="form-control" id="tags" placeholder="可愛い,笑顔" oninput="stricker_saveTags(this)"></textarea>
                            </div>
                            <div class="form-group">
                                
                                <button class="btn btn-primary float-right" type="button" data-action="sendStricker">
                                    <i class="fa fa-paper-plane" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id='stricker_bottom' class="row w-full mt-10 font-size-20" style="align-items: center;">
                        <div class="col-1">
                           <i class="fa fa-cog fa-2x" aria-hidden="true"></i>
                    		</div>
                    		<div class="col-9">
                    			<div id='stricker_types' class="overflow-x-scroll overflow-y-hidden w-full h-50">
		                        <div class="w-auto h-50 pb-10" style="display: flex;justify-content: center;font-size:20px" onmousewheel="this.parentElement.scrollBy(event.deltaY, 0)" >
		                            <span class="emoji_active" data-action="stricker_toType,emoji">😀</span>
		                            <span data-action="stricker_toType,stricker">🖼</span>
		                        </div>
                    			</div>
                    		</div>
                    		<div class="col-1 text-right">
                           <i class="fa fa-2x fa-close" aria-hidden="true" onclick="g_emoji.hide()"></i>
                    		</div>
                    </div>

                </div>
            </div>
        </div>
    </div>`).appendTo('.content-wrapper').find('.lazyload').lazyload();;

        // <i class="fa fa-close" onclick="g_emoji.hide();" aria-hidden="true"></i>
        // doAction(null, 'show_stricker');
    }
}


function checkStrickerMeta(id, sid, img) {
    var pic;
    data = {
        id: id,
        sid: sid,
        img: $(img).attr('data-src'),
    };
    if (g_stricker['id_' + id]) {
        if (g_stricker['id_' + id]['hasAnimation']) {
            pic = 'http://dl.stickershop.line.naver.jp/products/0/0/1/' + id + '/android/animation/' + sid + '.png';
            data.animation = pic;
            reloadImage($(img).attr('data-src', pic)[0]);
        }
        if (g_stricker['id_' + id]['hasSound']) {
            data.audio = 'http://dl.stickershop.line.naver.jp/products/0/0/1/' + id + '/android/sound/' + sid + '.m4a';
            _audio_stricker.src = data.audio;
            _audio_stricker.img = pic || $(img).attr('data-src');
        }
    }

    g_cache.strick_last = data;
}

function sendStricker() {
    var d = g_cache.strick_last;
    var img = d.animation || d.img;
    var key = d.id + ',' + d.sid;

    // 保存历史记录
    var i = g_stricker_options.history.indexOf(key);
    if (i != -1) g_stricker_options.history.splice(i, 1);
    g_stricker_options.history.splice(0, 0, key);
    if (g_stricker_options.history.length > 100) {
        g_stricker_options.history.pop();
    }
    local_saveJson('stricker_options', g_stricker_options);
    stricker_initHistory();

    g_room.sendMsg({
        img: img,
        audio: d.audio
    })

    $('#bottom_stricker').hide();
}

function reloadImage(img) {
    img.src = img.getAttribute('data-src');
    imagesLoaded(img).on('progress', function(instance, image) {
        var index = g_cache.reloadImage.indexOf(image.img);
        if (!image.isLoaded) {
            image.img.src = 'img/reload.png';
            if (index == -1) g_cache.reloadImage.push(image.img);
            if (!g_cache.reloadImage_timer) {
                g_cache.reloadImage_timer = setInterval(() => {
                    for (var img of g_cache.reloadImage) {
                        reloadImage(img);
                    }
                }, 2000);
            }
            return;
        }
        img.classList.remove('loading');
        if (index != -1) g_cache.reloadImage.splice(index, 1);
        if (g_cache.reloadImage.length == 0) {
            clearInterval(g_cache.reloadImage_timer);
            g_cache.reloadImage_timer = 0;
        }
    });
}


function searchStrick(keyword) {
    var id = cutString(keyword + '/', 'product/', '/');
    if (id != '') {
        queryStricker(id);
        return;
    }
    $.getJSON(g_api + 'stricker.php?type=search&s=' + keyword, function(json, textStatus) {
        if (textStatus == 'success') {
            var h = '';
            for (var detail of json) {
                h += `
                <div class="col-4" data-action="addStrick" data-title='` + detail['name'] + `' data-id="` + detail['id'] + `">
                    <img src='` + detail['icon'] + `' title='` + detail['name'] + `'>    
                `;
                if (detail['hasAnimation'] || detail['hasSound']) {
                    h += '<span class="badge-group float-right">';
                    if (detail['hasAnimation']) {
                        h += '<span class="badge badge-primary"><i class="fa fa-volume-down" aria-hidden="true"></i></span>';
                    }
                    if (detail['hasSound']) {
                        h += '<span class="badge badge-primary"><i class="fa fa-play" aria-hidden="true"></i></span>';
                    }
                    h += '</span>';
                }
                h += '</div>';
            }
            $('#stricker_search').html(h);
            $('.btn[data-id="search"]').show().click();
        }
    });
}

function queryStricker(id, alert = true) {
    $.getJSON(g_api + 'stricker.php?type=ids&id=' + id, function(json, textStatus) {
        if (textStatus == 'success') {
            g_stricker['id_' + id] = json;
            local_saveJson('stricker', g_stricker);

            addStrick(json, alert);
            if (alert) toastPAlert('追加に成功しました', 3000, '', 'alert-success');
        } else {
            if (alert) toastPAlert('もう一度試してください', 3000, '', 'alert-secondary');
        }
    });
}

function addStrick(data, active = false) {
    var btn = $(`
    <span data-action="stricker_toTab" data-id="` + data.id + `">
        <img class="loading" data-src='https://sdl-stickershop.line.naver.jp/products/0/0/1/` + data.id + `/android/main.png'>
    </span>
    `);
    $('#emoji_tab_stricker').append(btn)[0];
    var h = `<div id='stricker_` + data.id + `' class="row w-full h-200 stricker_content" style="align-items: center; display:none">`;
    for (var id of data.stickers) {
        h += getStrickerHTML(data.id, id);
    }
    $('#emoji_content_stricker').append(h + '</div>');
    if (active) {
        var tabs = $('#emoji_tab_stricker')[0];
        tabs.scrollTo(tabs.scrollWidth, 0);
        btn.click();
    }
}

function getStrickerHTML(id, sid, fromLike = false) {
    return `
        <div class="col-4">
            <img class="loading"` + (fromLike ? ' data-id="' + id + '"' : '') + ` data-sid="` + sid + `" data-action="previewStricker" data-src='http://dl.stickershop.line.naver.jp/products/0/0/1/` + id + `/android/stickers/` + sid + `.png'>
        </div>
        `;
}

function getStrickerHTML_bottom(id, sid) {
    var url = `http://dl.stickershop.line.naver.jp/products/0/0/1/` + id + `/android/stickers/` + sid + `.png`;
    return `
        <div class="col-4">
            <img data-id="` + id + `" data-sid="` + sid + `" data-action="previewStricker_bottom" data-src='` + url + `' src='` + url + `'>
        </div>
        `;
}

function likeStrickerImg(switcher) {
    var img = $('#stricker_footer img');
    var id = $(img).attr('data-id');
    var sid = $(img).attr('data-sid');
    var key = id + ',' + sid;
    var index = g_stricker_options.likes.indexOf(key);
    var save = false;
    if (switcher.checked) {
        if (index == -1) {
            g_stricker_options.likes.push(key);
            save = true;
            $('#stricker_like').prepend(getStrickerHTML(id, sid));
        }
    } else {
        if (index != -1) {
            g_stricker_options.likes.splice(index, 1);
            save = true;
        }
    }
    if (save) {
        local_saveJson('stricker_options', g_stricker_options);
    }
}

function stricker_saveTags(textarea) {
    var img = $('#stricker_footer img');
    var text = textarea.value;
    var key = $(img).attr('data-id') + ',' + $(img).attr('data-sid');
    if (g_cache.saveTag && g_cache.saveTag.timer) clearTimeout(g_cache.saveTag.timer);
    g_cache.saveTag = {
        text: text,
        key: key,
        timer: setTimeout(() => {
            var text = g_cache.saveTag.text;
            var key = g_cache.saveTag.key;
            var exists = g_stricker_options.tags[key] != undefined;
            if (text == '') {
                if (!exists) {
                    return;
                }
                delete g_stricker_options.tags[key];
            } else {
                if (exists && g_stricker_options.tags[key] == text) {
                    return;
                }
                g_stricker_options.tags[key] = text;
            }
            local_saveJson('stricker_options', g_stricker_options);
            g_cache.tags = Object.entries(g_stricker_options.tags);
        }, 1000)
    }
}

function checkStrickerTags(textarea) {
    // setTyping(g_config.user.name);
    //queryMsg({ type: 'typing' }, true);
    var h = '';
    var text = textarea.value;
    if (text != '') {
        for (var tag of g_cache.tags) {
            if (tag[1].indexOf(text) != -1) {
                var args = tag[0].split(',');
                h += getStrickerHTML_bottom(args[0], args[1]);
            }
        }
    }
    console.log(h);
    if (h != '') {
        $('#bottom_stricker').show().find('.row').html(h);
    } else {
        $('#bottom_stricker').hide();
    }
}

function initStrickers() {

    if (!g_cache.strickerInited) {
        
        for (var id in g_stricker) {
            addStrick(g_stricker[id]);
        }
        var h = '';
        for (var key of g_stricker_options.likes) {
            var args = key.split(',');
            h += getStrickerHTML(args[0], args[1], true);
        }
        $('#stricker_like').html(h);

        stricker_initHistory();
        g_cache.strickerInited = true;
    }
}

function stricker_initHistory() {
    var h = '';
    if (g_stricker_options.history == undefined) g_stricker_options.history = [];
    for (var key of g_stricker_options.history) {
        var args = key.split(',');
        h += getStrickerHTML(args[0], args[1], true);
    }
    $('#stricker_history').html(h);
}


g_emoji.init();