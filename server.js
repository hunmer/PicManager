// "nodejs";
// const engines = require("engines");
// console.log(engines.myEngine().execArgv);
// const serverEngineId = engines.myEngine().execArgv.serverEngineId;
// const serverEngine = engines.getRunningEngines().find(e => e.id === serverEngineId);
// if (!serverEngine) {
//     console.error('请运行文件"main.js"，而不是直接启动本代码');
//     return;
// }
// $autojs.keepRunning();

// // 监听命令消息
// engines.myEngine().on('command', (command) => {
//     // console.log('nodejs: ', command);
//     // serverEngine.emit('reply', command);
// });

// -------------------------------------
const express = require('express');
const server = express();

server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({ extended: true,limit: '50mb' }));

function registerApi(url, type, callback){
    server[type](url, callback);
}

function echoJson(req, res, data) {
    // console.log(req.params, req.body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/*
/
api/application/info
api/folder/listRecent
(x)api/preferences/collect/on
(x)api/preferences/collect/off
*/

// 应用版本信息 /api/application/info
// GET 取得当前运行 Eagle App 的详细信息，通常我们可以透过这个方式判断用户设备是否能够运行某些功能。
registerApi('/api/application/info', 'get', (req, res) => {
    var data = {
        "status": "success",
        "data": {
            "version": "1.11.0",
            "prereleaseVersion": null,
            "buildVersion": "20200612",
            "execPath": "/Users/augus/Projects/Eagle App/node_modules/electron/dist/Electron.app/Contents/Frameworks/Electron Helper (Renderer).app/Contents/MacOS/Electron Helper (Renderer)",
            "platform": "darwin"
        }
    };
    echoJson(req, res, data);
});

// 保存
registerApi('/', 'post', (req, res) => {
    // version 2.5.1
    // type    image (save-url,screen capture,import-images)
    // title   www.baidu
    // url https://mbd.baidu.com/newspage/data/landingsuper?context=%7B%22nid%22%3A%22news_9993329904832847038%22%7D&n_type=-1&p_from=-1
    // src data:image/jpeg;base64,
    // folderID    （目录id或者空 choose=选择目录)
    // extendTags  
    // metaAlt 
    // metaTitle   www.baidu
    // metaDescription 全球领先的中文搜索引擎、致力于让网民更便捷地获取信息，找到所求。百度超过千亿的中文网页数据库，可以瞬间找到相关的搜索结果。
    // metaTags    

    // forceHideCollectModal   true (收藏到目录)
    // images [{"type":"image","width":64,"height":64,"src":"http://127.0.0.1/PicManager/res/user.jpg","title":"user"},{"type":"image","width":1440,"height":1920,"src":"http://127.0.0.1/PicManager/res/1.jpg?t=1642853752862","title":"tag1,tag2"}] (import-images)

    var data = { "appVersion": "2.0.0", "preferences": { "showSubfolderContent": false, "useRetina": false, "language": "zh_CN", "general": { "language": "zh_CN", "showMenuItem": "true", "showSidebarBadge": "true", "autoSelect": "true", "showCollectModal": "false", "showCaptureCollectModal": "false", "IPTC": "false", "enableGPU": "true" }, "habits": { "dblclickSidebarItem": "collapse", "scrollBehavior": "paging", "videoScrollBehavior": "progress", "hoverZoom": "on", "renderBehavior": "non-pixelated", "defaultMode": "preview", "alwaysShowAnnotations": "hover", "transparency": "hide", "rememberLastZoom": "on", "defaultRatio": "auto", "keyspace": "preview", "middleBtn": "openNewWindow", "gifViewer": "off", "doubleclick": "internal", "scrollBehaviorTour": true }, "shortcuts": { "keybinds": { "show.eagle": "", "show.search": "", "zoom.in": "Ctrl + =", "zoom.out": "Ctrl + -", "zoom.actual": "Ctrl + 0", "zoom.fit": "Ctrl + 9", "capture.area": "Ctrl + Alt + E", "capture.window": "", "capture.full": "", "quicksearch": "Ctrl + J", "add.to": "Ctrl + Shift + J", "create.folder": "Ctrl + Shift + N", "create.smartFolder": "Ctrl + Shift + Alt + N", "import.pinterest": "Ctrl + Shift + Alt + P", "import.huaban": "Ctrl + Shift + Alt + H", "import.artstation": "Ctrl + Shift + Alt + S", "open.link": "Ctrl + Shift + O", "toggle.filter": "Ctrl+Shift+F", "open.tagfilter": "Ctrl+Shift+T", "switch.library": "Ctrl+L" } }, "theme": "GRAY", "download": { "queueLength": 5 }, "notification": { "soundEffect": { "enable": "true", "when": { "deleteImage": "true", "deleteFolder": "true", "screencapture": "true", "extension": "true" } }, "notification": { "when": { "screencapture": "true", "extension": "true", "repeatImage": "false", "autoImport": "true" } } }, "sidebar": { "untagged": "true", "unfiled": "true", "recent": "true", "random": "true", "quickAccess": "true", "smartFolder": "true", "folder": "true" }, "filter": { "color": "true", "tags": "true", "folders": "true", "shape": "true", "rating": "true", "type": "true", "date": "true", "mtime": "false", "resolution": "true", "fileSize": "false", "comments": "false", "annotation": "true", "url": "true", "camera": "false", "duration": "true", "bpm": "false", "fontActivated": "false" }, "screencapture": { "autoTagging": { "enable": "true" }, "autoWriteClipboard": "false", "useRetina": "true", "shortcutsEnable": "true", "format": "png" }, "video": { "hoverPlay": "true", "zoomFill": "false", "autoPlay": "true", "rememberPosition": "true", "loopShortVideo": "true" }, "font": { "autoTag": "true" }, "proxy": { "enable": "false", "ip": "127.0.0.1", "port": 1087 }, "privacy": { "enable": "false", "password": "", "passwordTips": "" }, "autoImport": { "enable": "false", "path": "" } }, "showCollectModal": false }
        echoJson(req, res, data);

});

// 最近使用文件夹 /api/folder/listRecent
// GET 取得最近用户使用过的文件夹列表
registerApi('/api/folder/listRecent', 'get', (req, res) => {
    var data = {
        "status": "success",
        "data": [{
                "id": "KBCB8BK86WIW1",
                "name": "工业风",
                "description": "",
                "children": [],
                "modificationTime": 1591972345736,
                "tags": [],
                "password": "",
                "passwordTips": "",
                "images": [],
                "isExpand": true,
                "newFolderName": "工业风",
                "imagesMappings": {},
                "imageCount": 11,
                "descendantImageCount": 11,
                "pinyin": "GONGYEFENG",
                "extendTags": []
            },
            {
                "id": "KBBPIOY46SRWP",
                "name": "北歐风格",
                "description": "",
                "children": [],
                "modificationTime": 1591773342438,
                "tags": [],
                "password": "",
                "passwordTips": "",
                "images": [],
                "isExpand": true,
                "newFolderName": "北歐风格",
                "imagesMappings": {},
                "imageCount": 72,
                "descendantImageCount": 72,
                "pinyin": "BEIOUFENGGE",
                "extendTags": []
            }
        ]
    };
        echoJson(req, res, data);

});

server.listen(41596);
console.log('Server running at http://127.0.0.1:41596/');



