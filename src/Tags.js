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

	onAddNewTag(newTagName) {
		this.setState({
			tags: this.state.tags.concat([{name: newTagName}])
		})
	}

	removeTag(tagName) {
		this.setState({
			tags: this.state.tags.filter(v => v.name !== tagName)
		})
	}

	render() {
		let tagsDOM = this.state.tags.map(tag => (
			<li key={tag.name} className="video-tag">
				{tag.name}
				<button className="remove-tag" onClick={e => this.removeTag(tag.name)}>x</button>
			</li>
		))
		return (
			<div>
				<ul id="video-tags">{tagsDOM}</ul>
				<AddNewTag allTags={this.props.allTags} onAddNewTag={this.onAddNewTag.bind(this)} />
			</div>
		)
	}
};
