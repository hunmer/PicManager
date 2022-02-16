var g_page = {
	lists: {},
	loading: {},
	getOpts: (name) => {
		return g_page.lists[name] || {}
	},
	setList: (name, opts) => {
		g_gallery.clearGallery();
		opts = Object.assign({hasMore: true}, opts);
		var element = $(opts.element);
		if(!element.length) return;
		 $(opts.element).on('scroll', function(event) {
            var scrollTop = this.scrollTop;
            if(scrollTop == 0){
            	g_page.prevPage(name)
                return;
            }
            if(scrollTop + this.offsetHeight + 50 >= this.scrollHeight){
            	if(g_page.loading[name] && g_page.loading[name] >= new Date().getTime()){
            		//console.log('还在加载中...');
            		return;
            	}
                g_page.nextPage(name);
            }
        });
		 g_page.lists[name] = opts;
	},
	get: (name) => {
		if(g_page.lists[name]) return g_page.lists[name];
	},
	nextPage: async (name) => {
		// todo 加载条
		var d = g_page.get(name);
		if(d){
            g_page.loading[name] = new Date().getTime() + d.timeout;

			var keys = Object.keys(d.datas);
			var max = keys.length - d.lastIndex;
			if(max == 0){
				if(d.requestData){ // 网络加载
            		d.requestData();
            		return;
        		}
				d.hasMore = false;
    			//toastPAlert('到底部啦...', 'alert-secondary', 500);
				return;
			}
    		//toastPAlert('loading...', 'alert-primary', 500);
			var load = Math.min(d.pagePre,max);

			var h = '';
			for(var i=0;i<load;i++){
				var index = i+d.lastIndex;
				var r = await d.parseItem(index, keys[index], d.datas[keys[index]]);
				if(r) h+= r;
			}
			if(h.length){
				d.hasMore = !load < d.pagePre;
				if(!d.hasMore){ // 到底了
					h+=d.bottomHtml; // 顶部html
				}
				// delete g_page.loading[name] // 图片加载完毕才算加载完毕
				d.done(h);
			}
			d.lastIndex+=load;
		}
	},
	prevPage: () => {

	}
}
