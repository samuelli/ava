'use strict';
require('../helper/fix-reporter-env')();

const path = require('path');
const test = require('tap').test;
const TTYStream = require('../helper/tty-stream');
const report = require('../helper/report');
const TapReporter = require('../../lib/reporters/tap');

const run = type => t => {
	const logFile = path.join(__dirname, `tap.${type.toLowerCase()}.log`);

	const tty = new TTYStream({
		columns: 200,
		sanitizers: [report.sanitizers.cwd, report.sanitizers.posix, report.sanitizers.stacks]
	});
	const reporter = Object.assign(new TapReporter(), {
		streams: {stderr: tty, stdout: tty}
	});
	return report[type](reporter)
		.then(() => {
			tty.end();
			return tty.asBuffer();
		})
		.then(buffer => report.assert(t, logFile, buffer));
};

test('verbose reporter - regular run', run('regular'));
test('verbose reporter - failFast run', run('failFast'));
test('verbose reporter - second failFast run', run('failFast2'));
test('verbose reporter - only run', run('only'));
