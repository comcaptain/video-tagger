import React from 'react';
import Video from './Video'
import Navigation from '../navigation/Navigation'
import './VideoList.css';
import { VideoWithScreenshots } from '../../share/bean/Video';
import IPCInvoker from '../ipc/IPCInvoker';

interface Props {
    filter: (vidoes: VideoWithScreenshots[]) => {filtered: VideoWithScreenshots[], filterDOM?: any, hideVideoList?: boolean};
	collapsedByDefault?: boolean;
}

interface State {
	videos: VideoWithScreenshots[];
	screenshotsPerLine: number;
}

export default class VideoList extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {videos: [], screenshotsPerLine: 4};
		this.updateScreenshotsPerLine = this.updateScreenshotsPerLine.bind(this);
		new IPCInvoker("dataLoader").invoke("loadAllVideos").then((v: VideoWithScreenshots[]) => this.setState({videos: v.reverse()}));
	}

	updateScreenshotsPerLine(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			screenshotsPerLine: parseInt(event.target.value)
		})
	}

	render() {
		let videos = this.state.videos;
        let thumbnailStyle = {width: `calc(${100 / this.state.screenshotsPerLine}% - 1px)`}
		let {filtered, filterDOM, hideVideoList} = this.props.filter(videos);
		if (hideVideoList) return null;
		let videoDOMs = filtered.map(video => <Video {...video} collapsedByDefault={this.props.collapsedByDefault} key={video.path} thumbnailStyle={thumbnailStyle} />);
		return (<div>
			<Navigation name="list" />
			<div id="videos-container">
				<div id="videos-meta">
					<span id="video-count">{filtered.length}个视频</span>
					<input type="number" 
						id="screenshots-per-line" 
						onChange={this.updateScreenshotsPerLine} 
						value={this.state.screenshotsPerLine} />
					{filterDOM}
				</div>
				<div id="video-list">{videoDOMs}</div>
			</div>
		</div>)
	}
}
