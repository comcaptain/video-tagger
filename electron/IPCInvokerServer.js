const { ipcMain } = require('electron')

module.exports = class IPCInvokerServer {
	constructor(instance, name) {
		this._instance = instance;
		this._name = name;
	}
	start() {
		console.log("Starting IPC invoker server for", this._name)
		ipcMain.handle(this._name, async (event, functionName, parameters) => {
			console.log("IPC invoke received for " + this._name + ", loading...", functionName, parameters)
			const result = await this._instance[functionName].apply(this._instance, parameters);
			console.log("loaded, replying", this._name);
			return result;
		})
		console.log("Started IPC invoker server for", this._name)
	}
}
