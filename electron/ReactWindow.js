const path = require('path');
const isDev = require('electron-is-dev');
const { BrowserWindow } = require('electron')

module.exports = class ReactWindow {
	constructor(url, options = {}) {
		this._url = url;
		this._options = Object.assign({}, {
			width: 900, 
			height: 680,
			webPreferences: {
				// Disable it in dev so that local file systems can be visited
				webSecurity: !isDev,
				nodeIntegration: true
			}}, options);
	}

	open() {
		let reactWindow = new BrowserWindow(this._options);
		if (this._options.noMenuBar) {
			reactWindow.removeMenu();
		}
		if (this._options.maximize) {
			reactWindow.maximize();
		}
		reactWindow.loadURL(isDev ? 'http://localhost:3000' + this._url : `file://${path.join(__dirname, '../build/' + this._url)}`);
		return reactWindow;
	}
}
