### Restore a collection (replace mode)

```
mongorestore --db=video-tagger --collection=TagPoint --drop --preserveUUID TagPoint.bson
```

### Fix data: Some `TagPoint.tag_id` values' type is string rather than ObjectId, change their type to ObjectId

```bash
# Find invalid records
db.TagPoint.find({tag_id: {$type: "string"}})

# Output fixed data to a new collection
db.TagPoint.aggregate([
    {$match: {tag_id: {$type: "string"}}},
    {$set: {tag_id: {$toObjectId: "$tag_id"}}},
    {$out: "TagPoint2" }
])

# Merge fixed data to original collection
db.TagPoint2.aggregate([
    { $merge: { into: "TagPoint", on: "_id", whenMatched: "replace", whenNotMatched: "fail" } }
])
```