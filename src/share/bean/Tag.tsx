import { VideoID } from './Video';
export interface TagModel {
	id: TagID;
	name: TagName;
	pinyin: PinYin;
	type?: TagType;
}

export interface TagWithVideoIDs extends TagModel {
	videoIDs: VideoID[]	
}

export interface EmptyTag {
	name: TagName
}

export type PinYin = string;
export type TagID = string;
export type TagName = string;
export type TagType = string;
