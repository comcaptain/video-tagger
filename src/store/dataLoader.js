const { ipcRenderer } = require('electron')

module.exports.execute = function(functionName, parameters = []) {
	console.log("Start loading...", functionName, parameters)
	let promise = ipcRenderer.invoke('load', functionName, parameters).then(result => {
		console.log("Received load result", result);
		return result;
	});
	console.log("Load request sent", functionName, parameters)
	return promise;
}