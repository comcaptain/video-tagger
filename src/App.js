import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useRouteMatch,
	useParams
} from "react-router-dom";
import CreateNewScreenshot from './CreateNewScreenshot';
const dataLoader = require('./store/dataLoader.js')

export default function App() {
	dataLoader.execute('loadAllVideos').then(v => console.log("Loaded", v));
	return (
		<Router>
			<Switch>
				<Route path="/tag/create">
					<CreateNewScreenshot />
				</Route>
				<Route path="/">
					<Home />
				</Route>
			</Switch>
		</Router>
	);
}

function Home() {
	return <h2>Home</h2>;
}
