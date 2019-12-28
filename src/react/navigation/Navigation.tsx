import React from "react";
import './Navigation.css'
import {remote} from 'electron';
import { useHistory } from "react-router-dom";
const ReactWindow = remote.require('./ReactWindow').default;

const ROUTES = [
	{name: "list", url: "/", description: "视频列表"},
	{name: "sync", url: "/sync", description: "视频文件同步"},
	{name: "tags", url: "/tags", description: "标签分类"},
]

interface Props {
	name: string
}

export default function Navigation(props: Props) {
	const history = useHistory();
	function handleClick(event: React.MouseEvent, url: string) {
		if (event.ctrlKey) {
			new ReactWindow(url, {maximize: true}).open();
		}
		else {
			history.push(url);
		}
	}
	let items = ROUTES.map(route => (<li key={route.name}>
		<img
			src={`/icons/${route.name}.svg`} 
			alt={route.name}
			title={route.description}
			className={props.name === route.name ? "selected nav-item" : "nav-item"}
			onClick={e => handleClick(e, route.url)}
			/>
	</li>))
	return (
		<nav>
			<ul>{items}</ul>
		</nav>
	)
}