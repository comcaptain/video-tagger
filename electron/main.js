const { app, globalShortcut, BrowserWindow } = require('electron')

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
  registerHotKeys();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const TAKE_SCREENSHOT_HOTKEY = "Ctrl+Shift+Alt+E"
function registerHotKeys() {
  let registered = globalShortcut.register("Ctrl+Shift+Alt+E", takeScreenShotTriggered);
  if (!registered) {
    console.error("Failed to register hot key", TAKE_SCREENSHOT_HOTKEY);
    return;
  }
  console.info("Registered hot key", TAKE_SCREENSHOT_HOTKEY);
}

function takeScreenShotTriggered() {
  console.info("Take screenshot triggered")
}
