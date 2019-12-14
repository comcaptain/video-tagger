import React from "react";
import Navigation from "../navigation/Navigation";
import IndexedVideos from "./IndexedVideos"
import './Sync.css'
import '../styles/buttons.css'
const dialog = require('electron').remote.dialog;
const VideoScanner = require('./VideoScanner.js');
const IPCInvoker = require('../ipc/IPCInvoker.js');
const VideoPlayer = require('../video/VideoPlayer');

export default class Sync extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			directories: [],
			status: null,
			scanning: false,
			notIndexedVideos: []
		};
		this.selectDirectories = this.selectDirectories.bind(this);
		this.doSync = this.doSync.bind(this);
	}
	
	selectDirectories() {
		let selectedDirectories = dialog.showOpenDialogSync({
			// The backslash in the end is very important. It won't work without it
			defaultPath: "V:\\",
			properties: ['openDirectory', 'multiSelections']
		});
		if (!selectedDirectories) return;
		this.setState({
			directories: selectedDirectories
		})
	}

	async doSync() {
		// Load indexed videos
		this.setState({scanning: true, status: "Loading indexed videos"});
		let videos = await new IPCInvoker("dataLoader").invoke("loadIndexedVideos");
		this.setState({status: `Loaded ${videos.length}`});
		
		// Scan
		let scanner = new VideoScanner(new IndexedVideos(videos), this.state.directories, status => this.setState({status: status}));
		let timer = setInterval(() => this.setState({status: scanner.status}), 10);
		scanner.scan().then(v => {
			this.setState({notIndexedVideos: v, scanning: false, status: scanner.status});
			clearInterval(timer);
		});
	}

	dirSelected() {
		return this.state.directories.length > 0;
	}

	render() {
		let diretoryDOMs = this.state.directories.map(v => <li key={v}>{v}</li>);
		let notIndexedVideoDOMs = this.state.notIndexedVideos.map(v => <li key={v} onClick={() => new VideoPlayer(v).play()}>{v}</li>);
		return (<div>
			<Navigation name="sync" />
			<div id="sync">
				{<button className="action-button green" disabled={this.state.scanning} onClick={this.selectDirectories}>选择文件夹</button>}
				{diretoryDOMs.length > 0 && <ul id="directories">{diretoryDOMs}</ul>}
				{this.dirSelected() && <button className="action-button green" disabled={this.state.scanning} onClick={this.doSync}>同步</button>}
				{this.state.status && <pre className="status">{this.state.status}</pre>}
				{notIndexedVideoDOMs.length > 0 && <ul id="not-indexed-videos">{notIndexedVideoDOMs}</ul>}
			</div>
		</div>)
	}
}