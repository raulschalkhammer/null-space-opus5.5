// "Track Layer" (paper diorama cut). Single source of truth for scene timing, narration cues,
// the tabletop route geometry and sound cues. Scene timing is driven by the narration durations.
// Import-free so Node can load it with --experimental-strip-types for the audio mix.

export const FPS = 24;
export type Option = {t: string; p: number};
export type StepData = {chosen: string; options: Option[]};
export type Fixture = {status: string; email: string; question: string; steps: StepData[]; jev: {label: string; p: number; status: string}};
export type VoLine = {id: string; text: string; duration: number};
export type Span = {start: number; end: number};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (t: number, p = 3) => 1 - Math.pow(1 - clamp01(t), p);
export const easeIn = (t: number, p = 2) => Math.pow(clamp01(t), p);
export const easeInOut = (t: number) => {
	const x = clamp01(t);
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const onTwos = (f: number) => Math.floor(f / 2) * 2;

export type Branch = {t: string; p: number; other: boolean; chosen: boolean};
export const branchesOf = (s: StepData): Branch[] => {
	const sorted = [...s.options].sort((a, b) => b.p - a.p);
	const list: Branch[] = sorted.map((o) => ({...o, other: false, chosen: o.t === s.chosen}));
	const rest = 1 - sorted.reduce((a, o) => a + o.p, 0);
	if (rest > 0.005) list.push({t: '…', p: rest, other: true, chosen: false});
	if (!list.some((b) => b.chosen)) throw new Error(`chosen token ${JSON.stringify(s.chosen)} missing from options`);
	return list;
};

// ---------- tabletop route geometry (ground-plane units) ----------
export const ROUTE = {W0: 720, Zc: 2600, SEG: 1500, BRANCH: 640, STUB: 260, GAP: 70, WAIT: 330};
export type ForkGeo = {
	k: number;
	x: number; // fork mouth
	win: number; // incoming width
	branches: (Branch & {z0: number; z1: number; w: number})[]; // z0 = stacked bottom edge at the mouth, z1 = lane bottom edge after the curve
	chosen: Branch & {z0: number; z1: number; w: number};
	cumBefore: number;
	cumAfter: number;
};
export function buildRoute(steps: StepData[]): ForkGeo[] {
	const {W0, Zc, SEG, GAP} = ROUTE;
	let cum = 1;
	return steps.map((s, k) => {
		const win = W0 * cum;
		const br = branchesOf(s);
		const ci = br.findIndex((b) => b.chosen);
		// stacked at the mouth, far side (large Z) first
		let z = Zc + win / 2;
		const stacked = br.map((b) => {
			const w = win * b.p;
			z -= w;
			return {...b, w, z0: z};
		});
		// lanes after the curve: chosen centred on Zc, the others fanned out on either side
		const cw = stacked[ci].w;
		let far = Zc + cw / 2 + GAP;
		let near = Zc - cw / 2 - GAP;
		const lanes = stacked.map((b) => ({...b, z1: 0}));
		lanes[ci].z1 = Zc - cw / 2;
		for (let i = ci - 1; i >= 0; i--) {
			lanes[i].z1 = far;
			far += lanes[i].w + GAP;
		}
		for (let i = ci + 1; i < lanes.length; i++) {
			near -= lanes[i].w;
			lanes[i].z1 = near;
			near -= GAP;
		}
		const cumBefore = cum;
		cum *= br[ci].p;
		return {k, x: k * SEG, win, branches: lanes, chosen: lanes[ci], cumBefore, cumAfter: cum};
	});
}

// ---------- the film ----------
// t0 shifts the whole story later (room for a cold open); an optional L10b line extends the derail beat.
export function buildFilm(fx: Fixture, vo: VoLine[], t0 = 0) {
	const d = (id: string) => Math.round((vo.find((l) => l.id === id)?.duration ?? 3) * FPS);
	const cues: Record<string, Span> = {};
	const say = (id: string, at: number) => {
		cues[id] = {start: at, end: at + d(id)};
		return cues[id].end;
	};
	const S: Record<string, Span> = {};
	const XF = 12; // crossfade frames between scenes

	S.title = {start: t0, end: t0 + 84};
	S.letter = {start: t0 + 72, end: 0};
	S.letter.end = say('L01', t0 + 96) + 20;
	S.gab = {start: S.letter.end, end: 0};
	S.gab.end = say('L02', S.gab.start + 12) + 18;
	S.fork = {start: S.gab.end, end: 0};
	const l03 = say('L03', S.fork.start + 30);
	S.fork.end = say('L04', l03 + 8) + 40;
	S.thin = {start: S.fork.end, end: 0};
	S.thin.end = say('L05', S.thin.start + 10) + 30;
	S.chain = {start: S.thin.end, end: 0};
	S.chain.end = say('L06', S.chain.start + 64) + 30;
	S.marble = {start: S.chain.end, end: 0};
	const l07 = say('L07', S.marble.start + 10);
	S.marble.end = say('L08', l07 + 6) + 34;
	S.lean = {start: S.marble.end, end: 0};
	S.lean.end = say('L09', S.lean.start + 20) + 40;
	S.derail = {start: S.lean.end, end: 0};
	S.derail.end = say('L10', S.derail.start + 58) + 20;
	if (vo.some((l) => l.id === 'L10b')) S.derail.end = say('L10b', S.derail.end - 8) + 20;
	S.jev = {start: S.derail.end, end: 0};
	const l11 = say('L11', S.jev.start + 26);
	const l12 = say('L12', l11 + 8);
	S.jev.end = say('L13', l12 + 12) + 26;
	S.close = {start: S.jev.end, end: 0};
	S.close.end = say('L14', S.close.start + 16) + 16;
	S.endcard = {start: S.close.end, end: S.close.end + 110};
	const total = S.endcard.end;

	const route = buildRoute(fx.steps);

	// Marble drop + train move per fork, in absolute frames.
	type ForkTime = {k: number; roll: number; land: number; go: number; arrive: number};
	const forkTimes: ForkTime[] = [];
	const push = (k: number, roll: number, land: number, go: number, arrive: number) => forkTimes.push({k, roll, land, go, arrive});
	// fork 0 is decided while L04 plays ("Gab takes one")
	push(0, cues.L04.start - 6, cues.L04.start + 22, cues.L04.start + 30, S.fork.end + 8);
	// forks 1..5 through L05
	{
		const a = S.thin.start + 4;
		const seg = (S.thin.end - a) / 5;
		for (let i = 0; i < 5; i++) {
			const t0 = a + i * seg;
			push(i + 1, t0, t0 + seg * 0.35, t0 + seg * 0.42, t0 + seg * 0.98);
		}
	}
	// fork 6: the unlikely word lands right as L07 ends ("a thin one wins")
	push(6, cues.L07.end - 44, cues.L07.end, cues.L08.end + 2, S.marble.end + 12);
	// fork 7 (magnified): legit, decided as L09 lands on its last word
	push(7, cues.L09.end - 36, cues.L09.end - 4, cues.L09.end + 4, S.lean.end + 10);

	// ---------- sound ----------
	type Sfx = {f: number; kind: string; v?: number; pitch?: number; dur?: number};
	const sfx: Sfx[] = [];
	sfx.push({f: t0 + 6, kind: 'paperRise'});
	sfx.push({f: S.letter.start + 10, kind: 'flutter', dur: 60});
	sfx.push({f: S.letter.start + 64, kind: 'pin'});
	sfx.push({f: S.gab.start + 30, kind: 'chug'});
	sfx.push({f: S.gab.start + 60, kind: 'chug'});
	sfx.push({f: S.fork.start + 4, kind: 'whoosh', v: 0.5});
	for (const ft of forkTimes) {
		const g = route[ft.k];
		if (ft.k === 7) continue;
		sfx.push({f: ft.roll, kind: 'roll', dur: ft.land - ft.roll});
		sfx.push({f: ft.land, kind: 'clack', pitch: 1 + (1 - g.chosen.p) * 0.6});
		sfx.push({f: ft.land + 2, kind: 'cut'});
		sfx.push({f: ft.go + 4, kind: 'chug'});
	}
	for (let i = 0; i < 6; i++) sfx.push({f: S.chain.start + 10 + i * 8, kind: 'tick', pitch: 1 + i * 0.08});
	sfx.push({f: S.chain.start + 60, kind: 'paperRise'});
	const f7 = forkTimes.find((t) => t.k === 7)!;
	sfx.push({f: S.lean.start - 8, kind: 'zoom'});
	sfx.push({f: f7.land, kind: 'clack', pitch: 0.9});
	sfx.push({f: S.derail.start + 20, kind: 'creak'});
	sfx.push({f: S.derail.start + 36, kind: 'whoosh', v: 0.6});
	sfx.push({f: S.derail.start + 44, kind: 'splash'});
	for (let i = 0; i < 6; i++) sfx.push({f: S.derail.start + 60 + i * 9 + (i % 2) * 4, kind: 'bubble', pitch: 240 + i * 50});
	sfx.push({f: S.jev.start + 6, kind: 'whoosh', v: 0.4});
	sfx.push({f: S.jev.start + 24, kind: 'lamp'});
	sfx.push({f: cues.L12.start + 30, kind: 'sweep'});
	sfx.push({f: cues.L12.end - 20, kind: 'streamer'});
	sfx.push({f: cues.L13.start, kind: 'chime'});
	sfx.push({f: S.endcard.start + 12, kind: 'chime', v: 0.5});
	sfx.sort((a, b) => a.f - b.f);

	const music = [
		{kind: 'theme', start: t0, end: S.derail.start + 30},
		{kind: 'low', start: S.derail.start + 40, end: S.jev.start + 10},
		{kind: 'lamp', start: S.jev.start + 10, end: total},
	];

	return {fx, vo, cues, S, XF, total, route, forkTimes, sfx, music};
}
export type Film = ReturnType<typeof buildFilm>;
