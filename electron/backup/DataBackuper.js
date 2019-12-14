const fs = require('fs');
const util = require('util');
const fsMkdir = util.promisify(fs.mkdir);
const fse = require('fs-extra')
const fseCopy = util.promisify(fse.copy);
const path = require('path');
const formatDate = require('dateformat');
const exec = util.promisify(require('child_process').exec);
const conf = require('../../src/share/conf.js')

class DataBackuper {
	constructor(backupDirectory) {
		this._backupDirectory = path.join(backupDirectory, "video-tagger_" + formatDate(new Date(), "yyyy-mm-dd_HH.MM.ss.l"));
	}

	async backup() {
		await fsMkdir(this._backupDirectory, {recursive: true});
		return Promise.all([this.backupDB(), this.backupScreenshots()]);
	}

	async backupScreenshots() {
		let fromDirectory = conf.screenshot_directory;
		let toDirectory = path.join(this._backupDirectory, "screenshots");
		console.log(`Copying screenshots from ${fromDirectory} to ${toDirectory} ...`);
		await fseCopy(fromDirectory, toDirectory);
		console.log(`Copied screenshots from ${fromDirectory} to ${toDirectory}`);
	}

	async backupDB() {
		console.info("Doing DB backup...")
		let dbDIR = path.join(this._backupDirectory, "db");
		await fsMkdir(dbDIR, {recursive: true});
		await exec(`mongodump --db=${conf.mongo_db_name} --out=${dbDIR}`);
		console.info("Finished DB backup");
	}
}
let dataBackuper = new DataBackuper(conf.backup_directory)
dataBackuper.backup().then(() => console.log("backup finished"));
