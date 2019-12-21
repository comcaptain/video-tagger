import * as Video from '../../share/bean/Video'
import React from "react";
import Navigation from "../navigation/Navigation";
import IndexedVideos from "./IndexedVideos"
import './Sync.css'
import '../styles/buttons.scss'
import fs from "fs";
import util from "util";
import {remote} from 'electron';
import VideoScanner from './VideoScanner';
import IPCInvoker from '../ipc/IPCInvoker';
import VideoPlayer from '../video/VideoPlayer';
const fsDelete = util.promisify(fs.unlink);
const dialog = remote.dialog;

interface Props {

}

type SyncDirectory = string;

interface State {
	directories: SyncDirectory[],
	status: string | null,
	scanning: boolean,
	notIndexedVideos: Video.VideoPath[]
}

export default class Sync extends React.Component<Props, State> {

	constructor(props: Props) {
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
		let scanner = new VideoScanner(new IndexedVideos(videos), this.state.directories);
		let timer = setInterval(() => this.setState({status: scanner.status}), 10);
		scanner.scan().then((v: Video.VideoPath[]) => {
			this.setState({notIndexedVideos: v, scanning: false, status: scanner.status});
			clearInterval(timer);
		});
	}

	handleVideoClick(event: React.MouseEvent, videoPath: Video.VideoPath) {
		if (event.ctrlKey) {			
			if (!window.confirm(`Are you sure to delete video ${videoPath}?`)) return;
			fsDelete(videoPath)
				.then(() => window.alert("Successfully deleted file " + videoPath))
				.catch((e: any) => {
					console.error(e);
					window.alert(`Failed to delete file ${videoPath} because of ${e}`)
				});
		}
		else {
			new VideoPlayer(videoPath).play()
		}
	}

	dirSelected() {
		return this.state.directories.length > 0;
	}

	render() {
		let diretoryDOMs = this.state.directories.map(v => <li key={v}>{v}</li>);
		let notIndexedVideoDOMs = this.state.notIndexedVideos
			.map(v => <li key={v} onClick={(event) => this.handleVideoClick(event, v)}>{v}</li>);
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