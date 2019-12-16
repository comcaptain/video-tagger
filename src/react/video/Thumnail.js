import React from 'react';
import './Thumnail.css'
const VideoPlayer = require('./VideoPlayer.js');

export default class Thumnail extends React.Component {

	handleDoubleClick(event) {
		let videoPlayer = new VideoPlayer(this.props.videoPath, this.props.seekPosition);
		videoPlayer.play();
	}

	render() {
		return (
			<img 
				className="thumnail" 
				onDoubleClick={this.handleDoubleClick.bind(this)}
				src={this.props.screenshotPath} 
				alt={this.props.screenshotPath}
				style={this.props.thumbnailStyle}
				/>
		)
	}
}
