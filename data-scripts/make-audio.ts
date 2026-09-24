// Synthesizes the full soundtrack for "Track Layer" (SFX + leitmotifs) from the same timeline the
// renderer uses, so every tick, slam and chime lands on its frame. No samples, no downloads.
// Run: node --experimental-strip-types data-scripts/make-audio.ts
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {FPS, buildTimeline, type MusicCue, type Sfx, type TrackLayerFixture} from '../src/shorts/track-layer/timeline.ts';

const fx = JSON.parse(readFileSync(new URL('../fixtures/track-layer.json', import.meta.url), 'utf8')) as TrackLayerFixture;
const tl = buildTimeline(fx);

const SR = 44100;
const N = Math.ceil((tl.total / FPS) * SR);
const out = new Float32Array(N);
const at = (f: number) => Math.round((f / FPS) * SR);

let seed = 1234567;
const rnd = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};

type Wave = 'sine' | 'square' | 'tri' | 'saw';
const osc = (w: Wave, ph: number) => {
	const s = Math.sin(ph);
	if (w === 'sine') return s;
	if (w === 'square') return Math.tanh(4 * s);
	if (w === 'tri') return (2 / Math.PI) * Math.asin(s);
	return 2 * ((ph / (2 * Math.PI)) % 1) - 1;
};

// A pitched voice with glide, attack/decay envelope, optional vibrato and one-pole lowpass.
function tone(o: {t: number; dur: number; f0: number; f1?: number; w?: Wave; g: number; atk?: number; rel?: number; vib?: number; lp?: number; exp?: number}) {
	const {t, dur, f0, f1 = f0, w = 'sine', g, atk = 0.005, rel = 0.05, vib = 0, lp = 0, exp = 0} = o;
	const s0 = Math.round(t * SR);
	const n = Math.round((dur + rel) * SR);
	let ph = 0;
	let y = 0;
	const a = lp ? 1 - Math.exp((-2 * Math.PI * lp) / SR) : 1;
	for (let i = 0; i < n; i++) {
		const tt = i / SR;
		const k = Math.min(1, tt / dur);
		const fr = f0 * Math.pow(f1 / f0, k) * (1 + vib * Math.sin(2 * Math.PI * 6 * tt));
		ph += (2 * Math.PI * fr) / SR;
		let env = Math.min(1, tt / atk);
		env *= exp ? Math.exp(-tt / exp) : tt > dur ? Math.max(0, 1 - (tt - dur) / rel) : 1;
		const x = osc(w, ph) * env * g;
		y += a * (x - y);
		const idx = s0 + i;
		if (idx >= 0 && idx < N) out[idx] += y;
	}
}

// Filtered noise burst. `lp0 -> lp1` sweeps the lowpass cutoff; `hp` removes lows.
function noise(o: {t: number; dur: number; g: number; lp0?: number; lp1?: number; hp?: number; atk?: number; exp?: number; tri?: boolean}) {
	const {t, dur, g, lp0 = 8000, lp1 = lp0, hp = 0, atk = 0.003, exp = 0, tri = false} = o;
	const s0 = Math.round(t * SR);
	const n = Math.round(dur * SR);
	let y = 0;
	let h = 0;
	const ah = hp ? 1 - Math.exp((-2 * Math.PI * hp) / SR) : 0;
	for (let i = 0; i < n; i++) {
		const tt = i / SR;
		const k = tt / dur;
		const cut = lp0 * Math.pow(lp1 / lp0, k);
		const a = 1 - Math.exp((-2 * Math.PI * cut) / SR);
		y += a * (rnd() * 2 - 1 - y);
		h += ah * (y - h);
		const x = hp ? y - h : y;
		let env = Math.min(1, tt / atk);
		env *= tri ? 1 - Math.abs(2 * k - 1) : exp ? Math.exp(-tt / exp) : 1 - k;
		const idx = s0 + i;
		if (idx >= 0 && idx < N) out[idx] += x * env * g;
	}
}

const bell = (t: number, f: number, g: number, decay = 1.4) => {
	for (const [m, gg] of [[1, 1], [2.76, 0.35], [5.4, 0.15], [8.9, 0.06]] as const) tone({t, dur: decay * 3, f0: f * m, g: g * gg, exp: decay / m ** 0.5, atk: 0.002});
};

function sfx(e: Sfx) {
	const t = e.f / FPS;
	const v = e.v ?? 1;
	switch (e.kind) {
		case 'tick':
			noise({t, dur: 0.012, g: 0.22, lp0: 9000, hp: 1500, exp: 0.004});
			tone({t, dur: 0.02, f0: 2300, g: 0.07, exp: 0.008});
			break;
		case 'pop':
			tone({t, dur: 0.08, f0: 260, f1: 900, g: 0.22, exp: 0.05});
			break;
		case 'land':
			tone({t, dur: 0.15, f0: 520, g: 0.1, exp: 0.05});
			tone({t, dur: 0.15, f0: 780, g: 0.07, exp: 0.04});
			break;
		case 'swish':
			noise({t, dur: 0.22, g: 0.12, lp0: 700, lp1: 5000, tri: true});
			break;
		case 'slam':
			tone({t, dur: 0.25, f0: 120, f1: 45, g: 0.6, exp: 0.09});
			noise({t, dur: 0.14, g: 0.35, lp0: 500, exp: 0.04});
			tone({t, dur: 0.06, f0: 190, g: 0.2, exp: 0.03});
			break;
		case 'blip':
			tone({t, dur: 0.075, f0: e.pitch ?? 330, f1: (e.pitch ?? 330) * 1.12, w: 'square', g: 0.09, lp: 2400, rel: 0.02});
			break;
		case 'chug':
			noise({t, dur: 0.18, g: 0.2, lp0: 1400, lp1: 600, exp: 0.05});
			noise({t: t + 0.2, dur: 0.16, g: 0.14, lp0: 1200, lp1: 500, exp: 0.045});
			break;
		case 'ding':
			bell(t, 2093, 0.13, 0.5);
			break;
		case 'gulp':
			tone({t, dur: 0.13, f0: 700, f1: 200, g: 0.22, exp: 0.08});
			tone({t: t + 0.16, dur: 0.05, f0: 300, f1: 520, g: 0.18, exp: 0.03});
			break;
		case 'creak':
			tone({t, dur: 0.45, f0: 95, f1: 70, w: 'saw', g: 0.09, lp: 900, vib: 0.08});
			break;
		case 'uhoh':
			tone({t, dur: 0.12, f0: 440, w: 'square', g: 0.08, lp: 2200});
			tone({t: t + 0.18, dur: 0.2, f0: 330, f1: 300, w: 'square', g: 0.08, lp: 2200});
			break;
		case 'whoosh':
			noise({t, dur: 0.5, g: 0.28 * v, lp0: 300, lp1: 3500, tri: true});
			break;
		case 'splash':
			noise({t, dur: 1.0, g: 0.55, lp0: 3000, lp1: 400, exp: 0.25});
			tone({t, dur: 0.3, f0: 90, f1: 40, g: 0.4, exp: 0.12});
			for (let i = 0; i < 12; i++) tone({t: t + 0.05 + rnd() * 0.6, dur: 0.035, f0: 600 + rnd() * 500, f1: 1500 + rnd() * 900, g: 0.06, exp: 0.02});
			break;
		case 'bubble':
			tone({t, dur: 0.06, f0: e.pitch ?? 260, f1: (e.pitch ?? 260) * 2.6, g: 0.1, exp: 0.03});
			break;
		case 'question':
			tone({t, dur: 0.1, f0: 300, w: 'square', g: 0.08, lp: 2400});
			tone({t: t + 0.12, dur: 0.18, f0: 330, f1: 620, w: 'square', g: 0.08, lp: 2400});
			break;
		case 'chime':
			bell(t, 880, 0.2 * v);
			bell(t + 0.13, 1318.5, 0.16 * v);
			break;
		case 'sparkle':
			for (let i = 0; i < 6; i++) tone({t: t + i * 0.055, dur: 0.05, f0: 2600 + rnd() * 1800, g: 0.035, exp: 0.08});
			break;
		case 'antenna':
			tone({t, dur: 0.07, f0: 1760, g: 0.07, exp: 0.05});
			break;
		case 'blink':
			tone({t, dur: 0.04, f0: 1200, f1: 900, g: 0.04, exp: 0.02});
			break;
		case 'paper':
			noise({t, dur: 0.4, g: 0.2, lp0: 5000, hp: 900, tri: true});
			break;
		case 'thock':
			tone({t, dur: 0.07, f0: 210, g: 0.22, exp: 0.03});
			noise({t, dur: 0.05, g: 0.15, lp0: 1500, exp: 0.015});
			break;
		case 'chalk':
		case 'scribble': {
			const dur = (e.dur ?? 20) / FPS;
			let tt = 0;
			while (tt < dur) {
				const len = 0.05 + rnd() * 0.1;
				noise({t: t + tt, dur: len, g: e.kind === 'chalk' ? 0.09 : 0.05, lp0: 7000, hp: 2200, tri: true});
				tt += len + rnd() * 0.04;
			}
			break;
		}
		case 'recordStop':
			tone({t, dur: 0.5, f0: 520, f1: 60, w: 'tri', g: 0.1});
			break;
	}
}

// ---------- leitmotifs ----------
const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const BEAT = 12 / FPS; // 120 bpm
const gabMelody = [72, 74, 76, 74, 72, 76, 79, 76, 77, 76, 74, 72, 74, 77, 81, 77, 79, 77, 76, 74, 76, 79, 83, 79, 84, 79, 76, 72, 74, 76, 72, -1];
const gabBass = [48, 55, 48, 55, 53, 60, 53, 60, 55, 62, 55, 62, 48, 55, 48, 43];
const sour = (m: number) => ([4, 9, 11].includes(((m % 12) + 12) % 12) ? m - 1 : m);

function music(c: MusicCue) {
	const t0 = c.start / FPS;
	const t1 = c.end / FPS;
	if (c.kind === 'gab' || c.kind === 'gabSour') {
		const isSour = c.kind === 'gabSour';
		for (let i = 0; t0 + (i * BEAT) / 2 < t1 - 0.05; i++) {
			const t = t0 + (i * BEAT) / 2;
			const m = gabMelody[i % gabMelody.length];
			if (m > 0) tone({t, dur: BEAT * 0.32, f0: midi(isSour ? sour(m) - 12 : m), w: 'square', g: isSour ? 0.035 : 0.045, lp: 2600, rel: 0.04, vib: isSour ? 0.02 : 0});
			if (i % 2 === 0) {
				const b = gabBass[(i / 2) % gabBass.length];
				tone({t, dur: BEAT * 0.45, f0: midi(isSour ? sour(b) : b), w: 'tri', g: 0.1, rel: 0.05});
			} else {
				noise({t, dur: 0.04, g: 0.035, lp0: 10000, hp: 5000, exp: 0.012});
			}
		}
	}
	const pad = (notes: number[], g: number) => {
		for (const m of notes) tone({t: t0, dur: t1 - t0 - 1.2, f0: midi(m), g, atk: 1.2, rel: 1.2, vib: 0.003, lp: 1800});
		for (let t = t0 + 1.5; t < t1 - 1; t += 1.1 + rnd() * 1.4) tone({t, dur: 0.05, f0: midi(notes[Math.floor(rnd() * notes.length)] + 24), g: 0.018, exp: 0.5});
	};
	if (c.kind === 'jev') pad([57, 64, 69, 71, 76], 0.03);
	if (c.kind === 'math') pad([50, 57, 62, 66, 69], 0.024);
	if (c.kind === 'end') [69, 73, 76, 81].forEach((m, i) => bell(t0 + 0.9 + i * 0.18, midi(m), 0.07, 1.2));
}

tl.music.forEach(music);
tl.sfx.forEach(sfx);

// Master: gentle saturation, then 16-bit PCM WAV.
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
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(Math.tanh(out[i] * 1.1) * 0.92 * 32767), 44 + i * 2);
mkdirSync(new URL('../public/audio/', import.meta.url), {recursive: true});
writeFileSync(new URL('../public/audio/track-layer.wav', import.meta.url), pcm);
console.log(`wrote public/audio/track-layer.wav: ${(N / SR).toFixed(1)} s, ${tl.sfx.length} cues, ${tl.total} frames`);
