const { ipcRenderer } = require('electron')

module.exports.execute = function(functionName, parameters = []) {
	return new Promise((resolve, reject) => {
		console.log("Start loading...", functionName, parameters)
		ipcRenderer.once('loaded', (event, result) => {
			console.log("Received load result", result);
			resolve(result);
		})
		ipcRenderer.send('load', functionName, parameters);
		console.log("Load request sent", functionName, parameters)
	})
}