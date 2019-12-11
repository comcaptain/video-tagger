const fs = require("fs")
const path = require("path")
const util = require('util');
const fsReadDir = util.promisify(fs.readdir);
const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".mp3", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);
class VideoScanner {
	constructor(...directories) {
		this._directories = directories;
		this._scannedDirectoryCount = 0;
		this._scannedFileCount = 0;
		this._scannedVideoFileCount = 0;
	}

	scan() {
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			console.info(`Scanned ${this._scannedDirectoryCount} directories, ${this._scannedFileCount} files and ${this._scannedVideoFileCount} video files`)
		})
	}

	scanDirectory(directory) {
		return fsReadDir(directory, {withFileTypes: true}).then(files => Promise.all(files.map(file => {
			let fullPath = path.join(directory, file.name);
			if (file.isDirectory()) {
				return this.scanDirectory(fullPath);
			}
			if (file.isFile()) {
				let extension = path.extname(file.name);
				if (VIDEO_EXTENSIONS.has(extension)) this._scannedVideoFileCount++;
				this._scannedFileCount++;
			}
			return Promise.resolve();
		}))).then(() => this._scannedDirectoryCount++)
	}
}

let scanner = new VideoScanner("V:/mirror", "V:/new_mirror", "V:/mirror_backup");
scanner.scan().then(() => console.log("Scan finished"))