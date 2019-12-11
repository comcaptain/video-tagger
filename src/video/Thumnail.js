import React from 'react';
import Tags from '../tag/Tags';
import './Thumnail.css'
export default function Thumnail(props) {
	return (
		<img className="thumnail" src={props.screenshotPath} alt={props.screenshotPath}/>
	)
}
