import {type Expr, MOODS, type Speech, type SteamMood, lerpExpr} from '../../characters/steam';
import {type Film} from '../paper-track/timeline';

// The engine's acting, keyed to the narration. Each key is [frame, mood or custom face]; moods blend over BLEND frames.
export type MoodKey = [number, SteamMood | Expr];
const BLEND = 10;
const get = (m: SteamMood | Expr) => (typeof m === 'string' ? MOODS[m] : m);
const ease = (t: number) => t * t * (3 - 2 * t);

export function moodAt(keys: MoodKey[], f: number, blend = BLEND): Expr {
	const ks = keys.filter((k) => Number.isFinite(k[0])).sort((a, b) => a[0] - b[0]);
	let i = 0;
	while (i + 1 < ks.length && f >= ks[i + 1][0]) i++;
	if (i === 0 || f < ks[0][0]) return get(ks[0][1]);
	return lerpExpr(get(ks[i - 1][1]), get(ks[i][1]), ease(Math.min(1, (f - ks[i][0]) / blend)));
}

// A face with a different gaze, e.g. sad but looking up at the lighthouse.
export const withLook = (m: SteamMood, lookX: number, lookY: number, extra: Partial<Expr> = {}): Expr => ({...MOODS[m], lookX, lookY, ...extra});

// What the train has said so far: each chosen word appears the moment its marble lands.
export function speechAt(film: Film, f: number): Speech {
	return film.forkTimes
		.filter((t) => f >= t.land && film.route[t.k])
		.sort((a, b) => a.land - b.land)
		.map((t) => ({word: film.route[t.k].chosen.t.trim(), age: f - t.land}));
}

// The story arc for the engine we ride with (the Claude-inspired one).
export function storyKeys(film: Film): MoodKey[] {
	const {S, cues, forkTimes} = film;
	const ft = (k: number) => forkTimes.find((t) => t.k === k)!;
	const d0 = S.derail.start;
	return [
		[0, 'curious'],
		[S.letter.start + 8, withLook('curious', -1, -0.4)], // watches the letter fly in
		[S.letter.start + 64, 'curious'],
		[cues.L02.start + 20, 'happy'],
		[S.gab.end - 60, 'determined'], // rolls out
		[S.fork.start, 'curious'],
		[ft(0).land, 'happy'], // "Great"
		[ft(1).go, 'determined'],
		[S.chain.start, 'proud'],
		[S.marble.start, 'determined'],
		[ft(6).roll, 'nervous'],
		[ft(6).land, 'panic'], // "totally", 4%
		[ft(6).land + 34, 'nervous'],
		[S.lean.start, 'nervous'],
		[ft(7).land, 'proud'], // "legit": fluent and confident
		[d0, 'proud'],
		[d0 + 18, 'panic'], // the bank drops away
		[d0 + 46, 'dazed'], // in the lake
		[cues.L10b ? cues.L10b.start + 30 : d0 + 140, 'sad'],
		[S.jev.start + 150, withLook('sad', 0.9, -0.7, {lid: 0.3, tilt: 14})], // looks up at the lighthouse
	];
}

// The ChatGPT-inspired engine at the station: same beats, a touch later, so they read as two characters.
export function stationKeysGpt(film: Film): MoodKey[] {
	const {S, cues} = film;
	return [
		[0, 'curious'],
		[S.letter.start + 14, withLook('curious', -1, -0.4)],
		[S.letter.start + 70, 'proud'],
		[cues.L02.start + 34, 'happy'],
		[S.gab.end - 54, 'determined'],
	];
}

export const WHEEL_DIST = (px: number, s: number) => px / (0.2 * 40 * s); // wheel turns that match rolling px at scale s
