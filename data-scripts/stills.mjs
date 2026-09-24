// Render review stills for a list of frames with a single bundle: node data-scripts/stills.mjs 30 300 700
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'TrackLayer', browserExecutable});
for (const frame of frames) {
	const output = `renders/stills/f${String(frame).padStart(4, '0')}.png`;
	await renderStill({serveUrl, composition, frame, output, browserExecutable});
	console.log('wrote', output);
}
