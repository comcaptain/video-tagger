import React from 'react';
import AddNewTag from './AddNewTag';
import Tag from './Tag';
import './Tags.css';
import { TagWithVideoIDs, TagName, EmptyTag } from '../../share/bean/Tag';
import { VideoID } from '../../share/bean/Video';

interface Props {
	tags: (TagWithVideoIDs | EmptyTag)[];
	videoIDs?: VideoID[];
	dropTagEffect?: string;
	handleDragTagStart?: ((e: React.DragEvent) => any);
	handleDragTagEnd?: ((e: React.DragEvent) => any);
	handleRemoveTag?: ((name: TagName) => any);
	handleAddNewTag?: (name: TagName) => any;
}

export default function Tags(props: Props) {
	let tagsDOM = props.tags.map(tag => (<Tag 
		handleRemoveTag={props.handleRemoveTag}
		dropTagEffect={props.dropTagEffect} 
		tag={tag} 
		handleDragTagStart={props.handleDragTagStart}
		handleDragTagEnd={props.handleDragTagEnd}
		key={tag.name} />
	));
	return (
		<div className="video-tags">
			<ul>{tagsDOM}</ul>
			{props.handleAddNewTag && (<AddNewTag videoIDs={props.videoIDs} handleAddNewTag={props.handleAddNewTag} />)}
		</div>
	)
}
