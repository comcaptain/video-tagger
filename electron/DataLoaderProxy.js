const { ipcMain } = require('electron')

module.exports = class DataLoaderProxy {
	constructor(dataLoader) {
		this.dataLoader = dataLoader;
	}

	start() {
		console.log("Starting data loader proxy")
		ipcMain.on("load", (event, functionName, parameters) => {
			console.log("Load request received, loading...", functionName, parameters)
			this.dataLoader[functionName].apply(this.dataLoader, parameters).then(result => {
				console.log("loaded, replying")
				event.reply("loaded", result);
			})
		})
		console.log("Started data loader proxy")
	}
}
