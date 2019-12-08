import React from 'react';
import AddNewTag from './AddNewTag';
import './Tags.css';
export default class Tags extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: JSON.parse(JSON.stringify(props.tags))
		}
	}

	render() {
		let tagsDOM = this.state.tags.map(tag => (
			<li key={tag.name} className="video-tag">{tag.name} <button className="remove-tag">x</button></li>
		))
		return (
			<div>
				<ul id="video-tags">{tagsDOM}</ul>
				<AddNewTag allTags={this.props.allTags} />
			</div>
		)
	}
};
