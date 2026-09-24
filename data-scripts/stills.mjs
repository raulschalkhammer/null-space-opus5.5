// Render review stills with a single bundle.
//   node data-scripts/stills.mjs 120 300 900              (frames of TrackLayer)
//   node data-scripts/stills.mjs --comp=StyleA-Riso 0     (another composition)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const args = process.argv.slice(2);
const comps = args.filter((a) => a.startsWith('--comp=')).map((a) => a.slice(7));
const frames = args.filter((a) => !a.startsWith('--')).map(Number);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of comps.length ? comps : ['TrackLayer']) {
	const composition = await selectComposition({serveUrl, id, browserExecutable});
	for (const frame of frames.length ? frames : [0]) {
		const output = id === 'TrackLayerPaper' ? `renders/paper/f${String(frame).padStart(4, '0')}.png` : id === 'TrackLayer' ? `renders/stills/f${String(frame).padStart(4, '0')}.png` : `renders/styleframes/${id}.png`;
		await renderStill({serveUrl, composition, frame, output, browserExecutable});
		console.log('wrote', output);
	}
}
