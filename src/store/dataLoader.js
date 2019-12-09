const MongoClient = require('mongodb').MongoClient;

class DataPersister {
	constructor() {
		this._dbPromise = new MongoClient("mongodb://localhost:27017", {useUnifiedTopology: true}).connect().then(client => client.db("video-tagger"));
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
}

module.exports = new DataPersister();
