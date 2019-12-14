const fs = require('fs');
const util = require('util');
const fsMkdir = util.promisify(fs.mkdir);
const path = require('path');
const formatDate = require('dateformat');
const exec = util.promisify(require('child_process').exec);

class DataBackuper {
	constructor(backupDirectory) {
		this._backupDirectory = path.join(backupDirectory, "video-tagger_" + formatDate(new Date(), "yyyy-mm-dd_HH.MM.ss.l"));
	}

	async backup() {
		await fsMkdir(this._backupDirectory, {recursive: true});
		return Promise.all([this.backupDB()])
	}

	async backupDB() {
		console.info("Doing DB backup...")
		let dbDIR = path.join(this._backupDirectory, "db");
		await fsMkdir(dbDIR, {recursive: true});
		await exec(`mongodump --db=video-tagger --out=${dbDIR}`);
		console.info("Finished DB backup");
	}
}
let dataBackuper = new DataBackuper("d:/backups")
dataBackuper.backup().then(() => console.log("backup finished"));
