import React from 'react';
import Video from './video/Video'
import './VideoList.css';
const dataLoader = require('./store/dataLoader.js')

export default class VideoList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {videos: []};
		dataLoader.execute('loadAllVideos').then(v => this.setState({videos: v}));
	}

	render() {
		let videoDOMs = this.state.videos.map(video => <Video {...video} key={video.path} />);
		return (<div id="video-list">{videoDOMs}</div>)
	}
}