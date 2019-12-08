module.exports = class VideoScreenshot {
	/**
	 * @fileName e.g. JUFE-075-C.mp4_000805.253.jpg
	 */
	constructor(screenshotDirectory, screenshotFileName, videoFilePath) {
		let matches = screenshotFileName.match(/.*_(\d{2})(\d{2})(\d{2})\.(\d{3})\.jpg/);
		// Format is hh:mm:ss.ms
		this.seekPosition = matches[1] + ":" + matches[2] + ":" + matches[3] + "." + matches[4];
		this.videoFilePath = videoFilePath;
		this.screenshotFilePath = screenshotDirectory + "/" + screenshotFileName;
	}

	toURL() {
		return "/tag/create?" + new URLSearchParams({
			seekPosition: this.seekPosition,
			videoFilePath: this.videoFilePath,
			screenshotFilePath: this.screenshotFilePath
		}).toString();
	}
}