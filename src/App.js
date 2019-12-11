import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import CreateNewScreenshot from './CreateNewScreenshot';
import VideoList from './VideoList'

export default function App() {
	return (
		<Router>
			<Switch>
				<Route path="/tag/create">
					<CreateNewScreenshot />
				</Route>
				<Route path="/">
					<VideoList />
				</Route>
			</Switch>
		</Router>
	);
}
