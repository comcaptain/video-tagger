const MongoClient = require('mongodb').MongoClient;
const conf = require('../src/share/conf.js');

class DataPersister {
	constructor() {
		this._dbPromise = new MongoClient(conf.mongo_db_url, {useUnifiedTopology: true}).connect().then(client => client.db(conf.mongo_db_name));
	}

	loadAllTags() {
		return this._dbPromise.then(db => {
			console.log("Loading all tags")
			return db.collection("Tag").find({}).project({name: 1}).toArray();
		}).then(tags => {
			console.log(`Loaded ${tags.length} tags`);
			return tags;
		})
	}

	loadIndexedVideos() {
		return this._dbPromise.then(db => {
			console.log("Loading videos");
			return db.collection("Video").find({}).toArray();
		}).then(videos => {
			console.log(`Loaded ${videos.length} videos`);
			return videos;
		})
	}

	async loadAllVideos() {
		console.log("Load all videoes started")
		let allScreenshots = await this.loadAllScreenshots();
		let videoIDToScreenshots = {};
		allScreenshots.forEach(screenshot => {
			let videoID = screenshot.video_id;
			if (!videoIDToScreenshots[videoID]) {
				videoIDToScreenshots[videoID] = [];
			}
			delete screenshot.video_id;
			videoIDToScreenshots[videoID].push(screenshot);
		})
		return this._dbPromise.then(db => {
			console.log("Loading videos");
			return db.collection("Video").find({}).project({path: 1}).toArray();
		}).then(videos => {
			console.log(`Loaded ${videos.length} videos`);
			return videos.map(v => ({
				path: v.path,
				screenshots: videoIDToScreenshots[v._id],
			}));
		})
	}

	async loadAllScreenshots() {
		let allTagPoints = await this.loadAllTagPoints();
		let screenshotIDToTagNames = {};
		allTagPoints.forEach(tagPoint => {
			let screenshotID = tagPoint.screenshot_id;
			if (!screenshotIDToTagNames[screenshotID]) {
				screenshotIDToTagNames[screenshotID] = [];
			}
			screenshotIDToTagNames[screenshotID].push(tagPoint.tag_name);
		})
		return this._dbPromise.then(db => {
			console.log("Loading screenshots");
			return db.collection("VideoScreenshot").find({}).toArray();
		}).then(screenshots => {
			console.log(`Loaded ${screenshots.length} screenshots`);
			return screenshots.map(v => ({
				tagNames: screenshotIDToTagNames[v._id] ? screenshotIDToTagNames[v._id] : [],
				seekPosition: v.seek_position,
				screenshotPath: v.screenshot_path,
				video_id: v.video_id
			})).sort((a, b) => {
				if (a.seekPosition === b.seekPosition) return 0;
				return a.seekPosition > b.seekPosition ? 1 : -1;
			});
		})
	}

	async loadAllTagPoints() {
		let allTags = await this.loadAllTags();
		let tagIDToName = {};
		allTags.forEach(tag => tagIDToName[tag._id] = tag.name);
		return this._dbPromise.then(db => {
			console.log("Loading TagPoints");
			return db.collection("TagPoint").find({}).project({tag_id: 1, screenshot_id: 1}).toArray();
		}).then(tagPoints => {
			console.log(`Loaded ${tagPoints.length} tagPoints`);
			return tagPoints.map(tagPoint => ({
				tag_name: tagIDToName[tagPoint.tag_id],
				screenshot_id: tagPoint.screenshot_id
			}))
		})
	}
}

module.exports = new DataPersister();
