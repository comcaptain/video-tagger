import * as Video from '../../share/bean/Video';

interface PathToModifiedTime {
	[key: string]: Video.VideoModifiedTime
}

interface FingerprintToID {
	[key: string]: Video.VideoID
}

export default class IndexedVideos {

	_pathToMTime: PathToModifiedTime;

	_fingerprintToID: FingerprintToID;

	constructor(videos: Video.VideoModel[]) {
		let pathToMTime: PathToModifiedTime = {}, fingerprintToID: FingerprintToID = {};
		videos.forEach(video => {
			// After passing from main process, type of last_modified_time is changed to string, 
			// so we have to create a Date instance manually
			pathToMTime[video.path] = new Date(video.last_modified_time);
			fingerprintToID[video.fingerprint] = video.id;
		})
		this._pathToMTime = pathToMTime;
		this._fingerprintToID = fingerprintToID;
	}

	getModifiedTime(path: Video.VideoPath): Video.VideoModifiedTime {
		return this._pathToMTime[path];
	}

	getVideoID(fingerprint: Video.VideoFingerprint): Video.VideoID {
		return this._fingerprintToID[fingerprint];
	}
}