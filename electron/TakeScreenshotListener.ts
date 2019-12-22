import * as conf from '../src/share/conf';
import { globalShortcut, clipboard, BrowserWindow } from 'electron'
import fs from 'fs'
import robot from "robotjs";
import VideoScreenshot from "./VideoScreenshot";
import ReactWindow from './ReactWindow';
import util from 'util';
import processWindows from "node-process-windows";
const getActiveWindow = util.promisify(processWindows.getActiveWindow);

export default class TakeScreenshotListener {
	constructor(private _hotKey: string) {}

	startListening() {
		let registered = globalShortcut.register(this._hotKey, this.onTakeScreenshot.bind(this));
		if (!registered) {
			console.error("Failed to register hot key", this._hotKey);
			return;
		}
		console.info("Registered hot key.", this._hotKey);
	}

	async onTakeScreenshot() {
		console.info("Take screenshot triggered")
		let processName = await getActiveWindow().then((activeWindow:any) => activeWindow.ProcessName);
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

	watchForNewScreenshot(): Promise<string|null> {
		let startTime = new Date().getTime();
		return new Promise((resolve, reject) => {
			let timeoutID: NodeJS.Timeout;
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