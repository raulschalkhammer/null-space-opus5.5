import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import {FONT, FlatDefs, FlatLighthouse, Hills, K, Motes, Stars, Vignette} from '../../flat/kit';
import {Equation, type Term} from '../../flat/math';
import {Shots, Split, Zoom, type Shot} from '../../flat/shots';
import {LAID, TR, TrackWorld, laidAt} from '../../flat/bets';
import {Grain} from '../../styleframes/Shared';
import fixture from '../../../fixtures/track-layer.json';
import vo from '../../../fixtures/track-layer-flat-vo.json';
import type {Fixture, VoLine} from '../paper-track/timeline';
import {type TCam, fmt, proj, trainAt} from '../paper-track/Table';
import {type ForkGeo, type Span, ROUTE, buildRoute, clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {FlatEmailCard, FlatStation, FlatValley} from './Side';
import {FlatTableWorld} from './Table';
import {Bubble, ChatWindows, Hook, Planet, Twice} from './Intro';
import {Clouds, Moon, Mountains, WorldDefs} from '../../flat/world';
import {RailDefs, SideTrack, Terrain, Mist} from '../../flat/rail';
import {NewsScene} from './NewsScene';
import {GuessScene, RunsScene, ShannonScene} from './Curiosity';
import {buildFlatFilm} from './timeline';
import {SteamPress} from '../../characters/steam';
import {WHEEL_DIST, withLook} from './trainMood';
import {RED, Say, Stage, T, pop, zoomTo} from '../million-letters/parts';
import {CITY_BANK, CityShot} from '../million-letters/Zoom';
import {GUESS_PAUSE} from '../paper-track/timeline';

export const film = buildFlatFilm(fixture as Fixture, (vo as {lines: VoLine[]}).lines);
const {S, cues} = film;
const at = (id: string, u: number) => Math.round(cues[id].start + (cues[id].end - cues[id].start) * u);

// Chapter 1 as shots (docs/chapter1-plan.md). Worlds and palettes:
//   screen (the chat windows), night (city, planet, harbor, lighthouse), dusk rail (station, forks, corridor,
//   marble junction, swamp), study (Shannon, 1951), teal concept stages, and red for mistakes only.

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		{children}
	</svg>
);

// ======================= the ride-along table (forks, thin, chain) =======================
const mixCam = (a: TCam, b: TCam, k: number): TCam => ({camX: lerp(a.camX, b.camX, k), f: lerp(a.f, b.f, k), H: lerp(a.H, b.H, k), horizon: lerp(a.horizon, b.horizon, k)});
// camera angles on the same ground: high looks down on the ribbons, low sits by the rails
type View = 'eye' | 'high' | 'low';
const viewCam = (c: TCam, v: View): TCam => (v === 'high' ? {...c, H: c.H * 2.1, horizon: c.horizon - 330} : v === 'low' ? {...c, H: c.H * 0.5, horizon: c.horizon + 170} : c);

const Frame: React.FC<{f: number; horizon: number; shift?: number; children: React.ReactNode}> = ({f, horizon, shift = 0, children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<g transform={`translate(0 ${horizon - 560})`}>
			<Stars f={f} maxY={520} />
		</g>
		<Moon x={420} y={horizon - 250} r={34} />
		<circle cx={1300} cy={horizon - 20} r={300} fill="url(#gSun)" opacity={0.85} />
		<Clouds f={f} y={horizon - 300} count={4} seed={8} opacity={0.9} />
		<Mountains y={horizon - 24} shift={shift * 0.08} seed={4} layers={2} />
		<g transform={`translate(${1700 - (shift % 1400) * 0.05} ${horizon + 50}) scale(0.36)`}>
			<FlatLighthouse on={0.5} />
		</g>
		<rect x={-60} y={horizon + 20} width={2040} height={70} fill="url(#gHaze)" opacity={0.6} />
		{children}
		<Motes f={f} />
		<Vignette />
	</svg>
);

const mainState = (f: number, view: View) => {
	const main = film.route.slice(0, 6);
	const tr = trainAt(film, main, f, S.fork.start);
	const follow: TCam = {camX: tr.X + 650, f: 1100, H: 1000, horizon: lerp(1150, 130, easeInOut(progress(f, S.fork.start, S.fork.start + 34)))};
	const back = easeInOut(progress(f, S.chain.start, S.chain.start + 44));
	const c = viewCam(mixCam(follow, {camX: 3650, f: 640, H: 1650, horizon: 344}, back), view);
	return {main, tr, c, back, at: proj(c, tr.X, tr.Z)};
};
const MainTable: React.FC<{f: number; view?: View; panel?: boolean}> = ({f, view = 'eye', panel = true}) => {
	const {main, tr, c, back} = mainState(f, view);
	const revealAt = (k: number) => (k === 0 ? S.fork.start + 44 : film.forkTimes[k - 1].arrive - 16);
	const glow = f >= S.chain.start ? Math.floor(progress(f, S.chain.start + 10, S.chain.start + 58) * 6) - 1 : -1;
	return (
		<>
			<Frame f={f} horizon={c.horizon} shift={c.camX}>
				<FlatTableWorld film={film} f={f} c={c} route={main} trunkFrom={-4000} revealAt={revealAt} train={tr} showGauge={f >= S.thin.start && back < 0.5} glowCards={glow} />
			</Frame>
			{panel ? <ChainPanel f={f} /> : null}
		</>
	);
};

const magState = (f: number, k: number, span: Span, pond?: boolean, view: View = 'eye') => {
	const geo: ForkGeo = {...buildRoute([film.fx.steps[k]])[0], k};
	const ft = film.forkTimes.find((x) => x.k === k)!;
	const {WAIT, BRANCH, Zc} = ROUTE;
	let X = lerp(geo.x - WAIT - 500, geo.x - WAIT, easeInOut(progress(f, span.start, span.start + 30)));
	if (f >= ft.go) X = lerp(geo.x - WAIT, geo.x + BRANCH + (pond ? 900 : 500), easeIn(progress(f, ft.go, ft.arrive), 1.6));
	const u = Math.min(1, Math.max(0, (X - geo.x) / BRANCH));
	const Zt = X > geo.x ? lerp(geo.chosen.z0 + geo.chosen.w / 2, Zc, u * u * (3 - 2 * u)) : Zc;
	const c = viewCam({camX: lerp(geo.x - 100, X + 500, progress(f, ft.go, ft.arrive)), f: 1250, H: 1000, horizon: 110}, view);
	return {geo, ft, X, Z: Zt, c, at: proj(c, X, Zt), mouth: proj(c, geo.x, Zc)};
};
const Magnified: React.FC<{f: number; k: number; span: Span; context: string; pond?: boolean; view?: View; tag?: boolean}> = ({f, k, span, context, pond, view = 'eye', tag = true}) => {
	const {geo, ft, X, Z, c} = magState(f, k, span, pond, view);
	const real = film.route[k];
	const tagK = easeInOut(progress(f, span.start + 6, span.start + 20));
	return (
		<>
			<Frame f={f} horizon={c.horizon} shift={c.camX}>
				<FlatTableWorld film={film} f={f} c={c} route={[geo]} trunkFrom={-3000} revealAt={() => span.start + 14} train={{X, Z, cum: f >= ft.land ? real.cumAfter : real.cumBefore}} showGauge pond={pond} contextCard={context} />
			</Frame>
			{tag ? (
				<div style={{position: 'absolute', right: 90, top: 110, opacity: tagK, transform: `translateX(${(1 - tagK) * 40}px)`, display: 'flex', alignItems: 'center', gap: 22, fontFamily: FONT}}>
					<svg width={110} height={110} viewBox="0 0 110 110">
						<circle cx={46} cy={46} r={36} fill="rgba(92,200,255,0.15)" stroke={K.white} strokeWidth={9} />
						<path d="M 30 34 A 20 20 0 0 1 46 24" fill="none" stroke={K.white} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
						<rect x={70} y={64} width={16} height={40} rx={8} fill={K.teal} transform="rotate(-45 78 84)" />
					</svg>
					<div style={{textShadow: '0 4px 16px rgba(5,8,32,0.7)'}}>
						<div style={{fontWeight: 900, fontSize: 84, color: K.white, lineHeight: 0.95}}>{Math.round(1 / real.cumBefore).toLocaleString('en-US')}×</div>
						<div style={{fontWeight: 800, fontSize: 24, color: K.mute, letterSpacing: 4}}>ZOOM</div>
					</div>
				</div>
			) : null}
		</>
	);
};

const ChainPanel: React.FC<{f: number}> = ({f}) => {
	const {route} = film;
	const a = S.chain.start;
	const k = easeOut(progress(f, a + 4, a + 22), 3) * (1 - easeIn(progress(f, S.chain.end - 6, S.chain.end + 8)));
	if (k <= 0) return null;
	const n = 6;
	const fk = (i: number) => easeOut(progress(f, a + 10 + i * 8, a + 18 + i * 8), 3);
	const res = easeOut(progress(f, a + 10 + n * 8, a + 22 + n * 8), 3);
	const l6 = cues.L06;
	const e1 = easeOut(progress(f, l6.start + 6, l6.start + 20), 3);
	const e2 = easeOut(progress(f, l6.start + 16, l6.start + 30), 3);
	const e3 = easeOut(progress(f, l6.start + 26, l6.start + 40), 3);
	const lab = easeOut(progress(f, l6.start + 44, l6.start + 60), 2);
	const row1: Term[] = [];
	route.slice(0, n).forEach((g, i) => {
		if (i) row1.push({tex: '\\times', k: fk(i), color: K.mute});
		row1.push({tex: fmt(g.chosen.p), k: fk(i), pop: Math.sin(Math.PI * fk(i))});
	});
	row1.push({tex: '=', k: res, color: K.mute}, {tex: fmt(route[n - 1].cumAfter), k: res, color: K.orangeHi, pop: Math.sin(Math.PI * res)});
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 70, opacity: k, textAlign: 'center'}}>
			<div style={{position: 'absolute', left: '15%', right: '15%', top: -60, height: 460, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(8,10,40,0.6) 0%, rgba(8,10,40,0) 70%)'}} />
			<div style={{position: 'relative'}}>
				<Equation size={58} terms={row1} />
			</div>
			<div style={{position: 'relative', marginTop: 34, opacity: e1}}>
				<Equation
					size={78}
					terms={[
						{tex: 'P(\\text{sentence})', k: e1, color: K.orangeHi},
						{tex: '=', k: e1, color: K.mute},
						{tex: '\\prod_{t}', k: e2, color: K.teal, label: 'multiply', labelK: lab},
						{tex: 'P(w_t \\mid w_{<t})', k: e3, label: 'next word', labelK: lab},
					]}
				/>
			</div>
		</div>
	);
};

// ======================= the dusk rail, side on: the train lays its answer word by word =======================
const WORDS = film.route.map((r) => r.chosen.t.trim() || '␣');
const LayWorld: React.FC<{f: number; n: number; t0?: number; every?: number; fog?: number; expr?: ReturnType<typeof withLook>}> = ({f, n, t0 = 0, every = 1, fog = 0, expr}) => {
	const L = 150;
	const x0 = 120;
	const front = x0 + n * L;
	return (
		<g>
			<WorldDefs />
			<RailDefs />
			<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
			<Stars f={f} maxY={480} />
			<Moon x={1500} y={150} r={36} />
			<circle cx={1100} cy={640} r={330} fill="url(#gSun)" opacity={0.7} />
			<Clouds f={f} y={160} count={4} seed={14} opacity={0.9} />
			<Mountains y={580} seed={7} layers={2} />
			<Hills y={620} shift={f * 0.3} />
			<Terrain line={[[-600, 772], [2700, 772]]} bottom={1300} f={f} seed={5} />
			<SideTrack pieces={Array.from({length: n}, (_, i) => ({x: x0 + i * L, y: 741, angle: 0, len: L + 1, word: WORDS[i % WORDS.length]}))} f={f} />
			{/* the next piece settling into place */}
			{n > 0 && t0 ? <rect x={front - L} y={735} width={L} height={12} rx={4} fill={K.orangeHi} opacity={0.6 * (1 - progress(f, t0 + (n - 1) * every, t0 + (n - 1) * every + 8))} /> : null}
			<g transform={`translate(${front + 60} 741)`}>
				<SteamPress livery="claude" f={f} s={0.72} expr={expr ?? withLook('determined', 1, 0)} speech={[]} dist={WHEEL_DIST(front, 0.72)} smokeT={f * 0.012} />
			</g>
			{fog > 0 ? (
				<>
					<defs>
						<linearGradient id="gFog" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stopColor="#DCD8F6" stopOpacity={0} />
							<stop offset="0.45" stopColor="#DCD8F6" stopOpacity={0.7} />
							<stop offset="1" stopColor="#DCD8F6" stopOpacity={0.95} />
						</linearGradient>
					</defs>
					<rect x={front + 120} y={-60} width={1400} height={1300} fill="url(#gFog)" opacity={fog} />
					<rect x={front + 1500} y={-60} width={1400} height={1300} fill="#DCD8F6" opacity={0.95 * fog} />
					<Mist x={front + 100} y={720} w={900} f={f} />
					<Mist x={front + 200} y={640} w={900} f={f + 40} />
				</>
			) : null}
			<Motes f={f} />
			<Vignette />
		</g>
	);
};

// ======================= the teal concept stage =======================
const Scroll: React.FC<{x: number; y: number; crumble: number}> = ({x, y, crumble}) => (
	<g transform={`translate(${x} ${y})`}>
		{Array.from({length: 12}, (_, i) => {
			const r = (i * 37) % 11;
			const dy = crumble * (200 + r * 30);
			return (
				<g key={i} transform={`translate(${((i % 3) - 1) * crumble * 60} ${dy}) rotate(${crumble * (r - 5) * 8})`} opacity={1 - crumble * 0.9}>
					<rect x={-250} y={-240 + i * 40} width={500} height={40} fill="#FBF8FF" />
					<rect x={-210} y={-226 + i * 40} width={i % 4 === 3 ? 200 : 400 - r * 10} height={12} rx={6} fill="#B9B4E6" />
				</g>
			);
		})}
	</g>
);
const Countdown: React.FC<{f: number; a: number; b: number; x: number; y: number}> = ({f, a, b, x, y}) => {
	if (f < a || f >= b) return null;
	const count = Math.floor(progress(f, a, b) * 3);
	return (
		<>
			<div style={{position: 'absolute', left: x, top: y}}>
				<svg width={170} height={170} viewBox="-85 -85 170 170">
					<circle r={70} fill="none" stroke={T.tile} strokeWidth={12} />
					<circle r={70} fill="none" stroke={T.glow} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${440 * (1 - progress(f, a, b))} 460`} transform="rotate(-90)" />
					<text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={T.text}>
						{Math.max(1, 3 - count)}
					</text>
				</svg>
			</div>
			<Say x={x + 85} y={y + 210} k={pop(f, a)} text="GUESS" size={48} color={T.glow} spacing={6} />
		</>
	);
};
// A fork drawn flat on the tile: each branch is as wide as its chance
const TileFork: React.FC<{f: number; branches: {p: number; label: string; hot?: boolean}[]; k: number; y?: number}> = ({f, branches, k, y = 560}) => {
	const W = 300;
	const rest = 1 - branches.reduce((a, b) => a + b.p, 0);
	const all = rest > 0.01 ? [...branches, {p: rest, label: '', hot: false}] : branches;
	let acc = 0;
	const x1 = lerp(820, 1300, k);
	return (
		<g opacity={k}>
			<rect x={560} y={y - W / 2} width={262} height={W} fill={T.glow} opacity={0.35} />
			{all.map((b, i) => {
				const w = W * b.p;
				const y0 = y - W / 2 + acc;
				acc += w;
				const yEnd = y0 + w / 2 + (i - (all.length - 1) / 2) * 170;
				const wav = 4 * Math.sin(f * 0.1 + i);
				const faint = !b.label;
				return (
					<g key={i}>
						<path d={`M 820 ${y0} C 1000 ${y0} 1080 ${yEnd - w / 2 + wav} ${x1} ${yEnd - w / 2 + wav} L ${x1} ${yEnd + w / 2 + wav} C 1080 ${yEnd + w / 2 + wav} 1000 ${y0 + w} 820 ${y0 + w} Z`} fill={b.hot ? K.orange : T.glow} opacity={faint ? 0.2 : b.hot ? 0.95 : 0.6} />
						{b.label ? (
							<text x={x1 + 30} y={yEnd + 18} fontFamily={FONT} fontWeight={900} fontSize={56} fill={b.hot ? K.orangeHi : T.text}>
								{b.label}
							</text>
						) : null}
					</g>
				);
			})}
		</g>
	);
};

// ======================= scenes =======================
const HookScene: React.FC<{f: number}> = ({f}) => {
	const h2 = cues.H02;
	const bubbles = (x: number) => (
		<Svg>
			<Stage f={x} y={860} w={560}>
				<g transform="translate(610 500) scale(7)">
					<Bubble x={0} y={0} s={1} color={K.white} dots={false} />
				</g>
				<g transform="translate(1310 500) scale(7)">
					<Bubble x={0} y={0} s={1} color="#FFD9B0" dots={false} />
				</g>
				<g transform={`translate(960 520) scale(${pop(x, h2.start + (h2.end - h2.start) * 0.66, 12)})`}>
					<circle r={78} fill={K.orange} opacity={0.3} filter="url(#glowBig)" />
					<circle r={62} fill={K.orange} />
					<text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={K.ink}>?</text>
				</g>
			</Stage>
		</Svg>
	);
	const shots: Shot[] = [
		// 1. one chat window: the question, and a reply streaming in
		{at: 0, move: 'in', render: (x) => <Zoom cx={530} cy={420} z={1.55}><Twice film={film} f={x} out={0} /></Zoom>},
		// 2. a second window: the same question, a different reply
		{at: cues.H01.end + 2, move: 'in', render: (x) => <Zoom cx={1330} cy={400} z={2.6}><Twice film={film} f={x} out={0} /></Zoom>},
		// 3. both, side by side. Same question
		{at: h2.start, move: 'out', render: (x) => <Twice film={film} f={x} out={0} />},
		// 4. extreme close-up on the first words: "Yes," against "I'd hold off"
		{
			at: at('H02', 0.38),
			move: 'none',
			render: (x) => (
				<>
					<Split
						slide={easeOut(progress(x, at('H02', 0.38), at('H02', 0.38) + 10), 3)}
						panes={[
							{cx: 290, cy: 390, z: 3.3, render: () => <Twice film={film} f={x} out={0} />},
							{cx: 1150, cy: 390, z: 3.3, render: () => <Twice film={film} f={x} out={0} />},
						]}
					/>
					<Say x={960} y={880} k={pop(x, at('H02', 0.44))} text="different" size={84} color={K.orangeHi} />
				</>
			),
		},
		// 5. concept: two answers, one question mark
		{at: at('H02', 0.62), move: 'in', render: bubbles},
		// 6. out of the window, into a city at night where every window is lit
		{
			at: cues.H03.start,
			move: 'none',
			render: (x) => (
				<Svg>
					<g transform={zoomTo(easeInOut(progress(x, cues.H03.start, at('H03', 0.28))), 5, 1, [CITY_BANK.x, CITY_BANK.y - 60], [960, 540])}>
						<CityShot f={x} train={progress(x, cues.H03.start, at('H03', 0.3))} />
					</g>
				</Svg>
			),
		},
		// 7. the planet: questions rising from everywhere
		{at: at('H03', 0.25), move: 'in', render: (x) => <Hook film={film} f={x} />},
		// 8. close-up on the rim: "Is this rash normal?"
		{at: at('H03', 0.45), move: 'left', render: (x) => <Zoom cx={960} cy={300} z={1.8}><Hook film={film} f={x} /></Zoom>},
		// 9. close-up: "Is this email a scam?"
		{at: film.qTimes[2] - 2, move: 'right', render: (x) => <Zoom cx={1320} cy={330} z={1.6}><Hook film={film} f={x} /></Zoom>},
		// 10. split: ChatGPT and Claude, both streaming
		{at: cues.H04.start + 6, move: 'in', render: (x) => <ChatWindows film={film} f={x} />},
		// 11. extreme close-up: one word lands, a die rolls over it
		{at: film.streamStart + 26, move: 'right', render: (x) => <Zoom cx={520} cy={440} z={2.3}><ChatWindows film={film} f={x} /></Zoom>},
		// 12. each word, a small bet: a die thrown over every word the train lays
		{
			at: at('H04', 0.62),
			move: 'out',
			render: (x) => {
				const t = at('H04', 0.62);
				const n = laidAt(x, t - 20, 10);
				return (
					<>
						<Zoom cx={Math.min(1290, TR.x0 + n * TR.gap - 100)} cy={TR.y - 180} z={1.4}>
							<Svg>
								<TrackWorld f={x} n={n} t0={t - 20} every={10} />
							</Svg>
						</Zoom>
						<Say x={960} y={120} k={pop(x, at('H04', 0.8))} text="bet" size={110} color={K.yellow} />
					</>
				);
			},
		},
	];
	return <Shots f={f} end={S.hook.end} shots={shots} />;
};

const NewsShots: React.FC<{f: number}> = ({f}) => {
	const n2 = cues.N02;
	const n3 = cues.N03;
	const n4 = cues.N04;
	const news = (x: number) => <NewsScene film={film} f={x} />;
	const flyers = ['Great', 'question!', 'This', 'email', 'looks'];
	const shots: Shot[] = [
		// 13. the harbor at night: a calendar leaf falls. 15
		{at: S.news.start, move: 'in', render: news},
		// 14. close-up: the maker's nameplate
		{at: at('N01', 0.46), move: 'in', render: (x) => <Zoom cx={1600} cy={560} z={3.4}>{news(x)}</Zoom>},
		// 15. chat bubbles drift past the dark lighthouse; it answers none of them
		{
			at: at('N01', 0.76),
			move: 'left',
			render: (x) => (
				<>
					<Zoom cx={1420} cy={500} z={1.6}>
						{news(x)}
					</Zoom>
					<Svg>
						{flyers.map((w, i) => {
							const t = ((x - at('N01', 0.76)) * 0.012 + i * 0.22) % 1.2;
							const bx = lerp(-200, 2100, t);
							const by = 380 + i * 90 + 20 * Math.sin(x * 0.05 + i);
							return (
								<g key={i} transform={`translate(${bx} ${by})`}>
									<rect x={-w.length * 11 - 20} y={-30} width={w.length * 22 + 40} height={56} rx={28} fill={K.indigoHi} />
									<text textAnchor="middle" y={10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.white}>
										{w}
									</text>
								</g>
							);
						})}
					</Svg>
				</>
			),
		},
		// 16. the lamp ignites; J, E, V rise out of the sea
		{at: n2.start, move: 'out', render: news},
		// 17. close-up: the beam projects 0.91 onto the clouds
		{at: n2.start + 62, move: 'in', render: (x) => <Zoom cx={1460} cy={330} z={1.7}>{news(x)}</Zoom>},
		// 18. split: word by word against one flash. 193.6× faster
		{
			at: n3.start,
			move: 'none',
			render: (x) => {
				const n = laidAt(x, n3.start - 20, 7);
				return (
					<>
						<Split
							slide={easeOut(progress(x, n3.start, n3.start + 10), 3)}
							panes={[
								{cx: TR.x0 + n * TR.gap + 100, cy: TR.y - 200, z: 1.25, render: () => <Svg><TrackWorld f={x} n={n} t0={n3.start - 20} every={7} dice={false} /></Svg>},
								{cx: 1380, cy: 640, z: 1.0, render: () => news(x)},
							]}
						/>
					</>
				);
			},
		},
		// 19. the coin stacks: a tower against a single coin. 444.6× cheaper
		{at: n3.start + 70, move: 'in', render: (x) => <Zoom cx={680} cy={740} z={1.8}>{news(x)}</Zoom>},
		// 20. close-up: the tag on the lighthouse rail. TypeSafe's own tests
		{at: n3.start + 128, move: 'right', render: (x) => <Zoom cx={1720} cy={480} z={3.4}>{news(x)}</Zoom>},
		// 21. coins rain into the harbor. $40,000,000
		{at: n3.start + 176, move: 'out', render: news},
		// 21b. close-up: coins splash into the sea
		{at: n3.end - 50, move: 'down', render: (x) => <Zoom cx={900} cy={330} z={1.5}>{news(x)}</Zoom>},
		// 22. split: the lighthouse against the train. ?
		{
			at: n4.start,
			move: 'none',
			render: (x) => (
				<>
					<Split
						slide={easeOut(progress(x, n4.start, n4.start + 10), 3)}
						panes={[
							{cx: 1500, cy: TR.y - 200, z: 1.3, render: () => <Svg><TrackWorld f={x} n={12} t0={-999} every={1} dice={false} /></Svg>},
							{cx: 1600, cy: 480, z: 1.4, render: () => news(x)},
						]}
					/>
					<Say x={960} y={140} k={pop(x, n4.start + 16)} text="?" size={150} color={K.white} />
				</>
			),
		},
		// 23 and 24. push in toward the train: inside the ones we already use
		{
			at: at('N04', 0.45),
			move: 'none',
			render: (x) => {
				const k = easeIn(progress(x, at('N04', 0.45), S.news.end), 2);
				const fx = TR.x0 + 12 * TR.gap + 40 + 250 - 120;
				return (
					<>
						<Zoom cx={lerp(1300, fx, k)} cy={lerp(700, TR.y - 110, k)} z={lerp(1.1, 7, k)}>
							<Svg>
								<TrackWorld f={x} n={12} t0={-999} every={1} dice={false} />
							</Svg>
						</Zoom>
						<Say x={960} y={180} k={pop(x, at('N04', 0.6)) * (1 - progress(x, S.news.end - 20, S.news.end - 8))} text="inside" size={110} color={K.white} />
						<AbsoluteFill style={{background: '#FFF1C0', opacity: progress(x, S.news.end - 16, S.news.end)}} />
					</>
				);
			},
		},
	];
	return <Shots f={f} end={S.news.end} shots={shots} />;
};

const TitleCard: React.FC<{f: number; next?: boolean}> = ({f, next}) => {
	const rise = easeOut(progress(f, 0, 36), 3);
	const t = easeOut(progress(f, next ? 10 : 18, next ? 30 : 40), 2);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} count={140} maxY={900} />
				<g transform={`translate(0 ${(1 - rise) * 400})`}>
					<Hills y={860} shift={f * 0.8} />
					<rect x={0} y={940} width={1920} height={200} fill="#212872" />
					<g transform="translate(1540 862) scale(0.8)">
						<FlatLighthouse on={0.8} />
					</g>
					{[
						{livery: 'claude' as const, x: next ? 700 : -150 + f * 11, off: 0},
						{livery: 'gpt' as const, x: next ? 250 : -150 + f * 11 - 420, off: 13},
					].map((tr) => (
						<g key={tr.livery} transform={`translate(${tr.x} 944)`}>
							<SteamPress livery={tr.livery} f={f + tr.off} s={0.55} speech={[]} expr={next ? withLook('curious', 1, -0.5, {lid: 0.2}) : withLook('happy', 0.6, 0, {bounce: 3})} dist={next ? 0 : WHEEL_DIST(f * 11, 0.55)} smokeT={f * 0.012} />
						</g>
					))}
				</g>
				<Motes f={f} count={40} />
			</svg>
			<div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
				{next ? (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK</div>
						<div style={{fontWeight: 800, fontSize: 40, color: K.mute, marginTop: 40}}>next time</div>
						<div style={{fontWeight: 900, fontSize: 130, color: K.white, lineHeight: 1}}>The Mailroom</div>
					</>
				) : (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK · Nº 1</div>
						<div style={{fontWeight: 900, fontSize: 170, color: K.white, lineHeight: 1.05}}>Track Layer</div>
					</>
				)}
			</div>
			{next ? (
				<div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 18, color: K.mute, opacity: t}}>
					Draft · illustrative numbers · Kokoro-82M · Remotion
				</div>
			) : null}
		</AbsoluteFill>
	);
};

const StationShots: React.FC<{f: number}> = ({f}) => {
	const station = (x: number, card = true) => (
		<>
			<Svg>
				<FlatDefs />
				<FlatStation film={film} f={x} />
				<Vignette />
			</Svg>
			{card ? <FlatEmailCard film={film} f={x} /> : null}
		</>
	);
	const l2 = cues.L02;
	const layT0 = at('L02', 0.6);
	const shots: Shot[] = [
		// 26. the station at dusk; a letter is on its way
		{at: S.letter.start, move: 'in', render: (x) => station(x, false)},
		// 27. close-up: the envelope reaches the station, and the email opens beside it
		{at: S.letter.start + 50, move: 'right', render: (x) => <><Zoom cx={380} cy={600} z={1.9}>{station(x, false)}</Zoom><FlatEmailCard film={film} f={x} /></>},
		// 28. close-up on the question
		{at: at('L01', 0.72), move: 'in', render: (x) => <Zoom cx={1390} cy={420} z={1.7}>{station(x)}</Zoom>},
		// 29. concept: a finished answer on a scroll... that isn't there
		{
			at: S.gab.start,
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<Stage f={x} y={880} w={560}>
							<Scroll x={960} y={560} crumble={easeIn(progress(x, at('L02', 0.19), at('L02', 0.26)), 2)} />
						</Stage>
					</Svg>
					<Say x={960} y={90} k={pop(x, at('L02', 0.06)) * (1 - progress(x, at('L02', 0.19), at('L02', 0.22)))} text="whole?" size={96} color={T.text} />
				</>
			),
		},
		// 30. the station: two little trains. Claude, ChatGPT
		{at: at('L02', 0.27), move: 'out', render: (x) => station(x, false)},
		// 31. close-up: the Claude train, curious
		{at: at('L02', 0.4), move: 'in', render: (x) => <Zoom cx={890} cy={560} z={2.6}>{station(x, false)}</Zoom>},
		// 32. over the boiler: the track ahead runs into fog
		{at: at('L02', 0.46), move: 'right', render: (x) => <Zoom cx={120 + 4 * 150 + 260} cy={620} z={1.7}><Svg><LayWorld f={x} n={4} fog={1} expr={withLook('curious', 1, -0.2)} /></Svg></Zoom>},
		// 33. low by the rails: the first sleeper, a word
		{
			at: layT0,
			move: 'left',
			render: (x) => {
				const n = Math.min(3, 1 + Math.floor((x - layT0) / 18));
				return (
					<Zoom cx={120 + n * 150 - 40} cy={700} z={2.4}>
						<Svg>
							<LayWorld f={x} n={n} t0={layT0} every={18} fog={0.6} />
						</Svg>
					</Zoom>
				);
			},
		},
		// 34. close-up on the wheels rolling over it
		{
			at: at('L02', 0.78),
			move: 'right',
			render: (x) => (
				<Zoom cx={120 + 3 * 150 + 20} cy={720} z={3.2}>
					<Svg>
						<LayWorld f={x} n={3} fog={0.6} />
					</Svg>
				</Zoom>
			),
		},
		// 35. the camera swings up into the ride-along
		{at: at('L02', 0.86), move: 'in', render: (x) => station(x, false)},
	];
	return <Shots f={f} end={S.fork.start} shots={shots} />;
};

const ForkShots: React.FC<{f: number}> = ({f}) => {
	const ft = film.forkTimes;
	const onTrain = (x: number, view: View, z: number, dy = -60) => {
		const p = mainState(x, view).at;
		return (
			<Zoom cx={p.x} cy={p.y + dy} z={z}>
				<MainTable f={x} view={view} panel={false} />
			</Zoom>
		);
	};
	const shots: Shot[] = [
		// 36. ride-along: the first junction fans out
		{at: S.fork.start, move: 'in', render: (x) => <MainTable f={x} />},
		// 37. from above: each branch as wide as its chance
		{at: at('L03', 0.3), move: 'down', render: (x) => <MainTable f={x} view="high" />},
		// 38. concept: one fork on a tile; width is chance
		{
			at: at('L03', 0.6),
			move: 'in',
			render: (x) => (
				<Svg>
					<Stage f={x} y={900} w={600}>
						<TileFork
							f={x}
							k={easeOut(progress(x, at('L03', 0.6), at('L03', 0.6) + 16), 3)}
							branches={[
								{p: 0.7, label: '70%', hot: true},
								{p: 0.04, label: '4%'},
							]}
						/>
					</Stage>
				</Svg>
			),
		},
		// 39. the train at the junction, waiting
		{at: cues.L03.end - 16, move: 'left', render: (x) => onTrain(x, 'low', 1.8)},
		// 40. close-up: the points switch, and it takes one branch
		{at: ft[0].roll + 10, move: 'in', render: (x) => onTrain(x, 'eye', 2.2)},
		// 41. wide: the next junction appears out of the dark
		{at: ft[0].go + 20, move: 'out', render: (x) => <MainTable f={x} />},
		// 42. from above: the ribbon narrows at every junction
		{at: cues.L05.start, move: 'right', render: (x) => <MainTable f={x} view="high" />},
		// 43. close-up: the gauge ticks down
		{at: at('L05', 0.25), move: 'in', render: (x) => onTrain(x, 'eye', 2.0, -170)},
		// 44. low and wide: multiply at every junction
		{
			at: at('L05', 0.5),
			move: 'left',
			render: (x) => (
				<>
					<MainTable f={x} view="low" />
					<Say x={960} y={130} k={pop(x, at('L05', 0.55))} text="×" size={150} color={K.orangeHi} />
				</>
			),
		},
		// 45. close-up: the gauge. 0.027
		{at: at('L05', 0.78), move: 'in', render: (x) => onTrain(x, 'eye', 2.2, -170)},
	];
	return <Shots f={f} end={S.guess.start} shots={shots} />;
};

const GuessShots: React.FC<{f: number}> = ({f}) => {
	const g1 = cues.G01;
	const g2 = cues.G02;
	const guess = (x: number) => <GuessScene film={film} f={x} />;
	const shots: Shot[] = [
		// 46. concept: one branch, a safe bet. 80%
		{
			at: S.guess.start,
			move: 'in',
			render: (x) => (
				<Svg>
					<Stage f={x} y={900} w={600}>
						<TileFork f={x} k={easeOut(progress(x, S.guess.start + 4, S.guess.start + 20), 3)} branches={[{p: 0.8, label: '80%', hot: true}]} />
					</Stage>
				</Svg>
			),
		},
		// 47. the corridor: twenty junctions in a row
		{at: at('G01', 0.3), move: 'right', render: guess},
		// 48. close-up: the train facing it
		{at: at('G01', 0.6), move: 'in', render: (x) => <Zoom cx={330} cy={700} z={2.4}>{guess(x)}</Zoom>},
		// 49. along the corridor to its far end. 20
		{
			at: at('G01', 0.8),
			move: 'left',
			render: (x) => (
				<>
					<Zoom cx={1500} cy={640} z={1.8}>
						{guess(x)}
					</Zoom>
					<Say x={960} y={140} k={pop(x, at('G01', 0.82))} text="20" size={140} color={K.orangeHi} />
				</>
			),
		},
		// 50. concept: your guess. 3, 2, 1
		{
			at: g1.end,
			move: 'none',
			render: (x) => (
				<>
					<Svg>
						<Stage f={x} y={900} w={600}>
							<text x={960} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260} fill={T.text}>?</text>
						</Stage>
					</Svg>
					<Countdown f={x} a={g1.end} b={g1.end + GUESS_PAUSE} x={1480} y={380} />
				</>
			),
		},
		// 51. the corridor narrows, junction by junction
		{at: g2.start, move: 'in', render: guess},
		// 52. at the thin end: 0.8^20
		{at: g2.start + 64, move: 'out', render: (x) => <Zoom cx={1100} cy={720} z={1.4}>{guess(x)}</Zoom>},
	];
	return <Shots f={f} end={S.chain.start} shots={shots} />;
};

const ChainShots: React.FC<{f: number}> = ({f}) => {
	const shots: Shot[] = [
		// 53. pull back over the whole track; each junction's factor
		{at: S.chain.start, move: 'out', render: (x) => <MainTable f={x} />},
		// 54. the chain rule builds in the sky over the track
		{at: cues.L06.start, move: 'in', render: (x) => <MainTable f={x} />},
		// 55. close-up: the train lays the next word
		{
			at: at('L06', 0.7),
			move: 'right',
			render: (x) => {
				const t = at('L06', 0.7);
				const n = 5 + Math.min(1, Math.floor((x - t) / 20));
				return (
					<Zoom cx={120 + n * 150 + 20} cy={690} z={2.4}>
						<Svg>
							<LayWorld f={x} n={n} t0={t - 100} every={20} />
						</Svg>
					</Zoom>
				);
			},
		},
	];
	return <Shots f={f} end={S.shannon.start} shots={shots} />;
};

// Shannon's page: a passage with its letters hidden, a few already guessed
const Page: React.FC<{f: number}> = ({f}) => {
	const text = 'IS THIS EMAIL A SCAM';
	const shown = Math.floor(progress(f, at('SH01', 0.62), at('SH01', 0.72)) * 6);
	return (
		<Svg>
			<defs>
				<radialGradient id="gPageLamp" cx="0.6" cy="0.2" r="0.9">
					<stop offset="0" stopColor="#FFD98A" stopOpacity={0.5} />
					<stop offset="1" stopColor="#FFD98A" stopOpacity={0} />
				</radialGradient>
			</defs>
			<rect x={-60} y={-60} width={2040} height={1200} fill="#4A2F5A" />
			<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gPageLamp)" />
			<rect x={-60} y={640} width={2040} height={600} fill="#7A4E3A" />
			<g transform="rotate(-3 960 520)">
				<rect x={360} y={180} width={1200} height={680} rx={10} fill="#F3EEE3" />
				{text.split('').map((ch, i) => {
					const x = 440 + i * 54;
					return ch === ' ' ? null : (
						<g key={i}>
							<rect x={x} y={330} width={44} height={6} rx={3} fill="#3A2340" opacity={0.7} />
							{i < shown ? (
								<text x={x + 22} y={320} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill="#3A2340">
									{ch}
								</text>
							) : null}
						</g>
					);
				})}
				{[0, 1, 2, 3].map((r) => (
					<g key={r}>
						{Array.from({length: 18 - r * 2}, (_, i) => (
							<rect key={i} x={440 + i * 54} y={440 + r * 90} width={44} height={6} rx={3} fill="#3A2340" opacity={0.4} />
						))}
					</g>
				))}
			</g>
		</Svg>
	);
};

// The planet, crossed by thousands of little tracks, with thin branches flashing somewhere every few frames.
const PlanetTracks: React.FC<{f: number; flashes?: boolean}> = ({f, flashes}) => (
	<Svg>
		<FlatDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill={K.night} />
		<Stars f={f} count={160} maxY={1080} seed={11} />
		<g transform="translate(960 560)">
			<Planet f={f} />
			{Array.from({length: 40}, (_, i) => {
				const a = (i * 137.5 * Math.PI) / 180;
				const r = 60 + ((i * 53) % 220);
				const x = Math.cos(a) * r;
				const y = Math.sin(a) * r;
				const len = 30 + (i % 5) * 12;
				const ang = (i * 47) % 180;
				return <path key={i} d={`M ${x} ${y} l ${Math.cos((ang * Math.PI) / 180) * len} ${Math.sin((ang * Math.PI) / 180) * len}`} stroke={K.orangeHi} strokeWidth={3} strokeLinecap="round" opacity={0.55} />;
			})}
			{flashes
				? Array.from({length: 6}, (_, j) => {
						const i = Math.floor(f / 5) * 6 + j;
						const a = i * 2.39996;
						const r = 40 + ((i * 97) % 240);
						const k = ((f % 5) + j) % 5 < 3 ? 1 : 0;
						return k ? <circle key={j} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={9} fill={RED} filter="url(#glow)" /> : null;
					})
				: null}
		</g>
		<Vignette />
	</Svg>
);

const ShannonShots: React.FC<{f: number}> = ({f}) => {
	const sh = (x: number) => <ShannonScene film={film} f={x} />;
	const s2 = cues.SH02;
	const shots: Shot[] = [
		// 56. Shannon's study, 1951
		{
			at: S.shannon.start,
			move: 'in',
			render: (x) => (
				<>
					{sh(x)}
					<Say x={330} y={160} k={pop(x, S.shannon.start + 16)} text="1951" size={120} color="#FFD98A" />
				</>
			),
		},
		// 57. close-up: Shannon at the desk, under the lamp
		{at: at('SH01', 0.2), move: 'right', render: (x) => <Zoom cx={760} cy={470} z={2.1}>{sh(x)}</Zoom>},
		// 58. close-up: the chalkboard of letter frequencies
		{at: at('SH01', 0.4), move: 'left', render: (x) => <Zoom cx={1040} cy={230} z={2.5}>{sh(x)}</Zoom>},
		// 59. close-up on the page: a passage with its letters hidden
		{at: at('SH01', 0.58), move: 'in', render: (x) => <Page f={x} />},
		// 60. the tiles: one letter at a time, and how many guesses it took
		{at: at('SH01', 0.72), move: 'left', render: (x) => <Zoom cx={480} cy={820} z={1.9}>{sh(x)}</Zoom>},
		{at: at('SH01', 0.88), move: 'left', render: (x) => <Zoom cx={1250} cy={820} z={1.9}>{sh(x)}</Zoom>},
		// 61. wide: the whole line, mostly 1s. Predictable
		{at: s2.start, move: 'out', render: sh},
		// 62. close-up on the row of 1s
		{at: at('SH02', 0.26), move: 'right', render: (x) => <Zoom cx={960} cy={850} z={2.2}>{sh(x)}</Zoom>},
		// 63. the letters join into words... and a word becomes a sleeper on the rail
		{at: at('SH02', 0.5), move: 'in', render: (x) => <Zoom cx={960} cy={800} z={1.6}>{sh(x)}</Zoom>},
		{at: at('SH02', 0.72), move: 'out', render: (x) => <Zoom cx={120 + 4 * 150 - 75} cy={740} z={2.6}><Svg><LayWorld f={x} n={5} /></Svg></Zoom>},
		// 64. zoom out to the planet, crossed by little tracks. Billions
		{
			at: at('SH02', 0.86),
			move: 'out',
			render: (x) => (
				<>
					<PlanetTracks f={x} />
					<Say x={960} y={120} k={pop(x, at('SH02', 0.88))} text="billions" size={96} color={K.white} />
				</>
			),
		},
	];
	return <Shots f={f} end={S.marble.start} shots={shots} />;
};

const MarbleShots: React.FC<{f: number}> = ({f}) => {
	const ft = film.forkTimes[6];
	const mag = (x: number, view: View = 'eye', tag = true) => <Magnified f={x} k={6} span={S.marble} context="… this email looks" view={view} tag={tag} />;
	const shots: Shot[] = [
		// 65. the magnified junction after "looks"
		{at: S.marble.start, move: 'in', render: (x) => mag(x)},
		// 66. close-up on the branches: totally, 4%
		{
			at: at('L07', 0.35),
			move: 'right',
			render: (x) => {
				const s = magState(x, 6, S.marble, false);
				return (
					<Zoom cx={s.mouth.x + 320} cy={s.mouth.y - 70} z={2.2}>
						{mag(x, 'eye', false)}
					</Zoom>
				);
			},
		},
		// 67. close-up: the marble drops into the junction
		{
			at: ft.roll,
			move: 'in',
			render: (x) => {
				const s = magState(x, 6, S.marble, false);
				return (
					<Zoom cx={s.mouth.x} cy={s.mouth.y - 80} z={1.9}>
						{mag(x, 'eye', false)}
					</Zoom>
				);
			},
		},
		// 68. the points throw: the thin branch wins
		{
			at: ft.land,
			move: 'left',
			render: (x) => {
				const s = magState(x, 6, S.marble, false);
				return (
					<Zoom cx={s.at.x} cy={s.at.y - 110} z={1.8}>
						{mag(x, 'eye', false)}
					</Zoom>
				);
			},
		},
	];
	return <Shots f={f} end={S.runs.start} shots={shots} />;
};

const RunsShots: React.FC<{f: number}> = ({f}) => {
	const runs = (x: number, red = false) => <RunsScene film={film} f={x} red={red} />;
	const r2 = cues.R02;
	const t0 = cues.R01.end + 4;
	const shots: Shot[] = [
		// 69. concept: 4% sounds like never
		{
			at: S.runs.start,
			move: 'in',
			render: (x) => {
				const s = 1 - 0.5 * easeInOut(progress(x, S.runs.start + 20, at('R01', 0.4)));
				return (
					<>
						<Svg>
							<Stage f={x} y={900} w={600}>
								<text x={960} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260 * s} fill={K.orangeHi}>4%</text>
							</Stage>
						</Svg>
						<Say x={960} y={110} k={pop(x, at('R01', 0.2))} text="never?" size={96} color={T.text} />
					</>
				);
			},
		},
		// 70. the marble machine
		{at: at('R01', 0.42), move: 'right', render: (x) => runs(x)},
		// 71. close-up: the funnel, a hundred runs
		{at: at('R01', 0.72), move: 'in', render: (x) => <Zoom cx={960} cy={190} z={2.8}>{runs(x)}</Zoom>},
		// 72. close-up: marbles bounce down the chutes
		{at: t0 + 8, move: 'down', render: (x) => <Zoom cx={800} cy={300} z={3.4}>{runs(x)}</Zoom>},
		// 73a. the train watches the run, nervous
		{at: t0 + 40, move: 'in', render: (x) => <Zoom cx={940} cy={600} z={3.4}><Svg><LayWorld f={x} n={5} expr={withLook('nervous', -0.6, -0.4)} /></Svg></Zoom>},
		// 73. close-up: the "totally" bin catches one
		{at: t0 + 76, move: 'in', render: (x) => <Zoom cx={1160} cy={640} z={2.4}>{runs(x)}</Zoom>},
		// 74. wide: all the bins. 4 / 100
		{at: r2.start, move: 'out', render: (x) => runs(x)},
		// 75. close-up: the four, lit red
		{at: at('R02', 0.3), move: 'in', render: (x) => <Zoom cx={1160} cy={740} z={3}>{runs(x, true)}</Zoom>},
		// 76. zoom out: somewhere on the planet a thin branch wins every few moments
		{at: at('R02', 0.55), move: 'out', render: (x) => <PlanetTracks f={x} flashes />},
		// 77. closer: daily
		{
			at: at('R02', 0.78),
			move: 'in',
			render: (x) => (
				<>
					<Zoom cx={1060} cy={500} z={1.8}>
						<PlanetTracks f={x} flashes />
					</Zoom>
					<Say x={960} y={120} k={pop(x, at('R02', 0.8))} text="daily" size={110} color={K.white} />
				</>
			),
		},
	];
	return <Shots f={f} end={S.lean.start} shots={shots} />;
};

const LeanShots: React.FC<{f: number}> = ({f}) => {
	const ft = film.forkTimes[7];
	const mag = (x: number, view: View = 'eye', tag = true) => <Magnified f={x} k={7} span={S.lean} context="… looks totally" pond view={view} tag={tag} />;
	const shots: Shot[] = [
		// 78. the magnified junction after "totally", and a pond ahead
		{at: S.lean.start, move: 'in', render: (x) => mag(x)},
		// 79. close-up on the branches: legit, the widest
		{
			at: at('L09', 0.3),
			move: 'left',
			render: (x) => {
				const s = magState(x, 7, S.lean, true);
				return (
					<Zoom cx={s.mouth.x + 320} cy={s.mouth.y - 70} z={2.2}>
						{mag(x, 'eye', false)}
					</Zoom>
				);
			},
		},
		// 80. close-up: the train, confident again
		{
			at: at('L09', 0.62),
			move: 'in',
			render: (x) => {
				const s = magState(x, 7, S.lean, true);
				return (
					<Zoom cx={s.at.x + 20} cy={s.at.y - 120} z={2.3}>
						{mag(x, 'eye', false)}
					</Zoom>
				);
			},
		},
		// 81. wide: the track bends toward the water
		{at: ft.go, move: 'out', render: (x) => mag(x, 'low', false)},
	];
	return <Shots f={f} end={S.derail.start} shots={shots} />;
};

const ValleyShots: React.FC<{f: number}> = ({f}) => {
	const valley = (x: number) => (
		<Svg>
			<FlatDefs />
			<FlatValley film={film} f={x} />
			<Vignette />
		</Svg>
	);
	const d0 = S.derail.start;
	const b = cues.L10b;
	const words = [
		{t: at('L10', 0.5), text: 'fluent', cx: 1200, cy: 690, z: 1.6, color: K.white},
		{t: at('L10', 0.7), text: 'confident', cx: 960, cy: 680, z: 1.25, color: K.white},
		{t: at('L10', 0.86), text: 'wrong', cx: 1220, cy: 720, z: 1.9, color: RED, y: 860},
	];
	const shots: Shot[] = [
		// 82. the valley: the train slides into the swamp
		{at: d0, move: 'none', render: valley},
		// 83. close-up: panic, and steam
		{at: d0 + 56, move: 'in', render: (x) => <Zoom cx={1180} cy={730} z={2.2}>{valley(x)}</Zoom>},
		// 84. three quick words over the sinking train
		...words.map(
			(w, i): Shot => ({
				at: w.t,
				move: i % 2 ? 'left' : 'right',
				render: (x) => (
					<>
						<Zoom cx={w.cx} cy={w.cy} z={w.z}>
							{valley(x)}
						</Zoom>
						<Say x={960} y={('y' in w ? w.y : undefined) ?? 150} k={pop(x, w.t + 2, 6)} text={w.text} size={130} color={w.color} />
					</>
				),
			}),
		),
		// 85. usually caught
		{at: b.start, move: 'out', render: valley},
		// 86. pull back along the track; each sleeper carries its chance
		{at: b.start + 72, move: 'out', render: (x) => <Zoom cx={900} cy={620} z={1.2}>{valley(x)}</Zoom>},
		{at: b.start + 124, move: 'right', render: (x) => <Zoom cx={700} cy={640} z={1.5}>{valley(x)}</Zoom>},
		// 87. concept: a chain of small bets on the tile; one link, red, breaks
		{
			at: b.end - 58,
			move: 'in',
			render: (x) => {
				const brk = easeOut(progress(x, b.end - 46, b.end - 30), 2);
				return (
					<Svg>
						<Stage f={x} y={900} w={640}>
							{Array.from({length: 9}, (_, i) => {
								const bad = i === 5;
								const cx = 520 + i * 110;
								const drop = bad ? brk * 90 : i > 5 ? brk * 30 : 0;
								return (
									<ellipse key={i} cx={cx} cy={560 + drop} rx={62} ry={30} transform={`rotate(${bad ? brk * 40 : 0} ${cx} ${560 + drop})`} fill="none" stroke={bad ? RED : i % 2 ? T.glow : T.text} strokeWidth={14} opacity={bad ? 1 : 0.9} />
								);
							})}
						</Stage>
					</Svg>
				);
			},
		},
		// 88. wide: the whole chain, one bad link
		{
			at: b.end - 20,
			move: 'out',
			render: (x) => (
				<>
					{valley(x)}
					<Say x={960} y={130} k={pop(x, b.end - 14)} text="chain" size={96} color={K.white} />
				</>
			),
		},
		// 89. the lighthouse on the cliff: no track, no words
		{at: S.jev.start, move: 'in', xf: 12, render: valley},
		// 90. close-up: the lamp. 0 words
		{
			at: at('L11', 0.55),
			move: 'in',
			render: (x) => (
				<>
					<Zoom cx={1500} cy={330} z={2.4}>
						{valley(x)}
					</Zoom>
					<Say x={560} y={450} k={pop(x, at('L11', 0.62))} text="0 words" size={110} color={K.white} />
				</>
			),
		},
		// 91. the beam sweeps the whole email at once
		{at: cues.L12.start, move: 'left', render: valley},
		// 92. close-up: the beam splits into two wedges, sized by certainty
		{at: at('L12', 0.6), move: 'in', render: (x) => <Zoom cx={1420} cy={400} z={2.1}>{valley(x)}</Zoom>},
		// 93. 0.91, in one pass
		{
			at: cues.L13.start - 4,
			move: 'out',
			render: (x) => (
				<>
					{valley(x)}
					<Say x={520} y={300} k={pop(x, at('L13', 0.55))} text="1 pass" size={100} color={K.yellow} />
				</>
			),
		},
		// 94. split: one writes, the other decides
		{
			at: S.close.start,
			move: 'none',
			render: (x) => (
				<>
					<Split
						slide={easeOut(progress(x, S.close.start, S.close.start + 10), 3)}
						panes={[
							{cx: TR.x0 + (3 + Math.min(9, (x - S.close.start) / 6)) * TR.gap + 190, cy: TR.y - 160, z: 1.4, render: () => <Svg><TrackWorld f={x} n={Math.min(12, 3 + Math.floor((x - S.close.start) / 6))} t0={S.close.start - 18} every={6} dice={false} /></Svg>},
							{cx: 1500, cy: 360, z: 1.5, render: () => valley(x)},
						]}
					/>
					<Say x={480} y={920} k={pop(x, at('L14', 0.06))} text="writes" size={96} color={K.orangeHi} />
					<Say x={1440} y={920} k={pop(x, at('L14', 0.2))} text="decides" size={96} color={K.yellow} />
				</>
			),
		},
		// 95. close-up: 0.91. Can we trust it?
		{
			at: at('L14', 0.45),
			move: 'in',
			render: (x) => (
				<>
					<Zoom cx={1400} cy={200} z={2}>
						{valley(x)}
					</Zoom>
					<Say x={520} y={720} k={pop(x, at('L14', 0.62))} text="trust?" size={130} color={K.white} />
				</>
			),
		},
	];
	return <Shots f={f} end={S.endcard.start} shots={shots} />;
};

// Scenes, with how each one enters: a cross-fade (xf frames) or a hard cut (0). Cross-fades only at section changes.
type Scene = {span: Span; xf: number; render: (f: number) => React.ReactNode};
export const TrackLayerFlat: React.FC = () => {
	const f = useCurrentFrame();
	const scenes: Scene[] = [
		{span: S.hook, xf: 0, render: (x) => <HookScene f={x} />},
		{span: S.news, xf: 12, render: (x) => <NewsShots f={x} />},
		{span: S.title, xf: 12, render: (x) => <TitleCard f={x - S.title.start} />},
		{span: {start: S.letter.start, end: S.fork.start}, xf: 12, render: (x) => <StationShots f={x} />},
		{span: {start: S.fork.start, end: S.guess.start}, xf: 0, render: (x) => <ForkShots f={x} />},
		{span: S.guess, xf: 12, render: (x) => <GuessShots f={x} />},
		{span: S.chain, xf: 0, render: (x) => <ChainShots f={x} />},
		{span: S.shannon, xf: 12, render: (x) => <ShannonShots f={x} />},
		{span: S.marble, xf: 0, render: (x) => <MarbleShots f={x} />},
		{span: S.runs, xf: 0, render: (x) => <RunsShots f={x} />},
		{span: S.lean, xf: 0, render: (x) => <LeanShots f={x} />},
		{span: {start: S.derail.start, end: S.close.end}, xf: 0, render: (x) => <ValleyShots f={x} />},
		{span: S.endcard, xf: 12, render: (x) => <TitleCard f={x - S.endcard.start} next />},
	];
	return (
		<AbsoluteFill style={{background: K.night, overflow: 'hidden'}}>
			{scenes.map((sc, i) => {
				const next = scenes[i + 1];
				const tail = next ? next.xf : 0;
				if (f < sc.span.start || f >= sc.span.end + tail) return null;
				const fadeIn = sc.xf ? progress(f, sc.span.start, sc.span.start + sc.xf) : 1;
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn, overflow: 'hidden'}}>
						{sc.render(f)}
					</AbsoluteFill>
				);
			})}
			<Grain id="flatGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{film.fx.status !== 'measured' && f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={track('flat2-track')} />
		</AbsoluteFill>
	);
};
