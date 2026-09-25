import React from 'react';
import {FlatDefs, K, Stars, Vignette} from '../../flat/kit';
import {City, Moon, WorldDefs} from '../../flat/world';
import {SteamPress} from '../../characters/steam';
import {withLook} from '../flat-track/trainMood';
import {clamp01, lerp} from '../paper-track/timeline';
import {A, LetterBig, MailroomDefs} from './parts';

// The powers-of-ten zoom that opens (and, reversed, closes) chapter 3:
// one letter on a desk, a lit window of the bank, the city at night, the planet.

// ---------- 1. one letter on a desk ----------
export const DeskShot: React.FC<{f: number; sweep: number; flash: number}> = ({f, sweep, flash}) => (
	<g>
		<MailroomDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
		{/* the desk lamp and its pool of light */}
		<circle cx={1460} cy={260} r={520} fill="url(#gAmberLamp)" />
		<g transform="translate(1460 120)">
			<path d="M -120 140 L -70 20 L 70 20 L 120 140 Z" fill={A.brass} />
			<ellipse cx={0} cy={140} rx={120} ry={20} fill={A.lamp} />
			<rect x={-8} y={-160} width={16} height={180} fill={A.brassLo} />
		</g>
		{/* desk top */}
		<rect x={-60} y={520} width={2040} height={620} fill="url(#gDesk)" />
		{Array.from({length: 9}, (_, i) => (
			<path key={i} d={`M -60 ${560 + i * 60} Q 900 ${540 + i * 62 + 14 * Math.sin(i)} 1980 ${566 + i * 58}`} stroke={A.woodLo} strokeWidth={3} fill="none" opacity={0.5} />
		))}
		<ellipse cx={960} cy={820} rx={560} ry={110} fill="#2A1510" opacity={0.35} />
		{/* the letter */}
		<LetterBig x={960} y={700} s={1.3} r={-4} />
		{/* read once: a band of light crosses it */}
		{sweep > 0 && sweep < 1 ? <rect x={lerp(300, 1500, sweep) - 60} y={380} width={120} height={640} fill="#FFF1C0" opacity={0.55 * Math.sin(Math.PI * sweep)} transform="skewX(-14)" style={{mixBlendMode: 'screen'}} /> : null}
		{flash > 0 ? <rect x={-60} y={-60} width={2040} height={1200} fill="#FFF1C0" opacity={0.25 * flash} /> : null}
		<Vignette />
	</g>
);

// ---------- 2. the bank at night, every window a letter being read ----------
// Window (c, r) centre, in bank coordinates. TARGET is the window the desk shot lives behind.
export const BANK = {x: 410, w: 1100, top: 250, base: 980};
export const winXY = (c: number, r: number) => [BANK.x + 90 + c * 132 + 35, BANK.top + 90 + r * 118 + 40] as const;
export const TARGET = winXY(3, 1);
const blink = (f: number, i: number) => {
	const period = 70 + ((i * 37) % 60);
	const ph = (f + i * 23) % period;
	return ph < 8 ? 1 - ph / 8 : 0;
};
export const BankBuilding: React.FC<{f: number; lit?: number}> = ({f, lit = 1}) => (
	<g>
		{/* pediment and body */}
		<path d={`M ${BANK.x - 30} ${BANK.top} L ${BANK.x + BANK.w / 2} ${BANK.top - 150} L ${BANK.x + BANK.w + 30} ${BANK.top} Z`} fill="#2B3280" />
		<circle cx={BANK.x + BANK.w / 2} cy={BANK.top - 60} r={42} fill={A.brass} opacity={0.9} />
		<circle cx={BANK.x + BANK.w / 2} cy={BANK.top - 60} r={30} fill="none" stroke={A.brassHi} strokeWidth={5} />
		<rect x={BANK.x - 30} y={BANK.top} width={BANK.w + 60} height={30} fill="#353D96" />
		<rect x={BANK.x} y={BANK.top + 30} width={BANK.w} height={BANK.base - BANK.top - 30} fill="#232A70" />
		{/* windows */}
		{Array.from({length: 4}, (_, r) =>
			Array.from({length: 8}, (_, c) => {
				const [cx, cy] = winXY(c, r);
				const i = r * 8 + c;
				const b = blink(f, i);
				const on = (i * 7) % 5 !== 0 || (c === 3 && r === 1);
				return (
					<g key={i}>
						<rect x={cx - 35} y={cy - 40} width={70} height={80} rx={8} fill={on ? A.lamp : '#141A4E'} opacity={on ? (0.75 + 0.25 * b) * lit + (1 - lit) * 0.2 : 1} />
						{on && b > 0 ? <rect x={cx - 50} y={cy - 55} width={100} height={110} rx={16} fill="#FFF1C0" opacity={0.5 * b} filter="url(#glow)" /> : null}
						<rect x={cx - 2} y={cy - 40} width={4} height={80} fill="#232A70" opacity={0.8} />
					</g>
				);
			}),
		)}
		{/* columns and steps */}
		{Array.from({length: 7}, (_, i) => (
			<rect key={i} x={BANK.x + 40 + i * 170} y={BANK.top + 580} width={46} height={BANK.base - BANK.top - 610} fill="#3A42A0" />
		))}
		<rect x={BANK.x - 30} y={BANK.top + 560} width={BANK.w + 60} height={24} fill="#353D96" />
		<rect x={BANK.x + BANK.w / 2 - 70} y={BANK.base - 150} width={140} height={150} rx={70} fill={A.lamp} opacity={0.65} />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={BANK.x - 30 - i * 30} y={BANK.base + i * 24} width={BANK.w + 60 + i * 60} height={24} fill={i % 2 ? '#2B3280' : '#353D96'} />
		))}
	</g>
);
export const BankShot: React.FC<{f: number}> = ({f}) => (
	<g>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={300} />
		<Moon x={1720} y={140} r={40} />
		{/* neighbours */}
		<rect x={-60} y={380} width={430} height={760} fill="#1A1F5C" />
		<rect x={1550} y={330} width={430} height={810} fill="#1A1F5C" />
		{Array.from({length: 18}, (_, i) => (
			<rect key={i} x={(i % 2 ? 1600 : 20) + ((i * 53) % 280)} y={420 + ((i * 97) % 520)} width={40} height={50} rx={6} fill={A.lamp} opacity={0.35 + 0.5 * blink(f, i + 40)} />
		))}
		<BankBuilding f={f} />
		<rect x={-60} y={1052} width={2040} height={100} fill="#10143F" />
		<Vignette />
	</g>
);

// ---------- 3. the city at night; the bank is one building among many ----------
export const CITY_BANK = {x: 960, y: 700, s: 0.2};
export const CityShot: React.FC<{f: number; train: number}> = ({f, train}) => (
	<g>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={420} />
		<Moon x={1500} y={150} r={34} />
		<City x={-60} y={640} w={2040} f={f} seed={21} />
		<City x={-40} y={700} w={2040} f={f + 40} seed={7} />
		{/* the bank, small, centre */}
		<g transform={`translate(${CITY_BANK.x - (BANK.x + BANK.w / 2) * CITY_BANK.s} ${CITY_BANK.y - BANK.base * CITY_BANK.s}) scale(${CITY_BANK.s})`}>
			<BankBuilding f={f} />
		</g>
		{/* nearer blocks, with windows that blink as letters are read */}
		{Array.from({length: 14}, (_, i) => {
			const bx = i * 150 - 60 + (i > 6 ? 90 : 0);
			if (bx > 800 && bx < 1120) return null;
			const bh = 160 + ((i * 71) % 180);
			return (
				<g key={i}>
					<rect x={bx} y={760 - bh} width={120} height={bh} fill="#1C2266" />
					{Array.from({length: Math.floor(bh / 34)}, (_, r) =>
						[0, 1, 2].map((c) => {
							const j = i * 40 + r * 3 + c;
							return (j * 13) % 4 ? <rect key={`${r}-${c}`} x={bx + 14 + c * 34} y={760 - bh + 14 + r * 34} width={20} height={20} rx={3} fill={A.lamp} opacity={0.45 + 0.55 * blink(f, j)} /> : null;
						}),
					)}
				</g>
			);
		})}
		{/* river and bridge */}
		<rect x={-60} y={760} width={2040} height={400} fill="url(#gSea)" />
		{Array.from({length: 16}, (_, i) => (
			<rect key={i} x={((i * 263 + f * 0.8) % 2100) - 100} y={840 + ((i * 47) % 200)} width={50 + (i % 4) * 30} height={3} rx={1.5} fill={A.lamp} opacity={0.25} />
		))}
		<rect x={-60} y={880} width={2040} height={26} fill="#2B3280" />
		{Array.from({length: 7}, (_, i) => (
			<path key={i} d={`M ${i * 300 - 60} 906 Q ${i * 300 + 90} 820 ${i * 300 + 240} 906`} fill="none" stroke="#2B3280" strokeWidth={14} />
		))}
		{/* a cameo: the train from chapter 1, crossing the bridge */}
		{train > 0 && train < 1 ? (
			<g transform={`translate(${lerp(-260, 2200, train)} 880)`}>
				<SteamPress livery="claude" f={f} s={0.3} expr={withLook('happy', 1, -0.2, {bounce: 3})} dist={train * 900} smokeT={f * 0.012} />
			</g>
		) : null}
		<Vignette />
	</g>
);

// ---------- 4. the planet at night, streams of decisions between cities ----------
const CITIES: [number, number, number][] = [
	[-60, -90, 1.4], // home city
	[150, -160, 1],
	[230, 40, 0.8],
	[-220, 60, 1.1],
	[40, 150, 0.9],
	[-150, -230, 0.7],
	[300, -60, 0.6],
];
export const PLANET = {x: 960, y: 560, r: 390};
export const HOME = [PLANET.x + CITIES[0][0], PLANET.y + CITIES[0][1]] as const;
export const PlanetShot: React.FC<{f: number; arcs: number}> = ({f, arcs}) => (
	<g>
		<defs>
			<clipPath id="planetClip">
				<circle cx={PLANET.x} cy={PLANET.y} r={PLANET.r} />
			</clipPath>
			<radialGradient id="gAtmo" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0.8" stopColor={K.cyan} stopOpacity="0" />
				<stop offset="0.93" stopColor={K.cyan} stopOpacity="0.35" />
				<stop offset="1" stopColor={K.cyan} stopOpacity="0" />
			</radialGradient>
			<radialGradient id="gNight" cx="0.3" cy="0.3" r="0.9">
				<stop offset="0" stopColor="#233086" />
				<stop offset="1" stopColor="#0C1040" />
			</radialGradient>
		</defs>
		<rect x={-60} y={-60} width={2040} height={1200} fill="#070A24" />
		<Stars f={f} maxY={1080} count={160} seed={11} />
		<circle cx={PLANET.x} cy={PLANET.y} r={PLANET.r * 1.12} fill="url(#gAtmo)" />
		<circle cx={PLANET.x} cy={PLANET.y} r={PLANET.r} fill="url(#gNight)" />
		<g clipPath="url(#planetClip)">
			{[
				[-160, -120, 170, 120],
				[120, -40, 150, 190],
				[-120, 140, 120, 80],
				[260, 160, 90, 60],
			].map(([x, y, rx, ry], i) => (
				<ellipse key={i} cx={PLANET.x + x + ((f * 0.15) % 40) - 20} cy={PLANET.y + y} rx={rx} ry={ry} fill="#2A3890" opacity={0.8} />
			))}
			{CITIES.map(([x, y, s], i) => (
				<g key={i} transform={`translate(${PLANET.x + x} ${PLANET.y + y})`}>
					<circle r={26 * s} fill={A.lamp} opacity={0.18} filter="url(#glowBig)" />
					{Array.from({length: 9}, (_, j) => (
						<circle key={j} cx={((j * 13) % 21) - 10} cy={((j * 7) % 15) - 7} r={2 + (j % 2)} fill={A.lamp} opacity={0.5 + 0.5 * blink(f, i * 9 + j)} />
					))}
				</g>
			))}
			{/* the arcs: letters in flight between cities */}
			{CITIES.slice(1).map(([x, y], i) => {
				const [hx, hy] = [CITIES[0][0], CITIES[0][1]];
				const k = clamp01(arcs * 1.6 - i * 0.12);
				if (k <= 0) return null;
				const mx = (hx + x) / 2;
				const my = (hy + y) / 2 - 90;
				const len = 600;
				return (
					<path key={i} d={`M ${PLANET.x + hx} ${PLANET.y + hy} Q ${PLANET.x + mx} ${PLANET.y + my} ${PLANET.x + x} ${PLANET.y + y}`} fill="none" stroke={A.lamp} strokeWidth={3} strokeDasharray={`${len * k} ${len}`} opacity={0.75} />
				);
			})}
		</g>
		{/* terminator */}
		<circle cx={PLANET.x + 140} cy={PLANET.y - 80} r={PLANET.r} fill="#FFFFFF" opacity={0.03} clipPath="url(#planetClip)" />
	</g>
);
