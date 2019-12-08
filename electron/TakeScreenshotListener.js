const SCREENSHOT_DIRECTORY = 'F:/video-tagger-data/potplayer-screenshot';
const { globalShortcut, clipboard } = require('electron')
const fs = require('fs')
const robot = require("robotjs");
const VideoScreenshot = require("./VideoScreenshot.js");

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
		// 250 delay is necessary, otherwise ctrl e would not work
		setTimeout(() => robot.keyTap("e", "control"), 500);
		let screenshotFileName = await this.watchForNewScreenshot();
		robot.keyTap("c", ["control", "shift", "alt"]);
		let videoFilePath = clipboard.readText();
		let screenshot = new VideoScreenshot(SCREENSHOT_DIRECTORY, screenshotFileName, videoFilePath);
		console.info(screenshot);
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