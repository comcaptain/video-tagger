const fs = require("fs")
const path = require("path")
const util = require('util');
const fsReadDir = util.promisify(fs.readdir);
const FingerprintCalculator = require('../share/FingerprintCalculator.js')

const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

class VideoScanner {
	constructor(...directories) {
		this._directories = directories;
		this._scannedDirectoryCount = 0;
		this._scannedFileCount = 0;
		this._scannedVideoFileCount = 0;
		this._indexedVideoFileCount = 0;
	}

	scan() {
		this._startTime = new Date().getTime();
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			console.info(`Scanned ${this._scannedDirectoryCount} directories, ${this._scannedFileCount} files, ${this._scannedVideoFileCount} video files and indexed ${this._indexedVideoFileCount} video files in ${msToTime(new Date().getTime() - this._startTime)}`)
		})
	}

	scanDirectory(directory) {
		return fsReadDir(directory, {withFileTypes: true}).then(files => Promise.all(files.map(file => {
			let fullPath = path.join(directory, file.name);
			if (file.isDirectory()) {
				return this.scanDirectory(fullPath);
			}
			let resolvedPromise = Promise.resolve();
			if (!file.isFile()) return resolvedPromise;

			let extension = path.extname(file.name);
			this._scannedFileCount++;
			if (!VIDEO_EXTENSIONS.has(extension)) return resolvedPromise;

			this._scannedVideoFileCount++;
			return new FingerprintCalculator(fullPath).calculate().then(fingerprint => {
				this._indexedVideoFileCount++;
				console.info(`${msToTime(new Date().getTime() - this._startTime)} [${this._indexedVideoFileCount} / ${this._scannedVideoFileCount}] Fingerprint of video file ${fullPath} is ${fingerprint}`);
			})
		}))).then(() => this._scannedDirectoryCount++)
	}
}

let scanner = new VideoScanner("V:/mirror", "V:/new_mirror", "V:/mirror_backup");
scanner.scan().then(() => console.log("Scan finished"))