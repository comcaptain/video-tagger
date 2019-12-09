const { ipcMain } = require('electron')
module.exports = class SaveNewScreenshotListener {
	constructor(persister) {
		this._persister = persister;
	}

	startListening() {
		console.info("Start listening to save new screenshot command");
		ipcMain.on("save-new-screenshot", (event, screenshot, tagNames) => {
			console.log("Save new screenshot request received", screenshot, tagNames);
			this._persister.persist(screenshot, tagNames).then(() => {
				console.log("Saved, notifying browser");
				event.reply("save-new-screenshot", "done");
			})
		})
	}
}