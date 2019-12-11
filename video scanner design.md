### Targets
- If video is moved to a new position, then update the path
- For videoes that do not exist in Video collection, add them to Video collection
- Print scan progress on the screen

### Algorithm
Assume that if a file's absolute path & last update time is not changed, then this file is not changed.

1. Load all Video records from DB as two maps, key is path and fingerprint
2. Scan all files in directory, for each file:
   - If it's not video file, then do nothing
   - Find by path, if there is a corresponding Video record and last update time matches, then do nothing
   - Else find by fingerprint, if there is a corresponding Video record, then update path, name & last update time
   - ~~Else index the video~~ There is no need to do this because file
3. If a Video record is not mapped to any file, then display it on the screen and add GUI feature to:
   -  Open Video record's detail screen
   -  Remove single Video record
   -  Remove all Video records

### How should the scan be triggered

In the main screen, add a scan button at the top. Clicking it would navigate to scan screen.

Scan screen's top has following things:
- A directory-chooser button to select directory
- A scan button that only appears after a directory is chosen

After scan button is pressed, scan progress is displayed on the screen.
After scan finishes, print report and list not indexed video files by name.

Ctrl + left click viedo file name would play the file

### How to print scan progress
Live update following items:
- Scanned video file count
- Scanned directory count
- Found xxx moved videoes
- Scanning file xxxxxx
