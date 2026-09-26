import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT, FlatDefs, K, Stars} from '../flat/kit';
import {Mountains, WorldDefs} from '../flat/world';

// YouTube thumbnail (1280x720) for "How Jev Works (and Why It Never Writes a Word)".
// Jev as a robot, built from the lighthouse it is in the film: a striped tower for a body, the lamp room for a face
// (two eyes, no mouth: it never talks), the rose roof for a cap, its beam behind the claims.
const W = 1280;
const H = 720;
const INK = '#0B1030';

const Robot: React.FC = () => (
	<g>
		{/* the beam, out of the lamp room toward the numbers */}
		<path d="M 60 -250 L 1100 -520 L 1100 60 L 60 -170 Z" fill="url(#gBeam)" opacity={0.9} />
		{/* glow around the head */}
		<circle cx={0} cy={-230} r={330} fill="url(#gLamp)" opacity={0.55} />
		{/* arms: rounded capsules with a glowing tip (no hands) */}
		<g>
			<path d="M -118 -60 Q -190 20 -170 110" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
			<path d="M -118 -60 Q -190 20 -170 110" fill="none" stroke="#EDEBFF" strokeWidth={30} strokeLinecap="round" />
			<path d="M 118 -70 Q 220 -120 250 -230" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
			<path d="M 118 -70 Q 220 -120 250 -230" fill="none" stroke="#EDEBFF" strokeWidth={30} strokeLinecap="round" />
			<circle cx={250} cy={-236} r={38} fill={K.yellow} opacity={0.35} filter="url(#glowBig)" />
			<circle cx={250} cy={-236} r={22} fill={K.yellow} stroke={INK} strokeWidth={7} />
		</g>
		{/* the tower body, striped like the lighthouse */}
		<defs>
			<clipPath id="thBody">
				<path d="M -150 250 L -112 -110 Q -110 -130 -90 -130 L 90 -130 Q 110 -130 112 -110 L 150 250 Z" />
			</clipPath>
		</defs>
		<path d="M -150 250 L -112 -110 Q -110 -130 -90 -130 L 90 -130 Q 110 -130 112 -110 L 150 250 Z" fill="#EDEBFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
		<g clipPath="url(#thBody)">
			<rect x={-200} y={-20} width={400} height={70} fill={K.teal} />
			<rect x={-200} y={130} width={400} height={70} fill={K.teal} />
			<path d="M 0 -140 L 160 -140 L 200 260 L 0 260 Z" fill={INK} opacity={0.12} />
		</g>
		{/* chest plate: its name */}
		<rect x={-70} y={-100} width={140} height={58} rx={14} fill={INK} />
		<text x={0} y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} letterSpacing={6} fill={K.yellow}>
			JEV
		</text>
		{/* the gallery ring */}
		<rect x={-140} y={-160} width={280} height={36} rx={14} fill={INK} />
		{/* the head: the lamp room, glowing, with two eyes and no mouth */}
		<rect x={-130} y={-380} width={260} height={224} rx={46} fill="#EDEBFF" stroke={INK} strokeWidth={8} />
		<rect x={-104} y={-356} width={208} height={176} rx={32} fill="#FFF1C0" />
		<rect x={-104} y={-356} width={208} height={176} rx={32} fill={K.yellow} opacity={0.35} />
		{[-46, 46].map((ex) => (
			<g key={ex}>
				<ellipse cx={ex} cy={-262} rx={30} ry={40} fill={INK} />
				<circle cx={ex + 9} cy={-276} r={11} fill="#FFFFFF" />
				<circle cx={ex - 8} cy={-248} r={5} fill="#FFFFFF" opacity={0.8} />
				{/* a confident lid */}
				<path d={`M ${ex - 36} -300 Q ${ex} ${-318} ${ex + 36} -300 L ${ex + 36} -292 Q ${ex} -304 ${ex - 36} -292 Z`} fill={INK} />
			</g>
		))}
		<circle cx={-78} cy={-214} r={12} fill={K.rose} opacity={0.45} />
		<circle cx={78} cy={-214} r={12} fill={K.rose} opacity={0.45} />
		{/* the roof cap and its bulb */}
		<path d="M -150 -372 L 0 -470 L 150 -372 Z" fill={K.rose} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
		<circle cx={0} cy={-490} r={40} fill={K.yellow} opacity={0.4} filter="url(#glowBig)" />
		<circle cx={0} cy={-488} r={20} fill={K.yellow} stroke={INK} strokeWidth={7} />
	</g>
);

// "never writes a word": a speech bubble, crossed out
const NoWords: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
		<path d="M -110 -60 Q -110 -90 -80 -90 L 80 -90 Q 110 -90 110 -60 L 110 30 Q 110 60 80 60 L 10 60 L -30 100 L -30 60 L -80 60 Q -110 60 -110 30 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
		{[-50, 0, 50].map((dx) => (
			<circle key={dx} cx={dx} cy={-15} r={15} fill={INK} />
		))}
		<line x1={-125} y1={80} x2={125} y2={-110} stroke={INK} strokeWidth={40} strokeLinecap="round" />
		<line x1={-125} y1={80} x2={125} y2={-110} stroke={K.rose} strokeWidth={24} strokeLinecap="round" />
	</g>
);

const Claim: React.FC<{y: number; big: string; small: string; color: string}> = ({y, big, small, color}) => {
	const halo = {paintOrder: 'stroke' as const, stroke: INK, strokeLinejoin: 'round' as const};
	return (
		<g transform={`translate(1000 ${y})`}>
			<text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={176} fill={color} style={{...halo, strokeWidth: 22}}>
				{big}
			</text>
			<text x={0} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} letterSpacing={4} fill="#FFFFFF" style={{...halo, strokeWidth: 16}}>
				{small}
			</text>
		</g>
	);
};

export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: K.night}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<FlatDefs />
			<WorldDefs />
			<rect x={0} y={0} width={W} height={H} fill="url(#gSky)" />
			<Stars f={0} maxY={520} count={80} />
			<circle cx={360} cy={330} r={420} fill="url(#gSun)" opacity={0.55} />
			<g transform="scale(0.667)">
				<Mountains y={900} seed={12} layers={2} />
			</g>
			<rect x={0} y={640} width={W} height={100} fill="#1E2466" />
			<g transform="translate(360 530) rotate(-4) scale(0.92)">
				<Robot />
			</g>
			<NoWords x={118} y={262} s={0.74} />
			<Claim y={250} big="200×" small="FASTER" color={K.yellow} />
			<Claim y={560} big="450×" small="CHEAPER" color={K.orangeHi} />
			<text x={1262} y={708} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={20} fill="#FFFFFF" opacity={0.75}>
				*TypeSafe’s own tests
			</text>
			<rect x={0} y={0} width={W} height={H} fill="url(#gVignette)" opacity={0.7} />
		</svg>
	</AbsoluteFill>
);
