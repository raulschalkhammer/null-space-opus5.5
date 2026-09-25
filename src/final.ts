// The final cut: each chapter trimmed for the joined film (no title or end cards, no "last time" / "next time").
// An edit list maps a frame of the cut to a frame of the chapter. Cut points come from the narration cues, so they
// follow the narration when it is re-recorded. Import-light so Node can load it with --experimental-strip-types.
import type {Span} from './shorts/paper-track/timeline.ts';

// v: segments [start, length] of chapter frames, played in order; [frame, length, 1] holds one frame (a freeze).
export type Edl = {v: [number, number, number?][]; out: string; fin: number; fout: number; dips: number[]; total: number};
type Timed = {S: Record<string, Span>; cues: Record<string, Span>; total: number};
// cuts: measured from the narration audio by data-scripts/make-final-audio.ts (fixtures/final-cuts.json)
export type Cuts = {ch1LastSentence: number}; // seconds into L14 where "That's next time." begins

const FPS = 24;
const edl = (v: Edl['v'], out: string, fin: number, fout: number, dips: number[] = []): Edl => ({v, out, fin, fout, dips, total: v.reduce((a, s) => a + s[1], 0)});

export function buildEdls(flat: Timed, contract: Timed, million: Timed, signal: Timed, cuts: Cuts): Record<'ch1' | 'ch2' | 'ch3' | 'ch4', Edl> {
	// chapter 1: open on the planet (H03), skip the title card, drop "That's next time." at the end
	const a = flat.cues.H03.start - 40;
	const b = flat.S.news.end;
	const c = flat.S.title.end;
	const d = flat.cues.L14.start + Math.round(cuts.ch1LastSentence * FPS);
	const e = flat.cues.L14.end - 2;
	const g = flat.S.close.end;
	// chapter 2: skip the title card, end on the last line
	const c2 = contract.S.title.end;
	const e2 = contract.cues.C11.end + 4;
	// chapter 3: start once the title has faded, end where the end card begins
	const c3 = million.S.zoom.start + 12;
	const e3 = million.S.endcard.start;
	// chapter 4: skip the title and "Last time, …"; keep the ending
	const c4 = signal.cues.S02.start - 5;
	return {
		ch1: edl([[a, b - a], [c, d - c], [e, g - e], [g - 1, 36, 1]], 'ch1-final', 12, 30, [b - a]),
		ch2: edl([[c2, e2 - c2], [e2 - 1, 30, 1]], 'ch2-final', 10, 30),
		ch3: edl([[c3, e3 - c3], [e3 - 1, 30, 1]], 'ch3-final', 8, 30),
		ch4: edl([[c4, signal.total - c4]], 'ch4-final', 10, 36),
	};
}

// the chapter frame shown at frame f of the cut
export function mapFrame(v: Edl['v'], f: number) {
	let p = 0;
	for (const s of v) {
		if (f < p + s[1]) return s[2] ? s[0] : s[0] + (f - p);
		p += s[1];
	}
	const l = v[v.length - 1];
	return l[2] ? l[0] : l[0] + l[1] - 1;
}
// where a chapter frame lands in the cut (the next kept frame, if it was cut out)
export function invFrame(v: Edl['v'], f: number) {
	let p = 0;
	for (const s of v) {
		if (!s[2] && f < s[0]) return p;
		if (!s[2] && f < s[0] + s[1]) return p + (f - s[0]);
		p += s[1];
	}
	return p;
}
// black over the picture: fade in, fade out, and a short dip at each join that crosses a section change
export function blackAt(e: Edl, f: number) {
	let o = Math.max(0, 1 - f / e.fin, (f - (e.total - e.fout)) / e.fout);
	for (const d of e.dips) o = Math.max(o, 1 - Math.abs(f - d) / 6);
	return Math.min(1, o);
}
