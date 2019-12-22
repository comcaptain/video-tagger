import fs from "fs";
import path from "path";
import util from 'util';
const fsReadDir = util.promisify(fs.readdir);
const fsRemove = util.promisify(fs.unlink);
const fsStat = util.promisify(fs.stat);

export default class BackupDataCleaner {
	constructor(private _directory: string) {}

	async clean() {
		console.info("Cleaning up backup data in", this._directory);
		let filePaths = await fsReadDir(this._directory);
		filePaths = filePaths.filter(v => v.startsWith("video-tagger")).map(v => path.join(this._directory, v));
		let fileSizeToPath = {};
		return Promise.all(filePaths.map(filePath => fsStat(filePath).then(stats => {
			let fileSize = stats.size + "";
			let sameFileSizePath = fileSizeToPath[fileSize];
			if (sameFileSizePath) {
				console.info("Two backup files have the same fileSize", sameFileSizePath, filePath, fileSize);
				if (sameFileSizePath > filePath) {
					console.info("Remove", filePath)
					return fsRemove(filePath);
				}
				else {
					fileSizeToPath[fileSize] = filePath;
					console.info("Remove", sameFileSizePath)
					return fsRemove(sameFileSizePath);
				}
			}
			else {
				fileSizeToPath[fileSize] = filePath;
			}
		}))).then(() => console.info("Cleaned up backup data in", this._directory));
	}
}
