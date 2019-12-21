import fs from "fs"
import path from "path"
import util from 'util';
import * as Video from '../../share/bean/Video';
import IndexedVideos from './IndexedVideos';
import FingerprintCalculator from '../../share/FingerprintCalculator';
import IPCInvoker from '../ipc/IPCInvoker';

const fsReadDir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);
const dataPersister = new IPCInvoker("dataPersister");

const VIDEO_EXTENSIONS = new Set([".mp4", ".wmv", ".mkv", ".avi", ".rmvb", ".rm", ".flv", ".mov", ".3gp", ".VOB", ".MKV"]);

type ScanDirectory = string;

export default class VideoScanner {

	private _scannedDirectoryCount:number = 0;
	private _scannedFileCount:number = 0;
	private _scannedVideoFileCount:number = 0;
	private _updatePathCount:number = 0;
	private _notIndexedVideoPaths: Video.VideoPath[] = [];
	private _startTime: Date = new Date();
	public status: string = "";

	constructor(private readonly _indexedVideos: IndexedVideos, private readonly _directories: ScanDirectory[]) {}

	scan() {
		this._startTime = new Date();
		this.updateStatus("Scan started");
		return Promise.all(this._directories.map(this.scanDirectory, this)).then(() => {
			this.updateStatus("Scan finished")
			return this._notIndexedVideoPaths.sort();
		})
	}

	updateStatus(...statuses: string[]) {
		this.status = `Scanned ${this._scannedDirectoryCount} directories, \
${this._scannedFileCount} files, \
${this._scannedVideoFileCount} videos; \
updated paths for ${this._updatePathCount} videos; \
found ${this._notIndexedVideoPaths.length} not indexed videos
${msToTime(new Date().getTime() - this._startTime.getTime())} ${statuses.join(' ')}`;
		console.info(this.status);
	}

	scanDirectory(directory: ScanDirectory): Promise<any> {
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

	isFileChanged(fullPath: string): Promise<boolean> {
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

function msToTime(duration: number): string {
	let milliseconds = Math.floor((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	return `${(hours < 10) ? "0" + hours : hours}:${(minutes < 10) ? "0" + minutes : minutes}:${(seconds < 10) ? "0" + seconds : seconds}.${milliseconds}`;
}
