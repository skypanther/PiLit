/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 *	Not sure what a Cylon is? Check it out https://www.youtube.com/watch?v=MKdwe9wJsY4


--> INCOMPLETE, NOT WORKING <--

 */

var _ = require("lodash"),
	clear = require("clear"),
	colors = require("colors"),
	fields = require("fields"),
	fs = require("fs"),
	path = require("path");

exports.config = {
	description: "March left and right, like the original Cylon red eye"
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
	channelsArray.forEach(function (ch) {
		lastRow.push(show.lastUpdateRow[ch - 1]);
	});
	maxChannel = Math.max.apply(null, lastRow);
	return (show.show.length - maxChannel) / (1 / show.interval) / 1000;
}

var timeRemaining;

function _getChannelList(show) {
	fields.set([
		fields.text({
			desc: 'Enter a list of at least 3 channels to cylon between, separated by commas.',
			promptLabel: 'Channels',
			validate: function (value) {
				if (typeof value !== 'string' || value.indexOf(',') === -1 || value.split(',').length < 3) {
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
			_getDuration(show, value[0]);
		}
	});
}

function _getDuration(show, channels) {
	fields.set([
		fields.text({
			desc: 'You can cylon these lights for up to ' + timeRemaining + ' seconds.',
			promptLabel: 'Cylon for how many seconds?',
			validate: function (value) {
				return value <= timeRemaining;
			}
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			_generateAndSave(show, channels, value[0]);
		}
	});
}

function _generateAndSave(show, channels, duration) {
	// starting at lastUpdateRow, loop through the channels, mark all off, except the one
	var chans = channels.split(',');
	var channelOffset = 0;
	var sweepingLeft = false;
	var startOffset = show.lastUpdateRow[chans[0] - 1];
	var stopAt = duration * 1000 / show.interval;
	var lightThatIsOn = chans[channelOffset];
	for (startOffset; startOffset < stopAt; startOffset++) {
		var row = show.show[startOffset];
		chans.forEach(function (ch) {
			row[ch - 1] = 0;
		});
		if (sweepingLeft) {
			channelOffset--;
			if (channelOffset < 1) {
				sweepingLeft = false;
			}
			lightThatIsOn = chans[channelOffset];
		} else {
			channelOffset++;
			if (channelOffset === rows.length - 1) {
				sweepingLeft = true;
			}
			lightThatIsOn = chans[channelOffset];
		}
		row[lightThatIsOn] = 1;
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