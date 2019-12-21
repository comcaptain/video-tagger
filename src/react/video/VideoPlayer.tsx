const { exec } = require('child_process');

module.exports = class VideoPlayer {
	constructor(path, seekPosition) {
		this._path = path;
		this._seekPosition = seekPosition;
	}

	play() {
		let openCommand = `"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "${this._path}"`;
		if (this._seekPosition) {
			openCommand += ` /seek=${this._seekPosition}`;
		}
		console.info("Executing command", openCommand);
		exec(openCommand);
	}
}
