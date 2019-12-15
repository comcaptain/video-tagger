import React from 'react';
import './Tag.scss';

export default function Tag(props) {
	let tag = props.tag;
	let tagName, videoCount;
	if (typeof tag === 'string') {
		tagName = tag;
		videoCount = "";
	}
	else {
		tagName = tag.name;
		videoCount = ` (${tag.videoCount})`;
	}
	return (
		<li className={"video-tag" + (props.handleRemoveTag ? " removable" : "")}>
			{tagName}{videoCount}
			{props.handleRemoveTag && (<button 
				className="remove-tag" 
				onClick={e => props.handleRemoveTag(tagName)}>x</button>)
			}
		</li>
	)
}
