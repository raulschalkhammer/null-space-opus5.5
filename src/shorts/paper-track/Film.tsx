import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import fixture from '../../../fixtures/track-layer.json';
import vo from '../../../fixtures/track-layer-vo.json';
import {HorizonHills, P, PaperDefs, SERIF, Sky, Subtitle} from '../../paper/kit';
import {Grain} from '../../styleframes/Shared';
import {ChainBanner, EndCard, Stamp, TitleCard} from './Cards';
import {EmailCard, StationScene, ValleyScene} from './Side';
import {TableWorld, type TCam, fmt, trainAt} from './Table';
import {type Film, type Fixture, type ForkGeo, type Span, type VoLine, ROUTE, buildFilm, buildRoute, easeIn, easeInOut, lerp, progress} from './timeline';

export const film = buildFilm(fixture as Fixture, (vo as {lines: VoLine[]}).lines);

const mixCam = (a: TCam, b: TCam, k: number): TCam => ({camX: lerp(a.camX, b.camX, k), f: lerp(a.f, b.f, k), H: lerp(a.H, b.H, k), horizon: lerp(a.horizon, b.horizon, k)});

const TableFrame: React.FC<{c: TCam; children: React.ReactNode}> = ({c, children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<PaperDefs />
		<Sky />
		<g transform={`translate(${-((c.camX * 0.02) % 400)} 0)`}>
			<HorizonHills y={c.horizon + 10} lighthouseX={1720} />
		</g>
		{children}
	</svg>
);

// Forks 0..5 on the honest-width route, then the camera pulls back for the chain rule.
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
			<TableFrame c={c}>
				<TableWorld film={film} f={f} c={c} route={main} trunkFrom={-4000} revealAt={revealAt} train={tr} showGauge={f >= S.thin.start && back < 0.5} glowCards={glow} />
			</TableFrame>
			<ChainBanner film={film} f={f} />
		</>
	);
};

// A single fork, re-drawn at a readable size, labelled with how much it has been magnified.
const MagnifiedFork: React.FC<{f: number; k: number; span: Span; context: string; pond?: boolean}> = ({f, k, span, context, pond}) => {
	const geo: ForkGeo = {...buildRoute([film.fx.steps[k]])[0], k};
	const real = film.route[k];
	const ft = film.forkTimes.find((x) => x.k === k)!;
	const {WAIT, BRANCH, Zc} = ROUTE;
	const enter = easeInOut(progress(f, span.start, span.start + 30));
	let X = lerp(geo.x - WAIT - 500, geo.x - WAIT, enter);
	if (f >= ft.go) X = lerp(geo.x - WAIT, geo.x + BRANCH + (pond ? 900 : 500), easeIn(progress(f, ft.go, ft.arrive), 1.6));
	const Z = X > geo.x ? lerp(geo.chosen.z0 + geo.chosen.w / 2, Zc, Math.min(1, (X - geo.x) / BRANCH) ** 2 * (3 - 2 * Math.min(1, (X - geo.x) / BRANCH))) : Zc;
	const cum = f >= ft.land ? real.cumAfter : real.cumBefore;
	const c: TCam = {camX: lerp(geo.x - 100, X + 500, progress(f, ft.go, ft.arrive)), f: 1250, H: 1000, horizon: 110};
	const mag = Math.round(1 / real.cumBefore);
	const tagK = easeInOut(progress(f, span.start + 6, span.start + 20));
	return (
		<>
			<TableFrame c={c}>
				<TableWorld film={film} f={f} c={c} route={[geo]} trunkFrom={-3000} revealAt={() => span.start + 14} train={{X, Z, cum}} showGauge pond={pond} contextCard={context} />
			</TableFrame>
			<div style={{position: 'absolute', left: 90, top: 70, opacity: tagK, transform: `rotate(-2deg) translateY(${(1 - tagK) * -20}px)`, background: P.card, padding: '10px 22px', boxShadow: '6px 10px 20px rgba(58,42,24,0.3)', fontFamily: SERIF, color: P.ink}}>
				<div style={{fontStyle: 'italic', fontSize: 26}}>magnified {mag.toLocaleString('en-US')}×</div>
				<div style={{fontSize: 16, letterSpacing: 3, color: '#8A7B66', marginTop: 2}}>THE TRACK HERE IS {fmt(real.cumBefore)} WIDE</div>
			</div>
		</>
	);
};

const Station: React.FC<{f: number}> = ({f}) => (
	<>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			<PaperDefs />
			<Sky />
			<StationScene film={film} f={f} />
		</svg>
		<EmailCard film={film} f={f} />
	</>
);

const Valley: React.FC<{f: number}> = ({f}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<PaperDefs />
		<Sky />
		<ValleyScene film={film} f={f} />
	</svg>
);

type Scene = {span: Span; render: (f: number) => React.ReactNode; zoomOut?: boolean};

export const TrackLayerPaper: React.FC = () => {
	const f = useCurrentFrame();
	const {S, XF, cues} = film;
	const scenes: Scene[] = [
		{span: S.title, render: (x) => <TitleCard f={x} />},
		{span: {start: S.letter.start, end: S.gab.end}, render: (x) => <Station f={x} />},
		{span: {start: S.fork.start, end: S.chain.end}, render: (x) => <MainTable f={x} />, zoomOut: true},
		{span: S.marble, render: (x) => <MagnifiedFork f={x} k={6} span={S.marble} context="… this email looks" />, zoomOut: true},
		{span: S.lean, render: (x) => <MagnifiedFork f={x} k={7} span={S.lean} context="… looks totally" pond />},
		{span: {start: S.derail.start, end: S.close.end}, render: (x) => <Valley f={x} />},
		{span: S.endcard, render: (x) => <EndCard film={film} f={x} />},
	];
	const line = film.vo.find((l) => f >= cues[l.id].start - 2 && f < cues[l.id].end + 8);
	return (
		<AbsoluteFill style={{background: P.skyMid}}>
			{scenes.map((sc, i) => {
				if (f < sc.span.start || f >= sc.span.end + XF) return null;
				const fadeIn = i === 0 ? 1 : progress(f, sc.span.start, sc.span.start + XF);
				const out = sc.zoomOut ? progress(f, sc.span.end - 10, sc.span.end + XF) : 0;
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn, transform: out ? `scale(${1 + 2.2 * easeIn(out, 2)})` : undefined, transformOrigin: '42% 70%', filter: out ? `blur(${10 * out}px)` : undefined}}>
						{sc.render(f)}
					</AbsoluteFill>
				);
			})}
			{line ? <Subtitle text={line.text} /> : null}
			<Grain id="filmGrain" opacity={0.14} freq={0.6} seed={(f % 7) + 1} />
			{film.fx.status !== 'measured' && f < S.endcard.start ? <Stamp /> : null}
			<Audio src={staticFile('audio/paper-track.wav')} />
		</AbsoluteFill>
	);
};

export type {Film};
