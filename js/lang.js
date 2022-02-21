function addLang(data) {
    return Object.assign(g_lang, data)
}

var g_lang = {
    "确定删除吗": {
        "zh": "确定删除吗?",
        "jp": "削除してもいいですか？",
        "en": ""
    },
    "输入评论": {
        "zh": "输入评论...",
        "jp": "コメントを書く...",
        "en": ""
    },
    "上传": {
        "zh": "上传",
        "jp": "アップロードする",
        "en": ""
    },
    "删除": {
        "zh": "删除",
        "jp": "削除",
        "en": ""
    },
    "加载中": {
        "zh": "加载中...",
        "jp": "読み込み中",
        "en": ""
    },

    "什么都没有": {
        "zh": "空荡荡的...",
        "jp": "まだ何も書いていません",
        "en": ""
    },

}

function _l(k) {
    var lang = g_config.lang || 'zh';
    if (g_lang[k] && g_lang[k][lang]) {
        k = g_lang[k][lang];
    }
    var args = Array.from(arguments);
    args.shift(); // 去除第一个 k
    var len = args.length;
    if (len) {
        args = len == 1 && Array.isArray(args[0]) ? args[0] : args; // 如果是数组则用数组
        for (var i = 0; i < args.length; i++) {
            k = k.replace('%' + i, args[i]);
        }
        return k;
    }
    return k;
}