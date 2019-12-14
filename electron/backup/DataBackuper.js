const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const util = require('util');
const fsMkdir = util.promisify(fs.mkdir);
const path = require('path');
const formatDate = require('dateformat');

class DataBackuper {
	constructor(backupDirectory) {
		this._backupDirectory = path.join(backupDirectory, "video-tagger_" + formatDate(new Date(), "yyyy-mm-dd_HH.MM.ss.l"));
	}

	async backup() {
		await this.createBackupDIR();
		this.backupDB();
	}

	async createBackupDIR() {
		console.info("Creating backup dir", this._backupDirectory);
		await fsMkdir(this._backupDirectory, {recursive: true});
		console.info("Created backup dir", this._backupDirectory);
	}

	backupDB() {
		console.log("Backup to", this._backupDirectory)
	}
}

let dataBackuper = new DataBackuper("d:/backups")
dataBackuper.backup();
