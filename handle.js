const path = require('path')
const images = require('images')
const http = require('http')
const fs = require('fs')
const crypto = require('crypto')

const files = {
    exists: (path) => fs.existsSync(path),
    isFile: (path) => fs.existsSync(path) && fs.statSync(path).isFile(),
    isDir: (path) => fs.existsSync(path) && fs.statSync(path).isDirectory(),
    createWithDirs: (dir) => mkdirsSync(dir),
    write: (file, content) => fs.writeFileSync(file, content),
    getExtension: (file) => path.extname(file).replace('.', ''),
    // remove: (file) => {fs.rmSync(file)},
    remove: (file) => console.log('删除文件 ' + file),
    move: (oldFile, newFile) => {
        fs.copyFileSync(oldFile, newFile);
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
        searchFiles(path, imgs, ['jpg', 'png'], 2, skip);
        for (var img of imgs) {
            resizeImage(img.f); // 修复没有略缩图的图片
            img.f = files.getExtension(img.f);
        }
        if (imgs.length) runJs('g_database.importLocalImages(`' + JSON.stringify(imgs) + '`)');
    }
}


function searchFiles(dir, list, fileExts, C, skip) {
    fs.readdirSync(dir).forEach(fileName => {
        var path = files.join(dir, fileName);
        if (files.isDir(path) && ((!C && C != 0) || C > 0)) {
            if (files.isEmptyDir(path)) return files.removeDir(path);
            searchFiles(path, list, fileExts, C - 1);
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

function getFileMd5(file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    return hash.digest('hex');
}

function checkUpdate(url, ws) {
    var updated = [];
    http.get(url + 'listFile.json', (r) => {
        if (r.statusCode != 200) {
            sendMsg(ws, {type: 'js', data: `alert1('请求失败!')`})
            r.resume();
            return;
        }
        r.setEncoding('utf8');
        let rawData = '';
        r.on('data', (chunk) => { rawData += chunk; });
        r.on('end', () => {
            try {
                console.log(rawData);
                var json = JSON.parse(rawData);
                for (var name in json) {
                    var md5 = json[name];
                    name = name.replace(/\\/g, "/");
                    var saveTo = './test/'+name;
                    if (files.exists(saveTo) && md5 == getFileMd5(saveTo)) continue;
                    updated.push(name);
                }
                sendMsg(ws, {type: 'js', data: `g_autojs.confirmUpdate('${url}', '${updated.join(',')}')`})
            } catch (e) {
                console.error(e.message);
            }
        });
    });
}


function updateFiles(url, fileList, ws) {
    var max = fileList.length;
    if(max == 0) return;

    sendMsg(ws, {type: 'js', data: `g_autojs.showImportProgress(${fileList.length})`})

    var err = 0;
    var now = 0;
    var progress = 0;
    var callback = () => {
        var newProgress = parseInt(++now / max * 100);
        if (newProgress != progress) {
            progress = newProgress;
            sendMsg(ws, {type: 'js', data: `g_autojs.setImportProgress(${progress})`});
            if(progress == 100){
                sendMsg(ws, {type: 'js', data: `confirm1('成功更新 ${max - err} '个文件!'${err ? err + '个文件处理失败!' : ''}是否重载页面?', (value) => value && location.reload()})`});
            }
        }
    }
    for (var name of fileList) {
        var saveTo = './test/'+ name;
        http.get(url + name, (r) => {
            if (r.statusCode != 200) {
                err++;
                callback();
                r.resume();
            }else{
                var fileBuff = [];
                r.on('data', (chunk) => { fileBuff.push(Buffer.from(chunk)); });
                r.on('end', () => {
                    try {
                        var totalBuff = Buffer.concat(fileBuff);
                        fs.appendFile(saveTo, totalBuff, function(err) {
                            callback();
                            if (err){
                                err++;
                            }
                        });
                    } catch (e) {
                        console.error(e.message);
                    }
                });
            }
            
        });

    }
}

function sendMsg(client, msg) {
    if (typeof (msg) == 'object') msg = JSON.stringify(msg);
    client.send(msg);
}

// 检测目录图片改动
function checkFolderUpdate(resPath, paths, ws) {
    // files.removeDir('./savePics');
    var imgs = [];
    for (var path of paths) {
        if (files.isDir(path)) {
            searchFiles(path, imgs, ['jpg', 'png'], 2);
        }
    }
    var max = imgs.length;
    if (max > 0) {
        var saved = 0;
        var progress = 0;
        sendMsg(ws, {type: 'js', data: `g_autojs.showImportProgress(${max})`})
        var err = 0;
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
            var newProgress = parseInt(++saved / max * 100);
            if (newProgress != progress) {
                progress = newProgress;
                sendMsg(ws, {type: 'js', data: `g_autojs.setImportProgress(${progress})`})
            }
        }
        sendMsg(ws, {type: 'js', data: `alert1('成功导入 ${max - err} '张图片!'${err ? err + '个文件处理失败!' : ''}')`});
        sendMsg(ws, {type: 'importLocalImages', data: JSON.stringify(imgs)})
    }
}

module.exports = {
    checkFolderUpdate: checkFolderUpdate,
    checkUpdate: checkUpdate,
    updateFiles: updateFiles,
}