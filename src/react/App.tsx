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
// @ts-ignore
import { FindInPage } from 'electron-find';
import Navigation from "./navigation/Navigation";
const findInPage = new FindInPage(remote.getCurrentWebContents());

export default function App() {

	useEffect(() => {		
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'F12') {
				remote.getCurrentWebContents().toggleDevTools();
			}
			else if (event.ctrlKey && event.key === 'f') {
				findInPage.openFindWindow();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});

	return (
		<Router>
			<Switch>
				<Route path="/tag/create" component = {CreateNewScreenshot} />
				<Route path="/sync" component = {Sync} />
				<Route path="/tags" component = {TagCategories} />
				<Route path="/empty">
					<Navigation name="empty" />
				</Route>
				<Route path="/" component = {Home} />
			</Switch>
		</Router>
	);
}
