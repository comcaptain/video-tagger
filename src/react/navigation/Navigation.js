import React from "react";
import './Navigation.css'
const ReactWindow = require("electron").remote.require('./ReactWindow.js');

const ROUTES = [
	{name: "list", url: "/", description: "视频列表"},
	{name: "sync", url: "/sync", description: "视频文件同步"},
	{name: "tags", url: "/tags", description: "标签分类"},
]

export default class Navigation extends React.PureComponent {
	
	handleClick(event, url) {
		if (event.ctrlKey) {
			new ReactWindow(url, {maximize: true}).open();
		}
		else {
			window.location.href = url;
		}
	}

	render() {
		let items = ROUTES.map(route => (<li key={route.name}>
			<img
				src={`/icons/${route.name}.svg`} 
				alt={route.name}
				title={route.description}
				className={this.props.name === route.name ? "selected nav-item" : "nav-item"}
				onClick={e => this.handleClick(e, route.url)}
				/>
		</li>))
		return (
			<nav>
				<ul>{items}</ul>
			</nav>
		)
	}
}