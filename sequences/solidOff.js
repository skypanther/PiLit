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
	description: "Solid OFF - lights off for the duration you specify"
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

var timeRemaining, channelsToControl;

function _getChannelList(show) {
	fields.set([
		fields.text({
			desc: 'Enter the list of channels, separated by commas or as a range (1-4).',
			promptLabel: 'Channels',
			validate: function (value) {
				if (!isNaN(value) || value.split(',').length > 1) {
					channelsToControl = value;
					timeRemaining = _calculateTimeRemaining(channelsToControl, show);
					return true;
				} else if (value.split('-').length === 2) {
					var range = value.split('-').sort();
					var chans = [];
					for (var i = range[0], j = range[1]; i <= j; i++) {
						chans.push(i);
					}
					channelsToControl = chans.join(',');
					timeRemaining = _calculateTimeRemaining(channelsToControl, show);
					return true;
				} else {
					return false;
				}
			}
		}),
	]).prompt(function (err, value) {
		if (err) {
			console.error('There was an error!\n' + err);
		} else {
			_getDuration(show, channelsToControl);
		}
	});
}

function _getDuration(show, channels) {
	fields.set([
		fields.text({
			desc: 'You can turn them off for up to ' + timeRemaining + ' seconds.',
			promptLabel: 'Keep off for how many seconds?',
			validate: function (value) {
				return !isNaN(value) && value <= timeRemaining;
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
	// for each channel, loop through show.show starting at offset of show.lastUpdateRow and set to 1
	channels.split(',').forEach(function (chan) {
		var startOffset = show.lastUpdateRow[chan - 1] * (1 / show.interval);
		var stopAt = duration * 1000 * (1 / show.interval);
		for (startOffset; startOffset < stopAt; startOffset++) {
			show.show[startOffset][chan - 1] = 0;
		}
		show.lastUpdateRow[chan - 1] = stopAt;
	});
	var filePath = path.join('shows', show.title);
	fs.writeFile(filePath, JSON.stringify(show), (err) => {
		if (err) throw err;
		console.log('SUCCESS!');
		nextSequence();
	});

}