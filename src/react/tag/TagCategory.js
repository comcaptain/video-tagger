import React from 'react'
import Tags from './Tags'
import './TagCategory.scss'

export default function TagCategory(props) {
	let tags = props.tags.filter(tag => props.name === tag.type || props.isDefault && !tag.type);
	return (
		<div className="tag-category">
			<span className="tag-category-name">{props.name}</span>
			<Tags tags={tags} />
		</div>
	);
}
