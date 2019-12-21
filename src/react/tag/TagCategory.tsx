import React from 'react'
import Tags from './Tags'
import './TagCategory.scss'
import { TagType, TagWithVideoIDs } from '../../share/bean/Tag';

interface Props {
	isDefault?: boolean;
	name: TagType;
	tags: TagWithVideoIDs[];
	handleTypeChange: (tag: TagWithVideoIDs, type: TagType) => any;
	handleDragTagStart: (event: React.DragEvent) => any;
	handleDragTagEnd: (event: React.DragEvent) => any;
}

interface State {
	draggingOver: boolean;
}

export default class TagCategory extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.handleDragOver = this.handleDragOver.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.state = {
			draggingOver: false
		}
	}

	handleDragEnter() {
		this.setState({
			draggingOver: true
		})
	}

	handleDragLeave() {
		this.setState({
			draggingOver: false
		})
	}

	handleDragOver(event: React.DragEvent) {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}

	handleDrop(event: React.DragEvent) {
		event.preventDefault();
		this.setState({
			draggingOver: false
		})
		let tag = JSON.parse(event.dataTransfer.getData("tag"));
		if (tag.type === this.props.name) return;
		this.props.handleTypeChange(tag, this.props.name);
	}

	render() {
		let props = this.props;
		let tags = props.tags.filter(tag => props.name === tag.type || (props.isDefault && !tag.type));
		let className = "tag-category";
		if (this.state.draggingOver) className += " dragging-over";
		return (
			<div className={className}
				onDragOver={this.handleDragOver} onDrop={this.handleDrop}
				onDragEnter={this.handleDragEnter} onDragLeave={this.handleDragLeave}>
				<span className="tag-category-name">{props.name}</span>
				<Tags tags={tags} 
					handleDragTagStart={this.props.handleDragTagStart} 
					handleDragTagEnd={this.props.handleDragTagEnd} />
			</div>
		);
	}
}
