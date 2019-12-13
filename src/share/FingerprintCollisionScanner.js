const fs = require("fs")
const path = require("path")
const util = require('util');
const fsReadDir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);
const FingerprintCalculator = require('./FingerprintCalculator.js')

const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);

class FingerprintCollisionScanner {
	constructor(...directories) {
		this._directories = directories;
	}

	scan() {
		this._scannedDirectoryCount = 0;
		this._scannedFileCount = 0;
		this._scannedVideoFileCount = 0;
		this._fingerprintToPath = {};
		this._fingerprintCollisionCount = 0;
		this._startTime = new Date().getTime();
		this.updateStatus("Scan started");
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			this.updateStatus("Scan finished")
		})
	}

	updateStatus(...statuses) {
		this.status = `Scanned ${this._scannedDirectoryCount} directories, \
${this._scannedFileCount} files, \
${this._scannedVideoFileCount} videos; \
Found ${this._fingerprintCollisionCount} fingerprint collisions \
${msToTime(new Date().getTime() - this._startTime)} ${statuses.join( )}`;
		console.info(this.status);
	}

	scanDirectory(directory) {
		// this.updateStatus("Scanning directory", directory);
		return fsReadDir(directory, {withFileTypes: true}).then(files => Promise.all(files.map(file => {
			let fullPath = path.join(directory, file.name);

			// Found dirctory, recursively scan it
			if (file.isDirectory()) {
				return this.scanDirectory(fullPath);
			}
			let resolvedPromise = Promise.resolve();

			// Not file or directory, skip
			if (!file.isFile()) return resolvedPromise;
			let extension = path.extname(file.name);
			this._scannedFileCount++;

			// Not video file, skip
			if (!VIDEO_EXTENSIONS.has(extension)) return resolvedPromise;
			this._scannedVideoFileCount++;
			// this.updateStatus("Found video file", fullPath);
			return new FingerprintCalculator(fullPath).calculate().then(fingerprint => {
				let sameFingerprintPath = this._fingerprintToPath[fingerprint];
				if (!sameFingerprintPath) {
					this._fingerprintToPath[fingerprint] = fullPath;
					return;
				}
				this._fingerprintCollisionCount++;
				console.info(`Fingerprint collision found: ${sameFingerprintPath} ${fullPath} ${fingerprint}`);
			});
		}))).then(() => this._scannedDirectoryCount++)
	}

	isFileChanged(fullPath) {
		let storedMTime = this._indexedVideos.getModifiedTime(fullPath);
		if (storedMTime === undefined) return Promise.resolve(true);

		return fsStat(fullPath).then(stats => {
			return stats.mtime.getTime() !== storedMTime.getTime();
		})
	}
}

function msToTime(duration) {
	let milliseconds = parseInt((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

new FingerprintCollisionScanner("V:/mirror", "V:/mirror_backup", "V:/new_mirror", "V:/video").scan();

