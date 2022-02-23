var g_img = {}

// loadImage('http://p1.music.126.net/YakJCmqL2D7HQZNUhQABNQ==/109951166684878081.jpg?param=140y140');

function getImageBlob(url, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if (this.status == 200) {
            success(this.response);
        } else {
            error && error();
        }
    }
    xhr.onerror = function() {
        error && error();
    }
    xhr.send();
}

async function loadImage(url) {
    delete g_img.blob;
    //if (location.protocol == 'file:') {
        return showImage(url);
    //}
    getImageBlob(url, (blob) => {
        g_img.blob = blob;
        showImage(URL.createObjectURL(blob))
        //downloadData(blob, '1.jpg');
        // let reader = new FileReader();
        // reader.readAsDataURL(blob);
        // reader.onloadend = function(e) {
        //     console.log(reader.result)
        // }
    }, () => {
        showImage(url);
    });
}

function showImage(url) {
    g_img.url = url;
    $('#imageEdit img').attr('src', url);
    g_gallery.openImage();
    loadDetailImage();
}

// 加载右侧缩略图以及分析颜色
function loadDetailImage() {
    if ($('#div_detail').hasClass('hide')) return;
    if (g_cache.detailShow == g_database.showingImage) return;
    g_cache.detailShow = g_database.showingImage;
    $('#div_detail img').attr('src', g_database.showingData.i);
    if (g_img.blob) {
        $('#detail_fileSize .text-right').html(renderSize(g_img.blob.size));
        // 略缩图减少品质
        lrz(g_img.url, { width: 200, quality: 0.5 })
            .then(function(rst) {
                //$('#div_detail img').attr('src', URL.createObjectURL(rst.file));
                parseColor(rst.base64)
            })
            .catch(function(err) {});
    }
}

function renderSize(value) {
    if (null == value || value == '') {
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2); //保留的小数位数
    return size + unitArr[index];
}



function parseColor(src) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = src;
    img.onload = function() {
        var canvas = $("#canvas")[0];
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        var data = ctx.getImageData(0, 0, this.width, this.height).data; //读取整张图片的像素。
        var rgbArray = new Array();
        for (var i = 0; i < data.length; i += 4) {
            var rdata = data[i]; //240-250
            var gdata = data[i + 1]; //70-100
            var bdata = data[i + 2]; //80-120
            var adata = data[i + 3];
            if (adata > 125) {
                rgbArray.push([rdata, gdata, bdata, adata]);
            }

        }

        g_img.colors = [];
        GetColor(rgbArray);
        var h = '';
        for (var color of g_img.colors) {
            h += `
        <div class="dot" style="background-color: ` + color + `;"></div>
        `
        }
        $('#colors').html(h);
    }


}

//获取主题色
function GetColor(cube) {
    var qulity = 100;
    var maxr = cube[0][0],
        minr = cube[0][0],
        maxg = cube[0][1],
        ming = cube[0][1],
        maxb = cube[0][2],
        minb = cube[0][2];
    for (var i = 0; i < cube.length; i++) {
        if (cube[i][0] > maxr) {
            maxr = cube[i][0];
        }
        if (cube[i][0] < minr) {
            minr = cube[i][0];
        }
        if (cube[i][1] > maxg) {
            maxg = cube[i][1];
        }
        if (cube[i][1] < ming) {
            ming = cube[i][1];
        }
        if (cube[i][2] > maxb) {
            maxb = cube[i][2];
        }
        if (cube[i][2] < minb) {
            minb = cube[i][2];
        }
    }

    if ((maxr - minr) < qulity && (maxg - ming) < qulity && (maxb - minb) < qulity) {
        var r = 0,
            g = 0,
            b = 0;
        for (var i = 0; i < cube.length; i++) {
            r += cube[i][0];
            g += cube[i][1];
            b += cube[i][2];
        }
        g_img.colors.push("rgba(" + (r / (cube.length)).toFixed() + "," + (g / (cube.length)).toFixed() + "," + (b / (cube.length)).toFixed() + ")");
    } else {
        var maxrgb = 0;
        var rgbindex = 0;
        var rgbmiddle = 0;

        if ((maxr - minr) > maxrgb) {
            maxrgb = (maxr - minr);
            rgbmiddle = (maxr + minr) / 2
            rgbindex = 0;
        }
        if ((maxg - ming) > maxrgb) {
            maxrgb = (maxg - ming);
            rgbmiddle = (maxg + ming) / 2;
            rgbindex = 1;
        }
        if ((maxb - minb) > maxrgb) {
            maxrgb = (maxb - minb);
            rgbmiddle = (maxb + minb) / 2;
            rgbindex = 2;
        }

        //排序
        cube.sort(function(x, y) {
            return x[rgbindex] - y[rgbindex];
        });
        var cubea = new Array();
        var cubeb = new Array();
        for (var i = 0; i < cube.length; i++) {
            if (cube[i][rgbindex] < rgbmiddle) {
                cubea.push(cube[i]);
            } else {
                cubeb.push(cube[i]);
            }
        }

        GetColor(cubeb);
        GetColor(cubea);
    }
}