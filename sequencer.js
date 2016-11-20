/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 * Sequencer - start here to generate the specific sequences of your show
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
	random = require("./sequences/random");

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
	value: "random",
	module: random,
	label: random.config.description
}, {
	value: "exit",
	module: undefined,
	label: "Exit - stop setting light sequences"
}, ];

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
		selectSequence(value);
	}
});

function selectSequence(showName) {
	fields.set([
		fields.select({
			promptLabel: 'Sequence to program',
			numbered: true,
			options: sequences
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err + ", " + JSON.stringify(value));
		} else {
			if (value[0] === 'exit') {
				process.exit(0);
			}
			var sequencer = _.find(sequences, {
				value: value[0]
			});
			if (sequencer && sequencer.module) {
				sequencer.module.generate(showName, selectSequence);
			} else {
				console.error('There was an error!\n');
			}
		}
	});
}