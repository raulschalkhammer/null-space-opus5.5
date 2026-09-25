// Chapter 3, "A Million Letters": scene timing, narration cues and sound cues, driven by the narration durations.
// Import-light so Node can load it with --experimental-strip-types for the audio mix.
import {FPS, type Span, type VoLine} from '../paper-track/timeline.ts';

export const GUESS_PAUSE = 80; // frames the viewer gets to guess (3-2-1)

// Illustrative numbers (placeholders until a measured Jev run). The rule itself is exact:
// a person reads the letter when (1 - p) * mistake > review, i.e. when p < 1 - review / mistake.
export const MILLION = {
	letters: 1_000_000,
	promise: 0.91,
	review: 2, // euros per letter read by a person
	mistake: 20, // euros per wrong decision
	cheap: 4, // sorting newsletters
	dear: 200, // freezing a card
	toPeople: 170_000, // letters under the 0.9 line
	calibrated: 0.8, // "says 90, right 80 times in 100"
};
export const lineFor = (mistake: number) => 1 - MILLION.review / mistake;

export function buildMillion(vo: VoLine[]) {
	const d = (id: string) => Math.round((vo.find((l) => l.id === id)?.duration ?? 3) * FPS);
	const cues: Record<string, Span> = {};
	const say = (id: string, at: number) => {
		cues[id] = {start: at, end: at + d(id)};
		return cues[id].end;
	};
	const S: Record<string, Span> = {};
	S.title = {start: 0, end: 96};
	// 1. zoom out: letter, window, bank, city, planet
	S.zoom = {start: 84, end: 0};
	let t = say('M01', S.zoom.start + 18);
	t = say('M02', t + 10);
	t = say('M03', t + 8);
	S.zoom.end = say('M04', t + 8) + 16;
	// 2. the puzzle, with a pause to guess
	S.puzzle = {start: S.zoom.end, end: 0};
	S.puzzle.end = say('M05', S.puzzle.start + 10) + GUESS_PAUSE + 8;
	// 3. two naive answers
	S.naive = {start: S.puzzle.end, end: 0};
	t = say('M06', S.naive.start + 10);
	t = say('M07', t + 6);
	t = say('M08', t + 14);
	t = say('M09', t + 12);
	S.naive.end = say('M10', t + 8) + 18;
	// 4. every mistake has a price
	S.price = {start: S.naive.end, end: 0};
	t = say('M11', S.price.start + 8);
	t = say('M12', t + 10);
	S.price.end = say('M13', t + 10) + 14;
	// 5. the math, in the mailroom
	S.math = {start: S.price.end, end: 0};
	t = say('M14', S.math.start + 10);
	t = say('M15', t + 8);
	t = say('M16', t + 8);
	t = say('M17', t + 10);
	t = say('M18', t + 8);
	S.math.end = say('M19', t + 12) + 16;
	// 6. the line moves
	S.moves = {start: S.math.end, end: 0};
	t = say('M20', S.moves.start + 8);
	t = say('M21', t + 10);
	S.moves.end = say('M22', t + 12) + 16;
	// 7. the answer: a dune of a million letters on the beach
	S.answer = {start: S.moves.end, end: 0};
	t = say('M23', S.answer.start + 10);
	t = say('M24', t + 14);
	S.answer.end = say('M25', t + 12) + 18;
	// 8. the promise has to hold
	S.calib = {start: S.answer.end, end: 0};
	t = say('M26', S.calib.start + 8);
	S.calib.end = say('M27', t + 10) + 16;
	// 9. zoom back in to one person and one letter
	S.close = {start: S.calib.end, end: 0};
	t = say('M28', S.close.start + 10);
	S.close.end = say('M29', t + 30) + 40;
	S.endcard = {start: S.close.end, end: S.close.end + 120};
	const total = S.endcard.end;

	const at = (id: string, u: number) => Math.round(cues[id].start + (cues[id].end - cues[id].start) * u);

	type Sfx = {f: number; kind: string; v?: number; pitch?: number; dur?: number};
	const sfx: Sfx[] = [];
	sfx.push({f: 20, kind: 'chime', v: 0.6});
	// the zoom out: a whoosh at each jump in scale
	[at('M01', 0.8), at('M02', 0.2), at('M03', 0.35), at('M04', 0.1)].forEach((f, i) => sfx.push({f, kind: 'zoom', v: 0.6 + i * 0.1}));
	sfx.push({f: at('M03', 0.8), kind: 'pop', pitch: 1.3, v: 1.4});
	// the puzzle
	sfx.push({f: S.puzzle.start + 4, kind: 'whoosh', v: 0.5});
	for (let i = 0; i < 3; i++) sfx.push({f: cues.M05.end + 6 + i * 26, kind: 'tick', pitch: 1 + i * 0.1});
	// two naive answers: panels slide in, desks fill, letters fly, the grid turns red, the chute
	sfx.push({f: cues.M06.start, kind: 'whoosh', v: 0.6});
	for (let i = 0; i < 8; i++) sfx.push({f: at('M07', 0.2) + i * 7, kind: 'clack', pitch: 1.1 + (i % 3) * 0.1});
	for (let i = 0; i < 6; i++) sfx.push({f: at('M07', 0.7) + i * 5, kind: 'coin', pitch: 1 + (i % 3) * 0.08, v: 0.6});
	sfx.push({f: cues.M08.start, kind: 'whoosh', v: 0.6});
	for (let i = 0; i < 10; i++) sfx.push({f: at('M08', 0.45) + i * 4, kind: 'pop', pitch: 1.2 + (i % 4) * 0.1, v: 0.6});
	for (let i = 0; i < 9; i++) sfx.push({f: at('M09', 0.62) + i * 4, kind: 'tick', pitch: 0.7});
	sfx.push({f: cues.M10.start, kind: 'cut'});
	sfx.push({f: at('M10', 0.45), kind: 'roll', dur: 40});
	sfx.push({f: at('M10', 0.62), kind: 'pop', pitch: 0.8, v: 1.6});
	// the price
	sfx.push({f: cues.M11.start + 4, kind: 'creak'});
	sfx.push({f: at('M12', 0.2), kind: 'paperRise'});
	sfx.push({f: at('M12', 0.78), kind: 'coin', pitch: 1.2});
	[0.3, 0.45, 0.6].forEach((u) => sfx.push({f: at('M13', u), kind: 'cut'}));
	sfx.push({f: at('M13', 0.45) + 4, kind: 'stamp'});
	sfx.push({f: at('M13', 0.9), kind: 'coin', pitch: 0.8, v: 1.2});
	sfx.push({f: at('M13', 0.9) + 8, kind: 'creak'});
	// the math
	sfx.push({f: cues.M14.start + 6, kind: 'lamp'});
	[at('M15', 0.2), at('M15', 0.75), at('M16', 0.3)].forEach((f) => sfx.push({f, kind: 'pop', pitch: 1.1}));
	sfx.push({f: at('M15', 0.4), kind: 'cut'});
	sfx.push({f: at('M18', 0.2), kind: 'pop', pitch: 1.3});
	sfx.push({f: at('M18', 0.7), kind: 'pop', pitch: 1.5});
	sfx.push({f: at('M19', 0.15), kind: 'creak'});
	sfx.push({f: at('M19', 0.3), kind: 'clack', pitch: 0.6});
	// the line moves: a crank each way
	sfx.push({f: cues.M20.start + 6, kind: 'creak'});
	sfx.push({f: at('M21', 0.45), kind: 'roll', dur: 30});
	sfx.push({f: at('M21', 0.5), kind: 'creak'});
	sfx.push({f: at('M22', 0.45), kind: 'roll', dur: 30});
	sfx.push({f: at('M22', 0.5), kind: 'creak'});
	sfx.push({f: at('M22', 0.62), kind: 'clack', pitch: 0.6});
	// the dune
	sfx.push({f: cues.M23.start + 10, kind: 'roll', dur: 70});
	sfx.push({f: at('M24', 0.2), kind: 'sweep'});
	sfx.push({f: at('M24', 0.6), kind: 'splash', v: 0.5});
	sfx.push({f: at('M25', 0.15), kind: 'pop', pitch: 1.2, v: 1.4});
	// the promise
	sfx.push({f: cues.M26.start + 4, kind: 'chime', v: 0.6});
	for (let i = 0; i < 10; i++) sfx.push({f: at('M27', 0.4) + i * 3, kind: 'tick', pitch: 0.6});
	sfx.push({f: at('M27', 0.7), kind: 'roll', dur: 24});
	// the close
	[0, 0.3, 0.6].forEach((u) => sfx.push({f: at('M28', u), kind: 'zoom', v: 0.5}));
	sfx.push({f: cues.M29.start + 4, kind: 'paperRise'});
	sfx.push({f: S.endcard.start + 12, kind: 'chime', v: 0.5});
	sfx.sort((a, b) => a.f - b.f);

	const music = [
		{kind: 'intro', start: 0, end: S.puzzle.start + 10},
		{kind: 'low', start: cues.M05.end, end: S.naive.start},
		{kind: 'theme', start: S.naive.start, end: S.calib.start},
		{kind: 'low', start: cues.M27.start, end: cues.M27.end},
		{kind: 'lamp', start: S.close.start, end: total},
	];
	return {vo, cues, S, total, sfx, music, at};
}
export type MillionFilm = ReturnType<typeof buildMillion>;
