/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 * Generate a starting show file, which you will then edit
 * using the various other scripts included with this package
 */

/*

- name of show (check that it exists)
- type of sequence to generate
- then requires in the specific module, which has these methods:
	- prompt(config, currentAnswers) - 
		read show file, determine end points for each channel, then
		prompt for which channels, how long, and
		any sequence specific questions
	- generate(callback) 
		takes that config info / user responses
		generates the necessary changes / updates to show
		calls callback, passed from here, that actually saves the updated file
 */

// node modules
var _ = require("lodash"),
	clear = require("clear"),
	colors = require("colors"),
	fields = require("fields"),
	fs = require("fs"),
	path = require("path");


// require in our sequences
var twinkle = require("./sequences/twinkle"),
	solidOn = require("./sequences/solidOn"),
	solidOff = require("./sequences/solidOff"),
	marchLeft = require("./sequences/marchLeft"),
	marchRight = require("./sequences/marchRight"),
	onOff = require("./sequences/onOff"),
	flash = require("./sequences/flash");

var shows = fs.readdirSync('shows');

var sequences = [{
	value: "twinkle",
	module: twinkle,
	label: twinkle.config.description
}, {
	value: "solidOn",
	module: solidOn,
	label: solidOn.config.description
}, {
	value: "solidOff",
	module: solidOff,
	label: solidOff.config.description
}, {
	value: "marchLeft",
	module: marchLeft,
	label: marchLeft.config.description
}, {
	value: "marchRight",
	module: marchRight,
	label: marchRight.config.description
}, {
	value: "onOff",
	module: onOff,
	label: onOff.config.description
}, {
	value: "flash",
	module: flash,
	label: flash.config.description
}, ];

fields.set([
	fields.select({
		promptLabel: 'Which show are you programming?',
		options: shows,
		numbered: true
	}),
	fields.select({
		promptLabel: 'Sequence to program',
		numbered: true,
		options: sequences
	}),

	// fields.text({
	// 	promptLabel: 'What is the name of your show?',
	// 	validate: function (value) {
	// 		return /^\w+/.test(value);
	// 	}
	// }),
	// fields.text({
	// 	default: 600,
	// 	promptLabel: 'How long is your show? Enter a time in seconds.',
	// 	validate: function (value) {
	// 		return /^\d+$/.test(value);
	// 	}
	// }),
	// fields.select({
	// 	promptLabel: 'Should the show loop continuously?',
	// 	default: 'yes',
	// 	display: 'prompt',
	// 	options: ['__y__es', '__n__o'],
	// }),
	// fields.text({
	// 	desc: 'What is the minimum time a light could be on or off in milliseconds (thousandths of a second)?',
	// 	default: 250,
	// 	promptLabel: 'Interval',
	// 	validate: function (value) {
	// 		return /^\d+$/.test(value);
	// 	}
	// }),
	// fields.text({
	// 	desc: 'How many channels is your relay controller going to control? ',
	// 	default: 16,
	// 	promptLabel: 'Channels',
	// 	validate: function (value) {
	// 		return /^\d+$/.test(value) && parseInt(value) > 0;
	// 	}
	// }),
]).prompt(function (err, value) {
	if (err) {
		console.error('There was an error!\n' + err);
	} else {
		console.log(value)
	}
});