// Flat cut timeline: a cold open (hook + the Jev news) in front of the shared "Track Layer" story.
import {FPS, type Fixture, type Span, type VoLine, buildFilm} from '../paper-track/timeline.ts';

export const TWICE_GAP = 60; // the second reply finishes streaming before H02 lands its question

export function buildFlatFilm(fx: Fixture, vo: VoLine[]) {
	const d = (id: string) => Math.round((vo.find((l) => l.id === id)?.duration ?? 3) * FPS);
	const cues: Record<string, Span> = {};
	const say = (id: string, at: number) => {
		cues[id] = {start: at, end: at + d(id)};
		return cues[id].end;
	};
	const hook: Span = {start: 0, end: 0};
	const h1 = say('H01', 20);
	const h2 = say('H02', h1 + TWICE_GAP);
	const h3 = say('H03', h2 + 20);
	hook.end = say('H04', h3 + 10) + 18;
	const news: Span = {start: hook.end, end: 0};
	const n1 = say('N01', news.start + 16);
	const n2 = say('N02', n1 + 10);
	const n3 = say('N03', n2 + 10);
	news.end = say('N04', n3 + 12) + 14;

	const film = buildFilm(fx, vo, news.end);
	const S: Record<string, Span> = {...film.S, hook, news};

	// the three questions in H03 pop one after another
	const q = cues.H03;
	const qTimes = [q.start, q.start + (q.end - q.start) * 0.3, q.start + (q.end - q.start) * 0.62].map(Math.round);
	// words streaming in the two chat windows during H03
	const streamStart = cues.H04.start + 30;

	const sfx = [...film.sfx];
	// two replies to the same question stream in, one word at a time
	for (let i = 0; i < 30; i++) sfx.push({f: cues.H01.start + 10 + i * 4, kind: 'tick', pitch: 0.9 + (i % 4) * 0.08, v: 0.5});
	for (let i = 0; i < 28; i++) sfx.push({f: cues.H03.start + 6 + i * 3.1 + (i % 3), kind: 'pop', pitch: 0.8 + (i % 5) * 0.12});
	qTimes.forEach((t, i) => sfx.push({f: t + 2, kind: 'pop', pitch: 0.7 + i * 0.1, v: 1.6}));
	sfx.push({f: cues.H04.start, kind: 'whoosh', v: 0.5});
	for (let i = 0; i < 26; i++) sfx.push({f: streamStart + i * 5, kind: 'tick', pitch: 0.9 + (i % 4) * 0.08});
	sfx.push({f: news.start + 4, kind: 'whoosh', v: 0.6});
	sfx.push({f: cues.N01.start + 20, kind: 'paperRise'});
	sfx.push({f: cues.N02.start + 10, kind: 'lamp'});
	sfx.push({f: cues.N02.end - 16, kind: 'chime'});
	[0, 1, 2].forEach((i) => sfx.push({f: cues.N03.start + 10 + i * 40, kind: 'clack', pitch: 1 + i * 0.15}));
	sfx.push({f: news.end - 10, kind: 'whoosh', v: 0.7});
	sfx.sort((a, b) => a.f - b.f);

	const music = [{kind: 'intro', start: 0, end: news.end + 20}, ...film.music.map((m) => (m.kind === 'theme' ? {...m, start: news.end} : m))];
	return {...film, cues: {...film.cues, ...cues}, S, sfx, music, qTimes, streamStart};
}
export type FlatFilm = ReturnType<typeof buildFlatFilm>;
