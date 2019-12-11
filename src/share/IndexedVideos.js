class IndexedVideos {
	constructor(videos) {
		let pathToMTime = {}, fingerprintToID = {};
		videos.forEach(video => {
			pathToMTime[video.path] = video.last_modified_time;
			fingerprintToID[video.fingerprint] = video._id;
		})
		this._pathToMTime = pathToMTime;
		this._fingerprintToID = fingerprintToID;
	}

	getModifiedTime(path) {
		return this._pathToMTime[path];
	}

	getVideoID(fingerprint) {
		return this._fingerprintToID[fingerprint];
	}
}