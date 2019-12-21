import React from 'react';
import './Tag.scss';

export default class Tag extends React.Component {

	constructor(props) {
		super(props);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	handleDragStart(event) {
		event.dataTransfer.setData("tag", JSON.stringify(this.props.tag));
		event.dataTransfer.dropEffect = this.props.dropTagEffect;
		this.props.handleDragTagStart(event);
	}

	getClassName() {
		let classNames = ["video-tag"];
		if (this.props.handleRemoveTag) classNames.push("removable");
		if (this.props.selected) classNames.push("selected");
		if (this.props.handleClick) classNames.push("clickable");
		if (this.isDraggable()) classNames.push("draggable");
		return classNames.join(" ");
	}

	isDraggable() {
		return !!this.props.handleDragTagStart;
	}

	render() {		
		let tag = this.props.tag;
		let tagName, videoCount;
		if (typeof tag === 'string') {
			tagName = tag;
			videoCount = "";
		}
		else {
			tagName = tag.name;
			videoCount = `(${tag.videoIDs.length})`;
		}
		return (
			<li className={this.getClassName()} 
				onDragStart={this.handleDragStart} 
				onDragEnd={this.props.handleDragTagEnd} 
				draggable={this.isDraggable()}>
				<span onClick={this.props.handleClick ? () => this.props.handleClick(tag) : null}>{tagName}{videoCount}</span>
				{this.props.handleRemoveTag && (<button 
					className="remove-tag" 
					onClick={e => this.props.handleRemoveTag(tagName)}>x</button>)
				}
			</li>
		)
	}
}
