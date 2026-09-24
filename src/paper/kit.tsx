import React from 'react';

// Paper Diorama kit: palette, cut-paper filters, perspective camera and reusable props.
//
// The one rule of this world: PROBABILITY IS WIDTH. A track, a beam or a streamer is exactly as wide
// as the chance it carries. Forks split the width, following a path multiplies it, and the numbers
// and symbols are printed on paper that lives in the scene, only after the picture has shown the idea.

export const P = {
	ink: '#2B2722',
	cream: '#F3EAD7',
	card: '#FBF6EA',
	strip: '#EFE3C8',
	stripHot: '#E9C9A4',
	sage: '#A9B892',
	sageFar: '#C8CDB0',
	sageDeep: '#8C9E7A',
	grass: '#7B8E6B',
	shade: '#3F4B3C',
	ochre: '#D2A868',
	sun: '#EDC98A',
	terracotta: '#B8573A',
	rust: '#9E4A32',
	teal: '#3E7F7A',
	pond: '#4E5F66',
	pondLight: '#7D9096',
	faint: '#B9A98A',
	skyTop: '#E9DDC4',
	skyMid: '#F1E6D0',
	skyLow: '#E6D3B3',
};
export const SERIF = '"Fraunces", serif';

export const PaperDefs: React.FC = () => (
	<defs>
		{[1, 2, 3].map((s) => (
			<filter key={s} id={`cast${s}`} x="-10%" y="-10%" width="120%" height="130%">
				<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={s} result="n" />
				<feDisplacementMap in="SourceGraphic" in2="n" scale={1.6 + s * 0.4} xChannelSelector="R" yChannelSelector="G" result="cut" />
				<feDropShadow in="cut" dx={2 * s} dy={5 * s} stdDeviation={4 + 4 * s} floodColor="#3A2A18" floodOpacity={0.32} />
			</filter>
		))}
		{[2, 6].map((b) => (
			<filter key={b} id={`dof${b}`} x="-10%" y="-10%" width="120%" height="130%">
				<feGaussianBlur stdDeviation={b} />
			</filter>
		))}
		<radialGradient id="lampGlow">
			<stop offset="0" stopColor="#FFF4CF" />
			<stop offset="1" stopColor="#FFD980" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="beamR2L" x1="1" y1="0" x2="0" y2="0">
			<stop offset="0" stopColor="#FFE7A8" stopOpacity={0.9} />
			<stop offset="1" stopColor="#FFE7A8" stopOpacity={0.15} />
		</linearGradient>
	</defs>
);

export const Layer: React.FC<{children: React.ReactNode; shadow?: 1 | 2 | 3; blur?: 2 | 6}> = ({children, shadow = 1, blur}) => (
	<g filter={blur ? `url(#dof${blur})` : `url(#cast${shadow})`}>{children}</g>
);

export const Sky: React.FC = () => (
	<>
		<defs>
			<linearGradient id="paperSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={P.skyTop} />
				<stop offset="0.55" stopColor={P.skyMid} />
				<stop offset="1" stopColor={P.skyLow} />
			</linearGradient>
		</defs>
		<rect width={1920} height={1080} fill="url(#paperSky)" />
	</>
);

// ---------- perspective camera for the "tabletop" shots ----------
// Ground-plane point (X sideways, Z depth) -> screen. The camera sits at height H looking at the horizon.
export type Cam = {f: number; H: number; horizon: number; cx: number};
export const project = (cam: Cam, X: number, Z: number) => ({x: cam.cx + (cam.f * X) / Z, y: cam.horizon + (cam.f * cam.H) / Z, s: cam.f / Z});

type Pt = [number, number];
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
	const u = 1 - t;
	return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
};

// A flat paper ribbon lying on the ground, from (x0, z0 .. z0+w0) to (x1, z1 .. z1+w1), Sankey-style.
export function ribbon(cam: Cam, x0: number, z0: number, w0: number, x1: number, z1: number, w1: number, n = 40) {
	const xm = (x0 + x1) / 2;
	const edge = (za: number, zb: number) => Array.from({length: n + 1}, (_, i) => bez([x0, za], [xm, za], [xm, zb], [x1, zb], i / n));
	const top = edge(z0 + w0, z1 + w1);
	const bot = edge(z0, z1).reverse();
	const pts = [...top, ...bot].map(([X, Z]) => project(cam, X, Z));
	return {d: `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`, mid: (t: number) => {
		const [X, Za] = bez([x0, z0 + w0 / 2], [xm, z0 + w0 / 2], [xm, z1 + w1 / 2], [x1, z1 + w1 / 2], t);
		return project(cam, X, Za);
	}};
}

// ---------- props ----------
// Gab: a faceless paper locomotive-typewriter. Origin = front wheel contact, facing right.
export const Loco: React.FC<{scale?: number}> = ({scale = 1}) => (
	<g transform={`scale(${scale})`}>
		<Layer shadow={2}>
			<rect x={-190} y={-118} width={176} height={80} rx={14} fill={P.terracotta} />
			<rect x={-170} y={-150} width={130} height={16} rx={8} fill="#3A332D" />
			<path d="M -150 -150 L -152 -206 L -70 -212 L -64 -150 Z" fill={P.card} />
			{[0, 1, 2, 3].map((r) => (
				<line key={r} x1={-140} x2={-84 - (r % 2) * 16} y1={-194 + r * 12} y2={-195 + r * 12} stroke={P.faint} strokeWidth={2.5} />
			))}
			{[0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5].map((c) => <circle key={`${r}${c}`} cx={-172 + c * 22 + r * 6} cy={-60 - r * 18} r={6.5} fill="#F3E3C6" />))}
			<rect x={-200} y={-40} width={196} height={16} rx={4} fill="#3A332D" />
			{[-170, -104, -38].map((x) => (
				<g key={x}>
					<circle cx={x} cy={-18} r={22} fill="#2E2A26" />
					<circle cx={x} cy={-18} r={9} fill="#6A6158" />
				</g>
			))}
			<path d="M -6 -36 L 20 -4 L -6 -4 Z" fill="#8E3F2A" />
		</Layer>
	</g>
);

// Jev: a paper lighthouse. Origin = base centre. Returns the lamp position via `lamp` offset (0, -150).
export const Lighthouse: React.FC<{scale?: number}> = ({scale = 1}) => (
	<g transform={`scale(${scale})`}>
		<Layer shadow={2}>
			<path d="M -33 0 L -21 -104 L 21 -104 L 33 0 Z" fill={P.cream} />
			<path d="M -29 -32 L 29 -32 L 26 -56 L -26 -56 Z" fill={P.teal} />
			<path d="M -24 -76 L 24 -76 L 22 -94 L -22 -94 Z" fill={P.teal} />
			<rect x={-27} y={-110} width={54} height={8} fill={P.ink} />
			<rect x={-17} y={-140} width={34} height={30} fill="#FFE9A6" />
			<path d="M -23 -140 L 0 -164 L 23 -140 Z" fill={P.rust} />
		</Layer>
		<circle cx={0} cy={-125} r={70} fill="url(#lampGlow)" style={{mixBlendMode: 'screen'}} />
	</g>
);
export const LAMP_Y = -125;

// A paper tag hanging from a string, for numbers and symbols that live in the scene.
export const Tag: React.FC<{x: number; y: number; w: number; h: number; rot?: number; children: React.ReactNode; hang?: {x: number; y: number}}> = ({x, y, w, h, rot = 0, children, hang}) => (
	<>
		{hang ? <line x1={hang.x} y1={hang.y} x2={x + 14} y2={y + 14} stroke={P.ink} strokeWidth={1.5} /> : null}
		<Layer shadow={1}>
			<g transform={`translate(${x} ${y}) rotate(${rot})`}>
				<rect width={w} height={h} rx={6} fill={P.card} />
				<circle cx={14} cy={14} r={5} fill="#D9C9A8" />
				<foreignObject x={0} y={0} width={w} height={h}>
					<div style={{width: w, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, color: P.ink, textAlign: 'center'}}>{children}</div>
				</foreignObject>
			</g>
		</Layer>
	</>
);

// Narration subtitle, set like film subtitles over the scene.
export const Subtitle: React.FC<{text: string; bottom?: number}> = ({text, bottom = 44}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center'}}>
		<div style={{fontFamily: SERIF, fontSize: 38, lineHeight: 1.25, color: '#FFF8EA', textAlign: 'center', maxWidth: 1360, textShadow: '0 2px 12px rgba(30,20,10,0.8), 0 0 2px rgba(30,20,10,0.95)'}}>{text}</div>
	</div>
);

export const Slate: React.FC<{beat: string}> = ({beat}) => (
	<div style={{position: 'absolute', left: 90, top: 64, color: P.ink}}>
		<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 17, letterSpacing: 6}}>Nº 1 · TRACK LAYER</div>
		<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, lineHeight: 1.1, marginTop: 4}}>{beat}</div>
	</div>
);

export const HorizonHills: React.FC<{y: number; lighthouseX?: number}> = ({y, lighthouseX}) => (
	<>
		<Layer blur={2}>
			<circle cx={1330} cy={y - 150} r={95} fill={P.sun} />
			<path d={`M 0 ${y - 40} C 300 ${y - 110} 520 ${y - 60} 760 ${y - 90} C 1000 ${y - 120} 1200 ${y - 50} 1440 ${y - 95} C 1640 ${y - 130} 1800 ${y - 80} 1920 ${y - 100} L 1920 ${y + 60} L 0 ${y + 60} Z`} fill={P.sageFar} />
		</Layer>
		<Layer shadow={1}>
			<path d={`M 0 ${y + 10} C 260 ${y - 40} 520 ${y + 5} 800 ${y - 30} C 1060 ${y - 60} 1300 ${y + 10} 1540 ${y - 45} C 1700 ${y - 80} 1820 ${y - 20} 1920 ${y - 30} L 1920 ${y + 80} L 0 ${y + 80} Z`} fill={P.sage} />
		</Layer>
		{lighthouseX ? (
			<g transform={`translate(${lighthouseX} ${y - 58})`}>
				<Lighthouse scale={0.42} />
			</g>
		) : null}
	</>
);
