export const screenshot_directory: string = "C:/video-tagger-data/screenshots";
export const potplayer_screenshot_directory: string = "C:/video-tagger-data/potplayer-screenshot";
export const log_directory: string = "C:/video-tagger-data/logs";
// If you want to change this, you have to update the backup command in DataBackuper.js
export const mongo_db_url: string = "mongodb://localhost:27017";
export const mongo_db_name: string = "video-tagger";
export const backup_directories: string[] = ["C:/video-tagger-data/backups", "Z:/Tony/backups/video-tagger"];
// Check https://electronjs.org/docs/api/accelerator for available values
export const take_screenshot_hotkey: string = "Ctrl+Alt+T";
// Check https://robotjs.io/docs/syntax#keys for available values
export const potplayer_take_screenshot_hotkey: [string, string?] = ["e", "control"];
export const potplayer_copy_video_path_hotkey: [string, (string | string[])?] = ["c", ["control", "shift", "alt"]];
// After `potplayer_take_screenshot_hotkey`, wait for at most this time before quiting
// Timeunit is milliseconds
export const wait_for_screenshot_delay: number = 3000;