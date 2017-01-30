/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 *
 */

var rpio = require('rpio'),
	fs = require("fs"),
	path = require("path");

const OFF = rpio.HIGH;
const ON = rpio.LOW;

var pins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24];
var turnOffShowAt;

turnOffAllRelays();

if (process.argv[2]) {
	var showToRun = process.argv[2];
	if (showToRun === 'off') {
		turnOffAllRelays();
	} else if (showToRun === 'on') {
		turnOnAllRelays();
	} else {
		runShow(process.argv[2]);
	}
} else {
	var fields = require("fields");
	var shows = fs.readdirSync('shows');
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

if (process.argv[3] && !isNaN(process.argv[3])) {
	// turn off the show after x hours
	var now = new Date();
	var futureMS = Math.round(parseFloat(process.argv[3]) * 60 * 60 * 1000);
	turnOffShowAt = now.getTime() + futureMS;
}

function runShow(showName) {
	var filePath = path.join('shows', showName);
	if (!fs.existsSync(filePath)) {
		console.error('No show file by the name ' + showName);
		process.exit(1);
	}
	var showFile = fs.readFileSync(filePath, 'utf8'),
		show = JSON.parse(showFile),
		i = 0;

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
		if (turnOffShowAt) {
			if ((new Date()).getTime() > turnOffShowAt) {
				clearInterval(looper);
				looper = undefined;
				turnOffAllRelays();
				// the app sometimes exits before the relays are turned off
				// so use the rpio module's sleep function to keep it alive
				rpio.sleep(10);
				console.log("Good night");
			}
		}
	}, show.interval);
}

function drawRow(arr) {
	for (var i=0, j=arr.length; i<j; i++) {
		rpio.write(pins[i], arr[i] ? ON : OFF);
	}
}

function turnOffAllRelays() {
	for (var i=0, j=pins.length; i<j; i++) {
		rpio.write(pins[i], rpio.OUTPUT, OFF);
	}
}

function turnOnAllRelays() {
	for (var i=0, j=pins.length; i<j; i++) {
		rpio.write(pins[i], rpio.OUTPUT, ON);
	}
}