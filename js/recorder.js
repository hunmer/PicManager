var g_click = {
    start: 0,
    task: -1,
    dom: undefined,
    cnt: undefined,
    holding: false,
    startRecord: 0,
    endRecord: 0,
    recordTimer: 0,

};

    var chunks = [];

var mediaRecorder;

function sendRecord(lyric) {
    var reader = new FileReader();
    reader.readAsDataURL(chunks[0]);
    reader.onloadend = function() {
      g_json.datas[g_playing_index].lyrics[lyric] = {
          audio: reader.result,
          sec: g_click.cnt.html().replace('s','')
        }
          $('#ftb_confirm').hide();
          g_click.par.find('input[placeholder="end"]').val(getTime(
          toTime(g_click.par.find('input[placeholder="start"]').val()) + 
          (g_click.endRecord - g_click.startRecord).toFixed(2) * 1, true)).addClass('changed');
          saveChange(g_click.par);
    }
}

function startRecord() {
  // _record.pause();
    chunks = [];
    g_click.dom.addClass('btn-primary');
    g_click.cnt.html('0s');
    g_click.startRecord = getNow(false);
    mediaRecorder.start();
    console.log("录音中...");
    soundTip('./res/di.mp3');

    g_click.recordTimer = setInterval(() => {
        var s = getNow() - parseInt(g_click.startRecord);
        g_click.cnt.html(s+'s');
    }, 1000);
}

function soundTip(url) {
    _audio2.src = url;
    _audio2.play();
}

function stopRecord() {
    clearInterval(g_click.recordTimer);
    g_click.dom.removeClass('btn-primary');
    mediaRecorder.stop();
    console.log("录音结束");
    g_click.endRecord = getNow(false);
    $('#ftb_confirm').show();
}

function switchRecord() {
    if (mediaRecorder.state !== "recording") {
        startRecord();
    } else {
        stopRecord();
    }
}

if (navigator.mediaDevices.getUserMedia) {
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(
        stream => {
            mediaRecorder = new MediaRecorder(stream);

            window.onkeydown = (event) => {
                if (event.key == 'Delete') {
                    if (mediaRecorder.state !== "recording") {
                        startRecord();
                    }
                }
            };

            window.onkeyup = (event) => {
                if (event.key == 'Delete') {
                    if (mediaRecorder.state === "recording") {
                        stopRecord();

                    }
                } else
                if (event.key == 'Insert') {
                    document.querySelector("#record").play();
                }
            };

            mediaRecorder.ondataavailable = e => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = e => {
                var blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                var audioURL = window.URL.createObjectURL(blob);
                _record.preview = audioURL;
                _record.src = audioURL;
                _record.play();
            };
        },
        () => {
            alert("授权失败！");
        }
    );
} else {
    alert("浏览器不支持 getUserMedia");
}