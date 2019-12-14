const MongoClient = require('mongodb').MongoClient;
const conf = require('../src/share/conf.js');
const fs = require("fs");
const path = require('path');
const util = require('util');
const fsRename = util.promisify(fs.rename);
const fsStat = util.promisify(fs.stat);
const FingerprintCalculator = require("../src/share/FingerprintCalculator.js");

class DataPersister {
	constructor() {
		this._dbPromise = new MongoClient(conf.mongo_db_url, {useUnifiedTopology: true}).connect().then(client => client.db(conf.mongo_db_name));
	}

	async persist(screenshot, tagNames) {
		let [tagIDs, videoScreenshot] = await Promise.all([this.loadOrSaveTags(tagNames), this.persistVideoScreenshot(screenshot)]);
		return this._dbPromise.then(db => {
			let tagPoints = tagIDs.map(tagID => ({
				tag_id: tagID,
				video_id: videoScreenshot.video_id,
				screenshot_id: videoScreenshot._id
			}));
			console.log(`Inserting ${tagPoints.length} new TagPoint records:`, tagPoints)
			return db.collection("TagPoint").insertMany(tagPoints).then(o => {
				let docs = o.ops;
				console.log(`Inserted ${docs.length} new TagPoint records`)
			})
		})
	}

	async loadOrSaveTags(tagNames) {
		console.info("Load or save tags", tagNames);
		let db = await this._dbPromise;
		return this.loadAllTags().then(savedTags => {
			let tagNameToIDMap = {};
			for (let savedTag of savedTags) {
				if (tagNameToIDMap[savedTag.name]) throw "Duplicate tag found " + savedTag.name;
				tagNameToIDMap[savedTag.name] = savedTag._id;
			}
			let tagIDs = [];
			let createTime = new Date();
			let newTags = tagNames.filter(tagName => {
				let tagID = tagNameToIDMap[tagName];
				if (tagID) tagIDs.push(tagID);
				return !tagID;
			}).map(tagName => ({
				name: tagName,
				create_time: createTime
			}));
			if (newTags.length === 0) return tagIDs;
			console.log(`Inserting ${newTags.length} new Tag records:`, newTags)
			return db.collection("Tag").insertMany(newTags).then(o => {
				let savedNewTags = o.ops;
				console.log(`Inserted ${savedNewTags.length} new Tag records`);
				return tagIDs.concat(savedNewTags.map(v => v._id));
			})
		});
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

	async persistVideoScreenshot(screenshot) {
		let filePath = screenshot.screenshotFilePath;
		let newFilePath = conf.screenshot_directory + "/" + path.basename(filePath, ".jpg") + new Date().getTime() + ".jpg";
		let db = await this._dbPromise;
		return fsRename(filePath, newFilePath).then(() => {
			console.log(`Moved screenshot file from ${filePath} to ${newFilePath}`);
			return this.loadOrSaveVideo(screenshot.videoFilePath)
		}).then(video => {
			let videoScreenshot = {
				video_id: video._id,
				screenshot_path: newFilePath,
				seek_position: screenshot.seekPosition
			}
			console.log("Inserting VideoScreenshot", videoScreenshot);
			return db.collection("VideoScreenshot").insertOne(videoScreenshot).then(o => {
				let v = o.ops[0];
				console.log("Inserted new VideoScreenshot record", v);
				return v;
			})
		})
	}

	loadOrSaveVideo(videoPath) {
		return fsStat(videoPath).then(stats => this._dbPromise.then(db => {
			let videoCollection = db.collection("Video");
			let condition = {path: videoPath, last_modified_time: stats.mtime};
			console.log("Finding Video by condition", condition)
			return videoCollection.findOne(condition).then(video => {
				if (video) {
					console.log("Found video", video)
					return video;
				}
				console.log("Video not found, insert new Video record")
				return this.insertVideo(videoCollection, videoPath, stats.mtime);
			})
		}))
	}

	updateVideoPath(videoID, newVideoPath) {
		console.info(`Updating path of video ${videoID} to ${newVideoPath}...`)
		return this._dbPromise
			.then(db => db.collection("Video"))
			.then(collection => collection.updateOne({_id: videoID}, {$set: {path: newVideoPath}}))
			.then(() => console.info(`Updated path of video ${videoID} to ${newVideoPath}`))
	}

	async refreshFingerprints() {
		console.log("Refresh fingerprint, loading videos...")
		this._dbPromise
			.then(db => db.collection("Video"))
			.then(collection => collection.find().project({path: 1}).toArray())
			.then(videos => {
				console.log(`Loaded ${videos.length} videos, refreshing fingerprints`);
				return Promise.all(videos.map(video => this.refreshFingerprint(video._id, video.path)))
			})
			.then(() => console.info("Refreshed all fingerprints!"));
	}

	async refreshFingerprint(id, path) {
		let collection = await this._dbPromise.then(db => db.collection("Video"));
		return new FingerprintCalculator(path).calculate()
			.then(fingerprint => {
				console.info(`Fingerprint of ${path} is ${fingerprint}`)
				return collection.updateOne({_id: id}, {$set: {fingerprint: fingerprint}});
			})
			.then(() => console.info("Refreshed fingerprint for", path))
	}

	insertVideo(videoCollection, videoPath, mtime) {
		console.log("Calculating fingerprint for", videoPath)
		return new FingerprintCalculator(videoPath).calculate().then(fingerprint => {
			let record = {
				path: videoPath,
				last_modified_time: mtime,
				fingerprint: fingerprint
			}
			console.log("Calculated, inserting new Video record", record)
			return videoCollection.insertOne(record).then(o => {
				let v = o.ops[0];
				console.log("Inserted new Video record", v);
				return v;
			})
		})
	}
}

module.exports = new DataPersister();
