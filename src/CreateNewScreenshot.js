import React from 'react';
import Tags from './tag/Tags';
import './CreateNewScreenshot.css';
const { ipcRenderer, remote } = require('electron')
const dataLoader = require('./store/dataLoader.js')

export default class CreateNewScreenshot extends React.Component {
	constructor(props) {
		super(props);
		let parameters = new URL(window.location.href).searchParams;
		this.state = {
			videoFilePath: parameters.get("videoFilePath"),
			screenshotFilePath: parameters.get("screenshotFilePath"),
			seekPosition: parameters.get("seekPosition"),
			allTagNames: [],
			tagNames: []
		}
		dataLoader.execute("loadAllTags").then(allTags => this.setState({allTagNames: allTags.map(v => v.name)}))
	}

	handleSave() {
		ipcRenderer.send("save-new-screenshot", {
			seekPosition: this.state.seekPosition,
			videoFilePath: this.state.videoFilePath,
			screenshotFilePath: this.state.screenshotFilePath
		}, this.state.tagNames);
		remote.getCurrentWindow().close();
	}

	handleAddNewTag(newTagName) {
		this.setState({
			tagNames: this.state.tagNames.concat([newTagName])
		})
	}

	handleRemoveTag(tagName) {
		this.setState({
			tagNames: this.state.tagNames.filter(v => v !== tagName)
		})
	}

	handleGlobalKeyDown(event) {
		let selectedIndex = this.state.selectedIndex;
		let nextIndex;
		if (event.key === 's' && event.ctrlKey) {
			event.preventDefault();
			this.handleSave();
		}
	}

	componentDidMount() {
		this._listener = this.handleGlobalKeyDown.bind(this);
		document.addEventListener("keydown", this._listener);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this._listener);
	}

	render() {
		return (
			<div id="create-new-tag">
				<Tags 
					allTagNames={this.state.allTagNames} 
					tagNames={this.state.tagNames}
					handleAddNewTag={this.handleAddNewTag.bind(this)}
					handleRemoveTag={this.handleRemoveTag.bind(this)}
				/>
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
