import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import {FONT, FlatDefs, FlatLighthouse, K, Motes, Stars, Vignette} from '../../flat/kit';
import {Equation} from '../../flat/math';
import {City, Clouds, Moon, Mountains, WorldDefs} from '../../flat/world';
import {SteamPress, type Speech} from '../../characters/steam';
import {Grain} from '../../styleframes/Shared';
import vo from '../../../fixtures/signal-box-vo.json';
import type {VoLine} from '../paper-track/timeline';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {withLook} from '../flat-track/trainMood';
import {Coin, Grid10, RED, Say, Stage, T, pop} from '../million-letters/parts';
import {film as ch1} from '../flat-track/Film';
import {ChatWindows, Twice} from '../flat-track/Intro';
import {PassScene, contract as ch2} from '../jev-contract/Film';
import {AnswerScene, million as ch3} from '../million-letters/Film';
import {G, Interior, J, Junction, LEVER, POINTS_LEVER, type CartState, type Route, leverThrow, leverTop, routeLen} from './parts';
import {GUESS_PAUSE, SIGNAL, buildSignal, systemCost, timesCheaper} from './timeline';

export const signal = buildSignal((vo as {lines: VoLine[]}).lines);
const {H, cues, at} = signal;

// Chapter 4 as long shots (docs/chapter4-plan.md). Each shot keeps its whole setting in view, the camera moves
// slowly inside a world drawn wider than any frame, and shots cross-fade. Hard cuts only for the two reveals.

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
		{children}
	</svg>
);
type CamK = {x: number; y: number; z: number};
const camAt = (a: CamK, b: CamK, k: number): CamK => {
	const e = easeInOut(k);
	return {x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), e))};
};

// ---------- letters on the move ----------
type Sched = {t0: number; route: Route; p?: number; tint?: string; red?: boolean};
const V = 10; // px per frame
const arriveOf = (c: Sched, v = V) => c.t0 + routeLen(c.route) / v;
const cartsAt = (f: number, list: Sched[], v = V, linger = 16): CartState[] =>
	list.flatMap((c) => {
		const age = f - c.t0;
		if (age < 0) return [];
		const arrive = arriveOf(c, v);
		if (f > arrive + linger) return [];
		const s = Math.min(routeLen(c.route), age * v);
		return [{route: c.route, s, p: c.p, tint: c.tint, red: c.red, letter: f < arrive + (c.route === 'long' ? 4 : 10), o: 1 - progress(f, arrive + linger - 8, arrive + linger)}];
	});
// the points follow whichever letter is coming up to them
const routeFor = (f: number, list: Sched[], v = V, fallback: Route = 'short'): Route => {
	let best: Sched | null = null;
	for (const c of list) {
		const s = (f - c.t0) * v;
		if (s > 900 && s < 1260) best = c;
	}
	return best ? best.route : fallback;
};
const pAtPoints = (f: number, list: Sched[], v = V) => {
	let p: number | undefined;
	for (const c of list) {
		const s = (f - c.t0) * v;
		if (s > 700 && s < 1260) p = c.p;
	}
	return p;
};
const stampsOf = (list: Sched[], v = V) => list.filter((c) => c.route === 'short').map((c) => arriveOf(c, v));

// the train writing its reply, one word at a time
const REPLY = 'Dear customer , thank you for writing to us . We have looked into your account , and here is what happened'.split(' ');
const writing = (f: number, t0: number, every = 8): Speech => (f < t0 ? [] : REPLY.slice(0, Math.min(REPLY.length, Math.floor((f - t0) / every) + 1)).map((w, i) => ({word: w, age: f - (t0 + i * every)})));

// ---------- shots ----------
type ShotDef = {at: number; xf?: number; cam?: (f: number, k: number) => CamK; render: (f: number) => React.ReactNode; overlay?: (f: number) => React.ReactNode};
const Reel: React.FC<{f: number; shots: ShotDef[]; end: number}> = ({f, shots, end}) => {
	let i = -1;
	while (i + 1 < shots.length && f >= shots[i + 1].at) i++;
	if (i < 0) return null;
	const one = (j: number, opacity: number) => {
		const s = shots[j];
		const t1 = j + 1 < shots.length ? shots[j + 1].at : end;
		const k = clamp01((f - s.at) / Math.max(1, t1 - s.at));
		const c = s.cam ? s.cam(f, k) : {x: 960, y: 540, z: 1};
		return (
			<AbsoluteFill key={j} style={{opacity}}>
				<AbsoluteFill style={{transform: `translate(960px, 540px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`, transformOrigin: '0 0'}}>{s.render(f)}</AbsoluteFill>
				{s.overlay ? s.overlay(f) : null}
			</AbsoluteFill>
		);
	};
	const cur = shots[i];
	const xf = cur.xf ?? 14;
	if (i > 0 && xf > 0 && f < cur.at + xf) {
		return (
			<>
				{one(i - 1, 1)}
				{one(i, (f - cur.at) / xf)}
			</>
		);
	}
	return one(i, 1);
};
const span = (a: CamK, b: CamK) => (_f: number, k: number) => camAt(a, b, k);

// ----- shot 2: letters come down the line toward the junction -----
const flow2: Sched[] = Array.from({length: 7}, (_, i) => ({t0: H.rails - 40 + i * 34, route: (i % 4 === 2 ? 'long' : 'short') as Route, p: [0.97, 0.95, 0.64, 0.93, 0.98, 0.96, 0.71][i]}));
// ----- shot 4 and 5: one letter, read in the box -----
const lifted = {x: 600, t0: at('S05', 0.3), t1: at('S05', 0.75)};
// ----- shot 6: one sure letter, one unsure -----
const sure: Sched = {t0: at('S07', 0.55) - routeLen('short') / V, route: 'short', p: 0.97};
const unsure: Sched = {t0: at('S08', 0.5) - routeLen('long') / V, route: 'long', p: 0.64};
const flow6 = [sure, unsure];
// ----- shot 10: a thousand letters (thirty carts, each standing for 33 of them) -----
const RUN_V = 18;
const N = 30;
const flow10: Sched[] = Array.from({length: N}, (_, i) => ({t0: signal.run.start + i * 5, route: (i % 5 === 3 ? 'long' : 'short') as Route}));
const arrived = (f: number, route: Route) => flow10.filter((c) => c.route === route && f >= arriveOf(c, RUN_V)).length;
// ----- shot 14: the rule, letter by letter -----
const flow14: Sched[] = [0.96, 0.72, 0.93, 0.58, 0.97].map((p, i) => ({t0: H.honest - 60 + i * 30, route: (p >= SIGNAL.line ? 'short' : 'long') as Route, p}));
// ----- shot 15: the overconfident letter -----
const overSure: Sched = {t0: at('S23', 0.45) - routeLen('short') / V, route: 'short', p: 0.95};
// ----- shot 16: morning traffic -----
const flow16: Sched[] = Array.from({length: 9}, (_, i) => ({t0: H.partners - 80 + i * 26, route: (i % 5 === 2 ? 'long' : 'short') as Route}));
// ----- shot 17: letters from a new town -----
const flow17: Sched[] = Array.from({length: 6}, (_, i) => ({t0: H.catch - 40 + i * 30, route: (i % 3 === 1 ? 'long' : 'short') as Route, p: [0.93, 0.88, 0.91, 0.95, 0.86, 0.92][i], tint: '#9FC4F0'}));

const titleJunction = (f: number) => <Junction f={f} gpt={{x: 1350}} />;

// the whole world at dawn, for the ending: the harbor, the city, the junction
const Panorama: React.FC<{f: number; trainsGo: number}> = ({f, trainsGo}) => (
	<Svg>
		<FlatDefs />
		<WorldDefs />
		<defs>
			<linearGradient id="gSunrise" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2B2E7A" />
				<stop offset="0.5" stopColor="#8A5A9E" />
				<stop offset="0.85" stopColor="#F29A8A" />
				<stop offset="1" stopColor="#FFD29A" />
			</linearGradient>
		</defs>
		<rect x={-4000} y={-1600} width={8000} height={2230} fill="url(#gSunrise)" />
		<Stars f={f} maxY={200} />
		<circle cx={-600} cy={640} r={260} fill="#FFE2A8" opacity={0.6} filter="url(#glowBig)" />
		<circle cx={-600} cy={640} r={110} fill="#FFE9C0" />
		<Clouds f={f} y={260} count={5} seed={41} opacity={0.8} />
		{[-2600, -1700, -800, 100, 1000, 1900].map((x, i) => (
			<g key={x} transform={`translate(${x} 0)`}>
				<Mountains y={640} seed={50 + i} layers={2} />
			</g>
		))}
		{/* land under the city and the junction, meeting the harbor at a curved shore */}
		<rect x={-1500} y={640} width={5000} height={1400} fill="#1E2466" />
		<rect x={-1500} y={640} width={5000} height={20} fill="#2A3180" />
		<rect x={-1500} y={J.railY + 60} width={5000} height={1000} fill="#181D56" />
		{/* the harbor: sea and the lighthouse on its rock */}
		<path d="M -4000 640 L -1500 640 C -1380 700 -1460 820 -1320 900 C -1200 980 -1300 1200 -1180 2040 L -4000 2040 Z" fill="url(#gSea)" />
		<path d="M -2300 660 C -2240 580 -2160 540 -2040 536 C -1920 540 -1840 590 -1760 660 Z" fill="#2A2F7A" />
		<g transform="translate(-2040 544) scale(1.3)">
			<FlatLighthouse on={1} />
		</g>
		{/* the city, where the bank and its reviewers are */}
		<City x={-1320} y={660} w={1150} f={f} />
		{/* the junction */}
		<Junction f={f} bare lighthouse={0} train={{x: J.trainX + 900 * easeIn(trainsGo, 1.6), speech: writing(f, H.world + 30, 9), dist: 900 * trainsGo}} gpt={{x: 1350 + 900 * easeIn(clamp01(trainsGo * 1.2 - 0.2), 1.6), dist: 800 * trainsGo}} carts={cartsAt(f, Array.from({length: 12}, (_, i) => ({t0: H.world - 60 + i * 22, route: (i % 5 === 2 ? 'long' : 'short') as Route})), 12)} stampAt={stampsOf(Array.from({length: 12}, (_, i) => ({t0: H.world - 60 + i * 22, route: (i % 5 === 2 ? 'long' : 'short') as Route})), 12)} />
		<Motes f={f} color="#FFE2A8" count={20} seed={3} />
	</Svg>
);

const SHOTS: ShotDef[] = [
	// 1. title: the junction at night, the box lit, both trains waiting
	{
		at: H.title,
		xf: 0,
		cam: span({x: 960, y: 560, z: 1.02}, {x: 980, y: 560, z: 1.06}),
		render: (f) => <Svg>{titleJunction(f)}</Svg>,
		overlay: (f) => {
			const t = easeOut(progress(f, 14, 40), 2) * (1 - progress(f, H.rails, H.rails + 14));
			return (
				<div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
					<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK · Nº 4</div>
					<div style={{fontWeight: 900, fontSize: 160, color: K.white, lineHeight: 1.05, textShadow: '0 6px 30px rgba(5,8,32,0.6)'}}>The Signal Box</div>
				</div>
			);
		},
	},
	// 2. letters come down the line toward the junction; far off, the lighthouse
	{
		at: H.rails,
		cam: span({x: 520, y: 600, z: 1.12}, {x: 820, y: 640, z: 1.12}),
		render: (f) => (
			<Svg>
				<Junction f={f} carts={cartsAt(f, flow2)} route={routeFor(f, flow2)} gaugeP={pAtPoints(f, flow2)} stampAt={stampsOf(flow2)} />
			</Svg>
		),
		overlay: (f) => <Say x={560} y={170} k={pop(f, at('S02', 0.62))} text="reply?" size={96} color={K.white} />,
	},
	// 3. Jev can't write; the train can, word by word, a coin for each word
	{
		at: H.trains,
		cam: (f) => {
			const k = progress(f, at('S03', 0.7), at('S04', 0.3));
			return camAt({x: 640, y: 560, z: 1.6}, {x: 1560, y: 700, z: 1.5}, k);
		},
		render: (f) => {
			const words = Math.max(0, Math.floor((f - at('S04', 0.35)) / 8) + 1);
			return (
				<Svg>
					<Junction f={f} coins={{short: 0, long: Math.min(24, words * 2)}} train={{speech: writing(f, at('S04', 0.35)), expr: withLook('happy', 0.8, -0.3, {bounce: 3})}}>
						<g opacity={pop(f, at('S03', 0.15))}>
							<text x={600} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#FFF3C4" filter="url(#glow)">
								0.91
							</text>
						</g>
					</Junction>
				</Svg>
			);
		},
		overlay: (f) => (
			<>
				<Say x={640} y={140} k={pop(f, at('S04', 0.62)) } text="slow" size={96} color={K.white} />
				<Say x={1280} y={140} k={pop(f, at('S04', 0.82))} text="€" size={110} color={K.yellow} />
			</>
		),
	},
	// 4. crane up to the signal box; a letter stops here first and rises inside
	{
		at: H.crane,
		cam: span({x: 640, y: 800, z: 1.55}, {x: 600, y: 600, z: 1.3}),
		render: (f) => {
			const halt: Sched = {t0: lifted.t0 - 900 / 8, route: 'short'};
			const age = f - halt.t0;
			const s = Math.min(900, age * 8);
			const rise = easeInOut(progress(f, lifted.t0, lifted.t1));
			return (
				<Svg>
					<Junction f={f} carts={age >= 0 ? [{route: 'short', s, p: 0.97, letter: rise <= 0}] : []}>
						{rise > 0 && rise < 1 ? (
							<g>
								<line x1={lifted.x} y1={J.box.top + 180} x2={lifted.x} y2={lerp(836, J.box.top + 190, rise)} stroke="#C9CCE0" strokeWidth={3} />
								<g transform={`translate(${lifted.x} ${lerp(836, J.box.top + 200, rise)})`}>
									<rect x={-30} y={-20} width={60} height={40} rx={5} fill="#FBF3E4" />
									<path d="M -30 -18 L 0 4 L 30 -18" fill="none" stroke="#C9B8A0" strokeWidth={3} />
									<rect x={14} y={-15} width={11} height={13} fill={K.orange} />
								</g>
							</g>
						) : null}
					</Junction>
				</Svg>
			);
		},
	},
	// 5. inside the box: one sweep reads the letter; the beam touches a lever; outside, the points move
	{
		at: H.inside,
		cam: span({x: 960, y: 560, z: 1.02}, {x: 900, y: 580, z: 1.1}),
		render: (f) => {
			const read = progress(f, at('S06', 0.08), at('S06', 0.42));
			const beam = Math.sin(Math.PI * progress(f, at('S06', 0.45), at('S06', 0.85)));
			const thrown = leverThrow(f, at('S06', 0.62));
			const route: Route = thrown > 0.5 ? 'long' : 'short';
			const lt = leverTop(POINTS_LEVER, thrown);
			return (
				<Svg>
					<Interior f={f} read={read} beamTo={{x: lt.x, y: lt.y, k: beam}} thrown={[0, 0, thrown, 0, 0, 0, 0, 0]} boardRoute={route} outside={<Junction f={f} hideBox route={route} switchK={thrown > 0.5 ? progress(f, at('S06', 0.66), at('S06', 0.74)) : 1} />} />
				</Svg>
			);
		},
	},
	// 6. outside, high and wide: a sure letter takes the short line, an unsure one the long line
	{
		at: H.lines,
		cam: span({x: 1100, y: 700, z: 1.28}, {x: 1180, y: 700, z: 1.32}),
		render: (f) => {
			const intoTrain = arriveOf(unsure);
			return (
				<Svg>
					<Junction f={f} carts={cartsAt(f, flow6)} route={routeFor(f, flow6)} gaugeP={pAtPoints(f, flow6)} stampAt={stampsOf(flow6)} train={{speech: writing(f, intoTrain + 10, 9), expr: f > intoTrain ? withLook('determined', 1, 0) : withLook('curious', -0.8, -0.2)}} />
				</Svg>
			);
		},
		overlay: (f) => (
			<>
				<Say x={960} y={150} k={pop(f, at('S07', 0.6))} text="sure" size={96} color={K.yellow} />
				<Say x={1480} y={150} k={pop(f, at('S08', 0.6))} text="unsure" size={96} color={K.white} />
			</>
		),
	},
	// 7. concept: the price of one answer. A tiny coin against a huge one
	{
		at: H.coins,
		cam: span({x: 960, y: 560, z: 1.0}, {x: 960, y: 540, z: 1.06}),
		render: (f) => (
			<Svg>
				<Stage f={f} y={880} w={760}>
					<Coin x={700} y={700} s={0.4 * pop(f, at('S09', 0.2))} label="" />
					<Coin x={1180} y={560} s={3.2 * pop(f, at('S09', 0.35))} label="" />
					<text x={700} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={T.text} opacity={progress(f, at('S09', 0.2), at('S09', 0.3))}>Jev</text>
					<text x={1180} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={T.text} opacity={progress(f, at('S09', 0.35), at('S09', 0.45))}>chatbot</text>
				</Stage>
			</Svg>
		),
		overlay: (f) => (
			<>
				<Say x={960} y={90} k={pop(f, at('S09', 0.55))} text="444.6×" size={110} color={K.yellow} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: T.text, opacity: progress(f, at('S09', 0.6), at('S09', 0.7))}}>TypeSafe’s own tests</div>
			</>
		),
	},
	// 8. concept: one letter in five goes on to the train. How much cheaper? 3, 2, 1
	{
		at: H.guess,
		cam: span({x: 960, y: 540, z: 1.0}, {x: 960, y: 560, z: 1.05}),
		render: (f) => {
			const go = easeInOut(progress(f, at('S10', 0.12), at('S10', 0.32)));
			return (
				<Svg>
					<Stage f={f} y={880} w={900}>
						{Array.from({length: 5}, (_, i) => {
							const hot = i === 4;
							const x = 560 + i * 150 + (hot ? 300 * go : 0);
							const y = 620 - (hot ? 60 * Math.sin(Math.PI * go) : 0);
							return (
								<g key={i} transform={`translate(${x} ${y})`}>
									{hot ? <rect x={-60} y={-44} width={120} height={88} rx={14} fill={K.orange} opacity={0.4} filter="url(#glowBig)" /> : null}
									<rect x={-50} y={-34} width={100} height={68} rx={8} fill={hot ? '#FFE0C0' : '#FBF3E4'} />
									<path d="M -50 -30 L 0 6 L 50 -30" fill="none" stroke="#C9B8A0" strokeWidth={4} />
									<rect x={24} y={-26} width={16} height={18} fill={K.orange} />
								</g>
							);
						})}
						<g transform="translate(1380 700)">
							<SteamPress livery="claude" f={f} s={0.45} speech={[]} expr={withLook('curious', -1, -0.3)} dist={0} smokeT={f * 0.012} />
						</g>
						<text x={1010} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={T.text} opacity={progress(f, at('S10', 0.2), at('S10', 0.3))}>1 in 5</text>
					</Stage>
				</Svg>
			);
		},
		overlay: (f) => {
			const a = signal.pickStart;
			const inPause = f >= a && f < a + GUESS_PAUSE;
			const count = Math.floor(progress(f, a, a + GUESS_PAUSE) * 3);
			return (
				<>
					<Say x={960} y={90} k={pop(f, at('S10', 0.55))} text="?×" size={130} color={T.text} />
					{inPause ? (
						<>
							<div style={{position: 'absolute', left: 1600, top: 380}}>
								<svg width={170} height={170} viewBox="-85 -85 170 170">
									<circle r={70} fill="none" stroke={T.tile} strokeWidth={12} />
									<circle r={70} fill="none" stroke={T.glow} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${440 * (1 - progress(f, a, a + GUESS_PAUSE))} 460`} transform="rotate(-90)" />
									<text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={T.text}>
										{Math.max(1, 3 - count)}
									</text>
								</svg>
							</div>
							<Say x={1685} y={590} k={pop(f, a)} text="GUESS" size={48} color={T.glow} spacing={6} />
						</>
					) : null}
				</>
			);
		},
	},
	// 9. the reveal (hard cut): not 444. About five
	{
		at: H.reveal,
		xf: 0,
		cam: span({x: 960, y: 560, z: 1.0}, {x: 960, y: 560, z: 1.04}),
		render: (f) => (
			<Svg>
				<Junction f={f} boxLamp={0.8} />
				<rect x={-1400} y={-900} width={4800} height={2400} fill="#0B1030" opacity={0.45} />
			</Svg>
		),
		overlay: (f) => (
			<>
				<Say x={960} y={250} k={pop(f, at('S11', 0.05))} text="444×" size={120} color={K.white} strike={progress(f, at('S11', 0.3), at('S11', 0.45))} />
				<Say x={960} y={480} k={pop(f, at('S11', 0.72), 12)} text="≈ 5×" size={220} color={K.yellow} />
			</>
		),
	},
	// 10. a thousand letters through the box; counters at both ends
	{
		at: H.run,
		cam: span({x: 980, y: 700, z: 1.22}, {x: 1040, y: 700, z: 1.26}),
		render: (f) => {
			const s = arrived(f, 'short');
			const l = arrived(f, 'long');
			return (
				<Svg>
					<Junction f={f} carts={cartsAt(f, flow10, RUN_V, 8)} route={routeFor(f, flow10, RUN_V)} stampAt={flow10.filter((c) => c.route === 'short').map((c) => arriveOf(c, RUN_V))} coins={{short: s * 3, long: l * 4}} train={{speech: writing(f, signal.run.start + 90, 8), expr: withLook('determined', 1, 0)}}>
						<text x={J.booth.x0 + 75} y={J.booth.top - 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={K.yellow} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 8}}>
							{Math.round((s * SIGNAL.letters) / N)}
						</text>
						<text x={1640} y={J.railY - 190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={K.white} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 8}}>
							{Math.round((l * SIGNAL.letters) / N)}
						</text>
					</Junction>
				</Svg>
			);
		},
	},
	// 11. the two coin piles: a small heap against a tower
	{
		at: H.piles,
		cam: span({x: 1300, y: 780, z: 1.9}, {x: 1320, y: 760, z: 2.0}),
		render: (f) => (
			<Svg>
				<Junction f={f} coins={{short: 24 * 3, long: 6 * 4 + Math.round(10 * progress(f, at('S15', 0.3), at('S15', 0.6)))}} train={{speech: writing(f, signal.run.start + 90, 8)}}>
					<text x={J.shortEnd - 40} y={J.shortY - 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={K.white} opacity={progress(f, at('S15', 0.5), at('S15', 0.6))} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 7}}>
						1%
					</text>
					<text x={J.longStop - 40} y={J.railY + 60 - 34 * 9 - 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={K.yellow} opacity={progress(f, at('S15', 0.6), at('S15', 0.7))} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 8}}>
						99%
					</text>
				</Junction>
			</Svg>
		),
	},
	// 12. inside the box: the math builds on the track diagram board
	{
		at: H.math,
		cam: span({x: 1180, y: 300, z: 1.3}, {x: 1180, y: 310, z: 1.36}),
		render: (f) => {
			const e = (id: string, a: number, b: number) => easeOut(progress(f, at(id, a), at(id, b)), 3);
			return (
				<>
					<Svg>
						<Interior f={f} outside={<Junction f={f} hideBox />} letter={false} board={<rect x={432} y={42} width={1476} height={226} rx={10} fill={G.board} />} />
					</Svg>
					<div style={{position: 'absolute', left: 530, top: 56}}>
						<Equation
							size={50}
							terms={[
								{tex: 'c', k: e('S16', 0.05, 0.15)},
								{tex: '=', k: e('S16', 0.05, 0.15), color: K.mute},
								{tex: 'c_{\\text{Jev}}', k: e('S16', 0.2, 0.3), color: K.yellow, label: 'Jev', labelK: e('S16', 0.25, 0.35)},
								{tex: '+', k: e('S16', 0.4, 0.5), color: K.mute},
								{tex: 'r', k: e('S16', 0.45, 0.55), color: K.teal, label: 'share', labelK: e('S16', 0.5, 0.6)},
								{tex: '\\cdot', k: e('S16', 0.6, 0.7), color: K.mute},
								{tex: 'c_{\\text{train}}', k: e('S16', 0.7, 0.8), color: K.orangeHi, label: 'train', labelK: e('S16', 0.75, 0.85)},
							]}
						/>
					</div>
					<div style={{position: 'absolute', left: 1050, top: 50}}>
						<Equation
							size={50}
							terms={[
								{tex: '\\tfrac{c}{c_{\\text{train}}}', k: e('S17', 0.02, 0.12)},
								{tex: '=', k: e('S17', 0.02, 0.12), color: K.mute},
								{tex: '\\tfrac{1}{444.6}', k: e('S17', 0.2, 0.3) * (1 - 0.65 * e('S19', 0.1, 0.3)), color: K.yellow, label: 'Jev', labelK: e('S17', 0.3, 0.4)},
								{tex: '+', k: e('S17', 0.55, 0.62), color: K.mute},
								{tex: '0.2', k: e('S17', 0.72, 0.82), color: K.teal, label: 'share', labelK: e('S17', 0.78, 0.88), pop: Math.sin(Math.PI * e('S19', 0.5, 0.75))},
								{tex: '\\approx', k: e('S18', 0.1, 0.2), color: K.mute},
								{tex: '0.2', k: e('S18', 0.15, 0.25), color: K.orangeHi, pop: Math.sin(Math.PI * e('S18', 0.15, 0.3))},
							]}
						/>
					</div>
					<Say x={1690} y={185} k={pop(f, at('S18', 0.62), 12)} text="5×" size={84} color={K.yellow} />
				</>
			);
		},
	},
	// 13. concept: the share dial. One in five, one in ten, one in a hundred
	{
		at: cues.S20.start - 10,
		cam: span({x: 960, y: 540, z: 1.0}, {x: 960, y: 560, z: 1.05}),
		render: (f) => {
			const r1 = easeInOut(progress(f, at('S21', 0.1), at('S21', 0.3)));
			const r2 = easeInOut(progress(f, at('S21', 0.55), at('S21', 0.75)));
			// the dial runs on a log scale, so one in a hundred isn't lost against the end stop
			const share = r2 > 0 ? lerp(0.1, 0.01, r2) : lerp(0.2, 0.1, r1);
			const pos = (Math.log10(share) + 2) / 2; // 0.01 -> 0, 1 -> 1
			const ang = Math.PI * (1 - pos);
			const timeK = progress(f, at('S20', 0.1), at('S20', 0.3));
			const bar = (y: number, rel: number, k: number, icon: 'coin' | 'clock') => (
				<g opacity={k}>
					{icon === 'coin' ? <Coin x={560} y={y + 20} s={0.5} label="" /> : (
						<g transform={`translate(560 ${y + 20})`}>
							<circle r={24} fill={T.text} />
							<line x1={0} y1={0} x2={0} y2={-16} stroke={T.void} strokeWidth={4} strokeLinecap="round" />
							<line x1={0} y1={0} x2={11} y2={0} stroke={T.void} strokeWidth={4} strokeLinecap="round" />
						</g>
					)}
					<rect x={620} y={y} width={800} height={40} rx={20} fill={T.tile} />
					<rect x={620} y={y} width={Math.max(24, 800 * rel)} height={40} rx={20} fill={icon === 'coin' ? K.orange : T.glow} />
				</g>
			);
			return (
				<Svg>
					<Stage f={f} y={930} w={900}>
						<g transform="translate(960 470)">
							<path d="M -300 0 A 300 300 0 0 1 300 0" fill="none" stroke={T.tileTop} strokeWidth={30} strokeLinecap="round" />
							<path d="M -300 0 A 300 300 0 0 1 300 0" fill="none" stroke={T.glow} strokeWidth={5} opacity={0.7} />
							{[0.01, 0.1, 1].map((v) => {
								const a = Math.PI * (1 - (Math.log10(v) + 2) / 2);
								return <line key={v} x1={Math.cos(a) * 270} y1={-Math.sin(a) * 270} x2={Math.cos(a) * 240} y2={-Math.sin(a) * 240} stroke={T.text} strokeWidth={5} />;
							})}
							<line x1={0} y1={0} x2={Math.cos(ang) * 250} y2={-Math.sin(ang) * 250} stroke={K.orange} strokeWidth={10} strokeLinecap="round" />
							<circle r={16} fill={K.orange} />
							<text x={-300} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={T.text}>1 in 100</text>
							<text x={300} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={T.text}>all</text>
							<text x={0} y={-320} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={T.text}>1 in 10</text>
						</g>
						{bar(600, systemCost(share), 1, 'coin')}
						{bar(680, 1 / SIGNAL.faster + share, timeK, 'clock')}
					</Stage>
				</Svg>
			);
		},
		overlay: (f) => {
			const r1 = f >= at('S21', 0.3);
			const r2 = f >= at('S21', 0.75);
			const share = r2 ? 0.01 : r1 ? 0.1 : 0.2;
			const x = Math.round(timesCheaper(share));
			return <Say key={share} x={1560} y={560} k={pop(f, r2 ? at('S21', 0.75) : r1 ? at('S21', 0.3) : cues.S20.start - 4)} text={`≈ ${x >= 50 ? Math.round(x / 10) * 10 : x}×`} size={96} color={K.yellow} />;
		},
	},
	// 14. back at the junction: only letters above the line stay off the train
	{
		at: H.honest,
		cam: span({x: 760, y: 700, z: 1.45}, {x: 800, y: 690, z: 1.5}),
		render: (f) => (
			<Svg>
				<Junction f={f} carts={cartsAt(f, flow14)} route={routeFor(f, flow14)} gaugeP={pAtPoints(f, flow14)} stampAt={stampsOf(flow14)} />
			</Svg>
		),
		overlay: (f) => <Say x={1320} y={150} k={pop(f, at('S22', 0.72))} text="honest?" size={100} color={K.white} />,
	},
	// 15. hard cut: an over-sure letter takes the short line; the template reply doesn't fit
	{
		at: H.wrong,
		xf: 0,
		cam: span({x: 1180, y: 700, z: 1.7}, {x: 1200, y: 690, z: 1.78}),
		render: (f) => {
			const hit = arriveOf(overSure);
			const red = f >= hit;
			return (
				<Svg>
					<Junction f={f} carts={cartsAt(f, [{...overSure, red}], V, 80)} route="short" gaugeP={pAtPoints(f, [overSure])} stampAt={[hit]} stampRed train={{expr: withLook('sad', -0.9, -0.2)}}>
						{red ? (
							<path d={`M ${J.shortEnd - 60} ${J.shortY - 110} L ${J.shortEnd + 10} ${J.shortY - 40} M ${J.shortEnd + 10} ${J.shortY - 110} L ${J.shortEnd - 60} ${J.shortY - 40}`} stroke={RED} strokeWidth={12} strokeLinecap="round" opacity={progress(f, hit + 4, hit + 10)} />
						) : null}
					</Junction>
				</Svg>
			);
		},
		overlay: (f) => {
			const k = easeOut(progress(f, at('S23', 0.15), at('S23', 0.3)), 3);
			return k > 0 ? (
				<div style={{position: 'absolute', left: 90, top: 110, width: 560, transform: `rotate(-2deg) translateY(${(1 - k) * 30}px)`, opacity: k, background: '#FBF8FF', padding: '26px 32px', boxShadow: '0 24px 50px rgba(5,8,32,0.55)', fontFamily: FONT, color: K.navy, borderRadius: 6, border: f >= arriveOf(overSure) ? `6px solid ${RED}` : '6px solid transparent'}}>
					<div style={{fontWeight: 800, fontSize: 20, color: '#7A7AA8'}}>to: support</div>
					<div style={{fontWeight: 900, fontSize: 36, lineHeight: 1.25, marginTop: 10}}>My card was charged twice, and now I can’t find it.</div>
				</div>
			) : null;
		},
	},
	// 16. dawn: partners. The box sets the points, the train pulls out writing
	{
		at: H.partners,
		cam: span({x: 1000, y: 640, z: 1.12}, {x: 1160, y: 620, z: 1.08}),
		render: (f) => {
			const dawn = progress(f, H.partners, H.catch);
			const go = easeIn(progress(f, at('S24', 0.4), H.catch + 40), 1.5);
			return (
				<Svg>
					<Junction f={f} dawn={0.8 * dawn} carts={cartsAt(f, flow16)} route={routeFor(f, flow16)} stampAt={stampsOf(flow16)} train={{x: J.trainX + 700 * go, dist: 700 * go, speech: writing(f, at('S24', 0.4), 8), expr: withLook('happy', 1, -0.2)}} />
				</Svg>
			);
		},
		overlay: (f) => (
			<>
				<Say x={520} y={180} k={pop(f, at('S25', 0.12))} text="System One" size={84} color={K.yellow} />
				<Say x={1420} y={180} k={pop(f, at('S25', 0.62))} text="System Two" size={84} color={K.orangeHi} />
			</>
		),
	},
	// 17. the catch: letters from a new town, and a number that may not hold there
	{
		at: H.catch,
		cam: span({x: 700, y: 620, z: 1.25}, {x: 300, y: 600, z: 1.02}),
		render: (f) => {
			const wobble = progress(f, at('S27', 0.3), at('S27', 0.7));
			const p = 0.9 + 0.05 * Math.sin(f * 0.35) * wobble;
			return (
				<Svg>
					<Junction f={f} dawn={0.8} town={progress(f, H.catch, at('S27', 0.3))} townX={-1000} carts={cartsAt(f, flow17)} route={routeFor(f, flow17)} gaugeP={p} stampAt={stampsOf(flow17)} train={{x: J.trainX + 900}}>
						<g transform={`translate(160 ${J.railY - 150})`} opacity={progress(f, at('S27', 0.55), at('S27', 0.65))}>
							<rect x={-90} y={-60} width={180} height={110} rx={10} fill="#2A2F2A" />
							<rect x={-82} y={-52} width={164} height={94} rx={6} fill="#34453A" />
							<text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={G.cream}>7 / 10</text>
							<rect x={-6} y={50} width={12} height={90} fill="#2A2F2A" />
						</g>
					</Junction>
				</Svg>
			);
		},
		overlay: (f) => <Say x={960} y={150} k={pop(f, at('S27', 0.78))} text="check" size={110} color={K.white} />,
	},
	// ---------- the ending: one callback per chapter ----------
	// 18. chapter 1: the same question, twice. Two answers
	{at: H.cb1, xf: 24, cam: span({x: 960, y: 540, z: 1.0}, {x: 960, y: 540, z: 1.05}), render: (f) => <Twice film={ch1} f={ch1.cues.H02.start - 8 + (f - H.cb1)} out={0} />},
	// 18b. one word at a time, a bet on every word
	{at: H.cb1b, cam: span({x: 960, y: 520, z: 1.02}, {x: 960, y: 520, z: 1.08}), render: (f) => <ChatWindows film={ch1} f={Math.min(ch1.S.hook.end - 14, ch1.streamStart - 8 + (f - H.cb1b))} />},
	// 19. chapter 2: one pass, every answer at once
	{at: H.cb2, cam: span({x: 960, y: 540, z: 1.0}, {x: 980, y: 540, z: 1.05}), render: (f) => <PassScene f={ch2.cues.C06.start + (f - H.cb2)} />},
	// 19b. chapter 3: a line, and who reads what
	{at: H.cb2b, cam: span({x: 960, y: 540, z: 1.0}, {x: 940, y: 560, z: 1.05}), render: (f) => <AnswerScene f={Math.min(ch3.cues.M25.start - 1, ch3.at('M24', 0) - 20 + (f - H.cb2b))} />},
	// 20. the promise: 91 of 100
	{
		at: H.grid,
		cam: span({x: 960, y: 540, z: 1.0}, {x: 960, y: 550, z: 1.05}),
		render: (f) => (
			<Svg>
				<Stage f={f} y={930} w={620}>
					<Grid10 x={960 - 220} y={330} cell={44} k={progress(f, H.grid + 4, at('S32', 0.5))} lit={91} />
				</Stage>
			</Svg>
		),
		overlay: (f) => <Say x={960} y={120} k={pop(f, at('S32', 0.55))} text="91 / 100" size={96} color={T.text} />,
	},
	// 21. the whole world at sunrise, in one slow pull back
	{
		at: H.world,
		xf: 24,
		cam: (f, k) => camAt({x: 1100, y: 640, z: 1.25}, {x: -560, y: 470, z: 0.6}, easeInOut(k)),
		render: (f) => <Panorama f={f} trainsGo={progress(f, at('S33', 0.3), H.last + 60)} />,
	},
	// 22. the lighthouse, glowing steady over it all
	{
		at: H.last,
		xf: 24,
		cam: span({x: -2040, y: 470, z: 1.6}, {x: -2040, y: 480, z: 1.7}),
		render: (f) => <Panorama f={f} trainsGo={1} />,
		overlay: (f) => {
			const t = easeOut(progress(f, at('S34', 0.6), cues.S34.end + 20), 2);
			return (
				<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
					<div style={{fontWeight: 900, fontSize: 120, color: K.white, lineHeight: 1.05, textShadow: '0 6px 30px rgba(40,20,60,0.6)'}}>The Model That Doesn’t Talk</div>
				</div>
			);
		},
	},
	// 23. credits
	{
		at: H.credits,
		xf: 24,
		cam: span({x: -2040, y: 480, z: 1.7}, {x: -2040, y: 470, z: 1.75}),
		render: (f) => (
<Panorama f={f} trainsGo={1} />
		),
		overlay: () => (
			<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: FONT}}>
				<div style={{fontWeight: 900, fontSize: 120, color: K.white, lineHeight: 1.05, textShadow: '0 6px 30px rgba(40,20,60,0.6)'}}>The Model That Doesn’t Talk</div>
			</div>
		),
	},
];

export const SignalBox: React.FC<{silent?: boolean}> = ({silent}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: K.night, overflow: 'hidden'}}>
			<Reel f={f} shots={SHOTS} end={signal.total} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<Vignette />
			</svg>
			<Grain id="signalGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{silent ? null : <Audio src={track('signal-track')} />}
		</AbsoluteFill>
	);
};
void LEVER;
