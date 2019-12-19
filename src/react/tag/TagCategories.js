import React from 'react'
import TagCategory from './TagCategory'
import Navigation from "../navigation/Navigation";
import './TagCategories.scss'
const IPCInvoker = require('../ipc/IPCInvoker.js');

export default class TagCategories extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: []
		};
		new IPCInvoker("dataLoader").invoke("loadAllTags").then(tags => this.setState({tags: tags.sort((a, b) => b.videoIDs.length - a.videoIDs.length)}));	
	}

	render() {
		return (<div>
			<Navigation />
			<div id="tag-categories">				
				<TagCategory tags={this.state.tags} name="一级目录" />
				<TagCategory tags={this.state.tags} name="二级目录" />
				<TagCategory tags={this.state.tags} name="文件名" />
				<TagCategory tags={this.state.tags} name="其它" isDefault={true} />
			</div>
		</div>)
	}
}
