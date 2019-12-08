import React from 'react';
import './CreateNewTag.css';

export default class CreateNewTag extends React.Component {
	constructor(props) {
		super(props);
		let parameters = new URL(window.location.href).searchParams;
		this.state = {
			videoFilePath: parameters.get("videoFilePath"),
			screenshotFilePath: parameters.get("screenshotFilePath"),
			seekPosition: parameters.get("seekPosition")
		}
	}

	render() {
		return (
			<div id="create-new-tag">
				<div id="meta-data">
					<span id="video-file-path">{this.state.videoFilePath}</span>
					<span id="seek-position">{this.state.seekPosition}</span>
				</div>
				<img 
					id="video-screenshot"
					src={"file:///" + this.state.screenshotFilePath} 
					alt={this.state.screenshotFilePath}/>
			</div>
		)
	}
}
