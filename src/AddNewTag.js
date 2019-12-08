import React from 'react';
import './AddNewTag.css';

export default class AddNewTag extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: true,
			tags: props.allTags.slice()
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
		this.setState({tags: this.props.allTags.filter(tag => tag.name.toLowerCase().includes(value))})
	}

	onGlobalKeyDown(event) {
		if (event.key == 't') {
			event.preventDefault();
			this.onTrigger();
		}
		else if (event.key == 'Escape') {
			this.onDismiss();
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
		let tagDOMs = this.state.tags.map(tag => {
			return (
				<li key={tag.name}>{tag.name}</li>
			)
		})
		let tagsDOM = tagDOMs.length > 0 ? <ul>{tagDOMs}</ul> : null;
		return (
			<div class="add-new-tag">
				<input type="text" autoFocus={true} class={tagsDOM ? "has-hint" : null} onInput={e => this.onInput(e)}/>
				{tagsDOM}
			</div>
		)
	}
};
