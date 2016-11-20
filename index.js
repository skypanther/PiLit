/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 *
 */

var _ = require("lodash"),
	colors = require("colors"),
	fields = require("fields"),
	rpio = require('rpio'),
	fs = require("fs"),
	path = require("path");

const OFF = rpio.HIGH;
const ON = rpio.LOW;

var pins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24];
pins.forEach(function (pin) {
	rpio.open(pin, rpio.OUTPUT, ON);
});

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

function drawRow(arr) {
	arr.forEach(function (pinValue, index) {
		console.log("Setting pin " + index + (pinValue ? "on" : "off"));
		rpio.write(pins[index], pinValue ? ON : OFF);
	});
}