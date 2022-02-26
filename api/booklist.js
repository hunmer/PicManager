
const fs = require('fs');
const path = require('path');

var res = {};
walkSync('H:/download1', file => {
	var con = fs.readFileSync(file, 'utf8');
	var page = cutString(con, "var pagenum = '", "';");
	if(page != ''){
		var url = cutString(con, "var thumb = '", "';");
		var name = cutString(con, '"name":"','"');
		var id = cutString(con, '"residstr":"', '"');
		res[id] = {
			i: url,
			n: name,
			p: page
		}
		// console.log(url, page, name);
		// process.exit();
	}
});
fs.writeFileSync('result.json', JSON.stringify(res));


function cutString(s_text, s_start, s_end, i_start = 0) {
    i_start = s_text.indexOf(s_start, i_start);
    if (i_start === -1) return '';
    i_start += s_start.length;
    i_end = s_text.indexOf(s_end, i_start);
    if (i_end === -1) return '';
    return s_text.substr(i_start, i_end - i_start);
}



function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}