import React from 'react';
import Tags from './Tags';
import './CreateNewScreenshot.css';
const { ipcRenderer } = require('electron')

export default class CreateNewTag extends React.Component {
	constructor(props) {
		super(props);
		let parameters = new URL(window.location.href).searchParams;
		this.state = {
			videoFilePath: parameters.get("videoFilePath"),
			screenshotFilePath: parameters.get("screenshotFilePath"),
			seekPosition: parameters.get("seekPosition"),
			allTags: [{_id: "dfawe1", name: "中国"},
				{_id: "dfawe2", name: "日本"},
				{_id: "dfawe3", name: "韩国"},
				{_id: "dfawe4", name: "马来西亚"},
				{_id: "dfawe5", name: "美国"},
				{_id: "dfawe6", name: "新加坡"},
				{_id: "dfawe7", name: "泰国"},
				{_id: "dfawe8", name: "俄罗斯"},
				{_id: "dfawe9", name: "法国"},
				{_id: "dfawe10", name: "英国"},
				{_id: "dfawe11", name: "新西兰"}
			],
			tags: [
				{_id: "dfawe2", name: "日本"},
				{_id: "dfawe3", name: "韩国"},
				{_id: "dfawe4", name: "马来西亚"},
				{_id: "dfawe5", name: "美国"},
				{_id: "dfawe6", name: "新加坡"},
				{name: "拉脱维亚"},
				{name: "哈萨克斯坦"},
			]
		}
	}

	handleSave() {
		ipcRenderer.send("save-new-screenshot", {
			seekPosition: this.state.seekPosition,
			videoFilePath: this.state.videoFilePath,
			screenshotFilePath: this.state.screenshotFilePath
		}, this.state.tags.map(v => v.name))
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
				<Tags allTags={this.state.allTags} tags={this.state.tags} />
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
