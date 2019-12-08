const { app, BrowserWindow } = require('electron')
const TakeScreenshotListener = require("./TakeScreenshotListener.js")
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({width: 900, height: 680, webPreferences: {
		nodeIntegration: true
	}});
	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
	if (isDev) {
		// Open the DevTools.
		//BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		mainWindow.webContents.openDevTools();
	}
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function() {
	new TakeScreenshotListener("Ctrl+T").startListening();
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', () => {
	// Unregister all shortcuts.
	globalShortcut.unregisterAll()
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
