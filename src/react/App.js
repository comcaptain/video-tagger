import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import CreateNewScreenshot from './CreateNewScreenshot';
import VideoList from './VideoList'
const FingerprintCalculator = require('../share/FingerprintCalculator')

export default function App() {
	new FingerprintCalculator('V:/mirror/未分类/CJOD-101-C/CJOD-101-C.mp4').calculate().then(v => console.info("calculated fingerprint is", v))
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
