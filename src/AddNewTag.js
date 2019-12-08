import React from 'react';
import './AddNewTag.css';

export default class AddNewTag extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: true,
			tags: props.allTags.slice(),
			selectedIndex: null
		}
	}

	onTrigger() {
		this.setState({visible: true})
	}

	onDismiss() {
		this.setState({visible: false})
	}

	onInput(event) {
		let value = event.target.value.toLowerCase();
		if (value.trim() === "") {
			this.setState({tags: []})
			return;
		}
		this.setState({
			tags: this.props.allTags.filter(tag => tag.name.toLowerCase().includes(value)),
			selectedIndex: null
		})
	}

	onGlobalKeyDown(event) {
		let selectedIndex = this.state.selectedIndex;
		if (event.key == 't') {
			event.preventDefault();
			this.onTrigger();
		}
		else if (event.key == 'Escape') {
			this.onDismiss();
		}
		else if (event.key == 'ArrowUp') {
			event.preventDefault();
			let nextIndex;
			if (selectedIndex === 0) {
				nextIndex = 0;
			}
			else if (selectedIndex == null) {
				nextIndex = this.state.tags.length - 1;
			}
			else {
				nextIndex = selectedIndex - 1;
			}
			this.setState({selectedIndex: nextIndex})
		}
		else if (event.key == 'ArrowDown') {
			event.preventDefault();
			let nextIndex;
			if (selectedIndex === this.state.tags.length - 1) {
				nextIndex = selectedIndex;
			}
			else if (selectedIndex === null) {
				nextIndex = 0;
			}
			else {
				nextIndex = selectedIndex + 1;
			}
			this.setState({selectedIndex: nextIndex})
		}

	}

	componentDidMount() {
		this._listener = this.onGlobalKeyDown.bind(this);
		document.addEventListener("keydown", this._listener);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this._listener);
	}

	render() {
		if (!this.state.visible) return null;
		let tagDOMs = this.state.tags.map((tag, index) => {
			return (
				<li 
					key={tag.name} 
					className={index === this.state.selectedIndex ? "selected" : null}
					>
					{tag.name}
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
					onInput={e => this.onInput(e)}
					value={this.state.selectedIndex === null ? null : this.state.tags[this.state.selectedIndex].name}
					/>
				{tagsDOM}
			</div>
		)
	}
};
