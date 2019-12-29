import { TagWithVideoIDs, TagName, TagType } from '../../share/bean/Tag';
import { VideoWithScreenshots, VideoID, VideoPath } from '../../share/bean/Video';
import path from 'path';

const TAG_NAME_MARKER = "_$_";

export default class VideoMover {

    constructor(private _targetDir: string, private _tags: TagWithVideoIDs[], private _videos: VideoWithScreenshots[]) { }

    move() {
        console.info(this._videos);
        let tagNameToTag: {[key:string]: TagWithVideoIDs} = {};
        this._tags.forEach(tag => {tagNameToTag[tag.name] = tag});
        this._videos.forEach(video => {
            let tagNames = new Set<TagName>();
            video.screenshots.forEach(screenshot => screenshot.tagNames.forEach(tagNames.add, tagNames));
            let tags = Array.from(tagNames).map(tagName => tagNameToTag[tagName]).sort((a, b) => a.videoIDs.length - b.videoIDs.length);
            let newDir = this._getNewDir(tags);
            let newName = this._getNewName(tags, path.basename(video.path))
            console.info(video.path, "->", path.join(newDir, newName));
        })
    }

    private _getNewName(tags: TagWithVideoIDs[], videoName: string) {
        let newName = videoName;
        if (videoName.indexOf(TAG_NAME_MARKER) >= 0) {
            newName = videoName.substr(videoName.indexOf(TAG_NAME_MARKER) + TAG_NAME_MARKER.length);
        }
        let tagNames = tags.filter(tag => tag.type === TagType.OTHER || !tag.type).map(tag => tag.name).join("_");
        if (tagNames) newName = tagNames + TAG_NAME_MARKER + newName;
        return newName;
    }

    private _getNewDir(tags: TagWithVideoIDs[]) {
        let newPath;
        let firstLevelDirName = tags.filter(tag => tag.type === TagType.FIRST_LEVEL).map(tag => tag.name)[0];
        firstLevelDirName = firstLevelDirName ? firstLevelDirName : "其它";
        let secondLevelDirName = tags.filter(tag => tag.type === TagType.SECOND_LEVEL).map(tag => tag.name)[0];
        if (secondLevelDirName) {
            newPath = path.join(this._targetDir, firstLevelDirName, secondLevelDirName);
        }
        else {
            newPath = path.join(this._targetDir, firstLevelDirName);
        }
        return newPath;
    }
}