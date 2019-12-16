import React from 'react';
import Video from './video/Video'
import Tags from './tag/Tags'
import Navigation from './navigation/Navigation'
import './VideoList.css';
const IPCInvoker = require('./ipc/IPCInvoker.js');

export default class VideoList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {videos: [], tagNames: []};
		this.handleAddNewTag = this.handleAddNewTag.bind(this);
		this.handleRemoveTag = this.handleRemoveTag.bind(this);
		new IPCInvoker("dataLoader").invoke("loadAllVideos").then(v => this.setState({videos: v.reverse()}));
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
		let videoDOMs = videos.map(video => <Video {...video} key={video.path} />);
		return (<div>
			<Navigation name="list" />
			<div id="video-list">
				{videos.length}个视频
				<Tags tags={this.state.tagNames} handleAddNewTag={this.handleAddNewTag} handleRemoveTag={this.handleRemoveTag} />
				{videoDOMs}
			</div>
		</div>)
	}
}
