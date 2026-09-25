// Build the browser preview ("Screening Room"): one self-contained HTML page (script, styles and fonts inline)
// plus small MP3 copies of the chapter soundtracks. Output: preview/index.html and preview/audio/*.mp3.
//   node data-scripts/build-preview.mjs
// Then publish preview/index.html as an artifact with the audio files next to it.
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const OUT = 'preview';
const TRACKS = ['flat2-track', 'contract-track'];
mkdirSync(`${OUT}/audio`, {recursive: true});

// Soundtracks: MP3 copies (plays in every browser), re-encoded only when the WAV is newer.
const FF = 'node_modules/@remotion/compositor-linux-x64-gnu';
for (const t of TRACKS) {
	const src = `public/audio/${t}.wav`;
	const dst = `${OUT}/audio/${t}.mp3`;
	if (existsSync(dst) && statSync(dst).mtimeMs > statSync(src).mtimeMs) continue;
	execFileSync(`${FF}/ffmpeg`, ['-y', '-loglevel', 'error', '-i', src, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', dst], {env: {...process.env, LD_LIBRARY_PATH: FF}});
	console.log('audio', dst);
}

// Fontsource ships every script subset; the film only needs Latin, which keeps the page small.
const latinOnly = {
	name: 'latin-only',
	setup(b) {
		b.onResolve({filter: /^@fontsource\/[^/]+\/[\w-]+\.css$/}, (args) => {
			const [, pkg, file] = args.path.match(/^@fontsource\/([^/]+)\/([\w-]+\.css)$/);
			const dir = path.resolve('node_modules/@fontsource', pkg);
			const latin = path.join(dir, `latin-${file}`);
			return {path: existsSync(latin) ? latin : path.join(dir, file)};
		});
	},
};

const builtAt = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const res = await build({
	entryPoints: ['src/preview/main.tsx'],
	bundle: true,
	write: false,
	outdir: OUT,
	format: 'iife',
	minify: true,
	jsx: 'automatic',
	target: 'es2020',
	define: {__PREVIEW__: 'true', __BUILT_AT__: JSON.stringify(builtAt), 'process.env.NODE_ENV': '"production"'},
	loader: {'.woff2': 'dataurl', '.woff': 'empty', '.ttf': 'empty', '.json': 'json'},
	plugins: [latinOnly],
	logLevel: 'warning',
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text;
const css = (res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '')
	// drop the empty fallbacks left by the skipped .woff/.ttf files
	.replace(/,\s*url\(""\)\s*format\("(woff|truetype)"\)/g, '')
	.replace(/,\s*url\(data:[^)]*;base64,\)\s*format\("(woff|truetype)"\)/g, '');
const page = readFileSync('src/preview/page.html', 'utf8')
	.replace('</style>', `</style>\n<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`)
	.concat(`<script>${js.replace(/<\/script/gi, '<\\/script')}</script>\n`);
writeFileSync(`${OUT}/index.html`, page);
console.log(`preview/index.html ${(page.length / 1e6).toFixed(2)} MB, built ${builtAt}`);
