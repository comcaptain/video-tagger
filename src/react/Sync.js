import React from "react";
import Navigation from "./navigation/Navigation";
import './Sync.css'

const dialog = require('electron').remote.dialog;

export default class Sync extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			directories: []
		};
		this.selectDirectories = this.selectDirectories.bind(this);
	}
	
	selectDirectories() {
		let selectedDirectories = dialog.showOpenDialogSync({
			// The backslash in the end is very important. It won't work without it
			defaultPath: "V:\\",
			properties: ['openDirectory', 'multiSelections']
		});
		this.setState({
			directories: selectedDirectories
		})
	}

	render() {
		let diretoryDOMs = this.state.directories.map(v => <li key={v}>{v}</li>);
		return (<div>
			<Navigation name="sync" />
			<div id="sync">
				<button onClick={this.selectDirectories}>选择文件夹</button>
				{this.state.directories.length > 0 && <ul id="directories">{diretoryDOMs}</ul>}
			</div>
		</div>)
	}
}