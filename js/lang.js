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
        for (var i = 1; i < arguments.length; i++) {
            k = k.replace('%' + i, arguments[i]);
        }
    }
    return k;
}

