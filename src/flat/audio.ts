import {staticFile} from 'remotion';

declare const __PREVIEW__: boolean | undefined;

// A chapter's mixed soundtrack. Renders use the WAV; the browser preview ships a small MP3 copy instead.
export const track = (name: string) => staticFile(`audio/${name}.${typeof __PREVIEW__ !== 'undefined' && __PREVIEW__ ? 'mp3' : 'wav'}`);
