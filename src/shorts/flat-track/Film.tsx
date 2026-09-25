import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FONT, FlatDefs, FlatLighthouse, Hills, K, Motes, Stars, Vignette} from '../../flat/kit';
import {Equation, type Term} from '../../flat/math';
import {Grain} from '../../styleframes/Shared';
import fixture from '../../../fixtures/track-layer.json';
import vo from '../../../fixtures/track-layer-flat-vo.json';
import type {Fixture, VoLine} from '../paper-track/timeline';
import {type TCam, fmt, trainAt} from '../paper-track/Table';
import {type ForkGeo, type Span, ROUTE, buildRoute, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {FlatEmailCard, FlatStation, FlatValley} from './Side';
import {FlatTableWorld} from './Table';
import {Hook} from './Intro';
import {Clouds, Moon, Mountains, WorldDefs} from '../../flat/world';
import {NewsScene} from './NewsScene';
import {GuessScene, RunsScene, ShannonScene} from './Curiosity';
import {buildFlatFilm} from './timeline';
import {SteamPress} from '../../characters/steam';
import {WHEEL_DIST, withLook} from './trainMood';

export const film = buildFlatFilm(fixture as Fixture, (vo as {lines: VoLine[]}).lines);

// Flat-vector cut of "Track Layer". Same narration, timing and math as the paper cut; new look.
const mixCam = (a: TCam, b: TCam, k: number): TCam => ({camX: lerp(a.camX, b.camX, k), f: lerp(a.f, b.f, k), H: lerp(a.H, b.H, k), horizon: lerp(a.horizon, b.horizon, k)});

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

const MainTable: React.FC<{f: number}> = ({f}) => {
	const {S, route, forkTimes} = film;
	const main = route.slice(0, 6);
	const tr = trainAt(film, main, f, S.fork.start);
	const follow: TCam = {camX: tr.X + 650, f: 1100, H: 1000, horizon: lerp(1150, 130, easeInOut(progress(f, S.fork.start, S.fork.start + 34)))};
	const back = easeInOut(progress(f, S.chain.start, S.chain.start + 44));
	const c = mixCam(follow, {camX: 3650, f: 640, H: 1650, horizon: 344}, back);
	const revealAt = (k: number) => (k === 0 ? S.fork.start + 44 : forkTimes[k - 1].arrive - 16);
	const glow = f >= S.chain.start ? Math.floor(progress(f, S.chain.start + 10, S.chain.start + 58) * 6) - 1 : -1;
	return (
		<>
			<Frame f={f} horizon={c.horizon} shift={c.camX}>
				<FlatTableWorld film={film} f={f} c={c} route={main} trunkFrom={-4000} revealAt={revealAt} train={tr} showGauge={f >= S.thin.start && back < 0.5} glowCards={glow} />
			</Frame>
			<ChainPanel f={f} />
		</>
	);
};

const Magnified: React.FC<{f: number; k: number; span: Span; context: string; pond?: boolean}> = ({f, k, span, context, pond}) => {
	const geo: ForkGeo = {...buildRoute([film.fx.steps[k]])[0], k};
	const real = film.route[k];
	const ft = film.forkTimes.find((x) => x.k === k)!;
	const {WAIT, BRANCH, Zc} = ROUTE;
	let X = lerp(geo.x - WAIT - 500, geo.x - WAIT, easeInOut(progress(f, span.start, span.start + 30)));
	if (f >= ft.go) X = lerp(geo.x - WAIT, geo.x + BRANCH + (pond ? 900 : 500), easeIn(progress(f, ft.go, ft.arrive), 1.6));
	const u = Math.min(1, Math.max(0, (X - geo.x) / BRANCH));
	const Z = X > geo.x ? lerp(geo.chosen.z0 + geo.chosen.w / 2, Zc, u * u * (3 - 2 * u)) : Zc;
	const c: TCam = {camX: lerp(geo.x - 100, X + 500, progress(f, ft.go, ft.arrive)), f: 1250, H: 1000, horizon: 110};
	const tagK = easeInOut(progress(f, span.start + 6, span.start + 20));
	return (
		<>
			<Frame f={f} horizon={c.horizon} shift={c.camX}>
				<FlatTableWorld film={film} f={f} c={c} route={[geo]} trunkFrom={-3000} revealAt={() => span.start + 14} train={{X, Z, cum: f >= ft.land ? real.cumAfter : real.cumBefore}} showGauge pond={pond} contextCard={context} />
			</Frame>
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
		</>
	);
};

const ChainPanel: React.FC<{f: number}> = ({f}) => {
	const {S, route, cues} = film;
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
					{/* the two engines: Claude-inspired in front, ChatGPT-inspired following */}
					{[
						{livery: 'claude' as const, x: next ? 700 : -150 + f * 11, off: 0},
						{livery: 'gpt' as const, x: next ? 250 : -150 + f * 11 - 420, off: 13},
					].map((t) => (
						<g key={t.livery} transform={`translate(${t.x} 944)`}>
							<SteamPress
								livery={t.livery}
								f={f + t.off}
								s={0.55}
								speech={[]}
								expr={next ? withLook('curious', 1, -0.5, {lid: 0.2}) : withLook('happy', 0.6, 0, {bounce: 3})}
								dist={next ? 0 : WHEEL_DIST(f * 11, 0.55)}
								smokeT={f * 0.012}
							/>
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

type Scene = {span: Span; render: (f: number) => React.ReactNode; zoomOut?: boolean};

export const TrackLayerFlat: React.FC = () => {
	const f = useCurrentFrame();
	const {S, XF, cues} = film;
	const scenes: Scene[] = [
		{span: S.hook, render: (x) => <Hook film={film} f={x} />},
		{span: S.news, render: (x) => <NewsScene film={film} f={x} />},
		{span: S.title, render: (x) => <TitleCard f={x - S.title.start} />},
		{span: {start: S.letter.start, end: S.gab.end}, render: (x) => (
			<>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<FlatDefs />
					<FlatStation film={film} f={x} />
					<Vignette />
				</svg>
				<FlatEmailCard film={film} f={x} />
			</>
		)},
		...(S.guess
			? [
					{span: {start: S.fork.start, end: S.thin.end}, render: (x: number) => <MainTable f={x} />},
					{span: S.guess, render: (x: number) => <GuessScene film={film} f={x} />},
					{span: S.chain, render: (x: number) => <MainTable f={x} />, zoomOut: !S.shannon},
				]
			: [{span: {start: S.fork.start, end: S.chain.end}, render: (x: number) => <MainTable f={x} />, zoomOut: true}]),
		...(S.shannon ? [{span: S.shannon, render: (x: number) => <ShannonScene film={film} f={x} />}] : []),
		{span: S.marble, render: (x) => <Magnified f={x} k={6} span={S.marble} context="… this email looks" />, zoomOut: !S.runs},
		...(S.runs ? [{span: S.runs, render: (x: number) => <RunsScene film={film} f={x} />}] : []),
		{span: S.lean, render: (x) => <Magnified f={x} k={7} span={S.lean} context="… looks totally" pond />},
		{span: {start: S.derail.start, end: S.close.end}, render: (x) => (
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<FlatValley film={film} f={x} />
				<Vignette />
			</svg>
		)},
		{span: S.endcard, render: (x) => <TitleCard f={x - S.endcard.start} next />},
	];
	return (
		<AbsoluteFill style={{background: K.night}}>
			{scenes.map((sc, i) => {
				if (f < sc.span.start || f >= sc.span.end + XF) return null;
				const fadeIn = i === 0 ? 1 : progress(f, sc.span.start, sc.span.start + XF);
				const out = sc.zoomOut ? progress(f, sc.span.end - 10, sc.span.end + XF) : 0;
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn, transform: out ? `scale(${1 + 2.2 * easeIn(out, 2)})` : undefined, transformOrigin: '42% 55%', filter: out ? `blur(${10 * out}px)` : undefined}}>
						{sc.render(f)}
					</AbsoluteFill>
				);
			})}
			<Grain id="flatGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{film.fx.status !== 'measured' && f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={staticFile('audio/flat2-track.wav')} />
		</AbsoluteFill>
	);
};
