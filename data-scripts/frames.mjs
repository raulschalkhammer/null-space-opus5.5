// Render review frames without rendering a video: specific frames, or every Nth frame of a composition.
//   node data-scripts/frames.mjs MillionLetters out/ch3 1635 2220 3401      (these frames, half size)
//   node data-scripts/frames.mjs MillionLetters out/ch3 --every=36 --scale=0.25   (one frame per 1.5 s)
// Pair with data-scripts/contact-sheet.py to review a whole chapter on one image.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderFrames, renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const [comp, out] = args.filter((a) => !a.startsWith('--'));
const frames = args.filter((a) => !a.startsWith('--')).slice(2).map(Number);
const opt = (k, d) => Number(args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d);
const every = opt('every', 0);
const scale = opt('scale', 0.5);
if (!comp || !out) throw new Error('usage: node data-scripts/frames.mjs <Composition> <outDir> [frames...] [--every=N] [--scale=0.5]');

const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, logLevel: 'error'});
const browser = await openBrowser('chrome', {browserExecutable, logLevel: 'error'});
if (every > 0) {
	await renderFrames({
		serveUrl, composition, inputProps: {}, outputDir: out, imageFormat: 'jpeg', jpegQuality: 80, scale, everyNthFrame: every,
		frameRange: [0, composition.durationInFrames - 1], puppeteerInstance: browser, concurrency: 4, logLevel: 'error',
		onStart: () => undefined, onFrameUpdate: () => undefined,
	});
} else {
	for (const fr of frames) {
		await renderStill({serveUrl, composition, frame: fr, output: `${out}/element-${String(fr).padStart(5, '0')}.jpeg`, imageFormat: 'jpeg', scale, puppeteerInstance: browser, logLevel: 'error'});
	}
}
await browser.close({silent: true});
console.log(`wrote ${out} (${composition.durationInFrames} frames in ${comp})`);
