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
		videoCount = `(${tag.videoIDs.length})`;
	}
	let classNames = ["video-tag"];
	if (props.handleRemoveTag) classNames.push("removable");
	if (props.selected) classNames.push("selected");
	if (props.handleClick) classNames.push("clickable");
	return (
		<li className={classNames.join(" ")}>
			<span onClick={props.handleClick ? () => props.handleClick(tag) : null}>{tagName}{videoCount}</span>
			{props.handleRemoveTag && (<button 
				className="remove-tag" 
				onClick={e => props.handleRemoveTag(tagName)}>x</button>)
			}
		</li>
	)
}
