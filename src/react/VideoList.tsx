import React from 'react';
import Video from './video/Video'
import Tags from './tag/Tags'
import Navigation from './navigation/Navigation'
import './VideoList.css';
import { VideoWithScreenshots } from '../share/bean/Video';
import { TagName } from '../share/bean/Tag';
import IPCInvoker from './ipc/IPCInvoker';

interface Props {

}

interface State {
	videos: VideoWithScreenshots[];
	tagNames: TagName[];
	screenshotsPerLine: number;
}

export default class VideoList extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {videos: [], tagNames: [], screenshotsPerLine: 4};
		this.handleAddNewTag = this.handleAddNewTag.bind(this);
		this.handleRemoveTag = this.handleRemoveTag.bind(this);
		this.updateScreenshotsPerLine = this.updateScreenshotsPerLine.bind(this);
		new IPCInvoker("dataLoader").invoke("loadAllVideos").then((v: VideoWithScreenshots[]) => this.setState({videos: v.reverse()}));
	}

	handleAddNewTag(newTagName: TagName) {
		this.setState({
			tagNames: this.state.tagNames.concat([newTagName])
		})
	}

	handleRemoveTag(tagName: TagName) {
		this.setState({
			tagNames: this.state.tagNames.filter(v => v !== tagName)
		})
	}

	updateScreenshotsPerLine(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			screenshotsPerLine: parseInt(event.target.value)
		})
	}

	render() {
		let videos = this.state.videos;
		let tagNames = this.state.tagNames;
		if (tagNames.length > 0) {
			videos = videos.filter(video => {
				let videoTagNames = new Set();
				video.screenshots.forEach(screenshot => screenshot.tagNames.forEach(videoTagNames.add, videoTagNames));
				return tagNames.every(videoTagNames.has, videoTagNames);
			});
		}
		let thumbnailStyle = {width: `calc(${100 / this.state.screenshotsPerLine}% - 1px)`}
		let videoDOMs = videos.map(video => <Video {...video} key={video.path} thumbnailStyle={thumbnailStyle} />);
		let videoIDs = videos.map(v => v.id);
		return (<div>
			<Navigation name="list" />
			<div id="video-list">
				{videos.length}个视频
				<input type="number" 
					id="screenshots-per-line" 
					onChange={this.updateScreenshotsPerLine} 
					value={this.state.screenshotsPerLine} />
				<Tags tags={this.state.tagNames.map(v => ({name: v}))} videoIDs={videoIDs} handleAddNewTag={this.handleAddNewTag} handleRemoveTag={this.handleRemoveTag} />
				{videoDOMs}
			</div>
		</div>)
	}
}
