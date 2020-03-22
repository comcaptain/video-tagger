import React from 'react';
import Video from './Video'
import Navigation from '../navigation/Navigation'
import './VideoList.css';
import { VideoWithScreenshots } from '../../share/bean/Video';

interface Props {
	collapsedByDefault?: boolean;
	videos: VideoWithScreenshots[];
}

interface State {
	screenshotsPerLine: number;
}

export default class VideoList extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {screenshotsPerLine: 4};
		this.updateScreenshotsPerLine = this.updateScreenshotsPerLine.bind(this);
	}

	updateScreenshotsPerLine(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			screenshotsPerLine: parseInt(event.target.value)
		})
	}

	render() {
		let videos = this.props.videos;
		if (videos.length > 100) videos = videos.slice(0, 100);
        let thumbnailStyle = {width: `calc(${100 / this.state.screenshotsPerLine}% - 1px)`}
		let videoDOMs = videos.map(video => <Video {...video} collapsedByDefault={this.props.collapsedByDefault} key={video.path} thumbnailStyle={thumbnailStyle} />);
		return (<div>
			<Navigation name="list" />
			<div id="videos-container">
				<div id="videos-meta">
					<span id="video-count">{videos.length}个视频</span>
					<input type="number" 
						id="screenshots-per-line" 
						onChange={this.updateScreenshotsPerLine} 
						value={this.state.screenshotsPerLine} />
					{this.props.children}
				</div>
				<div id="video-list">{videoDOMs}</div>
			</div>
		</div>)
	}
}
