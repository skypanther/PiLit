/*

Test your show with testshow.js

*/

var _ = require("lodash"),
	axel = require('axel'),
	clear = require("clear"),
	colors = require("colors"),
	fields = require("fields"),
	fs = require("fs"),
	path = require("path");

var boxWidth = 4,
	boxHeight = 2,
	colors = ["#C7C101", "#E39E03", "#F6780F", "#FE5326", "#FB3244", "#ED1868", "#D5078E", "#B601B3", "#9106D3", "#6B16EC", "#472FFA", "#2850FE", "#1175F7", "#039BE5", "#01BECA", "#0ADCA8"],
	left = 2;

var shows = fs.readdirSync('shows');

fields.set([
	fields.select({
		promptLabel: 'Which show are you programming?',
		options: shows,
		numbered: true
	})
]).prompt(function (err, value) {
	if (err) {
		console.error('There was an error!\n' + err);
	} else {
		testSequence(value);
	}
});


function testSequence(theShow) {
	axel.clear();
	console.log("Testing show: ".green + theShow[0].white);
	var filePath = path.join('shows', theShow[0]);
	var showFile = fs.readFileSync(filePath, 'utf8'),
		show = JSON.parse(showFile);
	var i = 0,
		interval = show.interval;

	var looper = setInterval(function () {
		if (i < show.show.length) {
			drawRow(show.show[i]);
			i++;
		} else {
			clearInterval(looper);
			looper = undefined;
			axel.cursor.restore();
		}
	}, interval);
}

function drawRow(arr) {
	colors.forEach(function (color, index) {
		var rgb = hexToRgb(color);
		if (arr[index]) {
			axel.bg(rgb.r, rgb.g, rgb.b);
		} else {
			axel.bg(0, 0, 0);
		}
		axel.box(left + index * 5, 4, boxWidth, boxHeight);
	});
}

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	// from http://stackoverflow.com/a/5624139/292947
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}