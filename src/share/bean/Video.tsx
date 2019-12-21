import { Screenshot } from './Screenshot';
export interface VideoModel {
	id: VideoID;
	path: VideoPath;
	last_modified_time: VideoModifiedTime;
	fingerprint: VideoFingerprint;
}

export interface VideoWithScreenshots {
	id: VideoID;
	path: VideoPath;
	screenshots: Screenshot[]
}

export type VideoID = string;
export type VideoPath = string;
export type VideoFingerprint = string;
export type VideoModifiedTime = Date;
