const { ipcMain } = require('electron')

module.exports = class DataLoaderProxy {
	constructor(dataLoader) {
		this.dataLoader = dataLoader;
	}

	start() {
		console.log("Starting data loader proxy")
		ipcMain.handle("load", async (event, functionName, parameters) => {
			console.log("Load request received, loading...", functionName, parameters)
			const result = await this.dataLoader[functionName].apply(this.dataLoader, parameters);
			console.log("loaded, replying");
			return result;
		})
		console.log("Started data loader proxy")
	}
}
