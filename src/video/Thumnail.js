import React from 'react';
import './Thumnail.css'
const { exec } = require('child_process');

export default class Thumnail extends React.Component {

	handleClick(event) {
		if (event.ctrlKey) {
			let openCommand = `"C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" "${this.props.videoPath}" /seek=${this.props.seekPosition}`;
			console.info("Executing command", openCommand);
			exec(openCommand);
		}
	}

	render() {
		return (
			<img 
				className="thumnail" 
				onClick={this.handleClick.bind(this)}
				src={this.props.screenshotPath} 
				alt={this.props.screenshotPath}
				/>
		)
	}
}
