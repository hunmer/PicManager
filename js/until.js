var _GET = getGETArray();
var socket_url = 'wss:///daily-websock1.glitch.me';
var g_localKey = 'picManager_';
var g_cache = {
    isPC: IsPC(),
    isApp: isApp(),
    isWindow: isWindow(),
    closeCustom: () => {},
    closeCustom1: () => {},
}

function soundTip(url){
    var _audio = $('#soundTip')[0]
    _audio.src = './res/'+url;
    _audio.play();
}

function setImportantCss(dom, objs){
    for(var key in objs){
        dom.style.removeProperty(key);
        dom.style.setProperty(key, objs[key], 'important');
    }
}

function _r(data, k, type){
    if(!data[k]) return;
    switch(type){
        case 'timeout':
            if(typeof(data[k]) == 'number'){
                clearTimeout(data[k]);
                delete data[k];
            }
            break;

        case 'interval':
            if(typeof(data[k]) == 'number'){
                clearInterval(data[k]);
                delete data[k];
            }
            break;
    }
}

// todo
function _l(s) {
    return s;
}

var g_config = local_readJson('config', {
    debug: false,
    nomedia: true,
    clientData: {
        paths: [],
        imgPath:'./savePics', // 默认PC端位置
    },
    folderGrpups: {
        分类1: ['Folder1'],
    },
    darkMode: true,
});
if(!g_config.clientData.imgPath){
    // todo 咨询图片保存目录
    g_config.clientData.imgPath = './savePics';
}

if(g_config.debug) {
    loadJs('js/eruda.js', () => {
        eruda.init(/*{
            // container: el,
            tool: ['console', 'elements'],
            // useShadowDom: true
        }*/);
    });

}


String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

String.prototype.replaceAll1 = function(s1, s2) {
    var str = this;
    while(str.indexOf(s1) != -1){
        str = str.replace(s1, s2);
    }
    return str;
}


Array.prototype.searchArray = function(arr) {
   var self = this;
   return !arr.some((i) => {
        return self.indexOf(i) == -1
    });
}

var g_down = {

}

function getRandomColor() {
    return arrayRandom(['#f3a683', '#f7d794', '#778beb', '#e77f67', '#cf6a87', '##786fa6', '#f8a5c2', '#63cdda', '#ea8685', '#596275']);
}

Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

function getDataString(){
     var data = {};
     for (var key of local_getList()) {
        data[key] = localStorage.getItem(key);
    }
    return JSON.stringify(data);
}

function getArrValue(arr, defaultV){
    return arr && arr.length ? arr : defaultV;
}

function domValueAdd(dom, cnt){
    var val = parseInt(dom.innerHTML);
    dom.innerHTML = val + cnt;
}

function isSameDate(d1, d2){
    return d1.getDate() == d2.getDate();
}

function arrayRandom(arr){
    return arr[randNum(0, arr.length - 1)];
}


function local_remove(key) {
    if (window.localStorage) {
        key = g_localKey + key;
        localStorage.removeItem(key);
    }
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul = '') {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function local_getList() {
    var res = [];
    for (k of Object.keys(localStorage)) {
        if (k.indexOf(g_localKey) == 0) {
            res.push(k);
        }
    }
    return res;
}

function local_clearAll(skip){
    for(var key of local_getList()){
        if(skip && skip.indexOf(key.replace(g_localKey, '')) != -1) continue;
        localStorage.removeItem(key);
    }
}

function getGETArray() {
    var a_result = [],
        a_exp;
    var a_params = window.location.search.slice(1).split('&');
    for (var k in a_params) {
        a_exp = a_params[k].split('=');
        if (a_exp.length > 1) {
            a_result[a_exp[0]] = decodeURIComponent(a_exp[1]);
        }
    }
    return a_result;
}

function getFormatedTime(i = 0, date = new Date()) {
    if (typeof(date) != 'object') date = new Date(parseInt(date));
    switch (i) {
        case 0:
            return _s(date.getHours()) + ':' + _s(date.getMinutes());
        case 1:
            return date.getMonth() + 1 + '/' + date.getDate() + ' ' + _s(date.getHours()) + ':' + _s(date.getMinutes());
        case 2:
            return date.getMonth() + 1 + '/' + date.getDate();
        case 3:
            return date.getFullYear() + '_' + (Number(date.getMonth()) + 1) + '_' + date.getDate();
        case 4:
            return date.getFullYear() + '/' + (Number(date.getMonth()) + 1) + '/' + date.getDate();

        case 5:
            return date.getFullYear() + '/' + (Number(date.getMonth()) + 1) + '/' + date.getDate() + ' ' + _s(date.getHours()) + ':' + _s(date.getMinutes());
    }
}

function getLastTime(t1, t2) {
    if (t1 instanceof Date) t1 = t1.getTime() / 1000;
    if (!t2) t2 = new Date().getTime() / 1000;
    return getTime(t2 - t1);
}

function toastPAlert(msg, type, time, title) {
    halfmoon.initStickyAlert({
        content: msg,
        title: title || '',
        alertType: type || "alert-primary",
        hasDismissButton: false,
        timeShown: time || 3000
    });
    soundTip('alert.mp3');
    g_autojs.log('toast', msg);
}

function addAnimation(d, x, callback) {
    var c = d.attr('Class');
    if (d.attr('animated') != undefined) {
        d.removeClass(d.attr('animated'))
    }
    d.attr('animated', x).addClass('animated ' + x).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

        function() {
            if ($(this).attr('animated') != undefined) {
                $(this).removeClass('animated ' + $(this).attr('animated')).attr('animated', '');
                if (callback != undefined) {
                    callback();
                }
            }
        })
}

function _s1(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : (s < 10 ? '0' + s : s) + j);
}

function _s(i, j = '') {
    return (i < 10 ? '0' + i : i) + j;
}

function _s2(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : s + j);
}



function time_getRent(time) {
    if(!time) return '';
    var today = new Date();
    var s = (parseInt(today.getTime()) - time) / 1000;
    if (s >= 84000) {
        if (s >= 84000 * 30) {
            if (s >= 84000 * 365) {
                return getFormatedTime(4, time);
            }
            return getFormatedTime(2, time);
        }
        return parseInt(s / 86400) + _l('天前');
    }
    // console.log(getTime(s, '时', '分', '秒前'));
    var s = '';
    if(today.getDate() != new Date(time).getDate()){
        s = _l('昨天');
    }
    return s+ getFormatedTime(0, time);
}

function getTime(s, sh = _l('时'), sm = _l('分'), ss = _l('秒')) {
    s = Number(s);
    if (s >= 86400) {
        return parseInt(s / 86400) + _l('天');
    }
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    return _s1(h, sh) + _s(m, sm) + _s(parseInt(s), ss);
}

function getTime1(s, sh = _l('时'), sm = _l('分')) {
    s = Number(s);
    if (s >= 86400) {
        return parseInt(s / 86400) + _l('天');
    }
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    return _s1(h, sh) + _s(m, sm);
}

function parseTime(s){
    var r = {};
    s = Number(s);
    if (s >= 86400) {
        r.d = parseInt(s / 86400);
    }
    var h = 0,
        m = 0;
    if (s >= 3600) {
        r.h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        r.m = parseInt(s / 60);
        s %= 60;
    }
    r.s = s;
    return r;
}

function getVal(value, defaultV){
    return value || defaultV;
}


function randNum(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}

function getNow(b = true) {
    var i = new Date().getTime() / 1000;
    if (b) i = parseInt(i);
    return i;
}

function toTime(s) {
    var a = s.split(':');
    if(a.length == 1) return Number(s);
    if (a.length == 2) {
        a.unshift(0);
    }
    return a[0] * 3600 + a[1] * 60 + a[2] * 1;
}

function isEmpty(a){
    if(typeof(a) == 'string') return a.length == 0;
    return a;
}

function removeAnimation(d) {
    var x = d.attr('animated');
    if (x != undefined) {
        d.removeClass('animated ' + x).attr('animated', null);
    }
    return x;
}

function isApp(){
    return navigator.userAgent.indexOf('isApp') != -1;
}

function isWindow(){
    return navigator.userAgent.indexOf('isElectron') != -1;
}

function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

function hideSidebar() {
    if (isSidebarShowed()) {
        halfmoon.toggleSidebar();
        return true;
    }
    return false;
}

function isSidebarShowed(){
    return $('#page-wrapper').attr('data-sidebar-hidden') != 'hidden';
}


var g_actions = {};

function registerAction(name, callback) {
    g_actions[name] = callback;
}


function cutStrings(s_text, s_start, filter = false) {
    var res = [];
    var i_start = 0;
    while (1) {
        i_start = s_text.indexOf(s_start, i_start);
        if (i_start === -1) break;
        i_start += s_start.length;
        i_end = s_text.indexOf(s_start, i_start + s_start.length);
        if (i_end === -1) i_end = s_text.length;
        res.push(s_text.substr(i_start, i_end - i_start));
        i_start = i_end;
    }
    if (filter) {
        res = Array.from(new Set(res));
    }
    return res;
}

function downloadData(blob, fileName){
    if(typeof(blob) != 'blob'){
        blob = new Blob([blob]);
    }
    var eleLink = document.createElement('a');
    eleLink.download = fileName;
    eleLink.style.display = 'none';
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink); 
}



function registerContextMenu(selector, callback) {
    $('body')
        .on('touchstart', selector, function(event) {
            var dom = $(this);
            g_down.start = getNow();
            g_down.element = dom;
            g_down.task = setTimeout(function() {
                if (g_down.start > 0) {
                    g_down.holding = true;
                    event.originalEvent.preventDefault(true);
                    event.originalEvent.stopPropagation();
                    callback(g_down.element, event);
                }
                g_down.start = 0;
                g_down.task = -1;

            }, 1500);
        })
        .on('touchend', selector, function(event) {
            if (g_down.task != -1) {
                clearTimeout(g_down.task);
            }
            g_down.start = 0;
            if (g_down.holding) {
                event.originalEvent.preventDefault(true);
                event.originalEvent.stopPropagation();
            }
            g_down.holding = false;
        })
        .on('contextmenu', selector, function(event) {
            var dom = $(this);
            event.originalEvent.preventDefault(true);
            event.originalEvent.stopPropagation();
            g_down.element = dom;
            callback(g_down.element, event);
        });
}

function copyText(text) {
    if (!$('#modal-copy').length) {
        $(`<div class="modal" id="modal-copy" tabindex="-1" role="dialog" style="z-index: 99999;">
        <div class="modal-dialog" role="document">
            <div class="modal-content modal-content-media w-500">
                <a class="close" role="button" aria-label="Close" onclick="halfmoon.toggleModal('modal-copy');">
                    <span aria-hidden="true">&times;</span>
                </a>
                <h5 class="modal-title text-center">` + _l('弹出_复制_标题') + `</h5>
                <div class="modal-html"><div class="input-group">
          <textarea class="form-control" id="input_copy" disbaled>` + text + `</textarea>
        </div>
        <button class="form-control bg-primary btn-block" onclick="$('#input_copy').select();document.execCommand('copy');halfmoon.toggleModal('modal-copy');">` + _l('复制') + `</button>
                </div>
            </div>
        </div>
    </div>`).appendTo('body');
    }
    halfmoon.toggleModal('modal-copy');
}

// 检测弹出的窗口是否为指定的类型
function isModalOpen(id, type) {
    var modal = $('#' + id)
    if (modal.hasClass('show')) {
        if (type && modal.attr('data-type') != type) {
            return false;
        }
        return true;
    }
    return false;
}


function checkInputValue(doms) {
    var values = [];
    for (var input of doms) {
        input = $(input);
        var val = input.val();
        if (val == '') {
            input.addClass('is-invalid')[0].focus();
            return false;
        }
        input.removeClass('is-invalid');
        values.push(val);
    }
    return values;
}


function loadJs(file, success = function() {}, fail = function() {}) {
    var scriptNode = $('script[src="'+file+'"]');
    if(scriptNode.length){ // js已加载
        success();
        return scriptNode[0];
    }
    var D = document;
    scriptNode = D.createElement('script');
    scriptNode.type = "text/javascript";
    scriptNode.src = file;
    var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
    targ.appendChild(scriptNode);
    scriptNode.onload = function() {
        success();
    }
    scriptNode.onerror = function() {
        fail();
    }
    return scriptNode;
}

function insertStyle(cssText) {
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    var rules = document.createTextNode(cssText);
    style.type = "text/css";
    if (style.styleSheet) {
        style.styleSheet.cssText = rules.nodeValue;
    } else {
        style.appendChild(rules);
    }
    head.appendChild(style);
    return style;
}

function getEditorHtml(m) {
    var c = $('<div>' + m + '</div>').clone(); // 用div把所有元素包成1个，以便取得所有html
    for (var d of c.find('.emoji_')) {
        // 去除蜜汁插入图片的背景颜色
        d.style.backgroundColor = '';
    }
    if (c.length == 1 && c[0].nodeName == 'P') {
        s = c[0].innerText;
    } else {
        s = c[0].outerHTML // jq html() 无法获取h1等等
    }
    s = s.replace('<p>', '').replace('</p>', '').replace('<div>', '').replace('</div>', ''); // 替换一个div与p

    return s;
}

function showImage(url){
    g_cache.closeCustom = () => {}
        $('#modal-custom').find('.modal-title').html('');
        $('#modal-custom').attr('data-type', 'image').find('.modal-html').html(`
            <div>
                <img style="width: 100%;" src="`+url+`">
            </div>
        `);
        halfmoon.toggleModal('modal-custom');
}


var vibrateInterval;
// 开始震动
function startVibrate(duration) {
    if(!navigator.vibrate) return soundTip('click.mp3');
    navigator.vibrate(duration);
}

// 停止震动
function stopVibrate() {
    // 清除间隔和停止持续振动
    if(!navigator.vibrate) return;

    if(vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
}

//在给定的持续时间和间隔时开始持续的振动
//假定一个数字值
function startPeristentVibrate(duration, interval) {
    if(!navigator.vibrate) return;
    vibrateInterval = setInterval(function() {
        startVibrate(duration);
    }, interval);
}