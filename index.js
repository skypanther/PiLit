/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 *
 */

var _ = require("lodash"),
	axel = require('axel'),
	clear = require("clear"),
	colors = require("colors"),
	fields = require("fields"),
	rpio = require('rpio'),
	fs = require("fs"),
	path = require("path");

var shows = fs.readdirSync('shows');

if (process.argv[2]) {
	runShow(process.argv[2]);
} else {
	fields.set([
		fields.select({
			promptLabel: 'Which show would you like to run?',
			options: shows,
			numbered: true
		})
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			runShow(value[0]);
		}
	});

}

function runShow(showName) {
	var filePath = path.join('shows', showName);
	if (!fs.existsSync(filePath)) {
		console.error('No show file by the name ' + showName);
		process.exit(1);
	}
	var showFile = fs.readFileSync(filePath, 'utf8'),
		show = JSON.parse(showFile);
	var i = 0,
		interval = show.interval;

	var looper = setInterval(function () {
		if (i < show.show.length) {
			drawRow(show.show[i]);
			i++;
		} else {
			if (!show.loop) {
				// show isn't set up to run continously
				clearInterval(looper);
				looper = undefined;
			} else {
				i = 0;
			}
		}
	}, interval);
}