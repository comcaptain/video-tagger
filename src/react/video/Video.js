import React from 'react';
import Thumnail from './Thumnail'
import Tags from '../tag/Tags'
import './Video.css'

export default function Video(props) {
	let tagNames = new Set();
	props.screenshots.forEach(v => v.tagNames.forEach(tagNames.add, tagNames));
	tagNames = [...tagNames];
	let thumnailDOMs = props.screenshots.map(v => <Thumnail {...v} videoPath={props.path} key={v.screenshotPath} />);
	return (
		<div className="video">
			<div className="video-meta-data">				
				<Tags tagNames={tagNames} />
				<span className="path">{props.path}</span>
			</div>
			<div className="thumnails">{thumnailDOMs}</div>
		</div>
	)
}