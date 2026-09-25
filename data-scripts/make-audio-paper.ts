// Mixes the soundtrack for the paper cut of "Track Layer": Kokoro narration + synthesized paper-world SFX
// + a soft felt-piano score that ducks under the voice. Everything is timed from the same film timeline.
// Run: node --experimental-strip-types data-scripts/make-audio-paper.ts
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {FPS, buildFilm, type Fixture, type VoLine} from '../src/shorts/paper-track/timeline.ts';
import {buildFlatFilm} from '../src/shorts/flat-track/timeline.ts';
import {buildContract} from '../src/shorts/jev-contract/timeline.ts';
import {buildMillion} from '../src/shorts/million-letters/timeline.ts';

// --film=flat2: the flat cut with its cold open (own narration set, synth score, flat2-track.wav)
const FLAT2 = process.argv.includes('--film=flat2');
// --film=contract: chapter 2, Jev's Contract (vo-contract, contract-track.wav)
const CONTRACT = process.argv.includes('--film=contract');
// --film=million: chapter 3, A Million Letters (vo-million, million-track.wav)
const MILLION = process.argv.includes('--film=million');

const root = new URL('../', import.meta.url);
const fx = JSON.parse(readFileSync(new URL('fixtures/track-layer.json', root), 'utf8')) as Fixture;
const vo = JSON.parse(readFileSync(new URL(MILLION ? 'fixtures/million-letters-vo.json' : CONTRACT ? 'fixtures/jev-contract-vo.json' : FLAT2 ? 'fixtures/track-layer-flat-vo.json' : 'fixtures/track-layer-vo.json', root), 'utf8')).lines as VoLine[];
const film = MILLION ? buildMillion(vo) : CONTRACT ? buildContract(vo) : FLAT2 ? buildFlatFilm(fx, vo) : buildFilm(fx, vo);
// --style=synth swaps the felt piano for soft synth plucks + pads and writes flat-track.wav
const SYNTH = FLAT2 || CONTRACT || MILLION || process.argv.includes('--style=synth');

const SR = 44100;
const N = Math.ceil((film.total / FPS) * SR) + SR;
const voice = new Float32Array(N);
const fxBus = new Float32Array(N);
const music = new Float32Array(N);

let seed = 99;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function tone(buf: Float32Array, o: {t: number; dur: number; f0: number; f1?: number; g: number; atk?: number; exp?: number; harm?: number[]; lp?: number}) {
	const {t, dur, f0, f1 = f0, g, atk = 0.004, exp = 0, harm = [1], lp = 0} = o;
	const s0 = Math.round(t * SR);
	const n = Math.round(dur * SR);
	let ph = 0;
	let y = 0;
	const a = lp ? 1 - Math.exp((-2 * Math.PI * lp) / SR) : 1;
	for (let i = 0; i < n; i++) {
		const tt = i / SR;
		const fr = f0 * Math.pow(f1 / f0, tt / dur);
		ph += (2 * Math.PI * fr) / SR;
		let x = 0;
		harm.forEach((h, k) => (x += h * Math.sin(ph * (k + 1))));
		const env = Math.min(1, tt / atk) * (exp ? Math.exp(-tt / exp) : 1) * Math.min(1, (dur - tt) / 0.03);
		y += a * (x * env * g - y);
		const idx = s0 + i;
		if (idx >= 0 && idx < N) buf[idx] += y;
	}
}
function noise(buf: Float32Array, o: {t: number; dur: number; g: number; lp0?: number; lp1?: number; hp?: number; shape?: 'tri' | 'exp' | 'flat'; exp?: number}) {
	const {t, dur, g, lp0 = 6000, lp1 = lp0, hp = 0, shape = 'exp', exp = dur / 4} = o;
	const s0 = Math.round(t * SR);
	const n = Math.round(dur * SR);
	let y = 0;
	let h = 0;
	const ah = hp ? 1 - Math.exp((-2 * Math.PI * hp) / SR) : 0;
	for (let i = 0; i < n; i++) {
		const k = i / n;
		const a = 1 - Math.exp((-2 * Math.PI * lp0 * Math.pow(lp1 / lp0, k)) / SR);
		y += a * (rnd() * 2 - 1 - y);
		h += ah * (y - h);
		const env = shape === 'tri' ? 1 - Math.abs(2 * k - 1) : shape === 'flat' ? Math.min(1, k * 20, (1 - k) * 20) : Math.exp(-(i / SR) / exp) * Math.min(1, i / (0.003 * SR));
		const idx = s0 + i;
		if (idx >= 0 && idx < N) buf[idx] += (hp ? y - h : y) * env * g;
	}
}
const bell = (buf: Float32Array, t: number, f: number, g: number, decay = 1.6) => {
	for (const [m, gg] of [[1, 1], [2.76, 0.3], [5.4, 0.12]] as const) tone(buf, {t, dur: decay * 3, f0: f * m, g: g * gg, exp: decay / Math.sqrt(m)});
};
// felt-piano-ish pluck: soft attack, quick bloom, long decay, darkened by a lowpass
const piano = (t: number, m: number, g: number, dur = 2.4) =>
	SYNTH
		? (tone(music, {t, dur: dur * 1.3, f0: 440 * Math.pow(2, (m - 69) / 12), g: g * 0.9, atk: 0.02, exp: dur / 2.2, harm: [1, 0.5, 0.33, 0.25, 0.2, 0.16], lp: 1500}),
			tone(music, {t, dur: dur * 1.3, f0: 440 * Math.pow(2, (m - 69) / 12) * 1.004, g: g * 0.5, atk: 0.3, exp: dur / 1.6, harm: [1, 0.3], lp: 1200}))
		: tone(music, {t, dur, f0: 440 * Math.pow(2, (m - 69) / 12), g, atk: 0.012, exp: dur / 3.2, harm: [1, 0.35, 0.12, 0.05], lp: 2200});

// ---------- narration ----------
function readWav(path: URL) {
	const b = readFileSync(path);
	let p = 12;
	let rate = 24000;
	let data: Buffer | null = null;
	while (p < b.length) {
		const id = b.toString('ascii', p, p + 4);
		const size = b.readUInt32LE(p + 4);
		if (id === 'fmt ') rate = b.readUInt32LE(p + 12);
		if (id === 'data') data = b.subarray(p + 8, p + 8 + size);
		p += 8 + size + (size % 2);
	}
	if (!data) throw new Error(`no data chunk in ${path}`);
	const s = new Float32Array(data.length / 2);
	for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768;
	return {s, rate};
}
for (const l of vo) {
	const path = new URL(`public/audio/${MILLION ? 'vo-million' : CONTRACT ? 'vo-contract' : FLAT2 ? 'vo-flat' : 'vo'}/${l.id}.wav`, root);
	if (!existsSync(path)) throw new Error(`missing ${l.id}.wav: run data-scripts/make-vo.py first`);
	const {s, rate} = readWav(path);
	const start = Math.round((film.cues[l.id].start / FPS) * SR);
	const n = Math.floor((s.length * SR) / rate);
	for (let i = 0; i < n; i++) {
		const x = (i * rate) / SR;
		const j = Math.floor(x);
		const v = s[j] + (s[Math.min(s.length - 1, j + 1)] - s[j]) * (x - j);
		if (start + i < N) voice[start + i] += v * 0.95;
	}
}

// ---------- sound effects ----------
for (const e of film.sfx) {
	const t = e.f / FPS;
	const v = e.v ?? 1;
	switch (e.kind) {
		case 'paperRise':
			noise(fxBus, {t, dur: 0.9, g: 0.14, lp0: 1500, lp1: 5000, hp: 400, shape: 'tri'});
			break;
		case 'flutter': {
			const dur = (e.dur ?? 48) / FPS;
			for (let k = 0; k < dur; k += 0.09 + rnd() * 0.07) noise(fxBus, {t: t + k, dur: 0.07, g: 0.07, lp0: 5000, hp: 1200, shape: 'tri'});
			break;
		}
		case 'pin':
			tone(fxBus, {t, dur: 0.08, f0: 1800, g: 0.08, exp: 0.02});
			noise(fxBus, {t, dur: 0.05, g: 0.15, lp0: 3000, exp: 0.01});
			break;
		case 'chug':
			noise(fxBus, {t, dur: 0.22, g: 0.12, lp0: 900, lp1: 400, exp: 0.06});
			noise(fxBus, {t: t + 0.22, dur: 0.2, g: 0.08, lp0: 800, lp1: 400, exp: 0.05});
			break;
		case 'whoosh':
			noise(fxBus, {t, dur: 0.6, g: 0.2 * v, lp0: 300, lp1: 2500, shape: 'tri'});
			break;
		case 'roll': {
			const dur = (e.dur ?? 20) / FPS;
			noise(fxBus, {t, dur, g: 0.1, lp0: 250, lp1: 500, shape: 'flat'});
			for (let k = 0.1; k < dur; k += 0.11 + rnd() * 0.08) tone(fxBus, {t: t + k, dur: 0.03, f0: 900 + rnd() * 500, g: 0.025, exp: 0.01});
			break;
		}
		case 'clack':
			tone(fxBus, {t, dur: 0.12, f0: 520 * (e.pitch ?? 1), g: 0.16, exp: 0.03, harm: [1, 0.4]});
			noise(fxBus, {t, dur: 0.06, g: 0.12, lp0: 2500, exp: 0.012});
			break;
		case 'cut':
			noise(fxBus, {t, dur: 0.16, g: 0.12, lp0: 7000, hp: 2500, shape: 'tri'});
			break;
		case 'pop':
			tone(fxBus, {t, dur: 0.09, f0: 380 * (e.pitch ?? 1), f1: 900 * (e.pitch ?? 1), g: 0.07 * v, exp: 0.04});
			break;
		case 'tick':
			tone(fxBus, {t, dur: 0.1, f0: 1200 * (e.pitch ?? 1), g: 0.06, exp: 0.03});
			break;
		case 'zoom':
			noise(fxBus, {t, dur: 0.7, g: 0.18, lp0: 400, lp1: 4000, shape: 'tri'});
			break;
		case 'creak':
			tone(fxBus, {t, dur: 0.5, f0: 110, f1: 80, g: 0.06, harm: [1, 0.6, 0.4, 0.3], lp: 900});
			break;
		case 'splash':
			noise(fxBus, {t, dur: 1.1, g: 0.42, lp0: 2800, lp1: 350, exp: 0.3});
			tone(fxBus, {t, dur: 0.35, f0: 95, f1: 45, g: 0.3, exp: 0.12});
			for (let i = 0; i < 10; i++) tone(fxBus, {t: t + 0.05 + rnd() * 0.6, dur: 0.04, f0: 700 + rnd() * 500, f1: 1600, g: 0.04, exp: 0.02});
			break;
		case 'bubble':
			tone(fxBus, {t, dur: 0.07, f0: e.pitch ?? 260, f1: (e.pitch ?? 260) * 2.4, g: 0.07, exp: 0.03});
			break;
		case 'lamp':
			tone(fxBus, {t, dur: 2.5, f0: 110, g: 0.05, atk: 0.4, harm: [1, 0.5, 0.2], lp: 600});
			bell(fxBus, t + 0.1, 1318.5, 0.05, 1.2);
			break;
		case 'sweep':
			noise(fxBus, {t, dur: 1.6, g: 0.08, lp0: 800, lp1: 3000, hp: 300, shape: 'tri'});
			break;
		case 'streamer':
			for (let k = 0; k < 0.7; k += 0.06) noise(fxBus, {t: t + k, dur: 0.05, g: 0.05, lp0: 4000, hp: 1000, shape: 'tri'});
			break;
		case 'coin':
			tone(fxBus, {t, dur: 0.5, f0: 2350 * (e.pitch ?? 1), g: 0.05 * v, exp: 0.12, harm: [1, 0, 0.35]});
			tone(fxBus, {t: t + 0.06, dur: 0.4, f0: 3150 * (e.pitch ?? 1), g: 0.03 * v, exp: 0.09});
			noise(fxBus, {t, dur: 0.05, g: 0.1 * v, lp0: 6000, hp: 2000, exp: 0.01});
			break;
		case 'stamp':
			tone(fxBus, {t, dur: 0.25, f0: 90, f1: 50, g: 0.3, exp: 0.06});
			noise(fxBus, {t, dur: 0.12, g: 0.2, lp0: 1200, exp: 0.03});
			break;
		case 'chime':
			bell(fxBus, t, 880, 0.12 * v);
			bell(fxBus, t + 0.14, 1318.5, 0.1 * v);
			break;
	}
}

// ---------- score: slow arpeggios in D major, a low, uneasy stretch, then a warm lamp-lit close ----------
const BEAT = 60 / 76;
const prog = [
	[50, 57, 62, 66, 69],
	[47, 54, 59, 62, 66],
	[43, 50, 55, 59, 62],
	[45, 52, 57, 61, 64],
];
for (const cue of film.music) {
	const t0 = cue.start / FPS;
	const t1 = cue.end / FPS;
	if (cue.kind === 'intro') {
		// a low pulse under the cold open, opening up into a chord for the news
		for (let t = t0; t < t1 - 0.5; t += BEAT) piano(t, 38, 0.05, 1.6);
		[50, 57, 62, 66].forEach((m, i) => piano(t0 + 0.4 + i * 0.05, m + 12, 0.025, 8));
		const mid = t0 + (t1 - t0) * 0.45;
		[50, 57, 62, 69, 74].forEach((m, i) => piano(mid + i * 0.12, m + 12, 0.03, 6));
	} else if (cue.kind === 'theme') {
		for (let bar = 0; t0 + bar * 4 * BEAT < t1 - 1; bar++) {
			const ch = prog[bar % prog.length];
			const tb = t0 + bar * 4 * BEAT;
			piano(tb, ch[0], 0.07, 4);
			[1, 2, 3, 4, 3, 2].forEach((ni, i) => {
				const tt = tb + (i + 1) * (BEAT * 0.66);
				if (tt < t1 - 0.5) piano(tt, ch[ni] + 12, 0.035 + (i === 3 ? 0.01 : 0), 2.2);
			});
		}
	} else if (cue.kind === 'low') {
		piano(t0, 38, 0.08, 5);
		piano(t0 + 1.6, 45, 0.05, 5);
		piano(t0 + 3.1, 44, 0.05, 5);
	} else {
		const ch = [50, 57, 62, 66, 69, 74];
		for (let t = t0; t < t1 - 1; t += 4 * BEAT) {
			piano(t, ch[0], 0.06, 5);
			piano(t + BEAT, ch[2] + 12, 0.03, 3);
			piano(t + 2 * BEAT, ch[3] + 12, 0.03, 3);
			piano(t + 3 * BEAT, ch[5] + 12, 0.025, 3);
		}
	}
}

// ---------- mix: duck the score under the voice ----------
const out = new Float32Array(N);
let env = 0;
let duck = 1;
for (let i = 0; i < N; i++) {
	env = Math.max(Math.abs(voice[i]), env * 0.9995);
	const target = env > 0.02 ? 0.45 : 1;
	duck += (target - duck) * (target < duck ? 0.002 : 0.0002);
	out[i] = Math.tanh(voice[i] * 1.0 + fxBus[i] * 0.9 + music[i] * 1.1 * duck);
}
const pcm = Buffer.alloc(44 + N * 2);
pcm.write('RIFF', 0);
pcm.writeUInt32LE(36 + N * 2, 4);
pcm.write('WAVEfmt ', 8);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28);
pcm.writeUInt16LE(2, 32);
pcm.writeUInt16LE(16, 34);
pcm.write('data', 36);
pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(out[i] * 0.95 * 32767), 44 + i * 2);
mkdirSync(new URL('public/audio/', root), {recursive: true});
const outName = MILLION ? 'million-track.wav' : CONTRACT ? 'contract-track.wav' : FLAT2 ? 'flat2-track.wav' : SYNTH ? 'flat-track.wav' : 'paper-track.wav';
writeFileSync(new URL(`public/audio/${outName}`, root), pcm);
console.log(`wrote public/audio/${outName}: ${(N / SR).toFixed(1)} s, ${film.sfx.length} sfx, ${vo.length} narration lines, ${film.total} frames`);
