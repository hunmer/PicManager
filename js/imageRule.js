
// console.log(getImageUrl('https://i.pinimg.com/originals/e8/e3/0c/e8e30cd06cf6de81d7d97c8af69ffb2f.png'))
function getImageUrl(url, thumb = true){
	var res = {};
	https://i.pinimg.com/236x/e8/e3/0c/e8e30cd06cf6de81d7d97c8af69ffb2f.jpg
	if(url.indexOf('i.pinimg.com/') != -1){
		return thumb ? url.replace('/originals/', '/236x/') : url.replace('/236x/', '/originals/');
	}
	return url;
}