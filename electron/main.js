const { app } = require('electron')
const TakeScreenshotListener = require("./TakeScreenshotListener.js")
const ReactWindow = require('./ReactWindow.js');
const DataPersister = require('./DataPersister.js');
const SaveNewScreenshotListener = require('./SaveNewScreenshotListener.js');

let mainWindow;

function createWindow() {
	mainWindow = new ReactWindow("/index.html").open();
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function() {
	new TakeScreenshotListener("Ctrl+T").startListening();
	let persiter = new DataPersister();
	new SaveNewScreenshotListener(persiter).startListening();
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
