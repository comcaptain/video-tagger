import React from 'react';

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
				<div id="video-file-path">{this.state.videoFilePath}</div>
				<div id="seek-position">{this.state.seekPosition}</div>
				<img src={"file:///" + this.state.screenshotFilePath} alt={this.state.screenshotFilePath}/>
			</div>
		)
	}
}
