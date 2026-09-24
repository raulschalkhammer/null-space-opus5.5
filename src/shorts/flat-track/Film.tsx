import React from 'react';
import katex from 'katex';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FONT, FlatDefs, FlatLighthouse, FlatLoco, FlatSubtitle, Hills, K, Motes, Stars} from '../../flat/kit';
import {Grain} from '../../styleframes/Shared';
import {film} from '../paper-track/Film';
import {type TCam, fmt, trainAt} from '../paper-track/Table';
import {type ForkGeo, type Span, ROUTE, buildRoute, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {FlatEmailCard, FlatStation, FlatValley} from './Side';
import {FlatTableWorld} from './Table';

// Flat-vector cut of "Track Layer". Same narration, timing and math as the paper cut; new look.
const tex = (s: string) => katex.renderToString(s, {throwOnError: false, output: 'html'});
const mixCam = (a: TCam, b: TCam, k: number): TCam => ({camX: lerp(a.camX, b.camX, k), f: lerp(a.f, b.f, k), H: lerp(a.H, b.H, k), horizon: lerp(a.horizon, b.horizon, k)});

const Frame: React.FC<{f: number; horizon: number; shift?: number; children: React.ReactNode}> = ({f, horizon, shift = 0, children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<FlatDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<g transform={`translate(0 ${horizon - 560})`}>
			<Stars f={f} maxY={520} />
		</g>
		<Hills y={horizon + 12} shift={shift * 0.1} />
		<g transform={`translate(${1700 - (shift % 1400) * 0.05} ${horizon - 30}) scale(0.36)`}>
			<FlatLighthouse on={0.5} />
		</g>
		{children}
		<Motes f={f} />
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
			<div style={{position: 'absolute', left: 80, top: 170, opacity: tagK, transform: `translateX(${(1 - tagK) * -40}px)`, display: 'flex', alignItems: 'center', gap: 16, background: K.navy, borderRadius: 40, padding: '12px 28px 12px 14px', boxShadow: '0 12px 30px rgba(5,8,32,0.5)', fontFamily: FONT}}>
				<div style={{width: 52, height: 52, borderRadius: 26, background: K.teal, color: K.ink, fontWeight: 900, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>×</div>
				<div>
					<div style={{fontWeight: 900, fontSize: 30, color: K.white}}>ZOOMED IN {Math.round(1 / real.cumBefore).toLocaleString('en-US')}×</div>
					<div style={{fontWeight: 700, fontSize: 18, color: K.mute}}>the real track here is only {fmt(real.cumBefore)} wide</div>
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
	const shown = Math.floor(progress(f, a + 10, a + 10 + n * 8) * n + 0.001);
	const eqK = easeOut(progress(f, cues.L06.start + 10, cues.L06.start + 28), 2);
	const nameK = easeOut(progress(f, cues.L06.start + 36, cues.L06.start + 50), 2);
	return (
		<div style={{position: 'absolute', left: 250, right: 250, top: 70, opacity: k, transform: `translateY(${(1 - k) * -30}px) scale(${0.96 + 0.04 * k})`, background: K.navy, borderRadius: 44, padding: '26px 40px 30px', boxShadow: '0 24px 50px rgba(5,8,32,0.55)', textAlign: 'center', fontFamily: FONT, color: K.white}}>
			<div style={{fontWeight: 800, fontSize: 22, letterSpacing: 2, color: K.mute}}>THE CHANCE OF THE WHOLE SENTENCE</div>
			<div style={{fontWeight: 900, fontSize: 54, marginTop: 6, whiteSpace: 'nowrap'}}>
				{route.slice(0, n).map((g, i) => (
					<span key={i} style={{opacity: i < shown ? 1 : 0.15}}>
						{i ? <span style={{color: K.mute, fontWeight: 700}}> × </span> : null}
						{fmt(g.chosen.p)}
					</span>
				))}
				<span style={{opacity: shown >= n ? 1 : 0.15}}>
					<span style={{color: K.mute, fontWeight: 700}}> = </span>
					<span style={{color: K.orangeHi}}>{fmt(route[n - 1].cumAfter)}</span>
				</span>
			</div>
			<div style={{height: 4, borderRadius: 2, background: K.indigoHi, margin: '20px 80px 16px', opacity: eqK}} />
			<div style={{opacity: eqK, fontSize: 46, color: K.white}} dangerouslySetInnerHTML={{__html: tex('p(\\text{sentence}) = \\prod_{t} \\, p\\big(\\,\\text{word}_t \\mid \\text{words before it}\\,\\big)')}} />
			<div style={{opacity: nameK, marginTop: 14, display: 'inline-block', background: K.teal, color: K.ink, fontWeight: 900, fontSize: 20, letterSpacing: 3, padding: '6px 20px', borderRadius: 20}}>THE CHAIN RULE</div>
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
					<g transform={`translate(${next ? 520 : -300 + f * 9} 944) scale(0.6)`}>
						<FlatLoco look={1} />
					</g>
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
					Draft · word odds and Jev’s answer are illustrative placeholders · voice: Kokoro-82M · made with Remotion
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
		{span: S.title, render: (x) => <TitleCard f={x} />},
		{span: {start: S.letter.start, end: S.gab.end}, render: (x) => (
			<>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<FlatDefs />
					<FlatStation film={film} f={x} />
				</svg>
				<FlatEmailCard film={film} f={x} />
			</>
		)},
		{span: {start: S.fork.start, end: S.chain.end}, render: (x) => <MainTable f={x} />, zoomOut: true},
		{span: S.marble, render: (x) => <Magnified f={x} k={6} span={S.marble} context="… this email looks" />, zoomOut: true},
		{span: S.lean, render: (x) => <Magnified f={x} k={7} span={S.lean} context="… looks totally" pond />},
		{span: {start: S.derail.start, end: S.close.end}, render: (x) => (
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<FlatValley film={film} f={x} />
			</svg>
		)},
		{span: S.endcard, render: (x) => <TitleCard f={x - S.endcard.start} next />},
	];
	const line = film.vo.find((l) => f >= cues[l.id].start - 2 && f < cues[l.id].end + 8);
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
			{line ? <FlatSubtitle text={line.text} /> : null}
			<Grain id="flatGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{film.fx.status !== 'measured' && f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={staticFile('audio/flat-track.wav')} />
		</AbsoluteFill>
	);
};
