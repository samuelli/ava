'use strict';
const lolex = require('lolex');

module.exports = () => {
	// Fix timestamps.
	lolex.install({
		now: new Date(2014, 11, 19, 17, 19, 12, 200).getTime(),
		toFake: [
			'Date'
		]
	});

	// Force consistent and high-fidelity logs.
	process.env.FORCE_COLOR = 3;
	Object.defineProperty(process, 'platform', {value: 'darwin', enumerable: true, configurable: true});
};
