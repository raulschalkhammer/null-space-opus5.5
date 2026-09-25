// Chapter 4, "The Signal Box" (and the ending of the video): scene timing, narration cues and sound cues,
// driven by the narration durations. Import-light so Node can load it with --experimental-strip-types for the mix.
import {FPS, type Span, type VoLine} from '../paper-track/timeline.ts';

export const GUESS_PAUSE = 84; // frames the viewer gets to guess (3-2-1)

// Jev's price against a chatbot's comes from TypeSafe's own tests (up to 444.6x cheaper, 193.6x faster).
// The share sent to the train (one in five) and the thousand letters are illustrative.
export const SIGNAL = {
	cheaper: 444.6,
	faster: 193.6,
	share: 0.2,
	letters: 1000,
	line: 0.9, // chapter 3's line: sure enough to stay off the train
};
export const systemCost = (share: number) => 1 / SIGNAL.cheaper + share; // relative to the train alone
export const timesCheaper = (share: number) => 1 / systemCost(share);

export function buildSignal(vo: VoLine[]) {
	const d = (id: string) => Math.round((vo.find((l) => l.id === id)?.duration ?? 3) * FPS);
	const cues: Record<string, Span> = {};
	const say = (id: string, at: number) => {
		cues[id] = {start: at, end: at + d(id)};
		return cues[id].end;
	};
	// one span per shot (docs/chapter4-plan.md); each shot runs until the next one starts
	const H: Record<string, number> = {};
	H.title = 0;
	H.rails = 84;
	let t = say('S01', H.rails + 24);
	t = say('S02', t + 12);
	H.trains = t + 10;
	t = say('S03', H.trains + 16);
	t = say('S04', t + 10);
	H.crane = t + 10;
	t = say('S05', H.crane + 14);
	H.inside = t + 8;
	t = say('S06', H.inside + 16);
	H.lines = t + 14;
	t = say('S07', H.lines + 16);
	t = say('S08', t + 26);
	H.coins = t + 16;
	t = say('S09', H.coins + 14);
	H.guess = t + 10;
	t = say('S10', H.guess + 10);
	const pickStart = t;
	H.reveal = t + GUESS_PAUSE;
	t = say('S11', H.reveal + 6);
	H.run = t + 16;
	t = say('S12', H.run + 14);
	t = say('S13', t + 10);
	t = say('S14', t + 16);
	H.piles = t + 10;
	t = say('S15', H.piles + 12);
	H.math = t + 14;
	t = say('S16', H.math + 16);
	t = say('S17', t + 14);
	t = say('S18', t + 14);
	H.dial = t + 18;
	t = say('S19', H.dial + 14);
	t = say('S20', t + 12);
	t = say('S21', t + 12);
	H.honest = t + 16;
	t = say('S22', H.honest + 14);
	H.wrong = t + 10;
	t = say('S23', H.wrong + 8);
	H.partners = t + 18;
	t = say('S24', H.partners + 16);
	t = say('S25', t + 12);
	t = say('S26', t + 10);
	H.catch = t + 18;
	t = say('S27', H.catch + 16);
	// the ending: one callback per chapter, then the whole world at dawn
	H.cb1 = t + 24;
	t = say('S28', H.cb1 + 16);
	H.cb1b = t + 6;
	t = say('S29', H.cb1b + 10);
	H.cb2 = t + 12;
	t = say('S30', H.cb2 + 14);
	H.cb2b = t + 6;
	t = say('S31', H.cb2b + 10);
	H.grid = t + 12;
	t = say('S32', H.grid + 14);
	H.world = t + 14;
	t = say('S33', H.world + 24);
	H.last = t + 16;
	t = say('S34', H.last + 20);
	H.credits = t + 70;
	const total = H.credits + 200;

	// sections for the render cache and the preview's scene strip
	const S: Record<string, Span> = {};
	const sec = (id: string, a: number, b: number) => (S[id] = {start: a, end: b});
	sec('title', H.title, H.rails);
	sec('intro', H.rails, H.crane);
	sec('box', H.crane, H.coins);
	sec('puzzle', H.coins, H.run);
	sec('run', H.run, H.math);
	sec('math', H.math, H.honest);
	sec('honest', H.honest, H.partners);
	sec('partners', H.partners, H.cb1);
	sec('ending', H.cb1, H.world);
	sec('world', H.world, H.credits);
	sec('credits', H.credits, total);

	const at = (id: string, u: number) => Math.round(cues[id].start + (cues[id].end - cues[id].start) * u);

	// the run: 1,000 letters through the box, the counters landing on 800 and 200
	const run = {start: at('S12', 0.3), end: at('S14', 0.9)};

	type Sfx = {f: number; kind: string; v?: number; pitch?: number; dur?: number};
	const sfx: Sfx[] = [];
	sfx.push({f: 20, kind: 'chime', v: 0.6});
	sfx.push({f: at('S01', 0.2), kind: 'chug', v: 0.6});
	// the train writes: a tick per word, a coin per word
	for (let i = 0; i < 10; i++) {
		sfx.push({f: at('S04', 0.35) + i * 8, kind: 'tick', pitch: 0.9 + (i % 3) * 0.08, v: 0.5});
		sfx.push({f: at('S04', 0.35) + i * 8 + 3, kind: 'coin', pitch: 1 + (i % 4) * 0.06, v: 0.35});
	}
	// the box: a letter rises into it, the lamp reads it, a lever is thrown, the points move
	sfx.push({f: at('S05', 0.55), kind: 'paperRise'});
	sfx.push({f: at('S06', 0.2), kind: 'sweep'});
	sfx.push({f: at('S06', 0.62), kind: 'clack', pitch: 0.6});
	sfx.push({f: at('S06', 0.7), kind: 'creak'});
	// the two lines: the stamp on the short one, a whistle-free chug on the long one
	sfx.push({f: at('S07', 0.55), kind: 'stamp'});
	sfx.push({f: at('S08', 0.6), kind: 'chug'});
	// the puzzle
	sfx.push({f: at('S09', 0.6), kind: 'coin', pitch: 1.4});
	sfx.push({f: at('S09', 0.7), kind: 'coin', pitch: 0.6, v: 1.2});
	for (let i = 0; i < 3; i++) sfx.push({f: pickStart + 6 + i * 26, kind: 'tick', pitch: 1 + i * 0.1});
	sfx.push({f: H.reveal, kind: 'cut'});
	sfx.push({f: at('S11', 0.72), kind: 'pop', pitch: 1.3, v: 1.4});
	// the run
	sfx.push({f: run.start, kind: 'roll', dur: run.end - run.start});
	for (let i = 0; i < 12; i++) sfx.push({f: run.start + 20 + i * 14, kind: 'tick', pitch: 1.1 + (i % 3) * 0.1, v: 0.35});
	for (let i = 0; i < 6; i++) sfx.push({f: at('S15', 0.3) + i * 5, kind: 'coin', pitch: 0.8 + (i % 3) * 0.1, v: 0.6});
	// the math
	[0.2, 0.5, 0.8].forEach((u) => sfx.push({f: at('S16', u), kind: 'pop', pitch: 1.1}));
	sfx.push({f: at('S17', 0.3), kind: 'pop', pitch: 1.3});
	sfx.push({f: at('S18', 0.6), kind: 'chime', pitch: 1.3, v: 0.7});
	// the dial
	[at('S21', 0.1), at('S21', 0.55)].forEach((f) => sfx.push({f, kind: 'creak'}));
	// the overconfident letter
	sfx.push({f: at('S23', 0.45), kind: 'stamp'});
	sfx.push({f: at('S23', 0.55), kind: 'cut'});
	// partners
	sfx.push({f: at('S24', 0.3), kind: 'chug'});
	sfx.push({f: at('S24', 0.5), kind: 'chug'});
	sfx.push({f: at('S26', 0.2), kind: 'lamp'});
	// the catch
	for (let i = 0; i < 6; i++) sfx.push({f: at('S27', 0.45) + i * 4, kind: 'tick', pitch: 0.7});
	// the ending
	sfx.push({f: H.cb1 + 4, kind: 'whoosh', v: 0.4});
	sfx.push({f: at('S30', 0.5), kind: 'streamer'});
	sfx.push({f: at('S32', 0.3), kind: 'chime', v: 0.6});
	sfx.push({f: H.world + 10, kind: 'whoosh', v: 0.5});
	sfx.push({f: at('S34', 0.1), kind: 'lamp'});
	sfx.push({f: H.credits + 10, kind: 'chime', v: 0.5});
	sfx.sort((a, b) => a.f - b.f);

	const music = [
		{kind: 'intro', start: 0, end: H.coins + 10},
		{kind: 'low', start: pickStart, end: H.reveal},
		{kind: 'theme', start: H.run, end: H.catch},
		{kind: 'low', start: cues.S23.start, end: cues.S23.end},
		{kind: 'lamp', start: H.cb1, end: total},
	];
	return {vo, cues, S, H, total, sfx, music, at, pickStart, run};
}
export type SignalFilm = ReturnType<typeof buildSignal>;
