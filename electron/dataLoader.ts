import { MongoClient, Db, ObjectID } from 'mongodb';
import * as conf from '../src/share/conf';
const pinyin = require("chinese-to-pinyin");
import { TagWithVideoIDs, TagModel, TagName } from '../src/share/bean/Tag';
import { VideoWithScreenshots } from '../src/share/bean/Video';

interface TagIDToTagMap {
	[key: string]: TagModel
}

interface TagIDToNameMap {
	[key: string]: TagName
}

class DataPersister {
	private _dbPromise: Promise<Db> = new MongoClient(conf.mongo_db_url, {useUnifiedTopology: true}).connect().then(client => client.db(conf.mongo_db_name));

	async loadAllTags(): Promise<TagWithVideoIDs[]> {
		console.info("Loading tags...")
		let db = await this._dbPromise;
		let tags = await db.collection("Tag").find({}).project({name: 1, type: 1}).toArray();
		console.log(`Loaded, found ${tags.length} tags`)
		let tagIDToTagMap:TagIDToTagMap = {};
		tags.forEach(tag => tagIDToTagMap[tag._id] = tag);

		console.info("Loading video count per tag...")
		let groups = await db.collection("TagPoint").aggregate( 
            [
                {"$group": { "_id": "$tag_id", video_ids: {$addToSet: "$video_id"} } }
            ]
        ).toArray();
        console.info("Loaded")
        return groups.map(group => {
        	let tagID = group._id.toString();
        	let tag = tagIDToTagMap[tagID];
        	let nameInPinyin = pinyin(tag.name, {removeTone: true, removeSpace: true});
        	return {
        		id: tagID,
        		name: tag.name,
        		type: tag.type,
        		pinyin: nameInPinyin,
        		videoIDs: group.video_ids.map((v: ObjectID) => v.toString())
        	}
        });
	}

	async loadIndexedVideos() {
		console.log("Loading videos");
		let db = await this._dbPromise;
		let videos = await db.collection("Video").find({}).toArray();
		console.log(`Loaded ${videos.length} videos`);
		return videos;
	}

	async loadAllVideos(): Promise<VideoWithScreenshots[]> {
		console.log("Load all videoes started")
		let allScreenshots = await this.loadAllScreenshots();
		let videoIDToScreenshots:any = {};
		allScreenshots.forEach(screenshot => {
			let videoID = screenshot.video_id;
			if (!videoIDToScreenshots[videoID]) {
				videoIDToScreenshots[videoID] = [];
			}
			delete screenshot.video_id;
			videoIDToScreenshots[videoID].push(screenshot);
		})
		console.log("Loading videos");
		let db = await this._dbPromise;
        let videos = await db.collection("Video").find({}).project({path: 1}).toArray();
		console.log(`Loaded ${videos.length} videos`);
		return videos.map(v => ({
			id: v._id.toString(),
			path: v.path,
			screenshots: videoIDToScreenshots[v._id],
		}));
	}

	async loadAllScreenshots() {
		let allTagPoints = await this.loadAllTagPoints();
		let screenshotIDToTagNames:any = {};
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

	async loadTagIDToNameMap(): Promise<TagIDToNameMap> {
		console.log("Loading tag ID to name map...")
		let db = await this._dbPromise;
		let tags = await db.collection("Tag").find({}).project({name: 1}).toArray();
		console.log(`Loaded, found ${tags.length} tags`)
		let tagIDToNameMap:TagIDToNameMap = {};
		tags.forEach(tag => tagIDToNameMap[tag._id] = tag.name);
		return tagIDToNameMap;
	}

	async loadAllTagPoints() {
		let tagIDToNameMap = await this.loadTagIDToNameMap();
		return this._dbPromise.then(db => {
			console.log("Loading TagPoints");
			return db.collection("TagPoint").find({}).project({tag_id: 1, screenshot_id: 1}).toArray();
		}).then(tagPoints => {
			console.log(`Loaded ${tagPoints.length} tagPoints`);
			return tagPoints.map(tagPoint => ({
				tag_name: tagIDToNameMap[tagPoint.tag_id],
				screenshot_id: tagPoint.screenshot_id
			}))
		})
	}
}

export default new DataPersister();
