// CHCP 65001
const { app, Menu } = require('electron')
const TakeScreenshotListener = require("./TakeScreenshotListener.js")
const ReactWindow = require('./ReactWindow.js');
const dataPersister = require('./dataPersister.js');
const dataLoader = require('./dataLoader.js')
const IPCInvokerServer = require('./IPCInvokerServer.js')

let mainWindow;

function createWindow() {
	mainWindow = new ReactWindow("/index.html", {maximize: true}).open();
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function() {
	new TakeScreenshotListener("Ctrl+Alt+T").startListening();
	new IPCInvokerServer(dataLoader, "dataLoader").start();
	new IPCInvokerServer(dataPersister, "dataPersister").start();
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

Menu.setApplicationMenu(null);
