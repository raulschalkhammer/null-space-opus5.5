// Chapter 2, "Jev's Contract": scene timing, narration cues and sound cues, driven by the narration durations.
// Import-light so Node can load it with --experimental-strip-types for the audio mix.
import {FPS, type Span, type VoLine} from '../paper-track/timeline.ts';

export const PICK_PAUSE = 80; // frames the viewer gets to make their pick (3-2-1)

// Illustrative numbers (placeholders until a real Jev run): the cruise letter and the harder letter.
export const CONTRACT = {
	scam: {p: 0.91},
	team: [
		{t: 'fraud', p: 0.83},
		{t: 'billing', p: 0.1},
		{t: 'lost card', p: 0.07},
	],
	urgency: 0.7,
	hard: {text: 'My card was charged twice, and now I can’t find it.', billing: 0.28, fraud: 0.47, lost: 0.25},
	line: 0.6, // route to a person when no answer reaches 60%
};

export function buildContract(vo: VoLine[]) {
	const d = (id: string) => Math.round((vo.find((l) => l.id === id)?.duration ?? 3) * FPS);
	const cues: Record<string, Span> = {};
	const say = (id: string, at: number) => {
		cues[id] = {start: at, end: at + d(id)};
		return cues[id].end;
	};
	const S: Record<string, Span> = {};
	const XF = 12;
	S.title = {start: 0, end: 96};
	S.open = {start: 84, end: 0};
	const c1 = say('C01', S.open.start + 20);
	S.open.end = say('C02', c1 + 14) + 20;
	S.contract = {start: S.open.end, end: 0};
	S.contract.end = say('C03', S.contract.start + 16) + 30;
	S.mail = {start: S.contract.end, end: 0};
	const c4 = say('C04', S.mail.start + 16);
	S.mail.end = say('C05', c4 + 40) + 36;
	S.pass = {start: S.mail.end, end: 0};
	const c6 = say('C06', S.pass.start + 14);
	S.pass.end = say('C07', c6 + 26) + 30;
	S.tri = {start: S.pass.end, end: 0};
	const c8 = say('C08', S.tri.start + 16);
	const c9 = say('C09', c8 + PICK_PAUSE);
	S.tri.end = say('C10', c9 + 16) + 40;
	S.close = {start: S.tri.end, end: 0};
	S.close.end = say('C11', S.close.start + 14) + 30;
	S.endcard = {start: S.close.end, end: S.close.end + 120};
	const total = S.endcard.end;

	// the letter's moments inside the mailroom
	const mailDrop = cues.C04.end - 30; // the cruise letter lands in its slot
	const at = (id: string, u: number) => Math.round(cues[id].start + (cues[id].end - cues[id].start) * u);

	type Sfx = {f: number; kind: string; v?: number; pitch?: number; dur?: number};
	const sfx: Sfx[] = [];
	sfx.push({f: 20, kind: 'chime', v: 0.6});
	sfx.push({f: at('C01', 0.75), kind: 'lamp'});
	sfx.push({f: S.contract.start + 20, kind: 'paperRise'});
	// three parts of the mast lowered by crane: a creak on the way down, a clank when they seat
	[0.3, 0.47, 0.7].forEach((u, i) => {
		sfx.push({f: at('C03', u) + 4, kind: 'creak', v: 0.5});
		sfx.push({f: at('C03', u) + 30, kind: 'clack', pitch: 0.7 + i * 0.1});
	});
	sfx.push({f: at('C03', 0.9) + 4, kind: 'clack', pitch: 0.55});
	sfx.push({f: at('C04', 0.45), kind: 'flutter', dur: 30});
	sfx.push({f: at('C04', 0.62), kind: 'sweep'});
	sfx.push({f: mailDrop, kind: 'clack', pitch: 1.2});
	sfx.push({f: mailDrop + 20, kind: 'clack', pitch: 1.35});
	sfx.push({f: mailDrop + 34, kind: 'clack', pitch: 1.1});
	sfx.push({f: at('C05', 0.08), kind: 'chug'});
	[0.3, 0.36, 0.42].forEach((u) => sfx.push({f: at('C05', u), kind: 'clack', pitch: 0.7}));
	sfx.push({f: at('C05', 0.55), kind: 'creak'});
	sfx.push({f: at('C05', 0.62), kind: 'cut'});
	sfx.push({f: cues.C06.start + 8, kind: 'sweep'});
	sfx.push({f: at('C06', 0.42), kind: 'streamer'});
	sfx.push({f: at('C06', 0.44), kind: 'chime', v: 0.7});
	sfx.push({f: at('C07', 0.2), kind: 'paperRise'});
	for (let i = 0; i < 3; i++) sfx.push({f: cues.C08.end + 6 + i * 24, kind: 'tick', pitch: 1 + i * 0.1});
	[0.22, 0.42, 0.64].forEach((u, i) => sfx.push({f: at('C09', u), kind: 'roll', dur: i === 2 ? 36 : 24}));
	sfx.push({f: at('C10', 0.62), kind: 'chime', pitch: 1.5});
	sfx.push({f: at('C10', 0.62) + 8, kind: 'chime', pitch: 1.5, v: 0.7});
	sfx.push({f: at('C11', 0.1), kind: 'lamp'});
	sfx.push({f: S.endcard.start + 12, kind: 'chime', v: 0.5});
	sfx.sort((a, b) => a.f - b.f);

	const music = [
		{kind: 'intro', start: 0, end: S.contract.start + 10},
		{kind: 'theme', start: S.contract.start, end: S.tri.start + 10},
		{kind: 'low', start: cues.C08.start, end: cues.C09.start},
		{kind: 'lamp', start: cues.C09.start, end: total},
	];
	return {vo, cues, S, XF, total, sfx, music, mailDrop};
}
export type ContractFilm = ReturnType<typeof buildContract>;
