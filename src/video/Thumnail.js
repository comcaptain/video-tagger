import React from 'react';
import Tags from '../tag/Tags';
export default function Thumnail(props) {
	return (
		<div className="thumnail">
			<span className="seek-position">{props.seekPosition}</span>
			<Tags tagNames={props.tagNames} />
			<img src={props.screenshotPath} alt={props.screenshotPath}/>
		</div>
	)
}
