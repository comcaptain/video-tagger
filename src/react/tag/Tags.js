import React from 'react';
import AddNewTag from './AddNewTag';
import './Tags.css';
export default function(props) {
	let tagsDOM = props.tagNames.map(tagName => (
		<li key={tagName} className={"video-tag" + (props.handleRemoveTag ? " removable" : "")}>
			{tagName}
			{props.handleRemoveTag && (<button 
				className="remove-tag" 
				onClick={e => props.handleRemoveTag(tagName)}>x</button>)
			}
		</li>
	))
	return (
		<div className="video-tags">
			<ul>{tagsDOM}</ul>
			{props.handleAddNewTag && (<AddNewTag 
				allTagNames={props.allTagNames} 
				handleAddNewTag={props.handleAddNewTag} />)
			}
		</div>
	)
};
