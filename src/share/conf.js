module.exports = {
	screenshot_directory: "F:/video-tagger-data/screenshots",
	potplayer_screenshot_directory: "F:/video-tagger-data/potplayer-screenshot",
	// If you want to change this, you have to update the backup command in DataBackuper.js
	mongo_db_url: "mongodb://localhost:27017",
	mongo_db_name: "video-tagger",
	backup_directory: "D:/backups",
	// Check https://electronjs.org/docs/api/accelerator for available values
	take_screenshot_hotkey: "Ctrl+Alt+T",
	// Check https://robotjs.io/docs/syntax#keys for available values
	potplayer_take_screenshot_hotkey: ["e", "control"],
	potplayer_copy_video_path_hotkey: ["c", ["control", "shift", "alt"]],
	// After `potplayer_take_screenshot_hotkey`, wait for at most this time before quiting
	// Timeunit is milliseconds
	wait_for_screenshot_delay: 3000
}