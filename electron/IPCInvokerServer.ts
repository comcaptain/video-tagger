import { ipcMain } from 'electron'

export default class IPCInvokerServer {
	constructor(private _instance: any, private _name: string) {}

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
