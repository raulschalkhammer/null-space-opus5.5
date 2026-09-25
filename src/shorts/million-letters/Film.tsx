import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import {FONT, K, LAMP_Y, Vignette} from '../../flat/kit';
import {Harbor} from '../../flat/harbor';
import {Equation} from '../../flat/math';
import {Grain} from '../../styleframes/Shared';
import vo from '../../../fixtures/million-letters-vo.json';
import type {VoLine} from '../paper-track/timeline';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {A, Balance, LampHead, Coin, CoinStack, Customer, Env, EnvelopeOpen, Gauge, Grid10, LetterBig, Mailroom, MailroomDefs, Panel, Reviewer, RopeLine, RED, Say, Stage, T, cam, pop, zoomTo} from './parts';
import {BankShot, CITY_BANK, BANK, CityShot, DeskShot, HOME, PlanetShot, TARGET} from './Zoom';
import {GUESS_PAUSE, MILLION, buildMillion, lineFor} from './timeline';

export const million = buildMillion((vo as {lines: VoLine[]}).lines);
const {S, cues, at} = million;
const W = 1920;

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		{children}
	</svg>
);
const fade = (f: number, a: number, len = 8) => easeInOut(progress(f, a, a + len));

// ---------- the dune: how sure Jev is about each of a million letters (600 grains, illustrative) ----------
const BELOW = [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8, 10, 13, 15, 18]; // bins 0.500 .. 0.900 (102 grains = 17%)
const ABOVE = [70, 110, 148, 170]; // bins 0.900 .. 1.000 (498 grains)
const BINS = [...BELOW, ...ABOVE];
const DUNE = {x0: 250, x1: 1530, base: 858, r: 3.6, pitch: 8, per: 7};
const binW = (DUNE.x1 - DUNE.x0) / BINS.length;
const xOfP = (p: number) => DUNE.x0 + ((p - 0.5) / 0.5) * (DUNE.x1 - DUNE.x0);
type GrainPos = {x: number; y: number; bin: number; order: number};
const GRAINS: GrainPos[] = (() => {
	const out: GrainPos[] = [];
	BINS.forEach((n, b) => {
		for (let i = 0; i < n; i++) {
			const col = i % DUNE.per;
			const row = Math.floor(i / DUNE.per);
			out.push({x: DUNE.x0 + b * binW + 8 + col * DUNE.pitch + (row % 2) * 3, y: DUNE.base - 4 - row * DUNE.pitch, bin: b, order: 0});
		}
	});
	// pour order: shuffled, deterministic
	let s = 17;
	const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
	const keys = out.map(() => r());
	const idx = out.map((_, i) => i).sort((a, b) => keys[a] - keys[b]);
	idx.forEach((gi, k) => (out[gi].order = k / out.length));
	return out;
})();
const Dune: React.FC<{f: number; pour: number; tide: number; drift: number; fall?: number}> = ({f, pour, tide, drift, fall = 0}) => {
	const x09 = xOfP(0.9);
	return (
		<g>
			{/* the beach */}
			<path d={`M -60 ${DUNE.base - 30} Q 800 ${DUNE.base - 60} 1980 ${DUNE.base - 20} L 1980 1140 L -60 1140 Z`} fill="#3A3A7E" />
			<path d={`M -60 ${DUNE.base - 30} Q 800 ${DUNE.base - 60} 1980 ${DUNE.base - 20}`} fill="none" stroke="#5A5AAE" strokeWidth={6} />
			{/* the reviewers' pier, left */}
			<g transform="translate(70 600)">
				{[20, 90, 160].map((x) => (
					<rect key={x} x={x} y={100} width={12} height={180} fill="#2A2238" />
				))}
				<rect x={0} y={90} width={200} height={16} fill="#3A2E4A" />
				<rect x={30} y={10} width={140} height={80} fill={A.wallTop} />
				<path d="M 20 12 L 100 -30 L 180 12 Z" fill={A.brick} />
				<rect x={60} y={34} width={30} height={30} rx={4} fill={A.lamp} opacity={0.9} />
				<rect x={110} y={34} width={30} height={30} rx={4} fill={A.lamp} opacity={0.9} />
				<circle cx={100} cy={50} r={90} fill={A.lamp} opacity={0.12} filter="url(#glowBig)" />
			</g>
			{/* grains */}
			{GRAINS.map((g, i) => {
				if (g.order > pour) return null;
				const below = g.bin < BELOW.length;
				const u = clamp01((pour - g.order) * 40);
				const y = lerp(g.y - 140, g.y, easeIn(u, 2));
				// grains below the line lift away toward the pier
				if (below && drift > 0) {
					const d = clamp01(drift * 1.4 - ((i * 37) % 100) / 250);
					if (d >= 1) return null;
					const x = lerp(g.x, 180, easeInOut(d));
					const yy = lerp(y, 640, easeInOut(d)) - 60 * Math.sin(Math.PI * d);
					return d > 0 ? <Env key={i} x={x} y={yy} s={0.18} r={10 * Math.sin(f * 0.1 + i)} /> : <circle key={i} cx={g.x} cy={y} r={DUNE.r} fill={K.yellow} />;
				}
				// a broken promise: some grains above the line fall back over it
				if (!below && fall > 0 && i % 9 === 0) {
					const d = clamp01(fall * 1.3 - ((i * 13) % 100) / 300);
					const x = lerp(g.x, x09 - 40 - ((i * 29) % 260), easeInOut(d));
					const yy = lerp(y, DUNE.base - 6, easeIn(d, 2)) - 90 * Math.sin(Math.PI * d);
					return <circle key={i} cx={x} cy={yy} r={DUNE.r} fill={d > 0.5 ? RED : K.orange} />;
				}
				return <circle key={i} cx={g.x} cy={y} r={DUNE.r} fill={below ? K.yellow : K.orange} opacity={u} />;
			})}
			{/* the tide: water rises over everything below 0.9 */}
			{tide > 0
				? (() => {
						const ty = DUNE.base - 50 * easeOut(tide, 2);
						const wave = Array.from({length: 30}, (_, i) => {
							const x = -60 + ((x09 + 60) * i) / 29;
							return `${x} ${ty + 5 * Math.sin(i * 1.3 + f * 0.15)}`;
						}).join(' L ');
						return (
							<>
								<path d={`M ${wave} L ${x09} 1140 L -60 1140 Z`} fill={K.cyan} opacity={0.2} />
								<path d={`M ${wave}`} fill="none" stroke={K.cyan} strokeWidth={4} opacity={0.7} />
							</>
						);
					})()
				: null}
			{/* axis */}
			{[0.5, 0.9, 1].map((p) => (
				<text key={p} x={xOfP(p)} y={DUNE.base + 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={p === 0.9 ? K.teal : K.mute}>
					{p === 1 ? '1.0' : p.toFixed(1)}
				</text>
			))}
		</g>
	);
};

// ---------- 0. title ----------
const Card: React.FC<{f: number; next?: boolean}> = ({f, next}) => {
	const t = easeOut(progress(f, next ? 10 : 14, next ? 30 : 40), 2);
	return (
		<AbsoluteFill>
			<Svg>
				<CityShot f={f + 400} train={0} />
			</Svg>
			<div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
				{next ? (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK</div>
						<div style={{fontWeight: 800, fontSize: 40, color: K.mute, marginTop: 40}}>next time</div>
						<div style={{fontWeight: 900, fontSize: 120, color: K.white, lineHeight: 1}}>The Signal Box</div>
					</>
				) : (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK · Nº 3</div>
						<div style={{fontWeight: 900, fontSize: 160, color: K.white, lineHeight: 1.05}}>A Million Letters</div>
					</>
				)}
			</div>
			{next ? (
				<div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 18, color: K.mute, opacity: t}}>
					Draft · illustrative numbers · Resemble AI · Remotion
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 1. zoom out: one letter, a window, a bank, a city, the planet ----------
const zs1 = () => at('M01', 0.78);
const zs2 = () => at('M03', 0.3);
const zs3 = () => at('M04', 0.02);
const BANK_MID: [number, number] = [CITY_BANK.x, CITY_BANK.y - (BANK.base - (BANK.top + BANK.base) / 2) * CITY_BANK.s];
const ZoomScene: React.FC<{f: number}> = ({f}) => {
	const s1 = zs1();
	const s2 = zs2();
	const s3 = zs3();
	const desk = 1 - fade(f, s1 - 4, 10);
	const bank = fade(f, s1 - 4, 10) * (1 - fade(f, s2 - 4, 10));
	const city = fade(f, s2 - 4, 10) * (1 - fade(f, s3 - 4, 10));
	const planet = fade(f, s3 - 4, 10);
	const deskScale = lerp(1, 0.14, easeIn(progress(f, s1 - 10, s1 + 6), 2)) * lerp(1, 1.06, progress(f, S.zoom.start, s1));
	return (
		<AbsoluteFill>
			<Svg>
				{desk > 0 ? (
					<g opacity={desk} transform={`translate(960 540) scale(${deskScale}) translate(-960 -600)`}>
						<DeskShot f={f} sweep={progress(f, at('M01', 0.3), at('M01', 0.5))} flash={Math.max(0, 1 - Math.abs(f - at('M01', 0.42)) / 5)} />
					</g>
				) : null}
				{bank > 0 ? (
					<g opacity={bank} transform={zoomTo(easeInOut(progress(f, s1 - 10, s2 - 10)), 7.3, 1, [TARGET[0], TARGET[1]], [960, 560])}>
						<BankShot f={f} />
					</g>
				) : null}
				{city > 0 ? (
					<g opacity={city} transform={zoomTo(easeInOut(progress(f, s2 - 6, s3 - 6)), 4.6, 1, BANK_MID, [960, 540])}>
						<CityShot f={f} train={progress(f, s2 + 6, s3 + 10)} />
					</g>
				) : null}
				{planet > 0 ? (
					<g opacity={planet} transform={zoomTo(easeOut(progress(f, s3 - 6, S.zoom.end), 2), 7, 1, [HOME[0], HOME[1]], [960, 560])}>
						<PlanetShot f={f} arcs={progress(f, at('M04', 0.2), at('M04', 0.95))} />
					</g>
				) : null}
			</Svg>
			<div style={{opacity: desk}}>
				<Say x={300} y={150} k={pop(f, at('M01', 0.05))} text="1" size={160} color={A.lamp} />
			</div>
			<div style={{opacity: city * (1 - fade(f, s3 + 10, 10))}}>
				<Say x={960} y={110} k={pop(f, at('M03', 0.78))} text="1,000,000" size={120} color={A.lamp} />
				<Say x={960} y={250} k={pop(f, at('M03', 0.9))} text="a day" size={44} color={K.white} />
			</div>
		</AbsoluteFill>
	);
};

// ---------- 2. the puzzle ----------
const HEAP = (() => {
	let s = 5;
	const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
	return Array.from({length: 240}, (_, i) => {
		const h = Math.sqrt(r());
		const y = 880 - 520 * (1 - h) - 10;
		const half = 520 * h;
		return {x: 1120 + (r() * 2 - 1) * half, y, r: r() * 70 - 35, t: r() < 0.2 ? A.paperLo : A.paper, i};
	}).sort((a, b) => a.y - b.y);
})();
const PuzzleScene: React.FC<{f: number}> = ({f}) => {
	const cut = at('M05', 0.4);
	const pickStart = cues.M05.end;
	const inPause = f >= pickStart && f < pickStart + GUESS_PAUSE;
	const count = Math.floor(progress(f, pickStart, pickStart + GUESS_PAUSE) * 3);
	if (f < cut) {
		const push = lerp(1, 1.07, progress(f, S.puzzle.start, cut));
		return (
			<AbsoluteFill>
				<Svg>
					<g transform={`translate(960 540) scale(${push}) translate(-960 -540)`}>
						<Mailroom f={f} holes={false} lamps={[380, 1560]}>
							{HEAP.map((e) => (
								<Env key={e.i} x={e.x} y={e.y} s={0.9} r={e.r} tint={e.t} />
							))}
							{/* a chute keeps pouring */}
							<rect x={1080} y={-20} width={80} height={200} fill={A.brassLo} />
							{Array.from({length: 4}, (_, i) => {
								const u = (f * 0.05 + i / 4) % 1;
								return <Env key={i} x={1120 + 20 * Math.sin(i * 3 + f * 0.1)} y={lerp(180, 360, u)} s={0.9} r={f * 3 + i * 90} />;
							})}
							<Reviewer x={440} y={880} s={0.8} f={f} look={1} desk={false} />
						</Mailroom>
					</g>
				</Svg>
				<Say x={440} y={140} k={pop(f, S.puzzle.start + 10)} text="1,000,000" size={96} color={A.lamp} />
			</AbsoluteFill>
		);
	}
	// concept stage: one person, a dial from none to all
	const needle = 0.5 + 0.45 * Math.sin((f - cut) * 0.07) * (inPause ? 1 : 0.6);
	const ang = Math.PI * (1 - needle);
	return (
		<AbsoluteFill>
			<Svg>
				<Stage f={f} y={900} w={460}>
					<Reviewer x={960} y={900} s={0.9} f={f} look={0} desk={false} />
					<g transform="translate(960 560)">
						<path d="M -330 0 A 330 330 0 0 1 330 0" fill="none" stroke={T.tileTop} strokeWidth={34} strokeLinecap="round" />
						<path d="M -330 0 A 330 330 0 0 1 330 0" fill="none" stroke={T.glow} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
						{Array.from({length: 11}, (_, i) => {
							const a = Math.PI * (1 - i / 10);
							return <line key={i} x1={Math.cos(a) * 300} y1={-Math.sin(a) * 300} x2={Math.cos(a) * 270} y2={-Math.sin(a) * 270} stroke={T.text} strokeWidth={i % 5 ? 3 : 6} opacity={0.7} />;
						})}
						<line x1={0} y1={0} x2={Math.cos(ang) * 280} y2={-Math.sin(ang) * 280} stroke={K.orange} strokeWidth={10} strokeLinecap="round" />
						<circle r={18} fill={K.orange} />
						<text x={-330} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={T.text}>0</text>
						<text x={330} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={T.text}>1,000,000</text>
					</g>
				</Stage>
			</Svg>
			<Say x={960} y={330} k={pop(f, cut + 4)} text="?" size={120} color={T.text} />
			{inPause ? (
				<>
					<div style={{position: 'absolute', left: 1480, top: 470}}>
						<svg width={170} height={170} viewBox="-85 -85 170 170">
							<circle r={70} fill="none" stroke={T.tile} strokeWidth={12} />
							<circle r={70} fill="none" stroke={T.glow} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${440 * (1 - progress(f, pickStart, pickStart + GUESS_PAUSE))} 460`} transform="rotate(-90)" />
							<text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={T.text}>
								{Math.max(1, 3 - count)}
							</text>
						</svg>
					</div>
					<Say x={1565} y={680} k={pop(f, pickStart)} text="GUESS" size={48} color={T.glow} spacing={6} />
				</>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 3. two naive answers, in split panels ----------
const ALL_ROWS = 7;
const AllWorld: React.FC<{f: number; fill: number; coins: number}> = ({f, fill, coins}) => {
	const desks: React.ReactNode[] = [];
	let n = 0;
	const total = ALL_ROWS * 9;
	for (let r = ALL_ROWS - 1; r >= 0; r--) {
		const s = lerp(0.9, 0.22, r / (ALL_ROWS - 1));
		const y = lerp(1000, 520, Math.pow(r / (ALL_ROWS - 1), 0.8));
		const count = 5 + r * 2;
		for (let c = 0; c < count; c++) {
			const x = 960 + (c - (count - 1) / 2) * 250 * s;
			const order = (ALL_ROWS - 1 - r) * 9 + (c % 9);
			if (order / total <= fill) desks.push(<Reviewer key={`${r}-${c}`} x={x} y={y} s={s} f={f} seed={r * 11 + c} look={(c % 3) - 1} />);
			n++;
		}
	}
	return (
		<Mailroom f={f} holes={false} lamps={[520, 1400]} floor={500}>
			{desks}
			<g opacity={coins > 0 ? 1 : 0}>
				<CoinStack x={1320} y={980} n={coins * 22} w={90} />
				<CoinStack x={1430} y={990} n={coins * 16} w={90} />
				<CoinStack x={1230} y={1000} n={coins * 12} w={90} />
			</g>
		</Mailroom>
	);
};
const NoneWorld: React.FC<{f: number; rush: number}> = ({f, rush}) => (
	<Harbor f={f} lamp={1} lx={1250} moon={[700, 140]}>
		<g transform={`translate(1250 ${604 + LAMP_Y * 1.3}) rotate(${190 + 6 * Math.sin(f * 0.3)})`} style={{mixBlendMode: 'screen'}}>
			<path d="M 0 -14 L 800 -200 L 800 200 L 0 14 Z" fill="url(#gBeam)" />
		</g>
		{Array.from({length: 18}, (_, i) => {
			const u = ((f * (0.035 + (i % 4) * 0.01) + i / 18) % 1) * rush;
			if (u <= 0.02) return null;
			return <Env key={i} x={lerp(400, 1180, u)} y={440 + ((i * 53) % 220) - 120 * u} s={0.5 * (1 - u * 0.6)} r={20 * Math.sin(i)} opacity={1 - u * 0.6} />;
		})}
	</Harbor>
);
const NaiveScene: React.FC<{f: number}> = ({f}) => {
	const gridIn = cues.M09.start - 4;
	const fieldIn = cues.M10.start;
	const chuteIn = at('M10', 0.42);
	if (f < gridIn) {
		const split = easeInOut(progress(f, cues.M08.start - 6, cues.M08.start + 10));
		const lw = lerp(1920, 954, split);
		const fill = easeOut(progress(f, cues.M06.start + 6, at('M07', 0.6)), 1.5);
		const coins = easeOut(progress(f, at('M07', 0.7), cues.M07.end), 2);
		return (
			<AbsoluteFill>
				<Svg>
					<Panel id="pAll" x={0} w={lw} dim={0.35 * split}>
						<AllWorld f={f} fill={fill} coins={coins} />
					</Panel>
					{split > 0 ? (
						<Panel id="pNone" x={lw + 12} w={1920 - lw - 12}>
							<NoneWorld f={f} rush={progress(f, at('M08', 0.4), at('M08', 0.6))} />
						</Panel>
					) : null}
				</Svg>
				<Say x={lw / 2} y={70} k={pop(f, cues.M06.start + 20)} text="all" size={80} color={A.lamp} />
				<div style={{opacity: 1 - split}}>
					<Say x={960} y={180} k={pop(f, at('M07', 0.45))} text="≈ 6,000" size={96} color={K.white} />
					<Say x={960} y={290} k={pop(f, at('M07', 0.55))} text="people" size={44} color={A.lamp} />
				</div>
				{split > 0 ? <Say x={lw + 12 + (1920 - lw - 12) / 2} y={70} k={pop(f, at('M08', 0.1))} text="none" size={80} color={K.cyan} /> : null}
			</AbsoluteFill>
		);
	}
	if (f < fieldIn) {
		// concept stage: 91 right, 9 wrong
		return (
			<AbsoluteFill>
				<Svg>
					<Stage f={f} y={930} w={640}>
						<Grid10 x={960 - 250} y={300} cell={52} k={progress(f, gridIn, gridIn + 20)} lit={91} red={9} redK={progress(f, at('M09', 0.62), at('M09', 0.9))} />
					</Stage>
				</Svg>
				<Say x={470} y={420} k={pop(f, at('M09', 0.25))} text="91%" size={96} color={K.orange} />
				<Say x={1450} y={420} k={pop(f, at('M09', 0.8))} text="9" size={120} color={RED} />
			</AbsoluteFill>
		);
	}
	if (f < chuteIn) {
		// the same grid, tiled out to a million
		const z = Math.exp(lerp(0, Math.log(0.16), easeIn(progress(f, fieldIn, chuteIn), 1.6)));
		return (
			<AbsoluteFill>
				<Svg>
					<defs>
						<pattern id="pField" width={520} height={520} patternUnits="userSpaceOnUse" x={710} y={300}>
							{Array.from({length: 100}, (_, i) => (
								<rect key={i} x={(i % 10) * 52} y={Math.floor(i / 10) * 52} width={44} height={44} rx={8} fill={[3, 17, 29, 42, 55, 61, 78, 86, 94].includes(i) ? RED : K.orange} />
							))}
						</pattern>
					</defs>
					<rect x={-60} y={-60} width={2040} height={1200} fill={T.void} />
					<g transform={cam(960, 560, z)}>
						<rect x={710 - 520 * 20} y={300 - 520 * 20} width={520 * 41} height={520 * 41} fill="url(#pField)" />
					</g>
				</Svg>
			</AbsoluteFill>
		);
	}
	// the chute: ninety thousand wrong letters a day
	const pile = easeOut(progress(f, chuteIn, cues.M10.end + 10), 1.4);
	return (
		<AbsoluteFill>
			<Svg>
				<Mailroom f={f} holes={false} lamps={[500, 1420]}>
					<path d="M 1500 -40 L 1600 -40 L 1180 520 L 1060 520 Z" fill={A.brassLo} />
					<path d="M 1520 -40 L 1580 -40 L 1170 500 L 1080 500 Z" fill={A.brass} />
					<path d={`M 960 ${880 - 330 * pile} Q 700 ${880 - 60 * pile} ${960 - 520 * pile} 880 L ${960 + 520 * pile} 880 Q 1220 ${880 - 60 * pile} 960 ${880 - 330 * pile} Z`} fill="#8E2433" />
					{Array.from({length: Math.round(90 * pile)}, (_, i) => {
						const h = ((i * 37) % 100) / 100;
						return <Env key={i} x={960 + (((i * 53) % 100) / 50 - 1) * 480 * pile * (1 - h * 0.8)} y={880 - 300 * pile * h - 14} s={0.7} r={((i * 29) % 70) - 35} red />;
					})}
					{Array.from({length: 7}, (_, i) => {
						const u = (f * 0.06 + i / 7) % 1;
						return <Env key={`c${i}`} x={lerp(1150, 980, u)} y={lerp(500, 880 - 300 * pile, u * u)} s={0.8} r={f * 4 + i * 50} red />;
					})}
				</Mailroom>
			</Svg>
			<Say x={560} y={330} k={pop(f, at('M10', 0.62))} text="90,000" size={140} color={RED} />
			<Say x={560} y={490} k={pop(f, at('M10', 0.8))} text="a day" size={48} color={K.white} />
		</AbsoluteFill>
	);
};

// ---------- 4. every mistake has a price ----------
const PriceScene: React.FC<{f: number}> = ({f}) => {
	const st = S.price.start;
	const wideA = st + 14;
	const hands = at('M12', 0.08);
	const coinEcu = at('M12', 0.68);
	const wideB = at('M13', 0.05);
	const v1 = at('M13', 0.3);
	const v2 = at('M13', 0.45);
	const v3 = at('M13', 0.6);
	const wideC = at('M13', 0.8);
	const drop2 = at('M13', 0.9);
	const two = f >= at('M12', 0.78);
	const twenty = f >= drop2;
	const tilt = twenty ? lerp(-0.45, 0.85, easeOut(progress(f, drop2, drop2 + 14), 2)) : two ? -0.45 * easeOut(progress(f, at('M12', 0.78), at('M12', 0.78) + 12), 2) : 0.04 * Math.sin(f * 0.1);
	const coinY = (t: number) => lerp(-400, 0, easeIn(progress(f, t - 10, t), 2)) - 20 * Math.abs(Math.sin(progress(f, t, t + 12) * Math.PI)) * (1 - progress(f, t, t + 12));
	const scaleShot = (labels: boolean) => (
		<Svg>
			<Mailroom f={f} lamps={[600, 1320]}>
				<rect x={360} y={800} width={1200} height={40} rx={10} fill="url(#gDesk)" />
				<Balance x={960} y={380} tilt={tilt} labels={['review', 'mistake']} labelK={labels ? 1 : 0} left={two ? <Coin x={0} y={-40 + (f < at('M12', 0.9) ? coinY(at('M12', 0.78)) : 0)} s={0.9} label="€2" /> : null} right={twenty ? <Coin x={0} y={-40 + coinY(drop2)} s={1.25} label="€20" /> : null} />
			</Mailroom>
		</Svg>
	);
	if (f < wideA) {
		// the two panels slam together
		const k = easeIn(progress(f, st, wideA), 2);
		return (
			<AbsoluteFill>
				<Svg>
					<rect x={-60} y={-60} width={2040} height={1200} fill="#05060F" />
					<Panel id="slamL" x={lerp(-480, 0, k)} w={960}>
						<AllWorld f={f} fill={1} coins={1} />
					</Panel>
					<Panel id="slamR" x={lerp(1440, 960, k)} w={960}>
						<NoneWorld f={f} rush={1} />
					</Panel>
					<rect x={-60} y={-60} width={2040} height={1200} fill="#FFF1C0" opacity={Math.max(0, (k - 0.85) / 0.15) * 0.8} />
				</Svg>
			</AbsoluteFill>
		);
	}
	if (f < hands) {
		return (
			<AbsoluteFill>
				{scaleShot(false)}
				<Say x={960} y={70} k={pop(f, at('M11', 0.8))} text="cost" size={88} color={A.lamp} />
			</AbsoluteFill>
		);
	}
	if (f < coinEcu) {
		return (
			<AbsoluteFill>
				<Svg>
					<MailroomDefs />
					<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
					<circle cx={1250} cy={260} r={640} fill="url(#gAmberLamp)" />
					{/* the reviewer at the desk, watching a letter open */}
					<Reviewer x={560} y={790} s={2.6} f={f} look={1} desk={false} />
					<rect x={-60} y={700} width={2040} height={500} fill="url(#gDesk)" />
					<rect x={-60} y={700} width={2040} height={14} fill={A.woodHi} />
					<EnvelopeOpen x={1240} y={820} s={1.15} open={easeInOut(progress(f, hands + 4, coinEcu - 4))} />
					<Vignette />
				</Svg>
			</AbsoluteFill>
		);
	}
	if (f < wideB) {
		// extreme close-up: the coin lands in the pan
		const t = at('M12', 0.78);
		return (
			<AbsoluteFill>
				<Svg>
					<g transform={cam(660, 610, 2.3)}>
						<Mailroom f={f} lamps={[600, 1320]}>
							<Balance x={960} y={380} tilt={-0.45 * easeOut(progress(f, t, t + 12), 2)} left={f >= t - 10 ? <Coin x={0} y={-40 + coinY(t)} s={0.9} label="€2" /> : null} />
						</Mailroom>
					</g>
				</Svg>
			</AbsoluteFill>
		);
	}
	if (f < v1 || f >= wideC) return <AbsoluteFill>{scaleShot(f >= wideC)}</AbsoluteFill>;
	if (f < v2) {
		// vignette 1: a fraud report filed under billing
		const k = easeInOut(progress(f, v1 + 2, v2 - 4));
		return (
			<AbsoluteFill>
				<Svg>
					<Mailroom f={f} holes={false} lamps={[960]}>
						<rect x={430} y={560} width={1060} height={300} rx={20} fill={A.brass} />
						<rect x={440} y={570} width={1040} height={280} rx={16} fill="#5A3E3A" />
						{['billing', 'fraud'].map((t, i) => (
							<g key={t}>
								<rect x={560 + i * 480} y={640} width={320} height={44} rx={10} fill="#1A1020" />
								<rect x={600 + i * 480} y={720} width={240} height={60} rx={10} fill={A.brass} />
								<text x={720 + i * 480} y={763} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={A.ink}>{t}</text>
							</g>
						))}
						<Env x={lerp(1200, 720, k)} y={lerp(380, 640, easeIn(k, 2))} s={2} r={lerp(-10, 0, k)} red />
						{k > 0.9 ? <path d="M 660 590 L 780 700 M 780 590 L 660 700" stroke={RED} strokeWidth={20} strokeLinecap="round" /> : null}
					</Mailroom>
				</Svg>
			</AbsoluteFill>
		);
	}
	if (f < v3) {
		// vignette 2: a frozen card
		const slam = easeIn(progress(f, v2, v2 + 5), 2);
		return (
			<AbsoluteFill>
				<Svg>
					<MailroomDefs />
					<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
					<circle cx={960} cy={540} r={520} fill="url(#gAmberLamp)" />
					<g transform={`translate(960 560) rotate(-6) scale(${1 + 0.04 * (1 - slam)})`}>
						<rect x={-340} y={-210} width={680} height={420} rx={36} fill="#3D5A96" />
						<rect x={-340} y={-130} width={680} height={70} fill="#233A6E" />
						<rect x={-270} y={-20} width={110} height={80} rx={12} fill={A.brass} />
						{[0, 1, 2, 3].map((i) => (
							<rect key={i} x={-270 + i * 130} y={110} width={100} height={20} rx={10} fill="#9FB4E6" />
						))}
					</g>
					<g transform={`translate(1100 ${lerp(220, 600, slam)})`}>
						<path d="M -70 -30 L -70 -90 Q -70 -150 0 -150 Q 70 -150 70 -90 L 70 -30" fill="none" stroke="#C8CBD8" strokeWidth={26} />
						<rect x={-110} y={-40} width={220} height={180} rx={24} fill={RED} />
						<circle cx={0} cy={40} r={20} fill="#6B0F1F" />
					</g>
					<Vignette />
				</Svg>
			</AbsoluteFill>
		);
	}
	// vignette 3: an angry customer
	return (
		<AbsoluteFill>
			<Svg>
				<MailroomDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
				<circle cx={760} cy={620} r={480} fill="url(#gAmberLamp)" />
				<Customer x={760} y={700} s={2.4} f={f} />
				<g transform={`translate(1330 360) scale(${pop(f, v3 + 2, 8)})`}>
					<path d="M -260 -130 Q -260 -170 -220 -170 L 220 -170 Q 260 -170 260 -130 L 260 90 Q 260 130 220 130 L -80 130 L -180 210 L -150 130 L -220 130 Q -260 130 -260 90 Z" fill={RED} />
					<text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#FFFFFF">#@!</text>
				</g>
				<Vignette />
			</Svg>
		</AbsoluteFill>
	);
};

// ---------- 5. the math, in the mailroom ----------
const pAt = (f: number) => {
	const a = progress(f, at('M16', 0.5), at('M17', 0.2));
	const b = progress(f, at('M17', 0.3), at('M17', 0.7));
	const c = progress(f, at('M18', 0.3), at('M18', 0.7));
	return lerp(lerp(lerp(0.95, 0.95, a), 0.8, easeInOut(b)), 0.9, easeInOut(c));
};
const MathScene: React.FC<{f: number}> = ({f}) => {
	const wide = cues.M15.start;
	const insA = at('M15', 0.36);
	const insB = at('M15', 0.6);
	const rope = cues.M19.start;
	if (f < wide) {
		// close-up: one real letter under Jev's lamp, and the gauge that says how sure Jev is
		const push = lerp(1, 1.08, progress(f, S.math.start, wide));
		const scan = progress(f, S.math.start + 6, S.math.start + 26);
		const pNow = lerp(0.5, 0.95, easeOut(progress(f, at('M14', 0.45), at('M14', 0.85)), 3)) + 0.004 * Math.sin(f * 0.4);
		return (
			<AbsoluteFill>
				<Svg>
					<g transform={`translate(960 540) scale(${push}) translate(-960 -540)`}>
						<Mailroom f={f} holes={false} lamps={[]}>
							<path d="M 700 250 L 420 860 L 1140 860 L 860 250 Z" fill={A.lamp} opacity={0.18 * Math.min(1, scan * 3)} />
							<LampHead x={780} y={200} s={1.4} f={f} />
							<rect x={200} y={820} width={1540} height={40} rx={10} fill="url(#gDesk)" />
							<LetterBig x={780} y={640} s={1.3} r={-3} glow={scan > 0 && scan < 1 ? Math.sin(Math.PI * scan) : 0.2} />
							<Gauge x={1440} y={560} s={1.25} p={pNow} />
						</Mailroom>
					</g>
				</Svg>
				<Say x={1440} y={200} k={pop(f, at('M14', 0.55))} text="sure?" size={64} color={K.yellow} />
			</AbsoluteFill>
		);
	}
	if (f >= insA && f < insB) {
		// concept insert: one minus p
		return (
			<AbsoluteFill>
				<Svg>
					<Stage f={f} y={930} w={600}>
						<Grid10 x={960 - 240} y={330} cell={48} k={1} lit={90} red={10} redK={progress(f, insA, insA + 10)} />
					</Stage>
				</Svg>
				<div style={{position: 'absolute', left: 1330, top: 470}}>
					<Equation size={96} terms={[{tex: '1-p', k: pop(f, insA + 4), color: RED}]} />
				</div>
			</AbsoluteFill>
		);
	}
	if (f >= rope) {
		// the line, made physical: a rope on a brass gauge, raised to 0.9
		const v = lerp(0.5, 0.9, easeInOut(progress(f, at('M19', 0.02), at('M19', 0.28))));
		return (
			<AbsoluteFill>
				<Svg>
					<Mailroom f={f} lamps={[520, 1400]} holes={false}>
						<RopeLine x0={420} x1={1340} floor={900} v={v} f={f} crank={progress(f, at('M19', 0.02), at('M19', 0.28)) * 3} tags={[{at: 0.33, text: '€2', s: pop(f, at('M19', 0.7))}, {at: 0.62, text: '€20', s: pop(f, at('M19', 0.78))}]} />
					</Mailroom>
				</Svg>
				<Say x={1640} y={250} k={pop(f, at('M19', 0.3))} text="0.9" size={150} color={K.yellow} />
			</AbsoluteFill>
		);
	}
	const p = pAt(f);
	const risk = (1 - p) * MILLION.mistake;
	const tilt = Math.max(-1, Math.min(1, (risk - MILLION.review) / 2.5));
	const e1 = pop(f, at('M15', 0.15));
	const e2 = pop(f, at('M15', 0.7));
	const e3 = pop(f, at('M16', 0.3));
	const gt = pop(f, at('M17', 0.55));
	const e4 = pop(f, at('M18', 0.62));
	const decide = f >= at('M16', 0.6) ? (risk > MILLION.review + 0.05 ? 'person' : risk < MILLION.review - 0.05 ? 'Jev' : '') : '';
	return (
		<AbsoluteFill>
			<Svg>
				<Mailroom f={f} lamps={[380, 1540]} holes={false}>
					<LampHead x={250} y={250} s={1.1} f={f} />
					<LetterBig x={250} y={420} s={0.5} r={-4} glow={0.3} />
					<Gauge x={250} y={680} s={0.8} p={p} />
					<rect x={360} y={830} width={1200} height={40} rx={10} fill="url(#gDesk)" />
					<Balance x={960} y={440} s={0.9} tilt={-tilt} labels={['risk', 'review']} labelK={e3} left={<CoinStack x={0} y={0} n={risk * 2} w={80} />} right={e3 > 0 ? <Coin x={0} y={-40} s={0.9} label="€2" /> : null} />
				</Mailroom>
			</Svg>
			<div style={{position: 'absolute', left: 0, width: 1920, top: 40, display: 'flex', justifyContent: 'center'}}>
				<Equation
					size={78}
					terms={[
						{tex: '(1-p)', k: e1, color: RED, label: 'wrong', labelK: e1},
						{tex: '\\cdot 20', k: e2, color: K.orange, label: 'mistake', labelK: e2},
						gt > 0 ? {tex: '>', k: gt, color: T.glow, pop: 1 - progress(f, at('M17', 0.55), at('M17', 0.75))} : {tex: '\\;\\text{vs}\\;', k: e3, color: K.mute},
						{tex: '2', k: e3, color: T.glow, label: 'review', labelK: e3},
					]}
				/>
			</div>
			{e4 > 0 ? (
				<div style={{position: 'absolute', left: 1330, width: 560, top: 400, display: 'flex', justifyContent: 'center'}}>
					<Equation size={96} terms={[{tex: 'p < 0.9', k: e4, color: K.yellow, pop: 1 - progress(f, at('M18', 0.62), at('M18', 0.85))}]} />
				</div>
			) : null}
			{decide && e4 <= 0 ? <Say x={960} y={930} k={1} text={decide} size={56} color={decide === 'Jev' ? K.yellow : A.lamp} /> : null}
		</AbsoluteFill>
	);
};

// ---------- 6. the line moves ----------
const MovesScene: React.FC<{f: number}> = ({f}) => {
	const split = easeInOut(progress(f, cues.M22.start - 6, cues.M22.start + 10));
	if (f < cues.M21.start) {
		// extreme close-up: the crank turns
		return (
			<AbsoluteFill>
				<Svg>
					<g transform={cam(1340, 470, 2.2)}>
						<Mailroom f={f} lamps={[1340]}>
							<RopeLine x0={420} x1={1340} floor={900} v={0.9 + 0.01 * Math.sin(f * 0.3)} f={f} crank={f * 0.02} tags={[{at: 0.86, text: '€20'}]} />
						</Mailroom>
					</g>
				</Svg>
			</AbsoluteFill>
		);
	}
	const lw = lerp(1920, 954, split);
	const vCheap = lerp(0.9, lineFor(MILLION.cheap), easeInOut(progress(f, at('M21', 0.42), at('M21', 0.62))));
	const vDear = lerp(0.9, lineFor(MILLION.dear), easeInOut(progress(f, at('M22', 0.42), at('M22', 0.62))));
	const flood = progress(f, at('M21', 0.6), at('M21', 0.95));
	return (
		<AbsoluteFill>
			<Svg>
				<Panel id="pCheap" x={0} w={lw} dim={0.3 * split}>
					<Mailroom f={f} holes={false} lamps={[700, 1250]}>
						{/* a tray of newsletters, most of them waved through */}
						{Array.from({length: 26}, (_, i) => {
							const u = ((f * 0.03 + i / 26) % 1) * flood;
							return <Env key={i} x={lerp(520 + ((i * 41) % 400), 1700, u)} y={760 - ((i * 23) % 120) - 200 * Math.sin(Math.PI * u)} s={0.8} r={((i * 17) % 40) - 20} tint={['#9FD8C8', '#F2C66A', '#E0A0C0', '#A8B8F0'][i % 4]} />;
						})}
						<RopeLine x0={420} x1={1340} floor={900} v={vCheap} f={f} crank={progress(f, at('M21', 0.42), at('M21', 0.62)) * -2} tags={[{at: 0.5, text: '€4'}]} />
					</Mailroom>
				</Panel>
				{split > 0 ? (
					<Panel id="pDear" x={lw + 12} w={1920 - lw - 12}>
						<Mailroom f={f} holes={false} lamps={[700, 1250]}>
							<Customer x={700} y={700} s={1.2} f={f} />
							<g transform="translate(980 620) rotate(-8)">
								<rect x={-120} y={-76} width={240} height={152} rx={18} fill="#3D5A96" />
								<rect x={-120} y={-44} width={240} height={30} fill="#233A6E" />
								<rect x={30} y={10} width={80} height={62} rx={12} fill={RED} />
							</g>
							<RopeLine x0={420} x1={1340} floor={900} v={vDear} f={f} crank={progress(f, at('M22', 0.42), at('M22', 0.62)) * 3} tags={[{at: 0.5, text: '€200', red: true}]} />
						</Mailroom>
					</Panel>
				) : null}
			</Svg>
			<div style={{position: 'absolute', left: 0, width: lw, top: 60, display: 'flex', justifyContent: 'center'}}>
				<Equation size={64} terms={[{tex: `1-\\tfrac{2}{${MILLION.cheap}}`, k: pop(f, at('M21', 0.3))}, {tex: '=', k: pop(f, at('M21', 0.5)), color: K.mute}, {tex: lineFor(MILLION.cheap).toFixed(1), k: pop(f, at('M21', 0.62)), color: K.yellow}]} />
			</div>
			{split > 0 ? (
				<div style={{position: 'absolute', left: lw + 12, width: 1920 - lw - 12, top: 60, display: 'flex', justifyContent: 'center'}}>
					<Equation size={64} terms={[{tex: `1-\\tfrac{2}{${MILLION.dear}}`, k: pop(f, at('M22', 0.3))}, {tex: '=', k: pop(f, at('M22', 0.5)), color: K.mute}, {tex: lineFor(MILLION.dear).toFixed(2), k: pop(f, at('M22', 0.62)), color: K.yellow}]} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 7. the answer: a dune of a million letters ----------
export const AnswerScene: React.FC<{f: number}> = ({f}) => {
	const hut = cues.M25.start;
	if (f < hut) {
		const pour = progress(f, S.answer.start + 10, at('M23', 0.98));
		const lineK = pop(f, at('M24', 0.05));
		const tide = progress(f, at('M24', 0.35), at('M24', 0.6));
		const drift = progress(f, at('M24', 0.55), cues.M24.end + 8);
		const lx = 1740;
		const lampY = 604 + LAMP_Y * 1.3;
		const aim = f < cues.M24.start ? -170 + 30 * (1 - pour) : lerp(-170, -165, progress(f, cues.M24.start, cues.M24.end));
		return (
			<AbsoluteFill>
				<Svg>
					<Harbor f={f} lamp={1} lx={lx} moon={[500, 140]}>
						<g transform={`translate(${lx} ${lampY}) rotate(${aim})`} style={{mixBlendMode: 'screen'}}>
							<path d="M 0 -14 L 700 -170 L 700 170 L 0 14 Z" fill="url(#gBeam)" />
						</g>
						{pour > 0 && pour < 1 ? (
							<path d={`M ${lx - 40} ${lampY + 20} Q ${(lx + xOfP(0.75 + 0.25 * Math.sin(f * 0.13))) / 2} ${lampY - 120} ${xOfP(0.75 + 0.25 * Math.sin(f * 0.13))} ${DUNE.base - 150}`} fill="none" stroke={K.yellow} strokeWidth={6} strokeDasharray="4 16" strokeDashoffset={-f * 4} opacity={0.8} />
						) : null}
						<Dune f={f} pour={pour} tide={tide} drift={drift} />
						{lineK > 0 ? <line x1={xOfP(0.9)} x2={xOfP(0.9)} y1={DUNE.base + 20} y2={DUNE.base - 320 * Math.min(1, lineK)} stroke={K.teal} strokeWidth={5} strokeDasharray="16 12" /> : null}
					</Harbor>
				</Svg>
				<Say x={1680} y={330} k={pop(f, at('M24', 0.25))} text="Jev" size={72} color={K.yellow} />
				<Say x={170} y={440} k={pop(f, at('M24', 0.72))} text="people" size={60} color={A.lamp} />
			</AbsoluteFill>
		);
	}
	// the reviewers' room: a few rows, where the endless queue used to be
	const ghost = 1 - progress(f, hut + 4, hut + 30);
	return (
		<AbsoluteFill>
			<Svg>
				<Mailroom f={f} holes={false} lamps={[560, 1360]} floor={560}>
					<g opacity={0.25 * ghost}>
						<AllWorld f={f} fill={1} coins={0} />
					</g>
					{Array.from({length: 3}, (_, r) =>
						Array.from({length: 5}, (_, c) => <Reviewer key={`${r}-${c}`} x={560 + c * 200 + (r % 2) * 40} y={700 + r * 130} s={0.55 + r * 0.08} f={f} seed={r * 5 + c} lamp={r === 2 && c % 2 === 0} />),
					)}
				</Mailroom>
			</Svg>
			<Say x={960} y={90} k={pop(f, at('M25', 0.12))} text="170,000" size={140} color={A.lamp} />
			<Say x={700} y={270} k={pop(f, at('M25', 0.55))} text="1,000,000" size={56} color={K.white} strike={progress(f, at('M25', 0.58), at('M25', 0.68))} />
			<Say x={1230} y={270} k={pop(f, at('M25', 0.8))} text="0" size={56} color={K.white} strike={progress(f, at('M25', 0.83), at('M25', 0.93))} />
		</AbsoluteFill>
	);
};

// ---------- 8. the promise has to hold ----------
const CalibScene: React.FC<{f: number}> = ({f}) => {
	if (f < cues.M27.start) {
		return (
			<AbsoluteFill>
				<Svg>
					<Stage f={f} y={930} w={640}>
						<Grid10 x={960 - 250} y={300} cell={52} k={progress(f, S.calib.start, S.calib.start + 24)} lit={90} />
					</Stage>
				</Svg>
				<Say x={470} y={440} k={pop(f, at('M26', 0.6))} text="90%" size={110} color={K.orange} />
			</AbsoluteFill>
		);
	}
	const flicker = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.9) * Math.sin(f * 0.37));
	const lx = 1740;
	return (
		<AbsoluteFill>
			<Svg>
				<Harbor f={f} lamp={flicker} lx={lx} moon={[500, 140]}>
					<g transform={`translate(${lx} ${604 + LAMP_Y * 1.3}) rotate(-168)`} style={{mixBlendMode: 'screen'}} opacity={flicker}>
						<path d="M 0 -14 L 700 -170 L 700 170 L 0 14 Z" fill="url(#gBeam)" />
					</g>
					<Grid10 x={820} y={90} cell={34} k={1} lit={90} red={20} redK={clamp01(0.5 + progress(f, at('M27', 0.35), at('M27', 0.55)) * 0.5)} />
					<Dune f={f} pour={1} tide={1} drift={1} fall={progress(f, at('M27', 0.62), cues.M27.end + 6)} />
					<line x1={xOfP(0.9)} x2={xOfP(0.9)} y1={DUNE.base + 20} y2={DUNE.base - 320} stroke={K.teal} strokeWidth={5} strokeDasharray="16 12" />
				</Harbor>
			</Svg>
			<Say x={560} y={270} k={pop(f, at('M27', 0.5))} text="80 / 100" size={72} color={RED} />
			<Say x={960} y={470} k={pop(f, at('M27', 0.86), 14)} text="calibration" size={110} color={K.white} />
		</AbsoluteFill>
	);
};

// ---------- 9. back down to one person and one letter ----------
const HARD_WORDS = 'My card was charged twice, and now I can’t find it.'.split(' ');
const CloseScene: React.FC<{f: number}> = ({f}) => {
	const a = S.close.start;
	const b = at('M28', 0.4);
	const c = at('M28', 0.8);
	const d = cues.M29.start - 2;
	if (f < d) {
		return (
			<AbsoluteFill>
				<Svg>
					{f < b ? (
						<g transform={zoomTo(easeIn(progress(f, a, b), 2), 1, 7, [960, 560], [HOME[0], HOME[1]])}>
							<PlanetShot f={f} arcs={1} />
						</g>
					) : f < c ? (
						<g transform={zoomTo(easeIn(progress(f, b, c), 2), 1, 4.6, [960, 540], BANK_MID)}>
							<CityShot f={f} train={0} />
						</g>
					) : (
						<g transform={zoomTo(easeIn(progress(f, c, d), 2), 1, 7.3, [960, 560], [TARGET[0], TARGET[1]])}>
							<BankShot f={f} />
						</g>
					)}
				</Svg>
			</AbsoluteFill>
		);
	}
	// close-up: the hard letter, its words lighting up one by one as a person reads it
	const trace = progress(f, cues.M29.start + 6, S.close.end - 20);
	const out = progress(f, S.close.end - 16, S.close.end + 10);
	return (
		<AbsoluteFill>
			<Svg>
				<MailroomDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
				<circle cx={1500} cy={180} r={640} fill="url(#gAmberLamp)" />
				<rect x={-60} y={560} width={2040} height={600} fill="url(#gDesk)" />
				<rect x={420} y={250} width={1080} height={560} rx={10} fill="#FFFDF6" transform="rotate(-3 960 530)" />
			</Svg>
			<div style={{position: 'absolute', left: 500, top: 330, width: 920, transform: 'rotate(-3deg)', fontFamily: FONT, color: K.navy}}>
				<div style={{fontWeight: 800, fontSize: 26, color: '#7A7AA8', letterSpacing: 1}}>to: support</div>
				<div style={{fontWeight: 900, fontSize: 54, lineHeight: 1.35, marginTop: 18}}>
					{HARD_WORDS.map((w, i) => {
						// each word lights up as it is read, and stays marked
						const k = clamp01(trace * (HARD_WORDS.length + 1) - i);
						return (
							<span key={i} style={{position: 'relative', display: 'inline-block', marginRight: 14}}>
								<span style={{position: 'absolute', left: -6, right: -6, top: '8%', bottom: '4%', borderRadius: 8, background: A.lamp, opacity: 0.55 * k, transform: `scaleX(${k})`, transformOrigin: 'left'}} />
								<span style={{position: 'relative'}}>{w}</span>
							</span>
						);
					})}
				</div>
			</div>
			<AbsoluteFill style={{background: '#05060F', opacity: out}} />
		</AbsoluteFill>
	);
};

// Scenes, with how each one enters: a cross-fade (xf frames) or a hard cut (0).
type Scene = {span: {start: number; end: number}; xf: number; render: (f: number) => React.ReactNode};
export const MillionLetters: React.FC = () => {
	const f = useCurrentFrame();
	const scenes: Scene[] = [
		{span: S.title, xf: 0, render: (x) => <Card f={x} />},
		{span: S.zoom, xf: 12, render: (x) => <ZoomScene f={x} />},
		{span: S.puzzle, xf: 12, render: (x) => <PuzzleScene f={x} />},
		{span: S.naive, xf: 0, render: (x) => <NaiveScene f={x} />},
		{span: S.price, xf: 0, render: (x) => <PriceScene f={x} />},
		{span: S.math, xf: 0, render: (x) => <MathScene f={x} />},
		{span: S.moves, xf: 0, render: (x) => <MovesScene f={x} />},
		{span: S.answer, xf: 12, render: (x) => <AnswerScene f={x} />},
		{span: S.calib, xf: 0, render: (x) => <CalibScene f={x} />},
		{span: S.close, xf: 12, render: (x) => <CloseScene f={x} />},
		{span: S.endcard, xf: 12, render: (x) => <Card f={x - S.endcard.start} next />},
	];
	return (
		<AbsoluteFill style={{background: K.night}}>
			{scenes.map((sc, i) => {
				const next = scenes[i + 1];
				const tail = next ? next.xf : 0;
				if (f < sc.span.start || f >= sc.span.end + tail) return null;
				const fadeIn = sc.xf ? progress(f, sc.span.start, sc.span.start + sc.xf) : 1;
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn}}>
						{sc.render(f)}
					</AbsoluteFill>
				);
			})}
			<Grain id="millionGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={track('million-track')} />
		</AbsoluteFill>
	);
};
