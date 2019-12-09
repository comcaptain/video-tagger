import React from 'react';
import AddNewTag from './AddNewTag';
import './Tags.css';
export default class Tags extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let tagsDOM = this.props.tags.map(tag => (
			<li key={tag.name} className="video-tag">
				{tag.name}
				<button 
					className="remove-tag" 
					onClick={e => this.props.handleRemoveTag(tag.name)}>x</button>
			</li>
		))
		return (
			<div>
				<ul id="video-tags">{tagsDOM}</ul>
				<AddNewTag 
					allTags={this.props.allTags} 
					handleAddNewTag={this.props.handleAddNewTag} />
			</div>
		)
	}
};
