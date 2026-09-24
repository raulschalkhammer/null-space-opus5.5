import React from 'react';
import {rng} from '../fx/rough';

// Flat-vector kit: an original look inspired by bold, science-explainer animation. Dusk palettes, flat shapes
// with soft top-lit gradients and no outlines, glows on anything that emits light, drifting particles.
// Probability is still width: every ribbon, beam and pennant is exactly as wide as the chance it carries.

export const K = {
	night: '#0E1638',
	navy: '#17225A',
	indigo: '#24307A',
	indigoHi: '#33429A',
	violet: '#3B2F7A',
	dusk: '#8A4C9E',
	rose: '#E0628C',
	orange: '#FF8A3D',
	orangeHi: '#FFB35C',
	orangeLo: '#E0582A',
	yellow: '#FFD45C',
	teal: '#2EE6C5',
	tealLo: '#1FA7A0',
	cyan: '#5CC8FF',
	white: '#F6F4FF',
	mute: '#8E97D6',
	ink: '#0B1030',
};
export const FONT = '"Nunito", sans-serif';

export const FlatDefs: React.FC = () => (
	<defs>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={8} result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
		<filter id="glowBig" x="-80%" y="-80%" width="260%" height="260%">
			<feGaussianBlur stdDeviation={22} />
		</filter>
		<filter id="soft" x="-20%" y="-20%" width="140%" height="160%">
			<feDropShadow dx={0} dy={10} stdDeviation={10} floodColor="#050820" floodOpacity={0.45} />
		</filter>
		<linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={K.orangeHi} />
			<stop offset="1" stopColor={K.orangeLo} />
		</linearGradient>
		<linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#6CF2DA" />
			<stop offset="1" stopColor={K.tealLo} />
		</linearGradient>
		<linearGradient id="gRibbon" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#4A5BC0" />
			<stop offset="1" stopColor="#2C3886" />
		</linearGradient>
		<linearGradient id="gChosen" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={K.orangeHi} />
			<stop offset="1" stopColor={K.orange} />
		</linearGradient>
		<radialGradient id="gOrb" cx="0.35" cy="0.3">
			<stop offset="0" stopColor="#FFF6CF" />
			<stop offset="0.5" stopColor={K.yellow} />
			<stop offset="1" stopColor="#E89A1C" />
		</radialGradient>
		<radialGradient id="gLamp">
			<stop offset="0" stopColor="#FFF7D6" stopOpacity={1} />
			<stop offset="0.4" stopColor={K.yellow} stopOpacity={0.55} />
			<stop offset="1" stopColor={K.yellow} stopOpacity={0} />
		</radialGradient>
		<linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#FFE9A0" stopOpacity={0.85} />
			<stop offset="1" stopColor="#FFE9A0" stopOpacity={0.06} />
		</linearGradient>
		<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={K.night} />
			<stop offset="0.55" stopColor={K.violet} />
			<stop offset="0.85" stopColor={K.dusk} />
			<stop offset="1" stopColor={K.rose} />
		</linearGradient>
		<linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#2A2F7E" />
			<stop offset="1" stopColor="#141C4E" />
		</linearGradient>
		<radialGradient id="gSun">
			<stop offset="0" stopColor="#FFE3A3" />
			<stop offset="0.35" stopColor="#FFB86B" />
			<stop offset="1" stopColor="#FF8A3D" stopOpacity={0} />
		</radialGradient>
	</defs>
);

// Stars and slowly drifting motes: the constant quiet motion that keeps a flat frame alive.
export const Stars: React.FC<{f: number; count?: number; maxY?: number; seed?: number}> = ({f, count = 90, maxY = 600, seed = 3}) => {
	const r = rng(seed);
	return (
		<g>
			{Array.from({length: count}, (_, i) => {
				const x = r() * 1920;
				const y = r() * maxY;
				const s = 0.8 + r() * 2.2;
				const tw = 0.45 + 0.55 * Math.abs(Math.sin(f * 0.05 + i));
				return <circle key={i} cx={x} cy={y} r={s} fill={K.white} opacity={tw * (0.35 + 0.5 * (1 - y / maxY))} />;
			})}
		</g>
	);
};
export const Motes: React.FC<{f: number; count?: number; seed?: number; color?: string}> = ({f, count = 26, seed = 5, color = K.cyan}) => {
	const r = rng(seed);
	return (
		<g>
			{Array.from({length: count}, (_, i) => {
				const x0 = r() * 1920;
				const speed = 0.4 + r() * 0.8;
				const y = 1100 - ((f * speed + r() * 1200) % 1200);
				const x = x0 + 18 * Math.sin(f * 0.02 + i);
				return <circle key={i} cx={x} cy={y} r={2 + r() * 3} fill={color} opacity={0.18 + 0.25 * r()} />;
			})}
		</g>
	);
};

// Layered dusk hills along a horizon line.
export const Hills: React.FC<{y: number; shift?: number}> = ({y, shift = 0}) => (
	<g>
		<circle cx={1320 - shift * 0.2} cy={y - 40} r={260} fill="url(#gSun)" opacity={0.9} />
		<circle cx={1320 - shift * 0.2} cy={y - 40} r={70} fill="#FFE0A0" />
		<g transform={`translate(${-shift * 0.3} 0)`}>
			<path d={`M -400 ${y - 30} C -100 ${y - 110} 200 ${y - 60} 480 ${y - 95} C 760 ${y - 130} 1000 ${y - 50} 1260 ${y - 90} C 1520 ${y - 130} 1760 ${y - 70} 2000 ${y - 100} C 2200 ${y - 120} 2350 ${y - 80} 2600 ${y - 90} C 2900 ${y - 110} 3200 ${y - 60} 3600 ${y - 95} L 3600 ${y + 80} L -400 ${y + 80} Z`} fill="#4B3A8E" />
		</g>
		<g transform={`translate(${-shift * 0.5} 0)`}>
			<path d={`M -400 ${y + 5} C -100 ${y - 40} 260 ${y} 560 ${y - 35} C 860 ${y - 70} 1100 ${y - 5} 1400 ${y - 45} C 1700 ${y - 80} 1950 ${y - 20} 2500 ${y - 35} C 2900 ${y - 60} 3200 ${y - 10} 3600 ${y - 40} L 3600 ${y + 90} L -400 ${y + 90} Z`} fill="#2F2E7A" />
		</g>
	</g>
);

// Gab: a flat locomotive-typewriter with two simple eyes. Origin = front wheel contact, facing right.
export const FlatLoco: React.FC<{scale?: number; look?: number; blink?: number; worried?: boolean}> = ({scale = 1, look = 0.3, blink = 0, worried}) => (
	<g transform={`scale(${scale})`}>
		<g filter="url(#soft)">
			<path d="M -150 -150 L -152 -210 Q -152 -216 -146 -216 L -72 -220 Q -66 -220 -66 -214 L -64 -150 Z" fill={K.white} />
			{[0, 1, 2, 3].map((r) => (
				<rect key={r} x={-140} y={-200 + r * 12} width={52 - (r % 2) * 16} height={4} rx={2} fill="#C7C4E8" />
			))}
			<rect x={-172} y={-156} width={134} height={18} rx={9} fill={K.ink} />
			<rect x={-194} y={-140} width={184} height={102} rx={22} fill="url(#gOrange)" />
			<rect x={-194} y={-70} width={184} height={32} rx={0} fill={K.orangeLo} opacity={0.5} />
			{[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => <circle key={`${r}${c}`} cx={-176 + c * 21 + r * 6} cy={-62 - r * 20} r={6.5} fill="#FFE6C8" />))}
			{/* eyes */}
			{[-58, -30].map((x) => (
				<g key={x}>
					<ellipse cx={x} cy={-104} rx={11} ry={13 * (1 - 0.9 * blink)} fill={K.white} />
					{blink < 0.5 ? <circle cx={x + 4 * look} cy={worried ? -100 : -104} r={5} fill={K.ink} /> : null}
				</g>
			))}
			{worried ? <path d="M -70 -124 L -48 -120 M -18 -120 L -40 -124" stroke={K.ink} strokeWidth={4} strokeLinecap="round" /> : null}
			<rect x={-204} y={-42} width={200} height={16} rx={8} fill={K.ink} />
			{[-172, -106, -40].map((x) => (
				<g key={x}>
					<circle cx={x} cy={-18} r={22} fill="#1C2358" />
					<circle cx={x} cy={-18} r={9} fill="#5A64B8" />
				</g>
			))}
			<path d="M -4 -36 L 22 -4 L -4 -4 Z" fill={K.orangeLo} />
		</g>
	</g>
);

// Jev: a flat lighthouse whose lamp is the only thing that "looks". Origin = base centre.
export const FlatLighthouse: React.FC<{scale?: number; on?: number}> = ({scale = 1, on = 1}) => (
	<g transform={`scale(${scale})`}>
		<circle cx={0} cy={-125} r={110 * (0.5 + 0.5 * on)} fill="url(#gLamp)" opacity={on} />
		<g filter="url(#soft)">
			<path d="M -34 0 L -22 -104 L 22 -104 L 34 0 Z" fill="#EDEBFF" />
			<path d="M -30 -30 L 30 -30 L 27 -56 L -27 -56 Z" fill={K.teal} />
			<path d="M -25 -76 L 25 -76 L 23 -94 L -23 -94 Z" fill={K.teal} />
			<path d="M 0 0 L 34 0 L 22 -104 L 0 -104 Z" fill={K.ink} opacity={0.12} />
			<rect x={-28} y={-112} width={56} height={9} rx={4} fill={K.ink} />
			<rect x={-17} y={-142} width={34} height={30} rx={6} fill={on > 0.2 ? '#FFF1C0' : '#6B6FA8'} />
			<path d="M -24 -142 L 0 -168 L 24 -142 Z" fill={K.rose} />
		</g>
	</g>
);
export const LAMP_Y = -127;

// Narration subtitle.
export const FlatSubtitle: React.FC<{text: string}> = ({text}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, lineHeight: 1.25, color: K.white, textAlign: 'center', maxWidth: 1400, textShadow: '0 2px 10px rgba(5,8,32,0.9), 0 0 2px rgba(5,8,32,1)'}}>{text}</div>
	</div>
);

// Rounded label pill, SVG, anchored at its bottom centre (with an optional stem to the ground).
export const Pill: React.FC<{x: number; y: number; s: number; title: string; sub?: string; hot?: boolean; opacity?: number; stem?: number}> = ({x, y, s, title, sub, hot, opacity = 1, stem = 40}) => {
	const w = Math.max(96, title.length * 18 + 44);
	const h = sub ? 74 : 48;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
			{stem ? <rect x={-2} y={-stem} width={4} height={stem} rx={2} fill={hot ? K.orange : K.mute} /> : null}
			<g filter="url(#soft)">
				<rect x={-w / 2} y={-stem - h} width={w} height={h} rx={h / 2.4} fill={hot ? K.orange : K.indigoHi} />
			</g>
			<text x={0} y={-stem - h + (sub ? 32 : 32)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={hot ? K.ink : K.white}>
				{title}
			</text>
			{sub ? (
				<text x={0} y={-stem - 12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={hot ? K.ink : K.yellow}>
					{sub}
				</text>
			) : null}
		</g>
	);
};
