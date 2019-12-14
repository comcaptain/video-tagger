const fs = require('fs');
const util = require('util');
const fsMkdir = util.promisify(fs.mkdir);
const fsCopyFile = util.promisify(fs.copyFile);
const fse = require('fs-extra')
const path = require('path');
const formatDate = require('dateformat');
const exec = util.promisify(require('child_process').exec);
const conf = require('../../src/share/conf.js')
const archiver = require('archiver');
const BackupDataCleaner = require('./BackupDataCleaner.js');

class DataBackuper {
	constructor(backupDirectories) {
		this._backupDir1 = path.join(backupDirectories[0], "video-tagger_" + formatDate(new Date(), "yyyy-mm-dd_HH.MM.ss.l"));
		this._backupDirs = backupDirectories;
	}

	async backup() {
		await Promise.all(this._backupDirs.map(v => fsMkdir(v, {recursive: true}) ));
		await Promise.all([this.backupDB(), this.backupScreenshots()]);
		let archivedBackupPath = await this.archiveBackupDir();
		await this.copyToAllBackupDirs(archivedBackupPath);
		return Promise.all(this._backupDirs.map(v => new BackupDataCleaner(v).clean()));
	}

	async copyToAllBackupDirs(archivedBackupPath) {
		console.info("Copying archived backup directory to all backup directories:", this._backupDirs);
		let fileName = path.basename(archivedBackupPath);
		await Promise.all(this._backupDirs.slice(1).map(v => fsCopyFile(archivedBackupPath, path.join(v, fileName))));
		console.info("Copied");
	}

	async backupScreenshots() {
		let fromDirectory = conf.screenshot_directory;
		let toDirectory = path.join(this._backupDir1, "screenshots");
		console.log(`Copying screenshots from ${fromDirectory} to ${toDirectory} ...`);
		await fse.copy(fromDirectory, toDirectory);
		console.log(`Copied screenshots from ${fromDirectory} to ${toDirectory}`);
	}

	async backupDB() {
		console.info("Doing DB backup...")
		let dbDIR = path.join(this._backupDir1, "db");
		await fsMkdir(dbDIR, {recursive: true});
		await exec(`mongodump --db=${conf.mongo_db_name} --out=${dbDIR}`);
		console.info("Finished DB backup");
	}

	archiveBackupDir() {
		let zipFilePath = this._backupDir1 + ".zip";
		let output = fs.createWriteStream(zipFilePath);
		let archive = archiver('zip');
		console.info("Archiving backup directory...")
		return new Promise((resolve, reject) => {
			output.on('close', resolve);
			archive.pipe(output);
			archive.directory(this._backupDir1, false);
			archive.finalize();
		}).then(() => {
			console.info("Archived backup directory, removing backup directory...");
			return fse.remove(this._backupDir1);
		}).then(() => {
			console.info("Removed backup directory, archive file is", zipFilePath);
			return zipFilePath;
		});
	}
}
let dataBackuper = new DataBackuper(conf.backup_directories)
dataBackuper.backup().then(() => console.log("backup finished"));