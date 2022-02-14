var g_mark = {

    // 打开主界面
    openDialog: (key) => {
        g_mark.showingKey = key;
        var data = g_database.getImgData(key);
        if (!data) return;
        g_mark.showingData = data;

        var modal = modalOpen({
            id: 'modal-custom',
            type: 'mark',
            width: '100%',
            title: `
            	<div class="row">
            		<div class="col-6 text-center" id="bar_mark_left">
            			<i data-action="mark_setMark,n" class="fa fa-dot-circle-o" aria-hidden="true"></i>
            			<i data-action="mark_setMark,c" class="fa fa-circle-o" aria-hidden="true"></i>
            			<i data-action="mark_setMark,s" class="fa fa-square-o" aria-hidden="true"></i>
            			<i data-action="mark_clear" class="fa fa-trash-o text-danger" aria-hidden="true"></i>
            		</div>
            	</div>
            `,
            html: `
				<div class="row w-full">
					<div class="col-6">
						<div style="position:relative" id="div_markImg">
							<img src="`+g_database.getImageUrl(key, data.i, false)+`" style="width: 100%; -webkit-user-drag: none;" onclick="modalImgClick(event);">
							<div id="area_select" style="display: none;position: fixed; z-index: 2;border: 2px solid blue;"></div>
						</div>
					</div>
					<div id="mark_noteList" class="col-6 p-10">
						
					</div>
				</div>
	        `,
            onClose: () => {
                g_mark.hide();
                return true;
            }
        });
        g_mark.initMark(data);

    },


    // 隐藏
    hide: () => {
        g_mark.div.fadeOut('slow');
        // addAnimation(g_mark.div, 'flipOutX', () => {
        //       g_mark.div.hide();
        //   });

    },
    isShow: () => {
        return g_mark.div.css('display') != 'none';
    },

    // 获取文本
    getText: () => {
        return g_mark.div.find('textarea').val();
    },

    // 设置文本
    setText: (text) => {
        return g_mark.div.find('textarea').val(text);
    },

    // 初始化
    init: () => {
        g_mark.gallery = false;
        //  onclick="getTextWithPrompt(event, 'コメント')"
        g_mark.div = $(`

			<div class="bg-dark-light text-light row position-fixed p-5 border rounded w-200" style="z-index: 99999;display: none;">
				<textarea class="form-control col-12" placeholder="コメントを書く..."></textarea>
				<div class="btn-group col-12 mt-5">
					<button data-action="dot_delete" class="btn col"><i class="fa fa-trash-o" aria-hidden="true"></i></button>
					<button data-action="dot_apply" class="btn col"><i class="fa fa-check" aria-hidden="true"></i></button>
				</div>
			</div>
		`).appendTo('body');

        registerAction('mark_setMark', (dom, action, params) => {
            var actived = $(dom).hasClass('text-primary');
            $('#bar_mark_left .text-primary').removeClass('text-primary');
            if (actived) {
                delete g_mark.markMode;
                return;
            }
            $(dom).addClass('text-primary')
            g_mark.markMode = action[1];
            // 应用选区效果
            $('#area_select').css('borderRadius', action[1] == 'c' ? '50%' : '')
        });

        registerAction('mark_clear', (dom, action, params) => {
            if (confirm('清空吗?')) {
                var key = g_mark.showingKey;
                var data = g_database.getImgData(key, false);
                if (data) {
                    $('.img-mark-dots').remove();
                    data.m = {};
                    g_database.saveImgData(key, data);
                    g_mark.initMarkTexts();
                }
            }
        });
        registerAction('dot_delete', (dom, action, params) => {
            if (confirm('删除吗?')) {
                var key = g_mark.showingKey;
                var data = g_database.getImgData(key, false);
                if (data) {
                    var dotKey = action.length > 1 ? action[1] : g_mark.dot.attr('data-key');
                    delete data.m[dotKey];
                    g_database.saveImgData(key, data)
                    $('.img-mark-dots[data-key="' + dotKey + '"]').remove();
                }
                g_mark.hide();
                g_mark.initMarkTexts();
            }
        });

        registerAction('dot_apply', (dom, action, params) => {
            var text = g_mark.getText();
            if (text == '') return toastPAlert('请输入文本', 1000, '', 'alert-primary');
            g_mark.dot.attr('data-title', text);
            g_mark.editingData.t = text;
            if(!g_mark.showingData.m) g_mark.showingData.m = {};
            g_mark.showingData.m[g_mark.dot.attr('data-key')] = g_mark.editingData;
            g_database.saveImgData(g_mark.showingKey, g_mark.showingData);
            g_mark.hide();
            g_mark.initMarkTexts();
        });
        registerAction('dot_click', (dom, action, params) => {
            dom = $(dom);
            g_mark.text = dom.attr('data-title');
            // if (editing) {
            //     return toastPAlert(g_mark.text, 10000, '', 'alert-primary');
            // }

            var i = g_mark.div.width() / 2;
            var x = dom.offset().left;
            var mw = $(window).width();
            if (x + i > mw) {
                x = mw - g_mark.div.width();
            } else {
                x -= i;
            }

            var y = dom.offset().top + 20;
            var mh = $(window).height();
            if (y + g_mark.div.height() > mh) {
                y = mh - g_mark.div.height();
            }

            g_mark.dot = dom;
            g_mark.key = dom.attr('data-key');;
            g_mark.div.find('textarea').val(g_mark.text)
            addAnimation(g_mark.div.css({
                left: x + 'px',
                top: y + 'px',
                display: 'unset'
            }), 'flipInX', () => {
                // g_mark.div.find('textarea').focus();
            });
        });

        // g_mark.openDialog('test4');
        

    },
    // 初始化标记
    initMark: (data) => {
        for (var key in data.m) {
            var p = key.split('_');
            g_mark.newMark(key, data.m[key]);
        }
        g_mark.initMarkTexts();
    },
    // 加载标记文本列表
    initMarkTexts: () => {
        var h = '';
        for (var key in g_mark.showingData.m) {
            h += `
    		<div class="alert mb-10" role="alert">
			  <span>` + g_mark.showingData.m[key].t + `</span>
			  <div class="mt-10 text-right">
			  	<i data-action="dot_delete,` + key + `" class="fa fa-trash-o text-danger" aria-hidden="true"></i>
			  	` + getFormatedTime(5, key) + `
			  </div>
			</div>
    		`
        }
        $('#mark_noteList').html(h);
    },
    // 创建标注点
    newMark: (key, data, isNew) => {
        g_mark.editingData = data;
        var p = data.a.split('_');
        var css = `
    		display: none;
    		position: absolute;
    	`;

        switch (p[0]) {
            case 's': // 正方形 
                css += `
				    border: 3px solid red;
				    width: ` + Math.abs(p[2] - p[1]) + `%;
				    height: ` + Math.abs(p[4] - p[3]) + `%;
				    `;
                break;

            case 'c': // 圆形 
                css += `
				    border-radius: 50%;
				    border: 3px solid red;
				    width: ` + Math.abs(p[2] - p[1]) + `%;
				    height: ` + Math.abs(p[4] - p[3]) + `%;
				    `;
                break;

            default:
                p[3] = p[2];
                css += `
				    border-radius: 50%;
				    border: 3px solid gray;
				    width: 25px;
				    height: 25px;
				    `;
                break;
        }


        // if (g_mark.gallery) {
        //     x = _viewer.image.width * (x / 100) + 'px';
        //     y = _viewer.image.height * (y / 100) + 'px';
        //     css = `margin-top: ` + $(_viewer.image).offset().top + `px;margin-left: ` + $(_viewer.image).offset().left + `px;`;
        // } 
        var dot = $(`<span class='img-mark-dots' data-toggle="tooltip" data-title="` + data.t + `" data-placement="bottom" data-key="` + key + `" style="` + css + `" data-action="dot_click"></span>`).appendTo(g_mark.gallery ? '.viewer-canvas' : '#div_markImg');
        dot.css({
            display: '',
            left: p[1] + '%',
            top: p[3] + '%',
        });

        if (isNew) {
            dot.click();
            if (data.t != '') {
                $('[data-action="dot_apply"]').click();
            } else {
                g_mark.div.find('textarea').focus();
            }
        }
    },
}

g_mark.init();

function modalImgClick(ev) {
    if (g_mark.markMode == 'n') {
        var text = prompt('输入评论');
        if (text != undefined && text.length) {
            var r = 25 / 2;
            g_mark.newMark(new Date().getTime(), {
                t: text,
                a: 'n_' + getPosX(ev.offsetX - r) + '_' + getPosY(ev.offsetY - r)
            }, true);
        }
    }
}

function getPosX(x) {
    return (x / $('#div_markImg').width() * 100).toFixed(2)
}

function getPosY(y) {
    return (y / $('#div_markImg').height() * 100).toFixed(2)
}


function getTextWithPrompt(event, title) {
    event.preventDefault(true);
    event.stopPropagation();
    var m = prompt(title, event.srcElement.value);
    if (m != undefined) {
        event.srcElement.value = m;
    }
}

var g_b_area;
var g_area;
var g_areaTimer;

$(document)
    .on('mousedown', '#div_markImg img', (event) => {
        if (!g_mark.markMode) return;
        g_b_area = true;
        g_areaTimer = setTimeout(() => {
            g_areaTimer = undefined;
            if (g_b_area) {
                setStart(event.currentTarget, event);
            }
        }, 1000);
    })
    .on('mouseup', (event) => {
        if (!g_mark.markMode) return;
        if (g_b_area) {
            g_b_area = false;
            if (!g_areaTimer) setEnd(event);
        }
    })
    .on('touchstart', '#div_markImg img', (event) => {
        if (!g_mark.markMode) return;

        g_b_area = true;
        g_areaTimer = setTimeout(() => {
            g_areaTimer = undefined;
            if (g_b_area) {
                setStart(event.currentTarget, event);
            }
        }, 1000);
    })
    .on('touchend', (event) => {
        if (!g_mark.markMode) return;

        if (g_b_area) {
            g_b_area = false;
            if (!g_areaTimer) setEnd(event);
        }
    })
    .on('mousemove', (event) => {
        if (!g_mark.markMode) return;

        if (g_b_area & !g_areaTimer && g_area) {
            setSize(event.currentTarget, event);
        }
    })
    .on('touchmove', (event) => {
        if (!g_mark.markMode) return;

        if (g_b_area & !g_areaTimer && g_area) {
            setSize(event.currentTarget, event);
        }
    })


function setStart(dom, ev) {
    if (g_mark.markMode != 's' && g_mark.markMode != 'c') {
        return;
    }
    var x, y, tx, ty;
    if (ev.touches) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
    } else {
        x = ev.clientX;
        y = ev.clientY;
    }
    g_area = {
        x: x,
        y: y,
    };
    $('#area_select').css({
        left: x,
        top: y,
        display: 'unset'
    });

}

function setSize(dom, ev) {
    var x, y, w, h;
    if (ev.touches) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
    } else {
        x = ev.clientX;
        y = ev.clientY;
    }

    var area = $('#area_select');
    if (g_area.x > x) { // x向左
        area.css('left', x);
    }
    if (g_area.y > y) { // x向上
        area.css('top', y);
    }

    w = Math.abs(x - g_area.x);
    h = Math.abs(g_area.y - y);
    area.css({
        width: w,
        height: h,
    });
}

function setEnd(ev) {
    g_b_area = false;
    delete g_area;
    var text = prompt('请输入说明');
    if (typeof(text) != 'string' || !text.length) return;
    var area = $('#area_select');
    var offset1 = area.offset();
    var offset2 = $('#div_markImg').offset();
    var x = offset1.left - offset2.left;
    var y = offset1.top - offset2.top;
    g_mark.newMark(new Date().getTime(), {
        t: text,
        a: g_mark.markMode + '_' + getPosX(x) + '_' + getPosX(x + area.width()) + '_' + getPosY(y) + '_' + getPosY(y + area.height())
    }, true);
    area.css({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        display: 'none'
    });
}