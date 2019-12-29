import React from 'react'
import TagCategory from './TagCategory'
import Navigation from "../navigation/Navigation";
import './TagCategories.scss'
import '../styles/buttons.scss'
import IPCInvoker from '../ipc/IPCInvoker';
import { TagWithVideoIDs, TagType } from '../../share/bean/Tag';
import { VideoWithScreenshots } from '../../share/bean/Video';
import VideoList from '../video/VideoList';
import VideoMover from './VideoMover';

const CATEGORIES = [{type: TagType.FIRST_LEVEL}, {type: TagType.SECOND_LEVEL}, {type: TagType.FILE_NAME}, {type: TagType.OTHER, isDefault: true}]

interface Props {

}

interface State {
	tags: TagWithVideoIDs[];
	dragging: boolean;
	savingTagTypes: boolean;
	videos: VideoWithScreenshots[]
}

export default class TagCategories extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			tags: [],
			dragging: false,
			savingTagTypes: false,
			videos: []
		};
		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.handleDragTagStart = this.handleDragTagStart.bind(this);
		this.handleDragTagEnd = this.handleDragTagEnd.bind(this);
		this.reloadTags();
		new IPCInvoker("dataLoader").invoke("loadAllVideos").then((v: VideoWithScreenshots[]) => this.setState({videos: v.reverse()}));
	}

	async reloadTags() {
		const tags = await new IPCInvoker("dataLoader").invoke("loadAllTags");
		return this.setState({ tags: tags.sort((a: TagWithVideoIDs, b: TagWithVideoIDs) => b.videoIDs.length - a.videoIDs.length) });	
	}

	handleTypeChange(tag: TagWithVideoIDs, newType: TagType) {
		let tags = this.state.tags;
		tags.filter(v => v.id === tag.id).forEach(v => v.type = newType);
		this.setState({tags: tags, dragging: false});
	}

	handleDragTagStart() {
		// Use setTimeout here so that drag can start
		setTimeout(() => this.setState({dragging: true}))
	}

	handleDragTagEnd() {
		this.setState({dragging: false});
	}

	saveTagTypes() {
		if (!window.confirm("确定要保存标签分类吗？")) return;
		this.setState({savingTagTypes: true});
		new IPCInvoker("dataPersister").invoke("updateTagTypes", this.state.tags)
			.then(() => this.reloadTags())
			.then(() => this.setState({savingTagTypes: false}));
	}

	getFilteredVideos() {
		let tagNames = this.state.tags
			.filter(tag => tag.type === TagType.FIRST_LEVEL || tag.type === TagType.SECOND_LEVEL)
			.map(tag => tag.name);
		let videos = this.state.videos;
		let filteredVideos = videos;
		if (tagNames.length > 0) {
			filteredVideos = videos.filter(video => {
				let videoTagNames = new Set();
				video.screenshots.forEach(screenshot => screenshot.tagNames.forEach(videoTagNames.add, videoTagNames));
				return !tagNames.some(videoTagNames.has, videoTagNames);
			});
		}
		return filteredVideos;
	}

	moveVideos() {
		// Move path to conf
		new VideoMover('v:/tagged_mirror', this.state.tags, this.state.videos).move();
	}

	render() {
		const categories = CATEGORIES.map(category => (<TagCategory 
			tags={this.state.tags}
			key={category.type}
			name={category.type}
			isDefault={category.isDefault}
			handleTypeChange={this.handleTypeChange}
			handleDragTagStart={this.handleDragTagStart}
			handleDragTagEnd={this.handleDragTagEnd}
		/>));
		let filteredVideos = this.getFilteredVideos();
		let videoIDs = filteredVideos.map(v => v.id);
		let videoListDOM = videoIDs.length > 0 ? <VideoList videos={filteredVideos} collapsedByDefault={true}><div>下面的视频都没有目录标签</div></VideoList> : null;
		return (<div>
			<Navigation name="tags" />
			<div id="tag-categories" className={this.state.dragging ? "dragging" : undefined}>
				{categories}
				<div id="buttons">
					<button 
						disabled={this.state.savingTagTypes} 
						className="action-button green" 
						onClick={this.saveTagTypes.bind(this)}>保存标签分类</button>
					<button 
						disabled={videoIDs.length > 0} 
						className="action-button green" 
						onClick={this.moveVideos.bind(this)}>按照标签移动视频</button>
				</div>
				{videoListDOM}
			</div>
		</div>)
	}
}
