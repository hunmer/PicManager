// process.setMaxListeners(0);
const path = require('path')

function runJs(script) {
    win.webContents.executeJavaScript(script).then((result) => {

    })
}

// module.exports = {
//     runJs: runJs,
// }

var electron = require('electron')
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch("disable-http-cache");
Menu.setApplicationMenu(null)

var win;

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

// win.webContents.send('asynchronous-reply', 'whoooooooh!')
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 1000,
        title: 'PicManager',
        frame: false,
        // hasShadow: true,
        // nativeWindowOpen: true,
        resizable: true,
        webPreferences: {
            webSecurity: false,
            // enableRemoteModule:true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64;isElectron) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.50',
    });

    // win.webContents.toggleDevTools()

    win.webContents.on('dom-ready', (event) => {
        // 解决electron显示的字体过大问题
        win.webContents.insertCSS(`
            :root {
                --base-html-font-size: 60% !important;
                --base-html-font-size-1600: 60% !important;
                --base-html-font-size-1920: 60% !important;
            }
      `);

    });
    // win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    //     if (level == 1 && message != undefined) {
    //     }
    // })
}

app.whenReady().then(() => {

    createWindow()
    // app.on('activate', function() {
    //     if (BrowserWindow.getAllWindows().length === 0) createWindow()
    // })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})


// 从浏览器发来的操作消息
ipcMain.on("method", (event, data) => {
    console.log(data);

    switch (data.type) {
        case 'localFolder_set':
            var folder = dialog.showOpenDialogSync(win, {
                // defaultPath: ,
                properties: ['openDirectory']
            });
            if (folder) runJs(`g_autojs.localFolder_set("${folder.replaceAll('\\\\','**')}")`);
            break;
        case 'localFolder_add':
            var folders = dialog.showOpenDialogSync(win, {
                // defaultPath: ,
                properties: ['openDirectory', 'multiSelections']
            });
            if (folders){
                 for (var folder of folders) {
                    runJs(`g_autojs.localFolder_add("${folder.replaceAll('\\\\', '**')}")`);
                }
            }
            break;

        case 'clearCache':
            // webview.clearCache(true);
            // loadUrl();
            break;
        case 'checkUpdate':
            checkUpdate(data.msg);
            break;

        case 'updateFiles':
            var json = JSON.parse(data.msg);
            updateFiles(json.url, json.files);
            break;

        case 'history_back':
            win.webContents.goBack();
            break;
        case 'history_forward':
            win.webContents.goForward();
            break;
        case 'reload':
            win.webContents.reload();
            break;
        case 'devtool':
            win.webContents.toggleDevTools()
            break;
        case 'min':
            win.minimize();
            break;

        case 'max':
            win.isMaximized() ? win.restore() : win.maximize();
            break;

        case 'close':
            win.close();
            break;
    }
});


