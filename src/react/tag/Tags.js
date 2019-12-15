import React from 'react';
import AddNewTag from './AddNewTag';
import Tag from './Tag';
import './Tags.css';

export default function Tags(props) {
	let tagsDOM = props.tags.map(tag => 
		<Tag handleRemoveTag={props.handleRemoveTag} tag={tag} key={typeof tag === "string" ? tag : tag.name} />);
	return (
		<div className="video-tags">
			<ul>{tagsDOM}</ul>
			{props.handleAddNewTag && (<AddNewTag handleAddNewTag={props.handleAddNewTag} />)}
		</div>
	)
}
