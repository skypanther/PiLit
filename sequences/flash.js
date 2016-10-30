/*
 * Christmas lights controller - Tim Poulsen
 * License MIT
 *
 */

exports.config = {
	description: "Flash - lights go on and off at your minimum interval time for the number of times you specify then stay on",
	filename: "flash",
	questions: [{
		questionText: "How many times should the lights flash before becoming steady?",
		default: 3
	}]
};

exports.generate = function (config, options) {

};