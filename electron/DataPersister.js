const SCRENSHOTS_DIR = "F:/video-tagger-data/screenshots"
const MongoClient = require('mongodb').MongoClient;
const fs = require("fs");
const path = require('path');
const util = require('util');
const fsRename = util.promisify(fs.rename);
const fsStat = util.promisify(fs.stat);
const FingerprintCalculator = require("./FingerprintCalculator.js");

module.exports = class DataPersister {
	constructor() {
		let client = new MongoClient("mongodb://localhost:27017");
		this._dbPromise = new Promise((resolve, reject) => {
			client.connect(err => {
				assert.equal(null, err);
				console.log("Connected successfully to Mongo DB");
				resolve(client.db("video-tagger"));
			});
		});
	}

	async persist(screenshot, tagNames) {
		let [tagIDs, videoScreenshot] = await Promise.all([this.loadOrSaveTags(tagNames), this.persistVideoScreenshot(screenshot)]);
		this._dbPromise.then(db => {
			let tagPoints = tagIDs.map(tagID => {
				tag_id: tagID,
				video_id: videoScreenshot.video_id,
				screenshot_id: videoScreenshot._id
			});
			console.log(`Inserting ${tagPoints.length} new TagPoint records: ${tagPoints}`)
			return db.collection("TagPoint").insertMany(tagPoints).then(docs => {
				console.log(`Inserted ${docs.length} new TagPoint records`)
			})
		})
	}

	async loadOrSaveTags(tagNames) {
		let db = await this._dbPromise;
		this.loadAllTags().then(savedTags => {
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
			}).map(tagName => {
				name: tagName,
				create_time: createTime
			});
			console.log(`Inserting ${newTags.length} new Tag records: ${newTags}`)
			return db.collection("Tag").insertMany(newTags).then(savedNewTags => {
				console.log(`Inserted ${savedNewTags.length} new Tag records`);
				return tagIDs.append(savedNewTags.map(v => v._id));
			})
		});
	}

	loadAllTags() {
		this._dbPromise.then(db => {
			console.log("Loading all tags")
			return db.collection("Tag").find({}).project({name: 1}).toArray();
		}).then(tags => {
			console.log(`Loaded ${tags.length} tags`);
			return tags;
		})
	}

	async persistVideoScreenshot(screenshot) {
		let filePath = screenshot.screenshotFilePath;
		let newFilePath = SCRENSHOTS_DIR + "/" + path.basename(filePath, ".jpg") + new Date().getTime() + ".jpg";
		let db = await this._dbPromise;
		fsRename(filePath, newFilePath).then(() => {
			console.log(`Moved screenshot file from ${filePath} to ${newFilePath}`);
			return this.loadOrSaveVideo(screenshot.videoFilePath)
		}).then(video => {
			let videoScreenshot = {
				video_id: video._id,
				screenshot_path: newFilePath,
				seek_position: screenshot.seekPosition
			}
			console.log(`Inserting VideoScreenshot ${videoScreenshot}`);
			return db.collection("VideoScreenshot").insertOne().then(v => {
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
			videoCollection.findOne(condition).then(video => {
				if (video) {
					console.log("Found video", video)
					return video;
				}
				console.log("Video not found, insert new Video record")
				return this.insertVideo(videoCollection, videoPath, stats.mtime);
			})
		}))
	}

	insertVideo(videoCollection, videoPath, mtime) {
		console.log("Calculating fingerprint for", videoPath)
		new FingerprintCalculator(videoPath).calculate().then(fingerprint => {
			let record = {
				name: path.basename(videoPath),
				path: videoPath,
				last_modified_time: mtime,
				fingerprint: fingerprint
			}
			console.log("Calculated, inserting new Video record", record)
			return videoCollection.insertOne(record).then(v => {
				console.log("Inserted new Video record", v);
				return v;
			})
		})
	}
}