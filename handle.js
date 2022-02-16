const path = require('path')
const images = require('images')
const fs = require('fs')
const crypto = require('crypto')
const request = require('request');

var i = 0;

/*
缺点: 没有储存图片目录，需要和服务器进行握手。
参数过于难以理解


*/

var g_cache = {};
function downloadFile(opts) {
    var received_bytes = 0;
    var total_bytes = 0;
    var progress = 0;
    var opt = {
        method: 'GET',
        url: opts.url,
        timeout: 15000,
        // headers:{
        //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.76',
        // }
    }
    if (['pinimg.com/'].some((url) => {
            return opts.url.indexOf(url) != -1;
        })) {
        opt.proxy = 'http://127.0.0.1:1080';
    }
    var req = request(opt);
    var fileBuff = [];
    req.on('data', function(chunk) {
        received_bytes += chunk.length;
        fileBuff.push(Buffer.from(chunk));
        var newProgress = parseInt(received_bytes / total_bytes * 100);
        if (newProgress != progress) {
            progress = newProgress;
            opts.progress && opts.progress(progress);
        }
    });
    req.on('end', function() {
        var totalBuff = Buffer.concat(fileBuff);
        if (opts.saveTo) {
            files.createWithDirs(path.dirname(opts.saveTo));
            fs.appendFile(opts.saveTo, totalBuff, (err) => opts.complete && opts.complete(err));
        } else {
            opts.complete && opts.complete(null, totalBuff.toString())
        }
    });
    req.on('response', function(data) {
        total_bytes = parseInt(data.headers['content-length']);
    });
    req.on('error', function(e) {
        opts.complete && opts.complete(e);
    });
}



const files = {
    exists: (path) => fs.existsSync(path),
    isFile: (path) => fs.existsSync(path) && fs.statSync(path).isFile(),
    isDir: (path) => fs.existsSync(path) && fs.statSync(path).isDirectory(),
    createWithDirs: (dir) => mkdirsSync(dir),
    write: (file, content) => fs.writeFileSync(file, content),
    getExtension: (file) => path.extname(file).replace('.', ''),
    remove: (file) => {fs.rmSync(file)},
    copy: (oldFile, newFile) => {
        fs.copyFileSync(oldFile, newFile);
        return fs.existsSync(newFile);
    },
    move: (oldFile, newFile) => {
        fs.copyFileSync(oldFile, newFile);
        fs.unlinkSync(oldFile);
        // fs.renameSync(oldFile, newFile);
        return fs.existsSync(newFile);
    },
    join: (dir, file) => path.join(dir, file),
    listDir: (dir) => {
        var res = [];
        fs.readdirSync(dir).forEach(function(name) {
            var filePath = path.join(dir, name);
            var stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                res.push(filePath);
            }
        });
        return res;
    },
    isEmptyDir: (dir) => fs.readdirSync(dir).length == 0,
    removeDir: (dir) => fs.rmSync(dir, { recursive: true, force: true }),
    stat: (file) => fs.statSync(file),
}

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
    }
}

function resizeImage(file) {
    images(file)
        .resize(200)
        .save(file + '.thumb', 'png', {
            quality: 50
        });
}

function importSavedPath(skip) {
    var path = g_config.getResPath();
    if (files.isDir(path)) {
        var imgs = [];
        searchDirFiles(path, imgs, ['jpg', 'png'], 2, skip);
        for (var img of imgs) {
            resizeImage(img.f); // 修复没有略缩图的图片
            img.f = files.getExtension(img.f);
        }
        if (imgs.length) runJs('g_database.importLocalImages(`' + JSON.stringify(imgs) + '`)');
    }
}

// 获取指定目录下的图片
function searchDirFiles(dir, list, fileExts, C, skip) {
    fs.readdirSync(dir).forEach(fileName => {
        var path = files.join(dir, fileName);
        if (files.isDir(path) && ((!C && C != 0) || C > 0)) {
            if (files.isEmptyDir(path)) return files.removeDir(path);
            searchDirFiles(path, list, fileExts, C - 1);
            return;
        }
        for (var i = 0; i < fileExts.length; i++) {
            if (fileName.endsWith(fileExts[i])) {
                if (skip && skip.indexOf(fileName.substr(0, 32)) != -1) {
                    continue; // 跳过
                }
                list.push({
                    f: path,
                    m: getFileMd5(path),
                });
                return;
            }
        }
    });
}

// 获取参数里的所有图片，参数可能包含目录也可能包含图片
function getTargetFiles(list, ws){
    var res = [];
    var exts = ['jpg', 'png'];
    for(var item of list){
        if(files.isFile(item)){
            if(exts.indexOf(files.getExtension(item)) != -1){
                res.push({
                    f: item,
                    m: getFileMd5(item),
                });
            }
        }else{
            searchDirFiles(path, res, exts, 2, skip);
        }
    }
    scanFiles(res, '', ws);
}

function getFileMd5(file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    return hash.digest('hex');
}


function checkUpdate(url, ws) {
    var updated = [];
    downloadFile({
        url: url + 'listFile.json',
        complete: (err, content) => {
            if (err) {
                sendMsg(ws, { type: 'js', data: `alert1('请求失败!')` })
            } else {
                var json = JSON.parse(content);
                for (var name in json) {
                    var md5 = json[name];
                    name = name.replace(/\\/g, "/");
                    var saveTo = './' + name;
                    if (files.exists(saveTo) && md5 == getFileMd5(saveTo)) continue;
                    updated.push(name);
                }
                if (updated.length) {
                    sendMsg(ws, { type: 'js', data: `g_autojs.confirmUpdate('${url}', '${updated.join(',')}')` })
                } else {
                    // sendMsg(ws, {type: 'js', data: `alert1('暂无更新')`})
                }
            }
        }
    })
}



function updateFiles(url, fileList, ws) {
    var max = fileList.length;
    if (max == 0) return;
    if(url.indexOf('127.0.0.1') != -1){
        return sendMsg(ws, { type: 'js', data: `alert1('小心失误操作!!!')` });
    }
    sendMsg(ws, { type: 'js', data: `g_autojs.showImportProgress(${fileList.length})` })

    var err = 0;
    var now = 0;
    var progress = 0;
    var callback = () => {
        var newProgress = parseInt(++now / max * 100);
        if (newProgress != progress) {
            progress = newProgress;
            sendMsg(ws, { type: 'js', data: `g_autojs.setImportProgress(${progress})` });
            if (progress == 100) {
                sendMsg(ws, { type: 'js', data: `confirm1('成功更新 ${max - err} 个文件!${err ? err + '个文件处理失败!' : ''}是否重载页面?', (value) => value && location.reload())` });
            }
        }
    }
    for (var name of fileList) {
        downloadFile({
            url: url + name,
            saveTo: './' + name,
            // progress: (progress) => {}, // todo 大文件进度提示
            complete: (err) => {
                if (err) {
                    err++;
                }
                callback();
            }
        });
    }
}

function sendMsg(client, msg) {
    if(!client) return console.log(msg);

    if (typeof(msg) == 'object') msg = JSON.stringify(msg);
    client.send(msg);
}

// 检测目录图片改动
function checkFolderUpdate(resPath, paths, ws) {
    g_cache.resPath = resPath;
    // files.removeDir('./savePics');
    var imgs = [];
    for (var path of paths) {
        if (files.isDir(path)) {
            searchDirFiles(path, imgs, ['jpg', 'png'], 2);
        }
    }
    scanFiles(imgs, resPath, ws);
}

// 移动文件
function scanFiles(imgs, resPath, ws){
    if(!resPath) resPath = g_cache.resPath;
    var max = imgs.length;
    if (max > 0) {
        var saved = 0;
        var progress = 0;
        sendMsg(ws, { type: 'js', data: `g_autojs.showImportProgress(${max})` })
        var err = 0;
        var res = [];
        for (var img of imgs) {
            var path = resPath + '/' + img.m.substr(0, 1) + '/';
            if (!files.isDir(path)) {
                files.createWithDirs(path);
            }
            var ext = files.getExtension(img.f);
            var newFile = path + img.m + '.' + ext;
            if (files.isFile(newFile)) {
                files.remove(img.f); // 重复的文件，删除跳过
                continue;
            }
            // todo 复制时顺带压缩图片
            if (!files.move(img.f, newFile)) {
                err++;
                continue;
            }
            // 缩略图
            resizeImage(newFile);
            img.f = ext; // 不需要文件路径，只保留后缀名
            res.push(img);
            var newProgress = parseInt(++saved / max * 100);
            if (newProgress != progress) {
                progress = newProgress;
                sendMsg(ws, { type: 'js', data: `g_autojs.setImportProgress(${progress})` })
            }
        }
        //sendMsg(ws, { type: 'js', data: `alert1('成功导入 ${max - err} 张图片!${err ? err + '个文件处理失败!' : ''}')` });
        console.log(res);
        sendMsg(ws, { type: 'importLocalImages', data: JSON.stringify(res) })
    }
}

module.exports = {
    checkFolderUpdate: checkFolderUpdate,
    checkUpdate: checkUpdate,
    updateFiles: updateFiles,
    getTargetFiles: getTargetFiles,
}