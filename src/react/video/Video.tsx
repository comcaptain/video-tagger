import React from 'react';
import Thumnail from './Thumnail'
import Tags from '../tag/Tags'
import './Video.scss'
import { Screenshot } from '../../share/bean/Screenshot';
import { TagName } from '../../share/bean/Tag';
import { VideoPath } from '../../share/bean/Video';

interface Props {
	screenshots: Screenshot[];
	thumbnailStyle: React.CSSProperties;
    path: VideoPath;
    collapsedByDefault?: boolean;
}

interface State {
	collapsed: boolean
}

export default class Video extends React.Component<Props, State> {
    constructor(props: Props) {
		super(props);
		this.state = {
			collapsed: !!props.collapsedByDefault
		}
    }

    render() {
        const { props } = this;
        let tagNameSet = new Set<TagName>();
        props.screenshots.forEach(v => v.tagNames.forEach(tagNameSet.add, tagNameSet));
        let tags = Array.from(tagNameSet.values()).map(v => ({name: v}));
		let thumnailsDOM = null;
		if (!this.state.collapsed) {
			let thumnailDOMs = props.screenshots.map(v => <Thumnail {...v} 
				thumbnailStyle = {props.thumbnailStyle} videoPath={props.path} key={v.screenshotPath} />);
			thumnailsDOM = <div className="thumnails">{thumnailDOMs}</div>;
		} 
        return (
            <div className="video">
                <div className="video-meta-data" onClick={e => this.setState({collapsed: !this.state.collapsed})}>				
                    <Tags tags={tags} />
                    <span className="path">{props.path}</span>
                </div>
                {thumnailsDOM}
            </div>
        )
    }
}