// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer  } = require('electron');

// const BrowserWindow = remote.BrowserWindow

contextBridge.exposeInMainWorld('_api', {
	method(data) {
		ipcRenderer.send('method', data);
	}
})

ipcRenderer.on('method', (event, arg) => {
  console.log(arg);
});
// ipcRenderer.send('message-from-renderer', '渲染进程发送消息过来了');

window.addEventListener('DOMContentLoaded', () => {
 	
})

