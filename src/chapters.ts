// The chapters and their scenes, as frame ranges. Shared by the browser preview (scene strip) and the
// render cache (one cached clip per scene). Import-light so Node can load it with --experimental-strip-types.
import type {Span} from './shorts/paper-track/timeline.ts';
import {type Edl, invFrame} from './final.ts';

export type SceneMark = {id: string; name: string; start: number; end: number};
export type ChapterInfo = {id: string; n: number; title: string; comp: string; audio: string; total: number; scenes: SceneMark[]};

// Scenes cut the chapter at each scene's start; a scene runs until the next one starts (cross-fades included).
function marks(total: number, list: [string, string, Span | undefined][]): SceneMark[] {
	const on = list.filter((x): x is [string, string, Span] => !!x[2]).sort((a, b) => a[2].start - b[2].start);
	return on.map(([id, name, s], i) => ({id, name, start: s.start, end: i + 1 < on.length ? on[i + 1][2].start : total}));
}

export function flatScenes(S: Record<string, Span>, total: number) {
	return marks(total, [
		['hook', 'Cold open', S.hook],
		['news', 'Jev news', S.news],
		['title', 'Title', S.title],
		['station', 'Station', S.letter],
		['forks', 'Forks', S.fork],
		['guess', 'Guess', S.guess],
		['chain', 'Chain rule', S.chain],
		['shannon', 'Shannon', S.shannon],
		['marble', 'Marble', S.marble],
		['runs', '100 runs', S.runs],
		['lean', 'Lean', S.lean],
		['valley', 'Valley', S.derail],
		['endcard', 'End card', S.endcard],
	]);
}

export function contractScenes(S: Record<string, Span>, total: number) {
	return marks(total, [
		['title', 'Title', S.title],
		['open', 'Open', S.open],
		['contract', 'Contract', S.contract],
		['mail', 'Mailroom', S.mail],
		['pass', 'One pass', S.pass],
		['tubes', 'Tubes', S.tri],
		['close', 'Promise', S.close],
		['endcard', 'End card', S.endcard],
	]);
}

export function millionScenes(S: Record<string, Span>, total: number) {
	return marks(total, [
		['title', 'Title', S.title],
		['zoom', 'Zoom out', S.zoom],
		['puzzle', 'Puzzle', S.puzzle],
		['naive', 'All or none', S.naive],
		['price', 'Price', S.price],
		['math', 'The math', S.math],
		['moves', 'Line moves', S.moves],
		['answer', 'Dune', S.answer],
		['calib', 'Promise', S.calib],
		['close', 'Close', S.close],
		['endcard', 'End card', S.endcard],
	]);
}

export function signalScenes(S: Record<string, Span>, total: number) {
	return marks(total, [
		['title', 'Title', S.title],
		['intro', 'Letters', S.intro],
		['box', 'The box', S.box],
		['puzzle', 'Puzzle', S.puzzle],
		['run', '1,000 letters', S.run],
		['math', 'The math', S.math],
		['honest', 'Honest', S.honest],
		['partners', 'Partners', S.partners],
		['ending', 'Callbacks', S.ending],
		['world', 'Dawn', S.world],
		['credits', 'Credits', S.credits],
	]);
}

type Timed = {S: Record<string, Span>; total: number};
export function chapterList(flat: Timed, contract: Timed, million: Timed, signal: Timed): ChapterInfo[] {
	return [
		{id: 'ch1', n: 1, title: 'Track Layer', comp: 'TrackLayerFlat', audio: 'flat2-track', total: flat.total, scenes: flatScenes(flat.S, flat.total)},
		{id: 'ch2', n: 2, title: 'Jev’s Contract', comp: 'JevContract', audio: 'contract-track', total: contract.total, scenes: contractScenes(contract.S, contract.total)},
		{id: 'ch3', n: 3, title: 'A Million Letters', comp: 'MillionLetters', audio: 'million-track', total: million.total, scenes: millionScenes(million.S, million.total)},
		{id: 'ch4', n: 4, title: 'The Signal Box', comp: 'SignalBox', audio: 'signal-track', total: signal.total, scenes: signalScenes(signal.S, signal.total)},
	];
}

// The final cut of the chapters (src/final.ts): what the Screening Room plays and render-cache renders by default.
// Scenes are carried over through the edit list; the title and end-card scenes fall away.
export function finalChapters(full: ChapterInfo[], edls: Record<string, Edl>): ChapterInfo[] {
	const comp: Record<string, string> = {ch1: 'Final1', ch2: 'Final2', ch3: 'Final3', ch4: 'Final4'};
	return full.map((c) => {
		const e = edls[c.id];
		let sc = c.scenes.filter((x) => x.id !== 'title' && x.id !== 'endcard').map((x) => ({...x, name: x.id === 'credits' ? 'Ending' : x.name, start: invFrame(e.v, x.start)}));
		sc = sc.map((x, i) => ({...x, end: i + 1 < sc.length ? sc[i + 1].start : e.total})).filter((x) => x.end > x.start);
		return {...c, comp: comp[c.id], audio: e.out, total: e.total, scenes: sc};
	});
}
