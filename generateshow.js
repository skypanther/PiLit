/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 * Generate a starting show file, which you will then edit
 * using the various other scripts included with this package
 */

/*

How long a show (seconds, default 600)?
Should it loop? (Y/n) 
Time interval (minimum time a light could be on or off)? (number, ms, default of 250ms)
How many channels? (number, integer, default of 16)
 */

// node modules
var clear = require('clear'),
	colors = require('colors'),
	fields = require('fields');
// local helpers / libraries
var banner = require('./lib/banner');

clear();
banner.show();

console.log("\nLet's generate a Christmas light show!\n".bold.white);
console.log("This script generates a starting show file that will turn on all of".white);
console.log("your lights for the duration of your show. From there, you will use".white);
console.log("this tool's other scripts to create the actual sequences.\n".white);

fields.setup({
	style: {
		title: 'white',
		desc: 'yellow'
	}
});

fields.set([
	fields.text({
		default: 'Christmas show ' + new Date().getFullYear(),
		promptLabel: 'What is the name of your show?',
		validate: function (value) {
			return /^\w+/.test(value);
		}
	}),
	fields.text({
		default: 600,
		promptLabel: 'How long is your show? Enter a time in seconds.',
		validate: function (value) {
			return /^\d+$/.test(value);
		}
	}),
	fields.select({
		promptLabel: 'Should the show loop continuously?',
		default: 'yes',
		display: 'prompt',
		options: ['__y__es', '__n__o'],
	}),
	fields.text({
		desc: 'What is the minimum time a light could be on or off in milliseconds (thousandths of a second)?',
		default: 250,
		promptLabel: 'Interval',
		validate: function (value) {
			return /^\d+$/.test(value);
		}
	}),
	fields.text({
		desc: 'How many channels is your relay controller going to control? ',
		default: 16,
		promptLabel: 'Channels',
		validate: function (value) {
			return /^\d+$/.test(value) && parseInt(value) > 0;
		}
	}),
]).prompt(function (err, value) {
	if (err) {
		console.error('There was an error!\n' + err);
	} else {
		var config = {
			title: value[0],
			duration: parseInt(value[1]),
			loop: value[2] === 'yes',
			interval: parseInt(value[3]),
			channels: parseInt(value[4])
		}
		createShow(config);
	}
});

function createShow(config) {
	var showConfig = {
			title: config.title,
			interval: config.interval,
			show: makeShowArray(config)
		}
		// write it all to the file by the name of title
}

function makeShowArray(config) {
	var row = Array(config.channels).fill(1);
	// duration is in seconds, interval in ms
	var numRows = config.duration * 1000 / config.interval;
	var theShow = [];
	while (numRows > 0) {
		theShow.push(row);
		numRows--;
	}
	return theShow;
}