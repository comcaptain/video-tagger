import React from 'react';
import { TagName } from '../share/bean/Tag';
import Tags from './tag/Tags';
import VideoList from './video/VideoList';
import { VideoWithScreenshots } from '../share/bean/Video';

interface Props {

}

interface State {
	tagNames: TagName[];
}

export default class Home extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {tagNames: []};
		this.handleAddNewTag = this.handleAddNewTag.bind(this);
		this.handleRemoveTag = this.handleRemoveTag.bind(this);
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

	filter(videos: VideoWithScreenshots[]) {		
		let tagNames = this.state.tagNames;
		let filteredVideos = videos;
		if (tagNames.length > 0) {
			filteredVideos = videos.filter(video => {
				let videoTagNames = new Set();
				video.screenshots.forEach(screenshot => screenshot.tagNames.forEach(videoTagNames.add, videoTagNames));
				return tagNames.every(videoTagNames.has, videoTagNames);
			});
		}
		let videoIDs = filteredVideos.map(v => v.id);
		let filterDOM = <Tags tags={this.state.tagNames.map(v => ({name: v}))} videoIDs={videoIDs} handleAddNewTag={this.handleAddNewTag} handleRemoveTag={this.handleRemoveTag} />;
		return {filtered: filteredVideos, filterDOM: filterDOM};
	}

	render() {
		return (<div><VideoList filter={this.filter.bind(this)}></VideoList></div>)
	}
}
