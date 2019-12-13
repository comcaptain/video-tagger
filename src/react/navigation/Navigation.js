import React from "react";
import './Navigation.css'

const ROUTES = [
	{name: "list", url: "/", description: "视频列表"},
	{name: "sync", url: "/sync", description: "视频文件同步"},
]

export default class Navigation extends React.PureComponent {
	
	jumpTo(url) {
		window.location.href = url;
	}

	render() {
		let items = ROUTES.map(route => (<li key={route.name}>
			<img
				src={`/icons/${route.name}.svg`} 
				alt={route.name}
				title={route.description}
				className={this.props.name === route.name ? "selected nav-item" : "nav-item"}
				onClick={() => this.jumpTo(route.url)}
				/>
		</li>))
		return (
			<nav>
				<ul>{items}</ul>
			</nav>
		)
	}
}