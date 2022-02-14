var g_socket = {
    connect: undefined,
    query: [],
    revices: {},
    registerRevice: (name, callback) => {
        g_socket.revices[name] = callback;
    },

    init: () => {
    	var parseData = (d) => {
    		console.log(d);
    		var now = new Date().getTime();
    		var folders = [];
    		if(d.folderID){
    			if(d.folderID == 'choose'){
    				// 选择目录	
    				// folders = g_database.chooseFolders(callback);
    				return;
    			}else{
    				// 指定目录
    				folders = [d.folderID];
    			}
    		}
			var data = {};
    		switch(d.type){
    			// eagle
    			case 'import-images':
    				var urls = [];
    				for(var img of JSON.parse(d.images)){
    					data[getMD5(img.src)] = {
					 		n: img.title,
							i: img.src,
							u: d.url,
							c: now,
							w: img.width,
							h: img.height,
					 	}
					 	urls.push(img.src);
    				}
    				g_autojs.addImgFromUrls(urls, data);
    				return;
				case 'image':
				case 'screen capture':
				// 从脚本收到的
				case 'images': 
					var items = d.items || [d];
					for(var d of items){
						var d1 = {
					 		n: d.title,
							i: d.src,
							u: d.url,
							t: d.tag,
							c: now
					 	};
					 	if(d.props){
					 		Object.assign(d1, d.props); // 自定义属性
					 	}
						data[d.md5 || getMD5(d.src)] = d1;
					}
					break;

				default:
					return;
			}
			console.log(data);
			g_database.importImages(data, (i) => {

			}, folders.length == 0 ? {} : {folder: folders[0]});
			// todo 多个目录怎么动态添加到当前展示?
			// 保存到目录
			for(var folder of folders){
				g_database.saveToFolder(folder, Object.keys(data));
			}
    	}
    	
    	// 目录
        g_socket.registerRevice('listRecent', (data) => {
        	var r = {
        		status: 'success',
        		data: []
        	}
        	for(var folder of g_database.getRecentFolder()){
        		var d = g_folders[folder];
        		r.data.push({
        			id: folder,
	                name: d.name,
	                description: d.desc,
	                children: [],
	                modificationTime: d.lastSaved,
	                tags: [],
	                password: "",
	                passwordTips: "",
	                images: [],
	                isExpand: true,
	                newFolderName: "",
	                imagesMappings: {},
	                imageCount: d.imgs.length,
	                descendantImageCount: 0,
	                pinyin: "GONGYEFENG",
	                extendTags: []
        		})
        	}
        	g_socket.send({type: 'listRecent', data: r, key: data.key});
        });
        // 下载多图片
        g_socket.registerRevice('downloadFinish', (data) => {
        	var d = g_database.getImgData(data.oldMd5);
        	if(d){
        		 g_database.removeImgData(data.oldMd5, false); // 删除旧数据
        	}
        	d.i = data.ext.substr(1, data.ext.length - 1); // 更新文件名(扩展名)
        	g_database.saveImgData(data.newMd5, d);
        });
        //
        g_socket.registerRevice('data', (data) => {
        	// if(isApp()){
        	// 	// 如果是手机则把网址传给客户端，让客户端下载到本地
        	// 	g_autojs.log('download', data.url)
        	// 	return;
        	// }
        	  $.getJSON(data.url, function(json, textStatus) {
        	  	if(textStatus == 'success'){
        	  		parseData(json);
        	  	}
        	  });
        });
        // 其他设备上传的照片（临摹）
        g_socket.registerRevice('uploadPhotofromNetwork', (data) => {
        	if(isModalOpen('modal-custom', 'dialog_addExpFromImage')){
                g_rpg.updateImage(data.data);
                if(isModalOpen('modal-custom-1', 'dialog_uploadImagefromNetwork')){
                	halfmoon.toggleModal('modal-custom-1')
                }
            }
        });
        g_socket.registerRevice('server', (data) => {
        	var d = data.data;
        	switch(data.url){
        		case '/':
        			break;
        	}
        })

        g_socket.registerRevice('js', (data) => {
            eval(data.data);
        });
        g_socket.registerRevice('importLocalImages', (data) => {
        	g_database.importLocalImages(data.data);
        });

        g_socket.registerRevice('msg', (data) => {
            alert(data.msg);
        });
        g_socket.connect();
    },
    connect: (url) => {
        if (!url) url = 'ws://127.0.0.1:41595';
        var socket = g_socket.connection = new WebSocket(url);
        var error = (e) => {
        	console.log(e);
        	$('#serverStatus').addClass('bg-danger').removeClass('bg-success');
        	g_socket.reconnect = setTimeout(() => g_socket.connect(), 1000 * 5);
        }
        socket.onopen = () => {
        	$('#serverStatus').removeClass('bg-danger').addClass('bg-success');
            clearTimeout(g_socket.reconnect);
            for (var msg of g_socket.query) {
                g_socket.connection.send(msg);
            }
            g_socket.query = [];

            g_socket.send({
            	type: 'checkFiles',
            	resPath: g_config.clientData.imgPath,
            	paths: g_config.clientData.paths
            });

            // g_socket.send({
            // 	type: 'checkUpdate',
            // 	url: 'http://127.0.0.1/PicManager/',
            // });
        }

        socket.onmessage = (e) => {
            g_socket.onRevice(JSON.parse(e.data));
        }

        socket.onerror = error(event);
        // socket.onclose = error(e);
    },

    send: (data) => {
    	console.log(data);
        var msg = JSON.stringify(data);
        var connection = g_socket.connection;
        if (!connection || connection.readyState != 1) {
            if (g_socket.query.indexOf(msg) == -1) g_socket.query.push(msg);
            return g_socket.connect();
        }
        connection.send(msg);
    },
    onRevice: (data) => {
    	console.log(data);
        var type = data.type;  
        delete data.type;
        if (g_socket.revices[type]) {
            return g_socket.revices[type](data);
        }
        switch (type) {}
    }
}

// var enable = 0 || isMobile() && g_config.socket;
// if(enable){
	setTimeout(() => g_socket.init(), 3000);
;
	
// }