import React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useRouteMatch,
	useParams
} from "react-router-dom";
import CreateNewTag from './CreateNewTag';

export default function App() {
	return (
		<Router>
			<Switch>
				<Route path="/tag/create">
					<CreateNewTag />
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
