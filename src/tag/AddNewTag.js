import React from 'react';
import './AddNewTag.css';

export default class AddNewTag extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getInitialState();
	}

	getInitialState() {
		return {
			visible: false,
			tagNames: this.getDefaultTags(),
			selectedIndex: null,
			value: ""
		}
	}

	show() {
		this.setState({visible: true})
	}

	dismiss() {
		this.setState(this.getInitialState())
	}

	getDefaultTags() {
		return this.props.allTagNames.slice(0, 10);
	}

	handleChange(event) {
		let value = event.target.value;
		let tagNames;
		if (value.trim() === "") {
			tagNames = this.getDefaultTags();
		}
		else {
			let keyword = value.toLowerCase();
			tagNames = this.props.allTagNames.filter(tagName => tagName.toLowerCase().includes(keyword));
		}
		this.setState({
			tagNames: tagNames,
			selectedIndex: null,
			value: value
		})
	}

	handleGlobalKeyDown(event) {
		let selectedIndex = this.state.selectedIndex;
		let nextIndex;
		if (event.key == 't') {
			event.preventDefault();
			this.show();
		}
		else if (event.key == 'Escape') {
			this.dismiss();
		}
		else if (event.key == 'ArrowUp') {
			event.preventDefault();
			if (selectedIndex === 0) {
				nextIndex = 0;
			}
			else if (selectedIndex == null) {
				nextIndex = this.state.tagNames.length - 1;
			}
			else {
				nextIndex = selectedIndex - 1;
			}
		}
		else if (event.key == 'ArrowDown') {
			event.preventDefault();
			if (selectedIndex === this.state.tagNames.length - 1) {
				nextIndex = selectedIndex;
			}
			else if (selectedIndex === null) {
				nextIndex = 0;
			}
			else {
				nextIndex = selectedIndex + 1;
			}
		}
		else if (event.key == 'Enter') {
			event.preventDefault();
			this.props.handleAddNewTag(this.state.value);
			this.dismiss();
		}
		if (nextIndex !== undefined) {
			this.setState({
				selectedIndex: nextIndex,
				value: this.state.tagNames[nextIndex]
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

	render() {
		if (!this.state.visible) return null;
		let tagDOMs = this.state.tagNames.map((tagName, index) => {
			return (
				<li 
					key={tagName} 
					className={index === this.state.selectedIndex ? "selected" : null}
					>
					{tagName}
				</li>
			)
		})
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
