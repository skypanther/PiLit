var _ = require("lodash"),
	fs = require("fs"),
	path = require("path");


var filePath = path.join('shows', "show1");
if (!fs.existsSync(filePath)) {
	console.error('No show file by the name ' + "show1");
	process.exit(1);
}
var showFile = fs.readFileSync(filePath, 'utf8'),
	show1 = JSON.parse(showFile);

var newShow = [];
show1.show.forEach(function (row) {
	newShow.push(row);
	newShow.push(row);
});

show1.show = newShow;
show1.interval = 250;

fs.writeFile(path.join('shows', 'show3.json'), JSON.stringify(show1), (err) => {
	if (err) throw err;
	console.log('SUCCESS!');
});