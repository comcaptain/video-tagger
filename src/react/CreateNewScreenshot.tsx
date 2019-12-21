import { remote } from 'electron';
import React from 'react';
import { ScreenshotPath, SeekPosition } from '../share/bean/Screenshot';
import { TagName } from '../share/bean/Tag';
import { VideoPath } from '../share/bean/Video';
import './CreateNewScreenshot.css';
import IPCInvoker from './ipc/IPCInvoker';
import Tags from './tag/Tags';

interface Props {

}

interface State {
	videoFilePath: VideoPath,
	screenshotFilePath: ScreenshotPath,
	seekPosition: SeekPosition,
	tagNames: TagName[]
}

export default class CreateNewScreenshot extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let parameters = new URL(window.location.href).searchParams;
		this.state = {
			videoFilePath: parameters.get("videoFilePath")!,
			screenshotFilePath: parameters.get("screenshotFilePath")!,
			seekPosition: parameters.get("seekPosition")!,
			tagNames: []
		}
	}

	handleSave() {
		new IPCInvoker("dataPersister").invoke("persist", {
			seekPosition: this.state.seekPosition,
			videoFilePath: this.state.videoFilePath,
			screenshotFilePath: this.state.screenshotFilePath
		}, this.state.tagNames);
		remote.getCurrentWindow().close();
	}

	handleAddNewTag(newTagName: string) {
		this.setState({
			tagNames: this.state.tagNames.concat([newTagName])
		})
	}

	handleRemoveTag(tagName: string) {
		this.setState({
			tagNames: this.state.tagNames.filter(v => v !== tagName)
		})
	}

	handleGlobalKeyDown = (event: KeyboardEvent) => {
		if (event.key === 's' && event.ctrlKey) {
			event.preventDefault();
			this.handleSave();
		}
	}

	componentDidMount() {
		document.addEventListener("keydown", this.handleGlobalKeyDown);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleGlobalKeyDown);
	}

	render() {
		return (
			<div id="create-new-tag">
				<Tags 
					tags={this.state.tagNames.map(v => ({name: v}))}
					handleAddNewTag={this.handleAddNewTag.bind(this)}
					handleRemoveTag={this.handleRemoveTag.bind(this)}
				/>
				<div id="meta-data">
					<span id="video-file-path">{this.state.videoFilePath}</span>
					<span id="seek-position">{this.state.seekPosition}</span>
				</div>
				<img 
					id="video-screenshot"
					src={"file:///" + this.state.screenshotFilePath.replace("#", "%23")}
					alt={this.state.screenshotFilePath}/>
			</div>
		)
	}
}
