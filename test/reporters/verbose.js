'use strict';
// Force consistent and high-fidelity logs.
process.env.FORCE_COLOR = 3;
Object.defineProperty(process, 'platform', {value: 'darwin', enumerable: true, configurable: true});

const fs = require('fs');
const path = require('path');
const lolex = require('lolex');
const replaceString = require('replace-string');
const test = require('tap').test;
const TTYStream = require('../helper/tty-stream');
const report = require('../helper/report');
const VerboseReporter = require('../../lib/reporters/verbose');

lolex.install({
	now: new Date(2014, 11, 19, 17, 19, 12, 200).getTime(),
	toFake: [
		'Date'
	]
});

const run = type => t => {
	const logFile = path.join(__dirname, `verbose.${type.toLowerCase()}.log`);

	const tty = new TTYStream(200);
	const reporter = Object.assign(new VerboseReporter({color: true, watching: type === 'watch'}), {
		stream: tty
	});
	return report[type](reporter)
		.then(() => {
			tty.end();
			return tty.asBuffer();
		})
		.then(buffer => {
			const sanitized = replaceString(replaceString(buffer.toString('utf8'), process.cwd(), '~'), '\\', '/')
				.replace(/slow (\d+ms)/g, 'slow (000ms)');

			let existing = null;
			try {
				existing = fs.readFileSync(logFile, 'utf8');
			} catch (err) {}
			if (existing === null || process.env.UPDATE_REPORTER_LOG) {
				fs.writeFileSync(logFile, sanitized);
				existing = sanitized;
			}

			t.is(sanitized, existing);
		});
};

test('verbose reporter - regular run', run('regular'));
test('verbose reporter - failFast run', run('failFast'));
test('verbose reporter - second failFast run', run('failFast2'));
test('verbose reporter - only run', run('only'));
test('verbose reporter - watch mode run', run('watch'));
