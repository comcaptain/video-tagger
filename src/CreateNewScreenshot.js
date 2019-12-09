import React from 'react';
import Tags from './Tags';
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
			allTags: [],
			tags: []
		}
		dataLoader.loadAllTags().then(allTags => this.setState({allTags: allTags}))
	}

	handleSave() {
		ipcRenderer.on('save-new-screenshot', (event, arg) => {
			console.info("saved, close window")
			remote.getCurrentWindow().close();
		})
		ipcRenderer.send("save-new-screenshot", {
			seekPosition: this.state.seekPosition,
			videoFilePath: this.state.videoFilePath,
			screenshotFilePath: this.state.screenshotFilePath
		}, this.state.tags.map(v => v.name));
	}

	handleAddNewTag(newTagName) {
		this.setState({
			tags: this.state.tags.concat([{name: newTagName}])
		})
	}

	handleRemoveTag(tagName) {
		this.setState({
			tags: this.state.tags.filter(v => v.name !== tagName)
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
					allTags={this.state.allTags} 
					tags={this.state.tags}
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
