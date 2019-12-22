import path from 'path';
import isDev from 'electron-is-dev';
import { BrowserWindow } from 'electron'

type Options = Electron.BrowserViewConstructorOptions & {maximize?: boolean, openDEVTool?: boolean};

export default class ReactWindow {
	private _url: string;
	private _options: Options;
	
	constructor(url: string, options: Options = {}) {
		this._url = url;
		this._options = Object.assign({}, {
			width: 900, 
			height: 680,
			show: false,
			webPreferences: {
				webSecurity: false,
				nodeIntegration: true
			}}, options);
	}

	open() {
		let reactWindow = new BrowserWindow(this._options);
		if (this._options.maximize) {
			reactWindow.maximize();
		}
		reactWindow.loadURL(isDev ? 'http://localhost:3000' + this._url : `file://${path.join(__dirname, '../build/' + this._url)}`);
		reactWindow.webContents.openDevTools();
		reactWindow.once('ready-to-show', () => {
			reactWindow.show()
		})
		return reactWindow;
	}
}
