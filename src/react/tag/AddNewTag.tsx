import React from 'react';
import './AddNewTag.scss';
import Tag from './Tag';
const IPCInvoker = require('../ipc/IPCInvoker');

export default class AddNewTag extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			allTags: [],
			selectedIndex: null,
			value: "",
			frozenHints: null
		};
		new IPCInvoker("dataLoader").invoke("loadAllTags").then(allTags => this.setState({allTags: allTags}));	
		this.handleTagClick = this.handleTagClick.bind(this);
		this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
	}

	filterByVideoIDs(tags) {
		let visibleVideoIDs = this.props.videoIDs;
		if (!visibleVideoIDs) return tags;

		visibleVideoIDs = new Set(visibleVideoIDs);
		let filteredTags = [];
		tags.forEach(tag => {
			let videoIDs = tag.videoIDs.filter(visibleVideoIDs.has, visibleVideoIDs);
			if (videoIDs.length === 0) return;
			tag.videoIDs = videoIDs
			filteredTags.push(tag);
		});
		return filteredTags;
	}

	filterByValue(tags) {
		let value = this.state.value;
		if (value.trim() === "") {
			return tags;
		}
		let keyword = value.toLowerCase();
		return tags.filter(tag => tag.name.toLowerCase().includes(keyword) || tag.pinyin.includes(keyword));
	}

	getHints() {
		if (this.state.frozenHints) return this.state.frozenHints;
		let hints = JSON.parse(JSON.stringify(this.state.allTags));
		hints = this.filterByValue(hints);
		hints = this.filterByVideoIDs(hints);
		hints = hints.sort((a, b) => b.videoIDs.length - a.videoIDs.length);
		return hints;
	}

	handleTKeyDown(event) {
		if (this.state.visible) return;
		event.preventDefault();
		this.setState({
			visible: true,
			selectedIndex: null,
			value: "",
			frozenHints: null
		});
	}

	handleEscapeKeyDown() {
		if (!this.state.visible) return;
		this.setState({visible: false})
	}

	handleEnterKeyDown(event) {
		if (!this.state.visible) return;
		event.preventDefault();
		this.props.handleAddNewTag(this.state.value);
		this.setState({visible: false})
	}

	handleArrowLeftKeyDown(event) {
		if (!this.state.visible) return;
		let selectedIndex = this.state.selectedIndex;
		// Down key is not pressed (i.e. no hint is selected) yet, do nothing
		if (selectedIndex === null) return;
		
		// It's already left most, do nothing
		if (selectedIndex === 0) return;

		event.preventDefault();
		this.selectNewIndex(selectedIndex - 1, this.getHints());
	}

	handleArrowRightKeyDown(event) {
		if (!this.state.visible) return;
		let selectedIndex = this.state.selectedIndex;
		// Down key is not pressed (i.e. no hint is selected) yet, do nothing
		if (selectedIndex === null) return;
		
		let hints = this.getHints();
		// It's already right most, do nothing
		if (selectedIndex === hints.length - 1) return;

		event.preventDefault();
		this.selectNewIndex(selectedIndex + 1, hints);
	}

	selectNewIndex(newIndex, hints) {
		this.setState({
			selectedIndex: newIndex,
			value: hints[newIndex].name,
		});
	}

	handleArrowDownKeyDown(event) {
		if (!this.state.visible) return;
		let selectedIndex = this.state.selectedIndex;
		// There is already a hint selected, do nothing
		if (selectedIndex !== null) return;

		let hints = this.getHints();
		// No visible hints, do nothing
		if (hints.length === 0) return;

		event.preventDefault();
		this.setState({
			selectedIndex: 0,
			value: hints[0].name,
			frozenHints: hints
		});
	}

	handleChange(event) {
		let value = event.target.value;
		this.setState({
			selectedIndex: null,
			value: value,
			frozenHints: null
		})
	}

	handleGlobalKeyDown(event) {
		if (event.key === 't') { this.handleTKeyDown(event); return; }
		if (event.key === 'Escape') { this.handleEscapeKeyDown(event); return; }
		if (event.key === 'Enter') { this.handleEnterKeyDown(event); return; }
		if (event.key === 'ArrowLeft') { this.handleArrowLeftKeyDown(event); return; }
		if (event.key === 'ArrowDown') { this.handleArrowDownKeyDown(event); return; }
		if (event.key === 'ArrowRight') { this.handleArrowRightKeyDown(event); return; }
	}

	componentDidMount() {
		document.addEventListener("keydown", this.handleGlobalKeyDown);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleGlobalKeyDown);
	}

	handleTagClick(tag) {
		this.props.handleAddNewTag(tag.name)
	}

	render() {
		if (!this.state.visible) return null;
		let hintDOMs = this.getHints().map((tag, index) => 
			<Tag selected={index === this.state.selectedIndex} tag={tag} key={tag.name} handleClick={this.handleTagClick} />);
		let hintsDOM = hintDOMs.length > 0 ? <ul>{hintDOMs}</ul> : null;
		return (
			<div className="add-new-tag">
				<input 
					type="text" 
					autoFocus={true} 
					className={hintsDOM ? "has-hint" : null} 
					onChange={e => this.handleChange(e)}
					value={this.state.value}
					/>
				{hintsDOM}
			</div>
		)
	}
};
