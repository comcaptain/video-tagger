// CHCP 65001
const { app } = require('electron')
const TakeScreenshotListener = require("./TakeScreenshotListener.js")
const ReactWindow = require('./ReactWindow.js');
const dataPersister = require('./dataPersister.js');
const dataLoader = require('./dataLoader.js')
const DataLoaderProxy = require('./DataLoaderProxy.js')
const SaveNewScreenshotListener = require('./SaveNewScreenshotListener.js');

let mainWindow;

function createWindow() {
	mainWindow = new ReactWindow("/index.html").open();
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function() {
	new TakeScreenshotListener("Ctrl+Shift+T").startListening();
	new SaveNewScreenshotListener(dataPersister).startListening();
	new DataLoaderProxy(dataLoader).start();
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
