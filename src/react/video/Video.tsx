import React from 'react';
import Thumnail from './Thumnail'
import Tags from '../tag/Tags'
import './Video.css'
import { Screenshot } from '../../share/bean/Screenshot';
import { TagName } from '../../share/bean/Tag';
import { VideoPath } from '../../share/bean/Video';

interface Props {
	screenshots: Screenshot[];
	thumbnailStyle: React.CSSProperties;
	path: VideoPath;
}

export default function Video(props: Props) {
	let tagNameSet = new Set<TagName>();
	props.screenshots.forEach(v => v.tagNames.forEach(tagNameSet.add, tagNameSet));
	let tags = Array.from(tagNameSet.values()).map(v => ({name: v}));
	let thumnailDOMs = props.screenshots.map(v => <Thumnail {...v} 
		thumbnailStyle = {props.thumbnailStyle} videoPath={props.path} key={v.screenshotPath} />);
	return (
		<div className="video">
			<div className="video-meta-data">				
				<Tags tags={tags} />
				<span className="path">{props.path}</span>
			</div>
			<div className="thumnails">{thumnailDOMs}</div>
		</div>
	)
}