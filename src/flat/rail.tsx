import React from 'react';
import {rng} from '../fx/rough';
import {FONT, K} from './kit';

// Railway, ground and water pieces for the side-view scenes.

export const RailDefs: React.FC = () => (
	<defs>
		<linearGradient id="gRail" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#F4F6FF" />
			<stop offset="0.35" stopColor="#B9C0F0" />
			<stop offset="1" stopColor="#5D65AE" />
		</linearGradient>
		<linearGradient id="gSleeper" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#8A6458" />
			<stop offset="1" stopColor="#4E3434" />
		</linearGradient>
		<linearGradient id="gBallast" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#4B4F98" />
			<stop offset="1" stopColor="#2B2F72" />
		</linearGradient>
		<pattern id="gravel" width={18} height={12} patternUnits="userSpaceOnUse">
			<ellipse cx={4} cy={4} rx={3.2} ry={2.2} fill="#6A70C0" opacity={0.7} />
			<ellipse cx={12} cy={9} rx={2.6} ry={1.8} fill="#1E2262" opacity={0.7} />
			<ellipse cx={15} cy={3} rx={1.8} ry={1.4} fill="#8C92D8" opacity={0.5} />
		</pattern>
		<linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#2B3D9A" />
			<stop offset="0.25" stopColor="#1C2A78" />
			<stop offset="1" stopColor="#0A1040" />
		</linearGradient>
		<filter id="steamBlur" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={5} />
		</filter>
		<linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#262D78" />
			<stop offset="1" stopColor="#151A52" />
		</linearGradient>
	</defs>
);

export type RailPiece = {x: number; y: number; angle: number; len: number; word?: string; hot?: boolean; underwater?: boolean};

// One stretch of track seen from the side: gravel bed, sleepers, far rail, near rail with a moving glint,
// and an enamel word plate bolted to the bed.
export const SideTrack: React.FC<{pieces: RailPiece[]; f: number; glint?: boolean}> = ({pieces, f, glint = true}) => (
	<g>
		{pieces.map((p, i) => {
			const n = Math.floor(p.len / 24);
			const gx = ((f * 22 + i * 97) % (p.len * 3)) - p.len;
			return (
				<g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`} opacity={p.underwater ? 0.35 : 1}>
					<path d={`M -3 4 L ${p.len + 3} 4 L ${p.len + 12} 34 L -12 34 Z`} fill="url(#gBallast)" />
					<path d={`M -3 4 L ${p.len + 3} 4 L ${p.len + 12} 34 L -12 34 Z`} fill="url(#gravel)" />
					{Array.from({length: n}, (_, j) => (
						<g key={j}>
							<rect x={6 + j * 24} y={-1} width={15} height={8} rx={2} fill="url(#gSleeper)" />
							<rect x={6 + j * 24} y={-1} width={15} height={2} rx={1} fill="#B08878" opacity={0.7} />
						</g>
					))}
					<rect x={0} y={-8} width={p.len} height={4} fill="#6B72BC" />
					<rect x={0} y={-5} width={p.len} height={7} fill="url(#gRail)" />
					<rect x={0} y={-4.5} width={p.len} height={1.6} fill="#FFFFFF" opacity={0.85} />
					{glint && gx > 0 && gx < p.len ? (
						<g transform={`translate(${gx} -3)`}>
							<ellipse rx={22} ry={3} fill="#FFFFFF" opacity={0.9} />
							<ellipse rx={7} ry={7} fill="#FFFFFF" opacity={0.35} filter="url(#glow)" />
						</g>
					) : null}
					{p.word ? (
						<g transform={`translate(${p.len / 2} 20)`}>
							<rect x={-60} y={-12} width={120} height={26} rx={5} fill={p.hot ? K.orange : '#1D2366'} stroke={p.hot ? '#FFD39A' : '#6F77C8'} strokeWidth={2} />
							<circle cx={-52} cy={1} r={2.2} fill="#9EA5E8" />
							<circle cx={52} cy={1} r={2.2} fill="#9EA5E8" />
							<text y={8} textAnchor="middle" fontFamily={FONT} fontSize={16} fontWeight={900} letterSpacing={1.5} fill={p.hot ? K.ink : K.white}>
								{p.word.toUpperCase()}
							</text>
						</g>
					) : null}
				</g>
			);
		})}
	</g>
);

// Grass lip, soil strata, stones, flowers and bushes along a ground line (list of points, left to right).
export const Terrain: React.FC<{line: [number, number][]; bottom: number; f: number; seed?: number}> = ({line, bottom, f, seed = 3}) => {
	const d = `M ${line.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
	const r = rng(seed);
	const yAt = (x: number) => {
		for (let i = 0; i < line.length - 1; i++) {
			const [x0, y0] = line[i];
			const [x1, y1] = line[i + 1];
			if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
		}
		return line[line.length - 1][1];
	};
	const x0 = line[0][0];
	const x1 = line[line.length - 1][0];
	const details: React.ReactNode[] = [];
	for (let x = x0 + 20; x < x1 - 10; x += 22 + r() * 30) {
		const y = yAt(x);
		const kind = r();
		const s = 0.6 + r() * 0.7;
		const tone = r();
		if (kind < 0.55) {
			details.push(
				<g key={`t${x}`} transform={`translate(${x} ${y + 2}) scale(${s})`}>
					{[-6, 0, 6].map((dx, j) => (
						<path key={j} d={`M ${dx} 0 Q ${dx + (j - 1) * 3 + 2 * Math.sin(f * 0.04 + x)} -12 ${dx + (j - 1) * 7} ${-18 - j * 3}`} stroke={tone < 0.5 ? '#3E5FB8' : '#2F8C9A'} strokeWidth={3} fill="none" strokeLinecap="round" />
					))}
				</g>,
			);
		} else if (kind < 0.8) {
			details.push(
				<g key={`s${x}`} transform={`translate(${x} ${y + 8}) scale(${s})`}>
					<path d="M -14 0 Q -12 -12 0 -13 Q 12 -12 14 0 Z" fill="#2E347E" />
					<path d="M -14 0 Q -12 -12 0 -13 L -2 0 Z" fill="#4A52AE" />
				</g>,
			);
		} else if (kind < 0.9) {
			details.push(
				<g key={`fl${x}`} transform={`translate(${x} ${y + 2})`}>
					<path d={`M 0 0 L 0 -16`} stroke="#2F8C9A" strokeWidth={2} />
					<circle cx={0} cy={-18} r={4} fill={tone < 0.5 ? '#FF8FB1' : K.yellow} />
					<circle cx={0} cy={-18} r={1.6} fill="#FFFFFF" />
				</g>,
			);
		} else {
			details.push(
				<g key={`b${x}`} transform={`translate(${x} ${y + 6}) scale(${s})`}>
					<circle cx={0} cy={-18} r={22} fill="#27307C" />
					<circle cx={20} cy={-10} r={16} fill="#27307C" />
					<circle cx={-6} cy={-26} r={10} fill="#3A43A2" />
				</g>,
			);
		}
	}
	return (
		<g>
			<path d={`${d} L ${x1} ${bottom} L ${x0} ${bottom} Z`} fill="url(#gSoil)" />
			{/* strata */}
			{[40, 90, 150].map((off, i) => (
				<path key={i} d={`M ${line.map(([x, y]) => `${x} ${y + off + 8 * Math.sin(x * 0.01 + i)}`).join(' L ')}`} fill="none" stroke={i % 2 ? '#1A2060' : '#2C3480'} strokeWidth={14 - i * 3} opacity={0.8} />
			))}
			<path d={d} fill="none" stroke="#3E47A8" strokeWidth={14} strokeLinejoin="round" />
			<path d={d} fill="none" stroke="#7E78D8" strokeWidth={3} strokeLinejoin="round" opacity={0.8} />
			{details}
		</g>
	);
};

// A lake: body, shimmer, reflections, lily pads, mist. `WaterFront` redraws the body over anything submerged.
// `bank`: the underwater slope from the waterline (first point) downwards, left to right.
export const waterPath = (bank: [number, number][], level: number, right: number, bottom: number) =>
	`M ${bank[0][0]} ${level} ${bank.map(([x, y]) => `L ${x} ${Math.max(y, level)}`).join(' ')} L ${bank[bank.length - 1][0]} ${bottom} L ${right} ${bottom} L ${right} ${level} Z`;

export const Lake: React.FC<{bank: [number, number][]; level: number; right: number; bottom: number; f: number; reflectX?: number[]; lamp?: number}> = ({bank, level, right, bottom, f, reflectX = [], lamp = 0}) => {
	const body = waterPath(bank, level, right, bottom);
	const x0 = bank[0][0];
	return (
		<g>
			<path d={body} fill="url(#gWater)" />
			{/* reflections: warm sunset band and the lighthouse lamp */}
			<rect x={x0} y={level + 4} width={right - x0} height={26} fill="#E07BA0" opacity={0.18} />
			{reflectX.map((rx, i) =>
				Array.from({length: 9}, (_, j) => {
					const w = 70 - j * 6 + 10 * Math.sin(f * 0.1 + j + i);
					return <rect key={`${i}-${j}`} x={rx - w / 2 + 6 * Math.sin(f * 0.07 + j)} y={level + 14 + j * 16} width={w} height={4} rx={2} fill={i === 0 ? '#FFE9A0' : '#DDE1FF'} opacity={(i === 0 ? lamp : 0.5) * (0.7 - j * 0.07)} />;
				}),
			)}
			{Array.from({length: 22}, (_, i) => {
				const x = x0 + ((i * 173 + f * (0.5 + (i % 3) * 0.3)) % (right - x0));
				const y = level + 12 + ((i * 47) % (bottom - level - 20));
				return <rect key={`s${i}`} x={x} y={y} width={30 + (i % 4) * 22} height={3} rx={1.5} fill="#8FA2FF" opacity={0.22} />;
			})}
			{/* lily pads */}
			{[
				[x0 + 330, level + 40, 1],
				[x0 + 420, level + 70, 0.8],
				[x0 + 700, level + 36, 1.1],
				[x0 + 780, level + 90, 0.7],
			].map(([x, y, s], i) => (
				<g key={`p${i}`} transform={`translate(${x} ${y + 2 * Math.sin(f * 0.05 + i)}) scale(${s} ${s * 0.4})`}>
					<path d="M 0 0 L 30 -8 A 32 32 0 1 1 30 8 Z" fill="#1F7F77" />
					<path d="M 0 0 L 30 -8 A 32 32 0 0 0 -28 -14" fill="none" stroke="#3FC0A8" strokeWidth={4} />
					{i === 2 ? <circle cx={-8} cy={-20} r={9} fill="#FF8FB1" /> : null}
				</g>
			))}
			<path d={`M ${x0} ${level} L ${right} ${level}`} stroke="#A9C4FF" strokeWidth={3} opacity={0.55} />
		</g>
	);
};

export const WaterFront: React.FC<{bank: [number, number][]; level: number; right: number; bottom: number; f: number}> = ({bank, level, right, bottom, f}) => {
	const x0 = bank[0][0];
	return (
	<g>
		<path d={waterPath(bank, level, right, bottom)} fill="url(#gWater)" />
		<rect x={x0} y={level} width={right - x0} height={10} fill="#3B55C8" opacity={0.6} />
		<path d={`M ${x0} ${level} L ${right} ${level}`} stroke="#C9D8FF" strokeWidth={3} opacity={0.75} />
		{Array.from({length: 8}, (_, i) => {
			const x = x0 + ((i * 211 + f * 0.8) % (right - x0));
			return <rect key={i} x={x} y={level + 16 + (i % 3) * 14} width={50} height={3} rx={1.5} fill="#8FA2FF" opacity={0.25} />;
		})}
	</g>
	);
};

// Low mist drifting over water.
export const Mist: React.FC<{x: number; y: number; w: number; f: number}> = ({x, y, w, f}) => (
	<g opacity={0.35}>
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={x + ((f * (0.6 + i * 0.3) + i * 300) % w)} cy={y - i * 10} rx={260} ry={22} fill="#C9C4F2" filter="url(#glowBig)" />
		))}
	</g>
);

// Steam hissing off hot metal: puffs rise, swell, drift and fade.
export const Steam: React.FC<{x: number; y: number; f: number; start: number; dur?: number}> = ({x, y, f, start, dur = 140}) => {
	const t = f - start;
	if (t < 0 || t > dur + 60) return null;
	return (
		<g>
			{Array.from({length: 16}, (_, i) => {
				const born = i * (dur / 16);
				const a = (t - born) / 60;
				if (a < 0 || a > 1) return null;
				const px = x + (i % 3 - 1) * 26 - 40 * a + 10 * Math.sin(i + a * 4);
				const py = y - 30 - 240 * a;
				const r = 18 + 50 * a;
				return (
					<g key={i} opacity={(1 - a) * 0.6} filter="url(#steamBlur)">
						<circle cx={px} cy={py} r={r} fill="#D9D6F6" />
						<circle cx={px - r * 0.25} cy={py - r * 0.3} r={r * 0.55} fill="#FFFFFF" opacity={0.55} />
					</g>
				);
			})}
		</g>
	);
};
