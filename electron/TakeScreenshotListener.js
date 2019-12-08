const { globalShortcut } = require('electron')

module.exports = class TakeScreenshotListener {
	constructor(hotKey) {
		this._hotKey = hotKey;
	}

	startListening() {
		let registered = globalShortcut.register("Ctrl+Shift+Alt+E", this.onTakeScreenshot.bind(this));
		if (!registered) {
			console.error("Failed to register hot key", this._hotKey);
			return;
		}
		console.info("Registered hot key", this._hotKey);
	}

	onTakeScreenshot() {
		console.info("Take screenshot triggered")
	}
}