### Targets
- Done. Should easily list all tags
- Done. Should easily list all videos
- Done. Should easily find all videos of a tag
- Done. 0Should easily find all screenshot & seekPositions of a video
- Done. Should be able to re-sync after a file is renamed or moved to a new position
  - Assume that if a file's absolute path & last update time is not changed, then this file is not changed
  - Load all Video records from DB as two maps, key is path and fingerprint
  - Scan all files in directory, for each file:
    - Find by path, if there is a corresponding Video record and last update time matches, then do nothing
    - Else find by fingerprint, if there is a corresponding Video record, then update path, name & last update time
  - If a record is not mapped to a video file in previous step, then remove it with confirm box

### Tag collection
- uuid
- name
- description
- create_time

### Video collection
- uuid
- name
- path
- `last-update-time`
- fingerprint

### TagPosition collection
- uuid
- tag_id
- video_id
- screenshot_path
- seek_position
