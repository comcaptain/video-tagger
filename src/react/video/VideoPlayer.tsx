import { exec } from 'child_process';
import { VideoPath } from '../../share/bean/Video';
import { SeekPosition } from '../../share/bean/Screenshot';

export default class VideoPlayer {
	constructor(private _path: VideoPath, private _seekPosition?: SeekPosition) {}

	play() {
		let openCommand = `"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "${this._path}"`;
		if (this._seekPosition) {
			openCommand += ` /seek=${this._seekPosition}`;
		}
		console.info("Executing command", openCommand);
		exec(openCommand);
	}
}
