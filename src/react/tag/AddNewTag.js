import React from 'react';
import './AddNewTag.scss';
import Tag from './Tag';
const IPCInvoker = require('../ipc/IPCInvoker.js');

export default class AddNewTag extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			allTags: [],
			tags: [],
			selectedIndex: null,
			value: ""
		};
		new IPCInvoker("dataLoader").invoke("loadAllTags").then(allTags => {
			let newState = {allTags: allTags};
			if (!this.state.value) newState.tags = this.sortTags(allTags.slice());
			this.setState(newState);
		});	
		this.handleTagClick = this.handleTagClick.bind(this);
	}

	sortTags(tags) {
		return tags.sort((a, b) => b.videoCount - a.videoCount)
	}

	show() {
		this.setState({
			tags: this.sortTags(this.state.allTags.slice()),
			visible: true,
			selectedIndex: null,
			value: ""
		});
	}

	dismiss() {
		this.setState({visible: false})
	}

	handleChange(event) {
		let value = event.target.value;
		let tags;
		if (value.trim() === "") {
			tags = this.state.allTags.slice();
		}
		else {
			let keyword = value.toLowerCase();
			tags = this.state.allTags.filter(tag => tag.name.toLowerCase().includes(keyword) || tag.pinyin.includes(keyword));
		}
		this.setState({
			tags: this.sortTags(tags),
			selectedIndex: null,
			value: value
		})
	}

	handleGlobalKeyDown(event) {
		let selectedIndex = this.state.selectedIndex;
		let nextIndex;
		if (event.key === 't') {
			if (this.state.visible) return;
			event.preventDefault();
			this.show();
		}
		else if (event.key === 'Escape') {
			this.dismiss();
		}
		else if (event.key === 'Enter') {
			event.preventDefault();
			this.props.handleAddNewTag(this.state.value);
			this.dismiss();
		}

		if (this.state.tags.length === 0) return;
		if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			event.preventDefault();
			if (selectedIndex === 0) {
				nextIndex = 0;
			}
			else if (selectedIndex === null) {
				nextIndex = this.state.tags.length - 1;
			}
			else {
				nextIndex = selectedIndex - 1;
			}
		}
		else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			event.preventDefault();
			if (selectedIndex === this.state.tags.length - 1) {
				nextIndex = selectedIndex;
			}
			else if (selectedIndex === null) {
				nextIndex = 0;
			}
			else {
				nextIndex = selectedIndex + 1;
			}
		}
		if (nextIndex !== undefined) {
			this.setState({
				selectedIndex: nextIndex,
				value: this.state.tags[nextIndex].name
			})
		}

	}

	componentDidMount() {
		this._listener = this.handleGlobalKeyDown.bind(this);
		document.addEventListener("keydown", this._listener);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this._listener);
	}

	handleTagClick(tag) {
		this.props.handleAddNewTag(tag.name)
	}

	render() {
		if (!this.state.visible) return null;
		let tagDOMs = this.state.tags.map((tag, index) => 
			<Tag selected={index === this.state.selectedIndex} tag={tag} key={tag.name} handleClick={this.handleTagClick} />);
		let tagsDOM = tagDOMs.length > 0 ? <ul>{tagDOMs}</ul> : null;
		return (
			<div className="add-new-tag">
				<input 
					type="text" 
					autoFocus={true} 
					className={tagsDOM ? "has-hint" : null} 
					onChange={e => this.handleChange(e)}
					value={this.state.value}
					/>
				{tagsDOM}
			</div>
		)
	}
};
