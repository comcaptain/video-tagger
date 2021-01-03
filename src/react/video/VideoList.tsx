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

function shuffle(array: any[]): any[] {
	array = array.slice();

	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}



export default class VideoList extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { screenshotsPerLine: 4 };
		this.updateScreenshotsPerLine = this.updateScreenshotsPerLine.bind(this);
	}

	updateScreenshotsPerLine(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			screenshotsPerLine: parseInt(event.target.value)
		})
	}

	render() {
		let videos = shuffle(this.props.videos).slice(0, 20);
		let thumbnailStyle = { width: `calc(${100 / this.state.screenshotsPerLine}% - 1px)` }
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
