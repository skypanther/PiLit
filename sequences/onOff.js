/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 */

exports.config = {
	description: "Alternating on/off - lights go on and off at the frequency you specify",
	filename: "onOff",
	questions: [{
		questionText: "Time in seconds should the lights be on; will turn off for the same amount of time",
		default: "1 second"
	}]
};

/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 */

var _ = require("lodash"),
	clear = require("clear"),
	colors = require("colors"),
	fields = require("fields"),
	fs = require("fs"),
	path = require("path");

exports.config = {
	description: "Alternating on/off - lights go on and off at the frequency you specify"
};

var nextSequence;
exports.generate = function (config, callback) {
	if (typeof callback === 'function') {
		nextSequence = callback;
	} else {
		nextSequence = function () {};
	}

	if (!config || !config.length || typeof config[0] !== 'string') {
		console.error("There was an error");
		process.exit(0);
	}
	var filePath = path.join('shows', config[0]);
	if (!fs.existsSync(filePath)) {
		console.error("The show file does not exist.");
		process.exit(0);
	}
	var showFile = fs.readFileSync(filePath, 'utf8'),
		show;
	if (showFile) {
		show = JSON.parse(showFile);
		_getChannelList(show);
	}
};

function _calculateTimeRemaining(channels, show) {
	var lastRow = [],
		channelsArray = channels.split(','),
		maxChannel;
	show.lastUpdateRow.forEach(function (ch, index) {
		if (channelsArray.indexOf(index + 1)) {
			lastRow.push(ch);
		}
	});
	maxChannel = Math.max.apply(null, lastRow);
	return (show.show.length - maxChannel) / (1 / show.interval) / 1000;
}

var timeRemaining;

function _getChannelList(show) {
	fields.set([
		fields.text({
			desc: 'Enter a pair of channels to alternate between, separated by commas.',
			promptLabel: 'Channels',
			validate: function (value) {
				if (typeof value !== 'string' || value.indexOf(',') === -1 || value.split(',').length > 2) {
					return false;
				}
				channelsToControl = value;
				timeRemaining = _calculateTimeRemaining(channelsToControl, show);
				return true;
			}
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			_getOnTime(show, value[0]);
		}
	});
}

function _getOnTime(show, channels) {
	fields.set([
		fields.text({
			desc: 'How long should the lights stay on (or off) in each cycle? (Must be evenly divisible by ' + show.interval + ' ms)',
			promptLabel: 'Milliseconds',
			validate: function (value) {
				if (isNaN(value) || value < show.interval || value % show.interval !== 0) {
					return false;
				}
				return true;
			}
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			_getDuration(show, channels, value[0]);
		}
	});
}

function _getDuration(show, channels, onTime) {
	fields.set([
		fields.text({
			desc: 'You can alternate these lights for up to ' + timeRemaining + ' seconds.',
			promptLabel: 'Duration',
			validate: function (value) {
				return value <= timeRemaining;
			}
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			_generateAndSave(show, channels, onTime, value[0]);
		}
	});
}

function _generateAndSave(show, channels, onTime, duration) {
	// starting at lastUpdateRow, loop through the channels, mark all off, except the one
	var chans = channels.split(',');
	chans[0] = chans[0] - 1;
	chans[1] = chans[1] - 1;
	var startOffset = show.lastUpdateRow[chans[0]];
	var stopAt = duration * 1000 / show.interval;
	var onOff = 1;
	var steps = onTime / show.interval; // multiples of interval to repeat the pattern
	var s = 1;
	for (startOffset; startOffset < stopAt; startOffset++) {
		var row = show.show[startOffset];
		row[chans[0]] = onOff;
		row[chans[1]] = (onOff ? 0 : 1); // set opposite of the other
		if (s >= steps) {
			onOff = (onOff ? 0 : 1); // then toggle between 1 and 0 for the next loop
			s = 0;
		}
		s++;
	}
	chans.forEach(function (ch) {
		show.lastUpdateRow[ch - 1] = stopAt;
	});
	var filePath = path.join('shows', show.title);
	fs.writeFile(filePath, JSON.stringify(show), (err) => {
		if (err) throw err;
		console.log('SUCCESS!');
		nextSequence();
	});
}