import { ipcRenderer } from 'electron'

export default class IPCInvoker {
	_name: string;

	constructor(name: string) {
		this._name = name;
	}

	invoke(functionName: string, ...parameters: any[]) {
		let name = this._name;
		console.log("Sending IPC invoke request for " + name + "...", functionName, parameters)
		let promise = ipcRenderer.invoke(name, functionName, parameters).then(result => {
			console.log("Received IPC invoke result for " + name + ":", result);
			return result;
		});
		console.log("Sent IPC invoke request for " + name + "...", functionName, parameters)
		return promise;		
	}
}