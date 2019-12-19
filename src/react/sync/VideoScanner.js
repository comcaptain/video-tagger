const fs = require("fs")
const path = require("path")
const util = require('util');
const fsReadDir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);
const FingerprintCalculator = require('../../share/FingerprintCalculator.js')
const IPCInvoker = require('../ipc/IPCInvoker.js');
const dataPersister = new IPCInvoker("dataPersister");

const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);

module.exports = class VideoScanner {
	constructor(indexedVideos, directories) {
		this._indexedVideos = indexedVideos;
		this._directories = directories;
	}

	scan() {
		this._scannedDirectoryCount = 0;
		this._scannedFileCount = 0;
		this._scannedVideoFileCount = 0;
		this._updatePathCount = 0;
		this._notIndexedVideoPaths = [];
		this._startTime = new Date().getTime();
		this.updateStatus("Scan started");
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			this.updateStatus("Scan finished")
			return this._notIndexedVideoPaths.sort();
		})
	}

	updateStatus(...statuses) {
		this.status = `Scanned ${this._scannedDirectoryCount} directories, \
${this._scannedFileCount} files, \
${this._scannedVideoFileCount} videos; \
updated paths for ${this._updatePathCount} videos; \
found ${this._notIndexedVideoPaths.length} not indexed videos
${msToTime(new Date().getTime() - this._startTime)} ${statuses.join(' ')}`;
		console.info(this.status);
	}

	scanDirectory(directory) {
		this.updateStatus("Scanning directory", directory);
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
			this.updateStatus("Found video file", fullPath);
			
			return this.isFileChanged(fullPath).then(isChanged => {
				// Video is indexed and not changed, do nothing
				if (!isChanged) {
					this.updateStatus(`Video file ${fullPath} is not changed, skip`)
					return;
				}
				this.updateStatus("Calculating fingerprint for", fullPath);
				return new FingerprintCalculator(fullPath).calculate().then(fingerprint => {
					this.updateStatus(`Calculated! Fingerprint of ${fullPath} is ${fingerprint}`);
					let videoID = this._indexedVideos.getVideoID(fingerprint);
					// Found corresponding video record, update video path
					if (videoID) {
						this.updateStatus(`Video file is moved! Updating path to ${fullPath}`);
						return dataPersister.invoke("updateVideoPath", videoID, fullPath).then(() => {
							this.updateStatus(`Updated path to ${fullPath}`);
							this._updatePathCount++;
						})
					}
					// Not indexed file found
					this._notIndexedVideoPaths.push(fullPath);
					this.updateStatus("Not indexed file found", fullPath);
				}).catch(e => {
					console.error(`Cannot calculate fingerprint of ${fullPath} because of ${e}`);
				})
			})
		}))).then(() => this._scannedDirectoryCount++)
	}

	isFileChanged(fullPath) {
		let storedMTime = this._indexedVideos.getModifiedTime(fullPath);
		if (storedMTime === undefined) return Promise.resolve(true);

		return fsStat(fullPath).then(stats => {
			return stats.mtime.getTime() !== storedMTime.getTime();
		}).catch(e => {
			console.error(`Cannot visit file ${fullPath} because of ${e}`);
			return false;
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
