const conf = require('../src/share/conf.js');
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
		setTimeout(() => robot.keyTap.apply(robot, conf.potplayer_take_screenshot_hotkey), 250);
		let screenshotFileName = await this.watchForNewScreenshot();
		if (!screenshotFileName) return;
		robot.keyTap.apply(robot, conf.potplayer_copy_video_path_hotkey);
		let videoFilePath = clipboard.readText();
		let screenshot = new VideoScreenshot(conf.potplayer_screenshot_directory, screenshotFileName, videoFilePath);
		new ReactWindow(screenshot.toURL(), {maximize: true}).open();
	}

	watchForNewScreenshot() {
		let startTime = new Date().getTime();
		return new Promise((resolve, reject) => {
			let timeoutID;
			let watcher = fs.watch(conf.potplayer_screenshot_directory, (eventType, filename) => {
				if (!filename) return;
				clearTimeout(timeoutID);
				watcher.close();
				console.info(`Screnshot ${filename} is taken in ${new Date().getTime() - startTime} ms`);
				resolve(filename);
			});
			console.log(`Wait ${conf.wait_for_screenshot_delay} milliseconds for screenshot to be taken`)
			timeoutID = setTimeout(() => {
				watcher.close();
				console.log(`Screnshot is not taken within ${conf.wait_for_screenshot_delay} milliseconds, stop waiting`);
				resolve(null);
			}, conf.wait_for_screenshot_delay);
		});
	}
}