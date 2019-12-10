import React from 'react';
import Thumnail from './Thumnail'
import Tags from '../tag/Tags'

export default function Video(props) {
	let tagNames = new Set();
	props.screenshots.forEach(v => v.tagNames.forEach(tagNames.add, tagNames));
	tagNames = [...tagNames];
	let thumnailDOMs = props.screenshots.map(v => <Thumnail {...v} key={v.screenshotPath} />);
	return (
		<div className="video">
			<span className="path">{props.path}</span>
			<Tags tagNames={tagNames} />
			{thumnailDOMs}
		</div>
	)
}