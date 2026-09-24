import React from 'react';
import {rng} from '../fx/rough';
import {K} from './kit';

// Environment pieces for dense, layered flat-vector scenes. Every shape is two-tone (lit face / shaded face)
// or top-lit, so the frame reads as a lit world rather than flat fills.

// Mountain range: peaks split into a lit left face and a shaded right face, with a haze gradient per layer.
export const Mountains: React.FC<{y: number; shift?: number; layers?: number; seed?: number; tone?: 'dusk' | 'night'}> = ({y, shift = 0, layers = 3, seed = 2, tone = 'dusk'}) => {
	const pal = tone === 'dusk'
		? [
				{lit: '#7A5AAE', dark: '#5B4494', base: '#5B4494'},
				{lit: '#5A45A0', dark: '#3F3486', base: '#3F3486'},
				{lit: '#3F3A92', dark: '#2A2A72', base: '#2A2A72'},
			]
		: [
				{lit: '#4A4A9E', dark: '#343682', base: '#343682'},
				{lit: '#36388A', dark: '#252A6C', base: '#252A6C'},
				{lit: '#282C74', dark: '#1B205A', base: '#1B205A'},
			];
	return (
		<g>
			{Array.from({length: layers}, (_, L) => {
				const r = rng(seed * 31 + L * 7);
				const peaks: {x: number; h: number; w: number}[] = [];
				for (let x = -600 - r() * 200; x < 3200; x += 240 + r() * 260) peaks.push({x, h: 120 + r() * 170 - L * 30, w: 260 + r() * 220});
				const yy = y + L * 55;
				const p = pal[Math.min(L, pal.length - 1)];
				return (
					<g key={L} transform={`translate(${-shift * (0.15 + L * 0.12)} 0)`}>
						<rect x={-800} y={yy} width={4400} height={400} fill={p.base} />
						{peaks.map((pk, i) => (
							<g key={i}>
								<path d={`M ${pk.x - pk.w / 2} ${yy + 2} L ${pk.x} ${yy - pk.h} L ${pk.x + pk.w * 0.08} ${yy - pk.h * 0.55} L ${pk.x - pk.w * 0.05} ${yy + 2} Z`} fill={p.lit} />
								<path d={`M ${pk.x} ${yy - pk.h} L ${pk.x + pk.w / 2} ${yy + 2} L ${pk.x - pk.w * 0.05} ${yy + 2} L ${pk.x + pk.w * 0.08} ${yy - pk.h * 0.55} Z`} fill={p.dark} />
							</g>
						))}
						{/* haze at the foot of each range */}
						<rect x={-800} y={yy - 60} width={4400} height={90} fill="url(#gHaze)" opacity={0.5} />
					</g>
				);
			})}
		</g>
	);
};

// Long flat cloud banks lit from below by the sunset.
export const Clouds: React.FC<{f: number; y: number; count?: number; seed?: number; scale?: number; opacity?: number}> = ({f, y, count = 5, seed = 4, scale = 1, opacity = 1}) => {
	const r = rng(seed);
	return (
		<g opacity={opacity}>
			{Array.from({length: count}, (_, i) => {
				const w = (260 + r() * 380) * scale;
				const x = ((r() * 2400 + f * (0.25 + r() * 0.3)) % 2600) - 340;
				const yy = y + r() * 160 * scale;
				const h = w * 0.16;
				return (
					<g key={i} transform={`translate(${x} ${yy})`}>
						<path d={`M 0 0 Q ${w * 0.06} ${-h} ${w * 0.2} ${-h * 0.8} Q ${w * 0.3} ${-h * 2} ${w * 0.48} ${-h * 1.3} Q ${w * 0.62} ${-h * 2.3} ${w * 0.76} ${-h} Q ${w * 0.9} ${-h * 1.1} ${w} 0 Z`} fill="#4A3F96" />
						<path d={`M ${w * 0.03} -2 Q ${w * 0.5} ${h * 0.1} ${w * 0.98} -2 L ${w} 0 L 0 0 Z`} fill="#E07BA0" opacity={0.7} />
						<path d={`M ${w * 0.2} ${-h * 0.8} Q ${w * 0.3} ${-h * 2} ${w * 0.48} ${-h * 1.3}`} fill="none" stroke="#8C7AD6" strokeWidth={3} opacity={0.6} />
					</g>
				);
			})}
		</g>
	);
};

export const Moon: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={r * 2.2} fill="#CFD6FF" opacity={0.08} />
		<circle r={r * 1.4} fill="#CFD6FF" opacity={0.1} />
		<circle r={r} fill="#EEF0FF" />
		<path d={`M ${r * 0.2} ${-r} A ${r} ${r} 0 0 1 ${r * 0.2} ${r} A ${r * 0.8} ${r} 0 0 0 ${r * 0.2} ${-r} Z`} fill="#C9CCF2" />
		<circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.18} fill="#D8DBF8" />
		<circle cx={r * 0.1} cy={r * 0.35} r={r * 0.12} fill="#D8DBF8" />
		<circle cx={-r * 0.45} cy={r * 0.3} r={r * 0.08} fill="#D8DBF8" />
	</g>
);

// Fireflies: wandering glow points that blink.
export const Fireflies: React.FC<{f: number; x: number; y: number; w: number; h: number; count?: number; seed?: number; color?: string}> = ({f, x, y, w, h, count = 14, seed = 6, color = K.yellow}) => {
	const r = rng(seed);
	return (
		<g>
			{Array.from({length: count}, (_, i) => {
				const px = x + r() * w + 30 * Math.sin(f * 0.03 + i * 1.7);
				const py = y + r() * h + 20 * Math.cos(f * 0.025 + i * 2.3);
				const b = Math.max(0, Math.sin(f * 0.08 + i * 2.1));
				return (
					<g key={i} opacity={0.3 + 0.7 * b}>
						<circle cx={px} cy={py} r={9} fill={color} opacity={0.25} />
						<circle cx={px} cy={py} r={2.6} fill="#FFF6D0" />
					</g>
				);
			})}
		</g>
	);
};

// Foreground foliage silhouettes with a rim of light; blur them for depth of field.
export const Foliage: React.FC<{x: number; y: number; s?: number; flip?: boolean; f?: number; blur?: boolean; color?: string}> = ({x, y, s = 1, flip, f = 0, blur, color = '#12184A'}) => {
	const sway = 3 * Math.sin(f * 0.03 + x);
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter={blur ? 'url(#dofFg)' : undefined}>
			{[-60, -20, 25, 70].map((dx, i) => (
				<g key={i} transform={`rotate(${(i - 1.5) * 16 + sway})`}>
					<path d={`M ${dx * 0.2} 0 Q ${dx} -160 ${dx * 1.6} -300 Q ${dx * 0.6} -170 ${dx * 0.2 + 18} 0 Z`} fill={color} />
					<path d={`M ${dx * 0.2} 0 Q ${dx} -160 ${dx * 1.6} -300`} fill="none" stroke="#4E4AB0" strokeWidth={3} opacity={0.6} />
				</g>
			))}
			<ellipse cx={0} cy={0} rx={120} ry={30} fill={color} />
		</g>
	);
};

export const Rock: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -60 0 L -40 -46 L 6 -62 L 48 -30 L 60 0 Z" fill="#2A2F7A" />
		<path d="M -40 -46 L 6 -62 L 0 -20 L -60 0 Z" fill="#3F46A6" />
	</g>
);

export const Reeds: React.FC<{x: number; y: number; f: number; n?: number; s?: number}> = ({x, y, f, n = 5, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{Array.from({length: n}, (_, i) => {
			const h = 90 + ((i * 37) % 50);
			const sway = 4 * Math.sin(f * 0.04 + i);
			const dx = i * 16 - n * 8;
			return (
				<g key={i}>
					<path d={`M ${dx} 0 Q ${dx + sway / 2} ${-h / 2} ${dx + sway} ${-h}`} stroke="#2B3470" strokeWidth={4} fill="none" strokeLinecap="round" />
					<rect x={dx + sway - 5} y={-h - 26} width={10} height={30} rx={5} fill="#8A5A3C" />
				</g>
			);
		})}
	</g>
);

// A distant city at night: rows of tiny lit windows (people, asking questions).
export const City: React.FC<{x: number; y: number; w: number; f: number; seed?: number}> = ({x, y, w, f, seed = 9}) => {
	const r = rng(seed);
	const blocks: React.ReactNode[] = [];
	for (let bx = 0; bx < w; bx += 26 + r() * 30) {
		const bh = 30 + r() * 110;
		const bw = 22 + r() * 26;
		blocks.push(<rect key={`b${bx}`} x={x + bx} y={y - bh} width={bw} height={bh} fill="#1C2160" />);
		for (let wy = y - bh + 8; wy < y - 6; wy += 11) {
			for (let wx = x + bx + 4; wx < x + bx + bw - 5; wx += 8) {
				if (r() < 0.45) {
					const on = Math.sin(f * 0.02 + wx * 0.3 + wy) > -0.7;
					if (on) blocks.push(<rect key={`w${wx}-${wy}`} x={wx} y={wy} width={3.4} height={4.5} fill={r() < 0.8 ? K.yellow : K.cyan} opacity={0.85} />);
				}
			}
		}
	}
	return (
		<g>
			<rect x={x - 40} y={y - 70} width={w + 80} height={90} fill={K.yellow} opacity={0.06} filter="url(#glowBig)" />
			{blocks}
		</g>
	);
};

export const WorldDefs: React.FC = () => (
	<defs>
		<linearGradient id="gHaze" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#C77AB8" stopOpacity={0} />
			<stop offset="1" stopColor="#C77AB8" stopOpacity={0.5} />
		</linearGradient>
		<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#3B3A8E" />
			<stop offset="1" stopColor="#141A4E" />
		</linearGradient>
		<filter id="dofFg" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation={7} />
		</filter>
		<filter id="projGlow" x="-40%" y="-80%" width="180%" height="260%">
			<feGaussianBlur stdDeviation={14} result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>
);
