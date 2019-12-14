const SCREENSHOT_DIRECTORY = 'F:/video-tagger-data/potplayer-screenshot';
const { globalShortcut, clipboard, BrowserWindow } = require('electron')
const fs = require('fs')
const robot = require("robotjs");
const VideoScreenshot = require("./VideoScreenshot.js");
const ReactWindow = require('./ReactWindow.js');
const processWindows = require("node-process-windows");
const util = require('util');
const getActiveWindow = util.promisify(processWindows.getActiveWindow);

module.exports = class TakeScreenshotListener {
	constructor(hotKey) {
		this._hotKey = hotKey;
	}

	startListening() {
		let registered = globalShortcut.register(this._hotKey, this.onTakeScreenshot.bind(this));
		if (!registered) {
			console.error("Failed to register hot key", this._hotKey);
			return;
		}
		console.info("Registered hot key", this._hotKey);
	}

	async onTakeScreenshot() {
		console.info("Take screenshot triggered")
		let processName = await getActiveWindow().then(activeWindow => activeWindow.ProcessName);
		if (!processName.includes("PotPlayer")) {
			console.info(`Active window's process name is ${processName}, not PotPlayer, do nothing`)
			return;
		}
		// 250 delay is necessary, otherwise ctrl e would not work
		setTimeout(() => robot.keyTap("e", "control"), 250);
		let screenshotFileName = await this.watchForNewScreenshot();
		robot.keyTap("c", ["control", "shift", "alt"]);
		let videoFilePath = clipboard.readText();
		let screenshot = new VideoScreenshot(SCREENSHOT_DIRECTORY, screenshotFileName, videoFilePath);
		new ReactWindow(screenshot.toURL(), {maximize: true}).open();
	}

	watchForNewScreenshot() {
		return new Promise((resolve, reject) => {
			let watcher = fs.watch(SCREENSHOT_DIRECTORY, (eventType, filename) => {
				if (!filename) return;
				watcher.close();
				resolve(resolve(filename))
			});
		});
	}
}