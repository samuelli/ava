'use strict';
const stream = require('stream');
const getStream = require('get-stream');

class TTYStream extends stream.PassThrough {
	constructor(columns) {
		super();

		this.isTTY = true;
		this.columns = columns;
	}

	asBuffer() {
		return getStream.buffer(this);
	}
}

module.exports = TTYStream;
