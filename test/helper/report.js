'use strict';
const path = require('path');
const globby = require('globby');
const Api = require('../../api');
const Logger = require('../../lib/logger');

const run = (type, reporter) => {
	const projectDir = path.join(__dirname, '../fixture/report', type.toLowerCase());

	const api = new Api({
		failFast: type === 'failFast' || type === 'failFast2',
		failWithoutAssertions: false,
		serial: type === 'failFast' || type === 'failFast2',
		require: [],
		cacheEnable: true,
		compileEnhancements: true,
		explicitTitles: false,
		match: [],
		babelConfig: {testOptions: {}},
		resolveTestsFrom: projectDir,
		projectDir,
		timeout: undefined,
		concurrency: 2,
		updateSnapshots: false,
		snapshotDir: false,
		color: true
	});

	reporter.api = api;
	const logger = new Logger(reporter);
	logger.start();

	api.on('test-run', runStatus => {
		reporter.api = runStatus;
		runStatus.on('test', logger.test);
		runStatus.on('error', logger.unhandledError);

		runStatus.on('stdout', logger.stdout);
		runStatus.on('stderr', logger.stderr);
	});

	const files = globby.sync('*.js', {cwd: projectDir}).sort();
	if (type !== 'watch') {
		return api.run(files).then(runStatus => {
			logger.finish(runStatus);
		});
	}

	// Mimick watch mode
	return api.run(files).then(runStatus => {
		logger.finish(runStatus);

		// Don't clear
		logger.reset();
		logger.section();
		logger.reset();
		logger.start();

		return api.run(files);
	}).then(runStatus => {
		runStatus.previousFailCount = 2;
		logger.finish(runStatus);

		// Clear
		logger.clear();
		logger.reset();
		logger.start();

		return api.run(files);
	}).then(runStatus => {
		logger.finish(runStatus);
	});
};

exports.regular = reporter => run('regular', reporter);
exports.failFast = reporter => run('failFast', reporter);
exports.failFast2 = reporter => run('failFast2', reporter);
exports.only = reporter => run('only', reporter);
exports.watch = reporter => run('watch', reporter);
