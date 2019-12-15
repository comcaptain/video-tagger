// CHCP 65001
const conf = require('../src/share/conf.js');
const { app, Menu } = require('electron')
const TakeScreenshotListener = require("./TakeScreenshotListener.js")
const ReactWindow = require('./ReactWindow.js');
const dataPersister = require('./dataPersister.js');
const dataLoader = require('./dataLoader.js')
const IPCInvokerServer = require('./IPCInvokerServer.js')
const path = require("path");
const log = require('electron-log');

let mainWindow;

function createWindow() {
	mainWindow = new ReactWindow("/index.html", {maximize: true}).open();
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function() {
	initializeLogger();
	new TakeScreenshotListener(conf.take_screenshot_hotkey).startListening();
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

function initializeLogger() {
	let format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
	log.transports.file.resolvePath = variables => path.join(conf.log_directory, variables.fileName);
	log.transports.console.format = format;
	log.transports.file.format = format;
	Object.assign(console, log.functions);
}

Menu.setApplicationMenu(null);
