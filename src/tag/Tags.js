import React from 'react';
import AddNewTag from './AddNewTag';
import './Tags.css';
export default function(props) {
	let tagsDOM = props.tagNames.map(tagName => (
		<li key={tagName} className="video-tag">
			{tagName}
			{props.handleRemoveTag && (<button 
				className="remove-tag" 
				onClick={e => props.handleRemoveTag(tagName)}>x</button>)
			}
		</li>
	))
	return (
		<div>
			<ul id="video-tags">{tagsDOM}</ul>
			{props.handleAddNewTag && (<AddNewTag 
				allTagNames={props.allTagNames} 
				handleAddNewTag={props.handleAddNewTag} />)
			}
		</div>
	)
};
