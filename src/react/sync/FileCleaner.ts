import { ScanDirectory, msToTime, VIDEO_EXTENSIONS } from './VideoScanner';
import util from 'util';
import fs from 'fs';
import path from 'path';

const fsReadDir = util.promisify(fs.readdir);
const fsRmdir = util.promisify(fs.rmdir);
const fsRmFile = util.promisify(fs.unlink);
const DO_NOT_TOUCH_EXTENSIONS = new Set<string>([".ass", ".srt"]);
const PICTURE_EXTENSIONS = new Set<string>([".jpg", ".gif", ".PNG", ".png", ".jpeg", ".JPG", ".bmp"]);
const REMOVE_EXTENSIONS = new Set<string>([".torrent", ".xltd", ".mht", ".doc", ".txt", ".db", ".!sync", ".35", ".rtf", ".parts", ".url", ".idx", ".nfo", ".qdl2", ".tdl"]);

export default class FileCleaner {

    private _startTime = new Date();
    private _scannedDirCount = 0;
    private _scannedFileCount = 0;
    private _removeDirectories: string[] = [];
    private _removeFiles: string[] = [];
    private _unknownExtensions = new Set<string>();
	public status: string = "";

    constructor(private readonly _directories: ScanDirectory[]) {}

	async cleanup() {
		this._startTime = new Date();
		this._updateStatus("Scan started");
        await Promise.all(this._directories.map(this._cleanupDirectory, this));
        this._updateStatus("Scan finished");
	}

	private _updateStatus(...statuses: string[]) {
        this.status = `Scanned ${this._scannedDirCount} directories, ${this._scannedFileCount} files\n` + 
            `${msToTime(new Date().getTime() - this._startTime.getTime())} ${statuses.join(' ')}`;
        if (this._unknownExtensions.size > 0) {
            this.status += `\nUnknown extensions: ${Array.from(this._unknownExtensions).join(", ")}`
        }
        if (this._removeDirectories.length > 0) {
            this.status += `\nRemoved ${this._removeDirectories.length} directories:\n${this._removeDirectories.join("\n")}`
        }
        if (this._removeFiles.length > 0) {
            this.status += `\nRemoved ${this._removeFiles.length} files:\n${this._removeFiles.join("\n")}`
        }
	}

    private async _cleanupDirectory(directory: ScanDirectory) {
        this._updateStatus("Scanning directory", directory, "...");
        let files = await fsReadDir(directory, {withFileTypes: true});
        let pictureFileCount = files.map(file => path.extname(file.name)).filter(extension => PICTURE_EXTENSIONS.has(extension)).length;
        await Promise.all(files.map(async file => await this._scanFile(directory, file, pictureFileCount)));
        this._scannedDirCount++;
        this._updateStatus("Scanned directory", directory)
        let fileCount = (await fsReadDir(directory)).length;
        if (fileCount === 0) await this._removeDirectory(directory);
    }

    private async _scanFile(directory: string, file: fs.Dirent, pictureFileCount: number) {
        let fullPath = path.join(directory, file.name);

        // Found dirctory, recursively scan it
        if (file.isDirectory()) await this._cleanupDirectory(fullPath);

        // Not file or directory, skip
        if (!file.isFile()) return;
        this._scannedFileCount++;
        this._updateStatus("Found file", fullPath);

        let extension = path.extname(file.name);
        if (VIDEO_EXTENSIONS.has(extension) || DO_NOT_TOUCH_EXTENSIONS.has(extension)) return;
        if (REMOVE_EXTENSIONS.has(extension)) await this._removeFile(fullPath);
        else if (PICTURE_EXTENSIONS) pictureFileCount <= 3 && await this._removeFile(fullPath);
        else this._unknownExtensions.add(extension)
    }

    private async _removeFile(fullPath:string) {
        this._removeFiles.push(fullPath);
        this._updateStatus("Removing file", fullPath);
        await fsRmFile(fullPath);
        this._updateStatus("Removed file", fullPath);
    }

    private async _removeDirectory(fullPath:string) {
        this._removeDirectories.push(fullPath);
        this._updateStatus("Removing directory", fullPath);
        await fsRmdir(fullPath);
        this._updateStatus("Removed directory", fullPath);
    }
}
