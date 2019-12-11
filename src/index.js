import React from 'react';
import ReactDOM from 'react-dom';
import './react/index.css';
import App from './react/App';
import * as serviceWorker from './react/serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


document.addEventListener("keydown", function (e) {
	// F12
	if (e.which === 123) {
		require('electron').remote.getCurrentWindow().toggleDevTools();
	}
	// F5
	else if (e.which === 116) {
		window.location.reload();
	}
});