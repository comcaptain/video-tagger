import React from 'react';
import AddNewTag from './AddNewTag';
import './Tags.css';
export default class Tags extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let tagsDOM = this.props.tagNames.map(tagName => (
			<li key={tagName} className="video-tag">
				{tagName}
				{this.props.handleRemoveTag && (<button 
					className="remove-tag" 
					onClick={e => this.props.handleRemoveTag(tagName)}>x</button>)
				}
			</li>
		))
		return (
			<div>
				<ul id="video-tags">{tagsDOM}</ul>
				{this.props.handleAddNewTag && (<AddNewTag 
					allTagNames={this.props.allTagNames} 
					handleAddNewTag={this.props.handleAddNewTag} />)
				}
			</div>
		)
	}
};
