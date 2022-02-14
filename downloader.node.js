module.exports = (function() {
    const fs = require("fs");
    const os = require("os");
    const request = require('request');
    const path = require("path");
    var images;
    const crypto = require("crypto");
    var _g = {
      max: 3, // 最大并列下载数
      list: [], // 队列
      fail: [], // 失败
      keys: {}, // md5对应图片地址
      downloading: [], // 下载中
      isAndroid: os.platform() == 'android'
  };
  if(_g.isAndroid){
    images = require("image");
  }else{
    images = require("images");
  }

  function resizeImage(file) {
    if (isAndroid) {
        if (!fs.existsSync(file)) return;
        var image = images.readImageSync(file);
        var w = image.width;
        var cacheFile = path.dirname(file) + '/cache_' + path.basename(file);
        images.writeImageSync(image.resizeSync(200, parseInt(200 / w * image.height), 0), cacheFile, 50);

        if (fs.existsSync(cacheFile)) {
            fs.renameSync(cacheFile, file + '.thumb');
        }
    } else {
        images(file)
            .resize(200)
            .save(file + '.thumb', 'png', {
                quality: 50
            });
    }
}


  // setTasks([
  //     "http://content.battlenet.com.cn/wow/media/wallpapers/patch/fall-of-the-lich-king/fall-of-the-lich-king-1920x1080.jpg",
  //     "http://content.battlenet.com.cn/wow/media/wallpapers/patch/black-temple/black-temple-1920x1200.jpg",
  //     "http://content.battlenet.com.cn/wow/media/wallpapers/patch/zandalari/zandalari-1920x1200.jpg",
  //     "http://content.battlenet.com.cn/wow/media/wallpapers/patch/rage-of-the-firelands/rage-of-the-firelands-1920x1200.jpg",
  //     "http://content.battlenet.com.cn/wow/media/wallpapers/patch/fury-of-hellfire/fury-of-hellfire-3840x2160.jpg",
  // ]);

    function removeDownload(imgSrc, md5) {
        var i = _g.downloading.indexOf(imgSrc);
        if (i != -1) {
            _g.downloading.splice(i, 1);
        }
        var i = _g.fail.indexOf(imgSrc);
        if (i != -1) {
            _g.fail.splice(i, 1);
        }
        if(md5 && _g.keys[md5]){
            var d = _g.keys[md5];
            if(typeof(_g.callback) == 'function') _g.callback(imgSrc, md5, d);
            delete _g.keys[md5];
        }
    }

    function getOldMd5ByUrl(url){
        for(var md5 in _g.keys){
            if(_g.keys[md5].url == url){
                return md5;
            }
        }
    }

    function startDownloadTask(imgSrc, dirName) {
        var promise = new Promise(function(resolve, reject) {

        _g.downloading.push(imgSrc);
        console.log('start download ' + imgSrc);

        // var fileName = path.basename(imgSrc);
        var received_bytes = 0;
        var total_bytes = 0;
        var progress = 0;
        var opt = {
            method: 'GET',
            url: imgSrc,
            timeout: 15000,
            // headers:{
            //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.76',
            // }
        }
        if(['pinimg.com/'].some((url) => {
            return imgSrc.indexOf(url) != -1;
        })){
            opt.proxy  = 'http://127.0.0.1:1080';
        }
        var req = request(opt);
            var fileBuff = [];
            req.on('data', function(chunk) {
                received_bytes += chunk.length;
                var buffer = Buffer.from(chunk);
                fileBuff.push(buffer);
                var newProgress = parseInt(received_bytes / total_bytes * 100);
                if (newProgress != progress) {
                    progress = newProgress;
                    // todo 渲染到网页端
                }
            });
            req.on('end', function() {
                var totalBuff = Buffer.concat(fileBuff);
                var md5 = crypto.createHash("md5WithRSAEncryption").update(totalBuff.toString("binary")).digest("hex");

                dirName += md5.substr(0, 1) + '/';
                mkdirsSync(dirName);

                var ext = path.extname(imgSrc).split('?')[0]; // 有的网址图片后缀名会加上参数 [?]
                var fileName = md5 + ext;
                var file = dirName + fileName;
                fs.appendFile(file, totalBuff, function(err) {
                    if(err == null){
                         // 略缩图
                         resizeImage(file);
                     
                        var oldMd5 = getOldMd5ByUrl(imgSrc);
                        _g.keys[oldMd5].newMd5 = md5;
                        _g.keys[oldMd5].ext = ext;
                        removeDownload(imgSrc, oldMd5);
                        
                    }else{
                        console.log(err);
                        removeDownload(imgSrc);
                    }
                    
                });
            });
        req.on('response', function(data) {
            total_bytes = parseInt(data.headers['content-length']);
        });
        req.on('error', function(e) {
            // 任务出错
            if (_g.fail.indexOf(imgSrc) == -1) _g.fail.push(imgSrc);
        });
    });
    return promise;
    }

    function setTasksFromDatas(list, callback) {
        var urls = [];
        for(var key in list){
            var url = list[key];
            _g.keys[key] = {
                url: url
            };
            urls.push(url);
        }
        setTasksFromUrls(urls);
        _g.callback = callback;
    }

    function setTasksFromUrls(list, keys) {
        // 添加任务
        var i = 0;
        for (var url of list) {
            if (_g.list.indexOf(url) == -1) {
                _g.list.push(url);
                i++;
            }
        }
        // 开始计时器
        if (i > 0 && !_g.timer) {
            _g.timer = setInterval(() => {
                var watting = _g.list.length;
                if (watting == 0) {
                    // 任务下载完毕
                    setStatus('任务下载完毕');
                    clearInterval(_g.timer);
                    delete _g.timer;
                    return;
                }
                for (var i = _g.downloading.length; i < Math.min(watting, _g.max); i++) {
                    startDownloadTask(_g.list.shift(), _g.isAndroid ? '/sdcard/savePics/' : 'F:/AppServ/www/PicManager/savePics/');
                }
            }, 1000);
        }
        return i;

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


    function setStatus(text) {
        console.log(text)
    }

    return {
        setTasksFromDatas: setTasksFromDatas,
        setTasksFromUrls: setTasksFromUrls,
    }
})();

