import React from 'react';
import './Thumnail.css'
import { VideoPath } from '../../share/bean/Video';
import { SeekPosition, ScreenshotPath } from '../../share/bean/Screenshot';
import VideoPlayer from './VideoPlayer';

interface Props {
	videoPath: VideoPath;
	seekPosition: SeekPosition;
	screenshotPath: ScreenshotPath;
	thumbnailStyle: React.CSSProperties;
}

export default class Thumnail extends React.Component<Props> {

	handleDoubleClick(event: React.MouseEvent) {
		let videoPlayer = new VideoPlayer(this.props.videoPath, this.props.seekPosition);
		videoPlayer.play();
	}

	render() {
		return (
			<img 
				className="thumnail" 
				onDoubleClick={this.handleDoubleClick.bind(this)}
				src={this.props.screenshotPath.replace("#", "%23")} 
				alt={this.props.screenshotPath}
				style={this.props.thumbnailStyle}
				/>
		)
	}
}
