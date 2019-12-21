import React, { ChangeEvent } from 'react';
import './AddNewTag.scss';
import Tag from './Tag';
import { VideoID } from '../../share/bean/Video';
import { TagWithVideoIDs, TagName, EmptyTag } from '../../share/bean/Tag';
import IPCInvoker from '../ipc/IPCInvoker';

interface Props {
	videoIDs?: VideoID[];
	handleAddNewTag: (name: TagName) => any;
}

interface State {
	visible: boolean;
	allTags: TagWithVideoIDs[];
	selectedIndex: number | null;
	value: TagName;
	frozenHints: TagWithVideoIDs[] | null;
}

export default class AddNewTag extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			visible: false,
			allTags: [],
			selectedIndex: null,
			value: "",
			frozenHints: null
		};
		new IPCInvoker("dataLoader").invoke("loadAllTags").then((allTags: TagWithVideoIDs[]) => this.setState({allTags: allTags}));	
		this.handleTagClick = this.handleTagClick.bind(this);
		this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
	}

	filterByVideoIDs(tags: TagWithVideoIDs[]) {
		if (!this.props.videoIDs) return tags;

		let visibleVideoIDs = new Set(this.props.videoIDs);
		let filteredTags: TagWithVideoIDs[] = [];
		tags.forEach(tag => {
			let videoIDs = tag.videoIDs.filter(visibleVideoIDs.has, visibleVideoIDs);
			if (videoIDs.length === 0) return;
			tag.videoIDs = videoIDs
			filteredTags.push(tag);
		});
		return filteredTags;
	}

	filterByValue(tags: TagWithVideoIDs[]) {
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
		hints = hints.sort((a: TagWithVideoIDs, b:TagWithVideoIDs) => b.videoIDs.length - a.videoIDs.length);
		return hints;
	}

	handleTKeyDown(event: KeyboardEvent) {
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

	handleEnterKeyDown(event: KeyboardEvent) {
		if (!this.state.visible) return;
		event.preventDefault();
		this.props.handleAddNewTag(this.state.value);
		this.setState({visible: false})
	}

	handleArrowLeftKeyDown(event: KeyboardEvent) {
		if (!this.state.visible) return;
		let selectedIndex = this.state.selectedIndex;
		// Down key is not pressed (i.e. no hint is selected) yet, do nothing
		if (selectedIndex === null) return;
		
		// It's already left most, do nothing
		if (selectedIndex === 0) return;

		event.preventDefault();
		this.selectNewIndex(selectedIndex - 1, this.getHints());
	}

	handleArrowRightKeyDown(event: KeyboardEvent) {
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

	selectNewIndex(newIndex: number, hints: TagWithVideoIDs[]) {
		this.setState({
			selectedIndex: newIndex,
			value: hints[newIndex].name,
		});
	}

	handleArrowDownKeyDown(event: KeyboardEvent) {
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

	handleChange(event: ChangeEvent<HTMLInputElement>) {
		let value = event.target.value;
		this.setState({
			selectedIndex: null,
			value: value,
			frozenHints: null
		})
	}

	handleGlobalKeyDown(event: KeyboardEvent) {
		if (event.key === 't') { this.handleTKeyDown(event); return; }
		if (event.key === 'Escape') { this.handleEscapeKeyDown(); return; }
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

	handleTagClick(tag: TagWithVideoIDs | EmptyTag) { 
		this.props.handleAddNewTag(tag.name)
	}

	render() {
		if (!this.state.visible) return null;
		let hintDOMs = this.getHints().map((tag: TagWithVideoIDs, index: number) => 
			<Tag selected={index === this.state.selectedIndex} tag={tag} key={tag.name} handleClick={this.handleTagClick} />);
		let hintsDOM = hintDOMs.length > 0 ? <ul>{hintDOMs}</ul> : null;
		return (
			<div className="add-new-tag">
				<input 
					type="text" 
					autoFocus={true} 
					className={hintsDOM ? "has-hint" : undefined} 
					onChange={e => this.handleChange(e)}
					value={this.state.value}
					/>
				{hintsDOM}
			</div>
		)
	}
};
