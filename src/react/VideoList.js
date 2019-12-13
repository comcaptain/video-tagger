import React from 'react';
import Video from './video/Video'
import Navigation from './navigation/Navigation'
import './VideoList.css';
const IPCInvoker = require('./ipc/IPCInvoker.js');

export default class VideoList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {videos: []};
		new IPCInvoker("dataLoader").invoke("loadAllVideos").then(v => this.setState({videos: v.reverse()}));
	}

	render() {
		let videoDOMs = this.state.videos.map(video => <Video {...video} key={video.path} />);
		return (<div>
			<Navigation name="list" />
			<div id="video-list">{videoDOMs}</div>
		</div>)
	}
}