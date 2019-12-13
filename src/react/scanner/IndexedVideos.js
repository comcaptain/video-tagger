export default class IndexedVideos {
	constructor(videos) {
		let pathToMTime = {}, fingerprintToID = {};
		videos.forEach(video => {
			// After passing from main process, type of last_modified_time is changed to string, 
			// so we have to create a Date instance manually
			pathToMTime[video.path] = new Date(video.last_modified_time);
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