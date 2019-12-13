import React from "react";
import Navigation from "./navigation/Navigation";
import IndexedVideos from "./scanner/IndexedVideos"
import './Sync.css'
const dialog = require('electron').remote.dialog;
const VideoScanner = require('./scanner/VideoScanner.js');
const IPCInvoker = require('./ipc/IPCInvoker.js');

export default class Sync extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			directories: [],
			status: "Loading indexed videos...",
			scanning: false,
			indexedVideos: null,
			notIndexedVideos: []
		};
		this.selectDirectories = this.selectDirectories.bind(this);
		this.doSync = this.doSync.bind(this);
		new IPCInvoker("dataLoader").invoke("loadIndexedVideos").then(videos => {
			this.setState({
				indexedVideos: new IndexedVideos(videos),
				status: `Loaded ${videos.length} indexed videos`
			})
		});
	}
	
	selectDirectories() {
		let selectedDirectories = dialog.showOpenDialogSync({
			// The backslash in the end is very important. It won't work without it
			defaultPath: "V:\\",
			properties: ['openDirectory', 'multiSelections']
		});
		this.setState({
			directories: selectedDirectories
		})
	}

	doSync() {
		this.setState({scanning: true});
		let scanner = new VideoScanner(this.state.indexedVideos, this.state.directories, status => this.setState({status: status}));
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
		let notIndexedVideoDOMs = this.state.notIndexedVideos.map(v => <li key={v}>{v}</li>);
		return (<div>
			<Navigation name="sync" />
			<div id="sync">
				{!this.state.scanning && <button onClick={this.selectDirectories}>选择文件夹</button>}
				{diretoryDOMs.length > 0 && <ul id="directories">{diretoryDOMs}</ul>}
				{this.dirSelected() && <button disabled={this.state.scanning || !this.state.indexedVideos} onClick={this.doSync}>同步</button>}
				{this.state.status && <pre className="status">{this.state.status}</pre>}
				{notIndexedVideoDOMs.length > 0 && <ul id="not-indexed-videos">{notIndexedVideoDOMs}</ul>}
			</div>
		</div>)
	}
}