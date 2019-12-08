const fs = require("fs");
const util = require('util');
const fsOpen = util.promisify(fs.open);
const fsRead = util.promisify(fs.read);
const fsStat = util.promisify(fs.stat);
const SAMPLE_BYTES_COUNT = 10;

module.exports = class FingerprintCalculator {
	constructor(filePath) {
		this._filePath = filePath;
	}

	calculate() {
		return fsOpen(this._filePath, 'r').then(fd => {
			let buffer = Buffer.alloc(SAMPLE_BYTES_COUNT * 3);
			let promises = [fsRead(fd, buffer, 0, SAMPLE_BYTES_COUNT, null)];
			return fsStat(this._filePath).then(stats => {
				let size = stats.size;
				if (size < SAMPLE_BYTES_COUNT * 3) {
					throw `Size of ${this._filePath} is ${size}, smaller than minimum size ${SAMPLE_BYTES_COUNT * 3}`
				}
				let middlePosition = size / 2 - SAMPLE_BYTES_COUNT / 2;
				promises.push(fsRead(fd, buffer, SAMPLE_BYTES_COUNT, SAMPLE_BYTES_COUNT, middlePosition));
				promises.push(fsRead(fd, buffer, SAMPLE_BYTES_COUNT * 2, SAMPLE_BYTES_COUNT, size - SAMPLE_BYTES_COUNT));
				return Promise.all(promises).then(v => buffer.toString("base64"))
			})
		})
	}
}