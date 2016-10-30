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

exports.generate = function (config, options) {

};