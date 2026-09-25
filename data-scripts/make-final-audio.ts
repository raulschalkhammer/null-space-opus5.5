// The final cut's soundtracks: each chapter's mix, cut on the same edit list as the picture (src/final.ts).
// Run after the chapter mixes (make-audio-paper.ts). Writes fixtures/final-cuts.json and public/audio/chN-final.wav.
//   node --experimental-strip-types data-scripts/make-final-audio.ts
// The audio under a held last frame keeps running on from that point; the cut fades in and out with the picture,
// sits 0.9x (about -1 dB) under the chapter mix, and each join gets a 10 ms ramp so it doesn't click.
import {readFileSync, writeFileSync} from 'node:fs';
import {buildFlatFilm} from '../src/shorts/flat-track/timeline.ts';
import {buildContract} from '../src/shorts/jev-contract/timeline.ts';
import {buildMillion} from '../src/shorts/million-letters/timeline.ts';
import {buildSignal} from '../src/shorts/signal-box/timeline.ts';
import {type Fixture, type VoLine} from '../src/shorts/paper-track/timeline.ts';
import {buildEdls} from '../src/final.ts';

const FPS = 24;
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

function readWav(path: string) {
	const b = readFileSync(path);
	let p = 12;
	let rate = 44100;
	let ch = 1;
	let data: Buffer | null = null;
	while (p < b.length) {
		const id = b.toString('ascii', p, p + 4);
		const size = b.readUInt32LE(p + 4);
		if (id === 'fmt ') {
			ch = b.readUInt16LE(p + 10);
			rate = b.readUInt32LE(p + 12);
		}
		if (id === 'data') data = b.subarray(p + 8, p + 8 + size);
		p += 8 + size + (size % 2);
	}
	if (!data) throw new Error(`no data chunk in ${path}`);
	const n = data.length / 2 / ch;
	const s = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		let v = 0;
		for (let c = 0; c < ch; c++) v += data.readInt16LE((i * ch + c) * 2);
		s[i] = v / ch / 32768;
	}
	return {s, rate};
}
function writeWav(path: string, s: Float32Array, rate: number) {
	const b = Buffer.alloc(44 + s.length * 2);
	b.write('RIFF', 0);
	b.writeUInt32LE(36 + s.length * 2, 4);
	b.write('WAVEfmt ', 8);
	b.writeUInt32LE(16, 16);
	b.writeUInt16LE(1, 20);
	b.writeUInt16LE(1, 22);
	b.writeUInt32LE(rate, 24);
	b.writeUInt32LE(rate * 2, 28);
	b.writeUInt16LE(2, 32);
	b.writeUInt16LE(16, 34);
	b.write('data', 36);
	b.writeUInt32LE(s.length * 2, 40);
	for (let i = 0; i < s.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s[i] * 32767))), 44 + i * 2);
	writeFileSync(path, b);
}

// 1. where the last sentence of L14 ("That's next time.") begins: the middle of the last pause before it
{
	const {s, rate} = readWav('public/audio/vo-flat/L14.wav');
	const win = Math.round(0.02 * rate);
	const quiet: boolean[] = [];
	for (let i = 0; i + win <= s.length; i += win) {
		let e = 0;
		for (let j = i; j < i + win; j++) e += s[j] * s[j];
		quiet.push(Math.sqrt(e / win) < Math.pow(10, -40 / 20));
	}
	let last = -1;
	let lastLen = 0;
	for (let i = 0; i < quiet.length - 15; ) {
		if (!quiet[i]) {
			i++;
			continue;
		}
		let j = i;
		while (j < quiet.length && quiet[j]) j++;
		if (j - i >= 12 && j < quiet.length - 10) {
			last = i;
			lastLen = j - i;
		}
		i = j;
	}
	if (last < 0) throw new Error('no pause found before the last sentence of L14');
	const cut = +((last + lastLen / 2) * 0.02).toFixed(3);
	writeFileSync('fixtures/final-cuts.json', JSON.stringify({ch1LastSentence: cut}, null, 2) + '\n');
	console.log(`L14: the last sentence starts after the pause at ${cut} s`);
}

// 2. the edit lists, and the cut soundtracks
const fx = json('fixtures/track-layer.json') as Fixture;
const flat = buildFlatFilm(fx, json('fixtures/track-layer-flat-vo.json').lines as VoLine[]);
const contract = buildContract(json('fixtures/jev-contract-vo.json').lines as VoLine[]);
const million = buildMillion(json('fixtures/million-letters-vo.json').lines as VoLine[]);
const signal = buildSignal(json('fixtures/signal-box-vo.json').lines as VoLine[]);
const edls = buildEdls(flat, contract, million, signal, json('fixtures/final-cuts.json'));
const src = {ch1: 'flat2-track', ch2: 'contract-track', ch3: 'million-track', ch4: 'signal-track'} as const;
for (const id of ['ch1', 'ch2', 'ch3', 'ch4'] as const) {
	const e = edls[id];
	const {s, rate} = readWav(`public/audio/${src[id]}.wav`);
	const spf = rate / FPS;
	const out = new Float32Array(Math.round(e.total * spf));
	const ramp = Math.round(0.01 * rate);
	let p = 0;
	for (const seg of e.v) {
		const o0 = Math.round(p * spf);
		const n = Math.round((p + seg[1]) * spf) - o0;
		const s0 = Math.round(seg[0] * spf);
		for (let i = 0; i < n && o0 + i < out.length; i++) {
			const g = Math.min(1, i / ramp, (n - i) / ramp);
			out[o0 + i] = (s[s0 + i] ?? 0) * g;
		}
		p += seg[1];
	}
	const fin = e.fin * spf;
	const fout = e.fout * spf;
	for (let i = 0; i < out.length; i++) out[i] *= 0.9 * Math.min(1, i / fin, (out.length - i) / fout);
	writeWav(`public/audio/${e.out}.wav`, out, rate);
	console.log(`wrote public/audio/${e.out}.wav: ${(out.length / rate).toFixed(1)} s, ${e.total} frames, cuts ${JSON.stringify(e.v)}`);
}
