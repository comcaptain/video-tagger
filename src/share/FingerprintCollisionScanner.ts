import fs from "fs";
import path from "path";
import util from 'util';
import FingerprintCalculator from './FingerprintCalculator';
import { VideoPath } from './bean/Video';
const fsReadDir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);

const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);

interface FingerprintToPath {
	[key: string]: VideoPath
}

type ScanDirectory = string;

class FingerprintCollisionScanner {
	private _directories: ScanDirectory[];
	private _scannedDirectoryCount = 0;
	private _scannedFileCount = 0;
	private _scannedVideoFileCount = 0;
	private _fingerprintToPath:FingerprintToPath  = {};
	private _fingerprintCollisionCount = 0;
	private _startTime = new Date();
	private _status: string = "";

	constructor(...directories: ScanDirectory[]) {
		this._directories = directories;
	}

	scan() {
		this.updateStatus("Scan started");
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			this.updateStatus("Scan finished")
		})
	}

	updateStatus(...statuses: string[]) {
		this._status = `Scanned ${this._scannedDirectoryCount} directories, \
${this._scannedFileCount} files, \
${this._scannedVideoFileCount} videos; \
Found ${this._fingerprintCollisionCount} fingerprint collisions \
${msToTime(new Date().getTime() - this._startTime.getTime())} ${statuses.join( )}`;
		console.info(this._status);
	}

	scanDirectory(directory: ScanDirectory): Promise<any> {
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
}

function msToTime(duration: number): string {
	let milliseconds = Math.floor((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	return `${(hours < 10) ? "0" + hours : hours}:${(minutes < 10) ? "0" + minutes : minutes}:${(seconds < 10) ? "0" + seconds : seconds}.${milliseconds}`;
}

new FingerprintCollisionScanner("V:/mirror", "V:/mirror_backup", "V:/new_mirror", "V:/video").scan();

