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

const OFF = rpio.HIGH;
const ON = rpi.LOW;

var pins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24];
pins.forEach(function (pin) {
	rpio.open(pin, rpio.OUTPUT, OFF);
});

fields.set([
	fields.text({
		default: 16,
		promptLabel: 'How many channels to test?',
		validate: function (value) {
			return /^\d+$/.test(value) && value <= 16;
		}
	}),
]).prompt(function (err, value) {
	if (err) {
		console.error('There was an error!\n' + err);
	} else {
		testSequence(value);
	}
});

function testSequence(num) {
	var pin = 0;
	var looper = setInterval(function () {
		let p = pin;
		if (p === num) {
			clearInterval(looper);
			looper = undefined;
		}
		rpio.write(pins[p], ON);
		pin++;
		setTimeout(function () {
			rpio.write(pins[p], OFF);
		}, 1000);
	}, 1250);
}