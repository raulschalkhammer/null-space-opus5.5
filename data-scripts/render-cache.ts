// Scene-cached render: every scene is rendered to its own clip once and reused until its pictures change.
//   node --experimental-strip-types data-scripts/render-cache.ts ch2              render chapter 2 (reusing clean scenes)
//   node --experimental-strip-types data-scripts/render-cache.ts ch1 --check      only report which scenes changed
//   node --experimental-strip-types data-scripts/render-cache.ts ch2 --force=mail,pass   re-render these scenes regardless
//   node --experimental-strip-types data-scripts/render-cache.ts ch1 --all        re-render every scene
//   node --experimental-strip-types data-scripts/render-cache.ts ch2 --adopt      trust the clips on disk as current and
//                                                  store their reference samples (after a render from the same code)
// How a scene is judged "changed": a quick low-res pass renders a handful of frames per scene (its first frame,
// the cross-fade, then every SAMPLE frames, and its last frame) and compares them with the samples kept from the
// scene's last render. Rendering noise moves a few pixels by a few shades, so a sample counts as changed only when
// more than NOISE_BLOCKS 2x2 blocks of pixels differ clearly. Frames are sampled relative to the scene's own start, so a scene that
// only moved in time (an earlier narration line got longer) is still reused.
// The chosen clips are then joined without re-encoding and the chapter's current soundtrack is laid on top, so an
// audio-only change never re-renders video. Output: renders/<chapter>-cached.mp4 (+ a -share copy).
import {bundle} from '@remotion/bundler';
import {openBrowser, renderFrames, renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {buildFlatFilm} from '../src/shorts/flat-track/timeline.ts';
import {buildContract} from '../src/shorts/jev-contract/timeline.ts';
import {buildMillion} from '../src/shorts/million-letters/timeline.ts';
import {type Fixture, type VoLine} from '../src/shorts/paper-track/timeline.ts';
import {chapterList} from '../src/chapters.ts';
import {changedBlocks} from './png.ts';
import {browserExecutable as findBrowser, ffmpegBin, ffmpegEnv} from './local.mjs';

const SAMPLE = 12; // one fingerprint frame every half second
const XF = 12; // cross-fade length, sampled mid-way so a change in the previous scene's tail is seen
const FP_SCALE = 0.35;
const NOISE_BLOCKS = 4; // changed 2x2 pixel blocks allowed per sample before a scene counts as changed

const args = process.argv.slice(2);
const chId = args.find((a) => !a.startsWith('--')) ?? 'ch1';
const checkOnly = args.includes('--check');
const adopt = args.includes('--adopt');
const all = args.includes('--all');
const force = new Set(args.find((a) => a.startsWith('--force='))?.slice(8).split(',') ?? []);

const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const fx = json('fixtures/track-layer.json') as Fixture;
const flat = buildFlatFilm(fx, json('fixtures/track-layer-flat-vo.json').lines as VoLine[]);
const contract = buildContract(json('fixtures/jev-contract-vo.json').lines as VoLine[]);
const million = buildMillion(json('fixtures/million-letters-vo.json').lines as VoLine[]);
const ch = chapterList(flat, contract, million).find((c) => c.id === chId);
if (!ch) throw new Error(`Unknown chapter ${chId}; use ch1, ch2 or ch3`);

const dir = `renders/cache/${ch.comp}`;
mkdirSync(dir, {recursive: true});
type Entry = {len: number; samples: number[]; file: string};
const manifestPath = `${dir}/manifest.json`;
const manifest: Record<string, Entry> = existsSync(manifestPath) ? json(manifestPath) : {};

const ffmpeg = (a: string[]) => execFileSync(ffmpegBin(), ['-y', '-hide_banner', '-loglevel', 'error', ...a], {env: ffmpegEnv(), stdio: 'inherit'});
const browserExecutable = findBrowser();

const t0 = Date.now();
const secs = () => `${((Date.now() - t0) / 1000).toFixed(0)}s`;
console.log(`Chapter ${ch.n} (${ch.comp}): ${ch.scenes.length} scenes, ${ch.total} frames`);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: ch.comp, browserExecutable, logLevel: 'error'});
const browser = await openBrowser('chrome', {browserExecutable, logLevel: 'error'});

// 1. fingerprint every scene
const samples = (len: number) => [...new Set([0, XF / 2, ...Array.from({length: Math.ceil(len / SAMPLE)}, (_, i) => i * SAMPLE), len - 1])].filter((x) => x < len).sort((a, b) => a - b);
const fresh: Record<string, Map<number, Buffer>> = {};
for (const s of ch.scenes) {
	const len = s.end - s.start;
	const want = new Set(samples(len).map((x) => x + s.start));
	const got = new Map<number, Buffer>();
	// renderFrames takes one stride, so render the stride grid plus the two extra frames in small ranges
	const ranges: [number, number, number][] = [[s.start, s.end - 1, SAMPLE], [s.start + XF / 2, s.start + XF / 2, 1], [s.end - 1, s.end - 1, 1]];
	for (const [a, b, n] of ranges) {
		if (a > b || a >= s.end) continue;
		await renderFrames({
			serveUrl, composition, inputProps: {}, outputDir: null, imageFormat: 'png', scale: FP_SCALE,
			frameRange: [a, b], everyNthFrame: n, puppeteerInstance: browser, concurrency: 4, logLevel: 'error',
			onStart: () => undefined,
			onFrameUpdate: () => undefined,
			onFrameBuffer: (buf, frame) => {
				if (want.has(frame)) got.set(frame - s.start, Buffer.from(buf));
			},
		});
	}
	fresh[s.id] = got;
}
const fpDir = (id: string) => `${dir}/fp/${id}`;
const differs = (id: string) => {
	for (const [k, buf] of fresh[id]) {
		const f = `${fpDir(id)}/${k}.png`;
		const n = existsSync(f) ? changedBlocks(readFileSync(f), buf) : Infinity;
		if (n > NOISE_BLOCKS) return `pictures changed at +${k}${Number.isFinite(n) ? ` (${n} blocks)` : ''}`;
	}
	return '';
};
const keepSamples = (id: string) => {
	rmSync(fpDir(id), {recursive: true, force: true});
	mkdirSync(fpDir(id), {recursive: true});
	for (const [k, buf] of fresh[id]) writeFileSync(`${fpDir(id)}/${k}.png`, buf);
	return [...fresh[id].keys()].sort((a, b) => a - b);
};
console.log(`fingerprints done (${secs()})`);

// 2. decide what to render
const plan = ch.scenes.map((s) => {
	const len = s.end - s.start;
	const old = manifest[s.id];
	const file = `${dir}/${s.id}.mp4`;
	const why = all ? 'all' : force.has(s.id) ? 'forced' : !old || !existsSync(old.file) ? 'new' : old.len !== len ? `length ${old.len}→${len}` : differs(s.id);
	return {s, len, file, why};
});
for (const p of plan) console.log(`  ${p.why ? '✎' : '✓'} ${p.s.name.padEnd(12)} ${String(p.len).padStart(5)} f  ${p.why || 'cached'}`);
const dirty = plan.filter((p) => p.why);
if (adopt) {
	for (const p of plan) if (existsSync(p.file)) manifest[p.s.id] = {len: p.len, samples: keepSamples(p.s.id), file: p.file};
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
	console.log(`adopted ${plan.filter((p) => existsSync(p.file)).length} clip(s) as current`);
	await browser.close({silent: true});
	process.exit(0);
}
if (checkOnly) {
	console.log(`${dirty.length} of ${plan.length} scenes would re-render (${dirty.reduce((a, p) => a + p.len, 0)} of ${ch.total} frames)`);
	await browser.close({silent: true});
	process.exit(0);
}

// 3. render the changed scenes, each as its own clip
for (const p of dirty) {
	let last = -1;
	await renderMedia({
		serveUrl, composition, codec: 'h264', outputLocation: p.file, frameRange: [p.s.start, p.s.end - 1], muted: true,
		puppeteerInstance: browser, inputProps: {}, logLevel: 'error',
		onProgress: ({progress}) => {
			const pc = Math.floor(progress * 10);
			if (pc !== last) process.stdout.write(`\r  rendering ${p.s.name} ${pc * 10}%   `), (last = pc);
		},
	});
	process.stdout.write('\n');
	manifest[p.s.id] = {len: p.len, samples: keepSamples(p.s.id), file: p.file};
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
}
await browser.close({silent: true});
console.log(`rendered ${dirty.length} scene(s) (${secs()})`);

// 4. join the clips without re-encoding, lay the current soundtrack on top
const list = `${dir}/concat.txt`;
writeFileSync(list, plan.map((p) => `file '${path.resolve(p.file)}'`).join('\n') + '\n');
const out = `renders/${ch.id}-${ch.comp}-cached.mp4`;
ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-i', `public/audio/${ch.audio}.wav`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', out]);
const share = out.replace('.mp4', '-share.mp4');
if (!args.includes('--no-share')) ffmpeg(['-i', out, '-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', share]);
console.log(`wrote ${out}${args.includes('--no-share') ? '' : ` and ${share}`} (${secs()})`);
