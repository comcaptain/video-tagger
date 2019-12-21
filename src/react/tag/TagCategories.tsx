import React from 'react'
import TagCategory from './TagCategory'
import Navigation from "../navigation/Navigation";
import './TagCategories.scss'
import '../styles/buttons.scss'
const IPCInvoker = require('../ipc/IPCInvoker');

const CATEGORIES = [{name: "一级目录"}, {name: "二级目录"}, {name: "文件名"}, {name: "其它", isDefault: true}]

export default class TagCategories extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: [],
			dragging: false,
			savingTagTypes: false
		};
		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.handleDragTagStart = this.handleDragTagStart.bind(this);
		this.handleDragTagEnd = this.handleDragTagEnd.bind(this);
		this.reloadTags();
	}

	reloadTags() {
		return new IPCInvoker("dataLoader").invoke("loadAllTags")
			.then(tags => this.setState({tags: tags.sort((a, b) => b.videoIDs.length - a.videoIDs.length)}));	
	}

	handleTypeChange(tag, newType) {
		let tags = this.state.tags;
		tags.filter(v => v.id === tag.id).forEach(v => v.type = newType);
		this.setState({tags: tags, dragging: false});
	}

	handleDragTagStart() {
		// Use setTimeout here so that drag can start
		setTimeout(() => this.setState({dragging: true}))
	}

	handleDragTagEnd() {
		this.setState({dragging: false});
	}

	saveTagTypes() {
		if (!window.confirm("确定要保存标签分类吗？")) return;
		this.setState({savingTagTypes: true});
		new IPCInvoker("dataPersister").invoke("updateTagTypes", this.state.tags)
			.then(() => this.reloadTags())
			.then(() => this.setState({savingTagTypes: false}));
	}

	render() {
		const categories = CATEGORIES.map(category => (<TagCategory 
			tags={this.state.tags}
			key={category.name}
			name={category.name}
			isDefault={category.isDefault}
			handleTypeChange={this.handleTypeChange}
			handleDragTagStart={this.handleDragTagStart}
			handleDragTagEnd={this.handleDragTagEnd}
		/>));
		return (<div>
			<Navigation />
			<div id="tag-categories" className={this.state.dragging ? "dragging" : null}>
				{categories}
				<div id="buttons">
					<button 
						disabled={this.state.savingTagTypes} 
						className="action-button green" 
						onClick={this.saveTagTypes.bind(this)}>保存标签分类</button>
				</div>
			</div>
		</div>)
	}
}
