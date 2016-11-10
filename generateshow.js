/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 * Generate a starting show file, which you will then edit
 * using the various other scripts included with this package
 */

// node modules
var clear = require('clear'),
	colors = require('colors'),
	fields = require('fields'),
	fs = require('fs'),
	path = require('path');

// local helpers / libraries
var banner = require('./lib/banner');

clear();
banner.show();

console.log("\nLet's generate a Christmas light show!\n".bold.white);
console.log("This script generates a starting show file that will turn on all of".white);
console.log("your lights for the duration of your show. From there, you will use".white);
console.log("the xxxxx script to create the actual light sequences of your show.\n".white);

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
	// will store the last row that has been updated with actual show info
	config.lastUpdateRow = Array(config.channels).fill(0);
	// create our starting show file
	config.show = makeShowArray(config);
	var filePath = path.join('shows', config.title);
	fs.writeFile(filePath, JSON.stringify(config), (err) => {
		if (err) throw err;
		console.log('SUCCESS!');
		console.log('');
		console.log('Now, use the `sequencer.js` script to begin generating the sequences for your show.');
	});
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