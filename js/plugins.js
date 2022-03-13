var g_plugins = {
    list: {
        pose: {
        	name: "人体模型",
        	res: [
	            { url: './js/pose/main.js', type: 'js' }
	        ]
	     },
         book: {
            name: "绘画书籍",
            icon: 'fa-book',
            res: [
                { url: './js/book/main.js', type: 'js' }
            ]
         }
    },
    loadScripts: function(callback) {
        var cnt = 0;
        var max = 0;
        for (var name in this.list) {
            var item = this.list[name];
            max += item.res.length;
            loadRes(item.res, (i) => {
                cnt += i;
                console.log(name + ' 加载成功');
                if (cnt == max) {
                    callback && callback();
                }
            }, false)
        }
    },
    init: function() {


        this.loadScripts(() => {
        	 registerAction('loadPlugin', (dom, action) => {
        	 	$('[data-plugin].text-primary').removeClass('text-primary');
        	 	dom.classList.add('text-primary');
        	 	doAction(dom, 'loadPlugin_'+dom.dataset.plugin)
		     });

            var h = ``;
            for (var key in g_plugins.list) {
            	var d =  g_plugins.list[key];
                h += `
		            <a data-action="loadPlugin" data-plugin="${key}" class="sidebar-link sidebar-link-with-icon row` + (g_database.folder == key ? ' active_text' : '') + `">
		                    <span class="sidebar-icon col-auto">
		                        <i class="fa ${d.icon || 'fa-plug'}" aria-hidden="true"></i>
		                    </span>
		                    <span class="col plugin-name">${d.name}</span>
		                    <span class="col text-right"></span>
		                </a>
		             `;
            }
            $('#plugins').html(h);
        });
    },
}

g_plugins.init();