import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import CreateNewScreenshot from './CreateNewScreenshot';
import VideoList from './VideoList'
import TagCategories from './tag/TagCategories'
import Sync from './sync/Sync'

export default function App() {
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
				<Route path="/">
					<VideoList />
				</Route>
			</Switch>
		</Router>
	);
}
