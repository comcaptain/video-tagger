import { TagName } from "./Tag";

export type ScreenshotPath = string;
export type SeekPosition = string;
export interface Screenshot {
    seekPosition: SeekPosition;
    screenshotPath: ScreenshotPath;
    tagNames: TagName[];
}