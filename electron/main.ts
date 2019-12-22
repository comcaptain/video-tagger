// CHCP 65001
import * as conf from '../src/share/conf';
import { app, Menu, globalShortcut, BrowserWindow } from 'electron';
import TakeScreenshotListener from "./TakeScreenshotListener"
import ReactWindow from './ReactWindow';
import dataPersister from './dataPersister';
import dataLoader from './dataLoader'
import IPCInvokerServer from './IPCInvokerServer'
import path from "path";
import log from 'electron-log';

let mainWindow: BrowserWindow | null;

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
	log.transports.file.resolvePath = variables => path.join(conf.log_directory, variables.fileName!);
	log.transports.console.format = format;
	log.transports.file.format = format;
	Object.assign(console, log.functions);
}

Menu.setApplicationMenu(null);
