import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import CreateNewScreenshot from './CreateNewScreenshot';
import Home from './Home'
import TagCategories from './tag/TagCategories'
import Sync from './sync/Sync'
import { remote } from 'electron';
import Navigation from "./navigation/Navigation";

export default function App() {

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'F12') {
				remote.getCurrentWebContents().toggleDevTools();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});

	return (
		<Router>
			<Switch>
				<Route path="/tag/create">
					<CreateNewScreenshot />
				</Route>
				<Route path="/sync">
					<Sync />
				</Route>
				<Route path="/tags">
					<TagCategories />
				</Route>
				<Route path="/empty">
					<Navigation name="empty" />
				</Route>
				<Route path="/">
					<Home />
				</Route>
			</Switch>
		</Router>
	);
}
