import { TagWithVideoIDs, TagName, TagType } from '../../share/bean/Tag';
import { VideoWithScreenshots, VideoID, VideoPath } from '../../share/bean/Video';
import path from 'path';
import IPCInvoker from '../ipc/IPCInvoker';
import util from 'util';
import fs from 'fs';

const dataPersister = new IPCInvoker("dataPersister");
const fsRename = util.promisify(fs.rename);
const fsMkdir = util.promisify(fs.mkdir);
const TAG_NAME_MARKER = "_$_";

export default class VideoMover {

    public logLines: string[] = [];

    constructor(private _targetDir: string, private _tags: TagWithVideoIDs[], private _videos: VideoWithScreenshots[]) { }

    async move() {
        let tagNameToTag: {[key:string]: TagWithVideoIDs} = {};
        this._tags.forEach(tag => {tagNameToTag[tag.name] = tag});
        await Promise.all(this._videos.map(async (video) => {
            let tagNames = new Set<TagName>();
            video.screenshots.forEach(screenshot => screenshot.tagNames.forEach(tagNames.add, tagNames));
            let tags = Array.from(tagNames).map(tagName => tagNameToTag[tagName]).sort((a, b) => a.videoIDs.length - b.videoIDs.length);
            let newDir = this._getNewDir(tags);
            let newName = this._getNewName(tags, path.basename(video.path));
            let newPath = path.join(newDir, newName);
            await this._moveVideo(video.id, video.path, newPath);
        }));
    }

    // TODO: If ass/srt exists with the same name, then move it to new path
    private async _moveVideo(videoID: VideoID, oldPath: VideoPath, newPath: VideoPath) {
        if (oldPath === newPath) return;
        let targetDirectory = path.dirname(newPath);
        this.logLines.push(`Recursively creating directory for ${targetDirectory} ...`)
        await fsMkdir(targetDirectory, {recursive: true});
        this.logLines.push(`Created directories, moving video from ${oldPath} to ${newPath} ...`);
        await fsRename(oldPath, newPath);
        this.logLines.push(`Moved video from ${oldPath} to ${newPath}, updating db ...`);
        await dataPersister.invoke("updateVideoPath", videoID, newPath);
        this.logLines.push(`Updated path of video ${videoID} from ${oldPath} to ${newPath}`);
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