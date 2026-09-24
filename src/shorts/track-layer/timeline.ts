// Single source of truth for "Track Layer": scene timing, train geometry, camera and sound cues.
// Pure functions of the fixture and the frame number, shared by the renderer and data-scripts/make-audio.ts.
// Keep this file free of imports so Node can load it with --experimental-strip-types.

export const FPS = 24;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Option = {t: string; p: number};
export type StepData = {chosen: string; options: Option[]};
export type TrackLayerFixture = {
	status: string;
	note: string;
	email: string;
	question: string;
	steps: StepData[];
	jev: {label: string; p: number; status: string};
};

export type Slice = {t: string; p: number; a0: number; a1: number; other: boolean};
export type StepKind = 'full' | 'fast' | 'unlucky' | 'lean' | 'medium';
export type StepTiming = {
	index: number;
	kind: StepKind;
	start: number;
	end: number;
	spinStart: number;
	spinEnd: number;
	drop: number;
	slam: number;
	slices: Slice[];
	chosenIdx: number;
	chosen: Option;
	// Total pointer travel in degrees (whole turns plus the landing angle).
	total: number;
};
export type Piece = {x0: number; y0: number; x1: number; y1: number; angle: number};
export type Pose = {x: number; y: number; rot: number; s: number; phase: 'track' | 'teeter' | 'fall' | 'swamp'};
export type Cam = {cx: number; cy: number; s: number; blur: number};

export type SfxKind =
	| 'tick' | 'pop' | 'land' | 'swish' | 'slam' | 'blip' | 'chug' | 'ding' | 'gulp' | 'creak'
	| 'uhoh' | 'whoosh' | 'splash' | 'bubble' | 'chime' | 'sparkle' | 'antenna' | 'paper'
	| 'chalk' | 'thock' | 'question' | 'scribble' | 'recordStop' | 'blink';
export type Sfx = {f: number; kind: SfxKind; v?: number; pitch?: number; dur?: number};
export type MusicCue = {kind: 'gab' | 'gabSour' | 'jev' | 'math' | 'end'; start: number; end: number};

// ---------- math helpers ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (t: number, p = 3) => 1 - Math.pow(1 - clamp01(t), p);
export const easeIn = (t: number, p = 2) => Math.pow(clamp01(t), p);
export const easeInOut = (t: number) => {
	const x = clamp01(t);
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
// 0 before a, ramps to 1 over `ramp` frames, holds, ramps back to 0 ending at b.
export const bump = (f: number, a: number, b: number, ramp: number) =>
	easeInOut(progress(f, a, a + ramp)) * (1 - easeInOut(progress(f, b - ramp, b)));
// Hold animation on twos: the classic 12-drawings-per-second cadence at 24 fps.
export const onTwos = (f: number) => Math.floor(f / 2) * 2;

// ---------- layout constants ----------
export const TRACK_X0 = 560;
export const TRACK_Y = 760;
export const PIECE = 260;
export const TRAIN_LEN = 250;
export const WHEEL_R = 180;

const KINDS: Record<StepKind, {len: number; spinStart: number; spinEnd: number; drop: number; slam: number; turns: number}> = {
	full: {len: 84, spinStart: 10, spinEnd: 46, drop: 54, slam: 64, turns: 3},
	lean: {len: 100, spinStart: 10, spinEnd: 46, drop: 56, slam: 66, turns: 2},
	fast: {len: 46, spinStart: 6, spinEnd: 22, drop: 26, slam: 32, turns: 2},
	unlucky: {len: 128, spinStart: 10, spinEnd: 92, drop: 104, slam: 112, turns: 3},
	medium: {len: 62, spinStart: 8, spinEnd: 32, drop: 38, slam: 46, turns: 2},
};

export function makeSlices(step: StepData): Slice[] {
	const sorted = [...step.options].sort((a, b) => b.p - a.p).map((o) => ({...o, other: false}));
	const sum = sorted.reduce((s, o) => s + o.p, 0);
	if (1 - sum > 0.005) sorted.push({t: '…', p: 1 - sum, other: true});
	let a = 0;
	return sorted.map((o) => {
		const a0 = a;
		a += o.p * 360;
		return {...o, a0, a1: a};
	});
}

// The "unlucky" step is the first one where a low-probability token was sampled.
function stepKinds(steps: StepData[]): StepKind[] {
	const u = steps.findIndex((s) => (s.options.find((o) => o.t === s.chosen)?.p ?? 1) < 0.1);
	return steps.map((_, i) => {
		if (u >= 0 && i === u) return 'unlucky';
		if (u >= 0 && i === u + 1) return 'lean';
		if (u >= 0 && i > u + 1) return 'medium';
		return i < 2 ? 'full' : 'fast';
	});
}

export const syllables = (token: string) => {
	const groups = token.toLowerCase().match(/[aeiouy]+/g);
	return /[a-z]/i.test(token) ? Math.max(1, groups ? groups.length : 1) : 0;
};

export function buildTimeline(fx: TrackLayerFixture) {
	const TITLE_END = 96;
	const EST_START = 88;
	const JEV_PLANT = 124;
	const STEPS_START = 264;

	// ----- steps -----
	const kinds = stepKinds(fx.steps);
	const steps: StepTiming[] = [];
	let t = STEPS_START;
	fx.steps.forEach((sd, i) => {
		const k = KINDS[kinds[i]];
		const slices = makeSlices(sd);
		const chosenIdx = slices.findIndex((s) => !s.other && s.t === sd.chosen);
		if (chosenIdx < 0) throw new Error(`step ${i}: chosen token ${JSON.stringify(sd.chosen)} is not among its options`);
		const c = slices[chosenIdx];
		const target = c.a0 + (c.a1 - c.a0) * (kinds[i] === 'unlucky' ? 0.72 : 0.5);
		steps.push({
			index: i,
			kind: kinds[i],
			start: t,
			end: t + k.len,
			spinStart: t + k.spinStart,
			spinEnd: t + k.spinEnd,
			drop: t + k.drop,
			slam: t + k.slam,
			slices,
			chosenIdx,
			chosen: {t: c.t, p: c.p},
			total: target + 360 * k.turns,
		});
		t += k.len;
	});
	const STEPS_END = t;
	const unlucky = steps.findIndex((s) => s.kind === 'unlucky');

	// Pointer angle on the wheel (degrees, measured clockwise from the wheel's top).
	const pointerAngle = (st: StepTiming, f: number) => st.total * easeOut(progress(f, st.spinStart, st.spinEnd), 3);

	// ----- track geometry: pieces bend downhill once the unlikely word is on the track -----
	const pieces: Piece[] = [];
	{
		let x = TRACK_X0;
		let y = TRACK_Y;
		steps.forEach((_, i) => {
			const k = unlucky < 0 || i < unlucky ? -1 : i - unlucky;
			const angle = k < 0 ? 0 : Math.min(40, 9 + 14 * k);
			const r = (angle * Math.PI) / 180;
			const x1 = x + PIECE * Math.cos(r);
			const y1 = y + PIECE * Math.sin(r);
			pieces.push({x0: x, y0: y, x1, y1, angle});
			x = x1;
			y = y1;
		});
	}
	const trackLen = pieces.length * PIECE;
	const trackEnd = {x: pieces[pieces.length - 1].x1, y: pieces[pieces.length - 1].y1};

	const pointAt = (s: number) => {
		if (s <= 0) return {x: TRACK_X0 + s, y: TRACK_Y};
		const i = Math.min(pieces.length - 1, Math.floor(s / PIECE));
		const p = pieces[i];
		const u = (s - i * PIECE) / PIECE; // may exceed 1 on the last piece (runs off the end)
		return {x: p.x0 + (p.x1 - p.x0) * u, y: p.y0 + (p.y1 - p.y0) * u};
	};
	const onTrackPose = (s: number) => {
		const front = pointAt(s);
		const rear = pointAt(s - TRAIN_LEN);
		return {x: front.x, y: front.y, rot: (Math.atan2(front.y - rear.y, front.x - rear.x) * 180) / Math.PI};
	};
	const trainS = (f: number) => {
		let s = 0;
		for (const st of steps) {
			if (f < st.slam) break;
			s = st.index * PIECE + PIECE * easeInOut(progress(f, st.slam + 2, st.end - 1));
		}
		return s;
	};

	// ----- derail -----
	const D = STEPS_END;
	const FALL_START = D + 26;
	const V0 = 340;
	const G = 2600;
	const swampY = trackEnd.y + 130;
	const swamp = {x0: trackEnd.x - 40, x1: trackEnd.x + 820, y: swampY};
	const teeterEnd = onTrackPose(trackLen + 40);
	const a1 = (teeterEnd.rot * Math.PI) / 180;
	const vx = V0 * Math.cos(a1);
	const vy = V0 * Math.sin(a1);
	const dy = swampY + 30 - teeterEnd.y;
	const tLand = (-vy + Math.sqrt(vy * vy + 2 * G * dy)) / G;
	const LAND = FALL_START + tLand * FPS;
	const fallRot = (tt: number) => teeterEnd.rot + (70 - teeterEnd.rot) * easeOut(tt / 0.4);
	const landPose = {x: teeterEnd.x + vx * tLand, y: swampY + 30, rot: fallRot(tLand)};
	const floatPose = {x: trackEnd.x + 330, y: swampY + 92, rot: -5};

	const gabPose = (f: number): Pose => {
		if (f < D) {
			const s = trainS(f);
			return {...onTrackPose(s), s, phase: 'track'};
		}
		if (f < FALL_START) {
			const s = trackLen + 40 * easeOut(progress(f, D, D + 12));
			const p = onTrackPose(s);
			const wob = 4 * Math.sin((f - D) * 0.8) * (1 - progress(f, D, FALL_START));
			return {...p, rot: p.rot + wob, s, phase: 'teeter'};
		}
		if (f < LAND) {
			const tt = (f - FALL_START) / FPS;
			return {x: teeterEnd.x + vx * tt, y: teeterEnd.y + vy * tt + 0.5 * G * tt * tt, rot: fallRot(tt), s: trackLen + 40 + V0 * tt, phase: 'fall'};
		}
		const u = (f - LAND) / FPS;
		const damp = Math.exp(-3.2 * u) * Math.cos(8 * u);
		return {
			x: lerp(landPose.x, floatPose.x, easeOut(Math.min(1, u / 1.2))),
			y: floatPose.y + (landPose.y - floatPose.y) * damp + 4 * Math.sin(u * 2.4),
			rot: floatPose.rot + (landPose.rot - floatPose.rot) * damp + 1.5 * Math.sin(u * 1.7),
			s: trackLen + 40 + V0 * tLand,
			phase: 'swamp',
		};
	};

	// ----- scene boundaries after the derail -----
	const JEV_START = Math.ceil(LAND) + 78;
	const JEV_LEN = 300;
	const MATH_START = JEV_START + JEV_LEN;
	const MATH_LEN = 324;
	const END_START = MATH_START + MATH_LEN;
	const END_LEN = 108;
	const total = END_START + END_LEN;

	// ----- Jev's hill -----
	const JEV_X = swamp.x1 + 1300;
	const JEV_GROUND = TRACK_Y - 200;
	const SIGN_TOP = JEV_GROUND - 186;

	// Ground profile (world coords), smoothed by the renderer.
	const ground: [number, number][] = [
		[-3000, TRACK_Y + 70],
		[-600, TRACK_Y + 70],
		[400, TRACK_Y + 70],
		...pieces.map((p) => [p.x0, p.y0 + 70] as [number, number]),
		[trackEnd.x + 6, trackEnd.y + 70],
		[trackEnd.x - 6, swampY + 40],
		[trackEnd.x + 120, swampY + 150],
		[swamp.x1 - 120, swampY + 150],
		[swamp.x1, swampY + 6],
		[swamp.x1 + 420, swampY - 260],
		[JEV_X - 420, JEV_GROUND + 60],
		[JEV_X, JEV_GROUND],
		[JEV_X + 380, JEV_GROUND + 60],
		[JEV_X + 1000, TRACK_Y + 90],
		[JEV_X + 4000, TRACK_Y + 90],
	];

	// ----- camera -----
	const wide = {cx: 2650, cy: 640, s: 0.34};
	const mix = (a: {cx: number; cy: number; s: number}, b: {cx: number; cy: number; s: number}, k: number) => ({
		cx: lerp(a.cx, b.cx, k),
		cy: lerp(a.cy, b.cy, k),
		s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)),
	});
	const followStep = (f: number) => {
		const p = gabPose(f);
		return {cx: p.x + 250, cy: 540 + (p.y - TRACK_Y) * 0.9, s: 1};
	};
	const wheelCenter = (st: StepTiming) => ({x: pieces[st.index].x0 + 150, y: pieces[st.index].y0 - 400});
	const swampShot = {cx: trackEnd.x + 230, cy: swampY - 250, s: 1};
	const jevClose = {cx: JEV_X + 100, cy: SIGN_TOP - 80, s: 1.8};
	const pull = {cx: (floatPose.x - 120 + JEV_X) / 2, cy: (swampY + SIGN_TOP) / 2 - 40, s: 0.62};

	const camera = (f: number): Cam => {
		if (f < 150) return {...wide, cx: wide.cx + (f - EST_START) * 1.2, blur: 0};
		if (f < 256) {
			const w = {...wide, cx: wide.cx + (150 - EST_START) * 1.2};
			return {...mix(w, followStep(f), easeInOut(progress(f, 150, 256))), blur: 0};
		}
		if (f < D) {
			let c = followStep(f);
			if (unlucky >= 0) {
				const st = steps[unlucky];
				const wc = wheelCenter(st);
				c = mix(c, {cx: wc.x - 40, cy: wc.y + 120, s: 1.28}, 0.85 * bump(f, st.spinStart - 4, st.slam + 4, 18));
			}
			return {...c, blur: 0};
		}
		if (f < JEV_START) {
			const c = mix(followStep(D - 1), swampShot, easeInOut(progress(f, D + 4, D + 34)));
			const k = f >= LAND ? Math.exp(-(f - LAND) / 5) : 0;
			return {cx: c.cx + 16 * k * Math.sin(f * 2.3), cy: c.cy + 12 * k * Math.cos(f * 3.1), s: c.s, blur: 0};
		}
		const J = JEV_START;
		if (f < J + 150) {
			const k = progress(f, J, J + 16);
			return {...mix(swampShot, jevClose, easeInOut(k)), blur: 70 * Math.sin(Math.PI * k)};
		}
		return {...mix(jevClose, pull, easeInOut(progress(f, J + 150, J + 198))), blur: 0};
	};

	// ----- sound cues -----
	const sfx: Sfx[] = [];
	const music: MusicCue[] = [];
	sfx.push({f: 8, kind: 'scribble', dur: 40});
	sfx.push({f: 88, kind: 'whoosh', v: 0.5});
	sfx.push({f: JEV_PLANT, kind: 'chime', v: 0.25});
	for (const st of steps) {
		sfx.push({f: st.start, kind: 'pop'});
		for (let f = st.spinStart; f < st.spinEnd; f++) {
			const a = pointerAngle(st, f);
			const b = pointerAngle(st, f + 1);
			for (const sl of st.slices) {
				for (let turn = Math.floor(a / 360); turn <= Math.floor(b / 360); turn++) {
					const edge = sl.a0 + 360 * turn;
					if (edge > a && edge <= b) sfx.push({f: f + (edge - a) / (b - a), kind: 'tick'});
				}
			}
		}
		sfx.push({f: st.spinEnd, kind: 'land'});
		if (st.kind === 'unlucky') sfx.push({f: st.spinEnd + 6, kind: 'gulp'});
		sfx.push({f: st.drop, kind: 'swish'});
		sfx.push({f: st.slam, kind: 'slam'});
		const n = syllables(st.chosen.t);
		const base = 300 + (st.chosen.t.charCodeAt(st.chosen.t.length - 1) % 7) * 22;
		for (let i = 0; i < n; i++) sfx.push({f: st.slam + 2 + i * 3, kind: 'blip', pitch: base * (i % 2 ? 1.18 : 1)});
		if (/[!.?]/.test(st.chosen.t)) sfx.push({f: st.slam + 3, kind: 'ding'});
		sfx.push({f: st.slam + 5, kind: 'chug'});
		if (st.kind !== 'fast') sfx.push({f: st.slam + 14, kind: 'chug'});
	}
	sfx.push({f: D + 2, kind: 'creak'});
	sfx.push({f: D + 10, kind: 'uhoh'});
	sfx.push({f: FALL_START, kind: 'whoosh', v: 0.6});
	sfx.push({f: LAND, kind: 'splash'});
	for (let i = 0; i < 7; i++) sfx.push({f: LAND + 14 + i * 7 + (i % 3) * 3, kind: 'bubble', pitch: 240 + i * 45});
	sfx.push({f: LAND + 58, kind: 'question'});
	const J = JEV_START;
	sfx.push({f: J, kind: 'whoosh', v: 0.8});
	sfx.push({f: J + 30, kind: 'blink'});
	sfx.push({f: J + 42, kind: 'chime', v: 1});
	sfx.push({f: J + 44, kind: 'sparkle'});
	sfx.push({f: J + 212, kind: 'question'});
	sfx.push({f: J + 240, kind: 'antenna'});
	sfx.push({f: J + 250, kind: 'antenna'});
	sfx.push({f: MATH_START - 14, kind: 'paper'});
	for (const [a, b] of MATH_WRITES) sfx.push({f: MATH_START + a, kind: 'chalk', dur: b - a});
	for (const a of MATH_PLANKS) sfx.push({f: MATH_START + a + 10, kind: 'thock'});
	sfx.push({f: END_START + 8, kind: 'chime', v: 0.6});
	sfx.push({f: END_START + 60, kind: 'blink'});

	const gabMusicCut = unlucky >= 0 ? steps[unlucky].spinStart : D;
	music.push({kind: 'gab', start: 250, end: gabMusicCut});
	if (unlucky >= 0) music.push({kind: 'gabSour', start: steps[unlucky].slam, end: D + 2});
	sfx.push({f: D + 2, kind: 'recordStop'});
	music.push({kind: 'jev', start: J + 20, end: MATH_START});
	music.push({kind: 'math', start: MATH_START, end: END_START});
	music.push({kind: 'end', start: END_START, end: total});
	sfx.sort((a, b) => a.f - b.f);

	return {
		fx, total, steps, unlucky, pieces, trackLen, trackEnd, swamp, landPose, floatPose,
		TITLE_END, EST_START, JEV_PLANT, STEPS_START, STEPS_END, D, FALL_START, LAND, JEV_START, MATH_START, END_START,
		JEV_X, JEV_GROUND, SIGN_TOP, ground,
		pointerAngle, pointAt, gabPose, camera, wheelCenter, sfx, music,
	};
}

// Math card choreography, in frames from MATH_START. Shared with the audio script.
export const MATH_WRITES: [number, number][] = [
	[16, 40], // p(y|x) =
	[44, 62], // factor 1
	[66, 84], // factor 2
	[88, 106], // factor 3
	[140, 186], // product form
	[236, 276], // Jev line
];
export const MATH_PLANKS = [48, 70, 92];

export type Timeline = ReturnType<typeof buildTimeline>;
