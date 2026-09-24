import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, JEV_P, NARRATION, SENTENCE, UNLUCKY} from './Shared';

// Direction C: "Paper Diorama". Layered cut paper lit like a stop-motion set: soft cast shadows,
// shallow depth of field, a muted earthy palette. Characters become objects: Gab is a paper
// locomotive-typewriter with no face, Jev is a lighthouse that takes in the whole scene in one sweep.
const SERIF = '"Fraunces", serif';
const INK = '#2B2722';
const CREAM = '#F3EAD7';

const Layer: React.FC<{children: React.ReactNode; shadow?: number; blur?: number}> = ({children, shadow = 1, blur = 0}) => (
	<g filter={blur ? `url(#dof${blur})` : `url(#cast${shadow})`}>{children}</g>
);

// Track pieces: flat, then bending down towards the cliff once the unlikely word is laid.
function trackPieces() {
	const L = 150;
	let x = 20;
	let y = 742;
	return SENTENCE.map((w, i) => {
		const k = i - UNLUCKY;
		const angle = k < 0 ? 0 : 7 + 12 * k;
		const r = (angle * Math.PI) / 180;
		const piece = {x, y, angle, w};
		x += L * Math.cos(r);
		y += L * Math.sin(r);
		return piece;
	});
}

export const StylePaper: React.FC = () => {
	const pieces = trackPieces();
	const end = pieces[pieces.length - 1];
	const endX = end.x + 150 * Math.cos((end.angle * Math.PI) / 180);
	const endY = end.y + 150 * Math.sin((end.angle * Math.PI) / 180);
	const lamp = {x: 1605, y: 318};
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #E9DDC4 0%, #F1E6D0 55%, #E6D3B3 100%)'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
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
					<linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
						<stop offset="0" stopColor="#FFE7A8" stopOpacity={0.85} />
						<stop offset="1" stopColor="#FFE7A8" stopOpacity={0} />
					</linearGradient>
					<radialGradient id="lampGlow">
						<stop offset="0" stopColor="#FFF4CF" />
						<stop offset="1" stopColor="#FFD980" stopOpacity={0} />
					</radialGradient>
				</defs>

				{/* sun + far hills (soft focus) */}
				<Layer blur={2}>
					<circle cx={1230} cy={250} r={120} fill="#EDC98A" />
					<path d="M 0 560 C 260 470 420 520 640 480 C 900 430 1080 520 1320 470 C 1560 420 1760 470 1920 440 L 1920 1080 L 0 1080 Z" fill="#C8CDB0" />
				</Layer>
				{/* mid hills with the lighthouse hill */}
				<Layer shadow={1}>
					<path d="M 0 640 C 300 590 520 640 760 600 C 1000 560 1180 640 1360 560 C 1480 505 1560 430 1640 432 C 1760 436 1840 520 1920 540 L 1920 1080 L 0 1080 Z" fill="#A9B892" />
				</Layer>
				{/* the lighthouse (Jev) and its beam across the whole scene */}
				<path d={`M ${lamp.x} ${lamp.y - 14} L 60 520 L 60 700 L ${lamp.x} ${lamp.y + 14} Z`} fill="url(#beam)" style={{mixBlendMode: 'screen'}} />
				<Layer shadow={2}>
					<path d="M 1572 440 L 1584 336 L 1626 336 L 1638 440 Z" fill={CREAM} />
					<path d="M 1576 408 L 1634 408 L 1631 384 L 1579 384 Z" fill="#3E7F7A" />
					<path d="M 1581 364 L 1629 364 L 1627 346 L 1583 346 Z" fill="#3E7F7A" />
					<rect x={1578} y={330} width={54} height={8} fill={INK} />
					<rect x={1588} y={300} width={34} height={30} fill="#FFE9A6" />
					<path d="M 1582 300 L 1605 276 L 1628 300 Z" fill="#9E4A32" />
				</Layer>
				<circle cx={lamp.x} cy={lamp.y} r={70} fill="url(#lampGlow)" style={{mixBlendMode: 'screen'}} />
				{/* the typed answer hanging from the balcony */}
				<Layer shadow={1}>
					<line x1={1632} y1={338} x2={1690} y2={392} stroke={INK} strokeWidth={1.5} />
					<g transform="translate(1668 390) rotate(8)">
						<rect x={0} y={0} width={124} height={70} rx={6} fill={CREAM} />
						<circle cx={16} cy={16} r={5} fill="#D9C9A8" />
						<text x={62} y={30} textAnchor="middle" fontFamily={SERIF} fontSize={15} fontStyle="italic" fill={INK}>
							scam?
						</text>
						<text x={62} y={60} textAnchor="middle" fontFamily={SERIF} fontSize={30} fontWeight={600} fill="#9E4A32">
							{JEV_P.toFixed(2)}
						</text>
					</g>
				</Layer>
				{/* the plateau, cliff and pond */}
				<Layer shadow={2}>
					<path d={`M 0 760 L 900 760 C 980 770 1040 820 1090 880 C 1120 920 1140 960 1150 1080 L 0 1080 Z`} fill="#8C9E7A" />
				</Layer>
				<Layer shadow={1}>
					<path d="M 1130 930 C 1250 900 1450 905 1600 940 C 1650 960 1640 1000 1560 1010 C 1400 1030 1220 1020 1150 995 C 1100 975 1100 945 1130 930 Z" fill="#4E5F66" />
					<path d="M 1200 950 C 1260 940 1330 942 1380 950" stroke="#7D9096" strokeWidth={4} fill="none" strokeLinecap="round" />
				</Layer>
				<Layer shadow={3}>
					<path d="M 1150 1080 C 1180 1000 1300 1000 1480 1020 C 1640 1036 1760 980 1920 960 L 1920 1080 Z" fill="#7B8E6B" />
				</Layer>
				{/* the email, pinned at the start of the line */}
				<Layer shadow={2}>
					<g transform="translate(70 560) rotate(-4)">
						<rect width={150} height={100} fill="#FBF6EA" />
						<path d="M 0 0 L 75 55 L 150 0" fill="none" stroke="#B9A98A" strokeWidth={3} />
						<rect x={118} y={10} width={22} height={26} fill="#9E4A32" />
					</g>
					<line x1={140} y1={660} x2={140} y2={760} stroke={INK} strokeWidth={4} />
				</Layer>
				{/* track: paper sleepers printed with the words, rails on top */}
				{pieces.map((p, i) => (
					<g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
						<Layer shadow={1}>
							<rect x={4} y={4} width={142} height={34} fill={i === UNLUCKY ? '#E9C9A4' : '#EFE3C8'} />
							<text x={75} y={28} textAnchor="middle" fontFamily={SERIF} fontSize={20} fontWeight={600} letterSpacing={2.5} fill={i === UNLUCKY ? '#9E4A32' : INK}>
								{p.w.t.toUpperCase()}
							</text>
						</Layer>
						<rect x={0} y={-4} width={150} height={5} fill={INK} />
					</g>
				))}
				{/* the locomotive-typewriter, teetering at the end */}
				<g transform={`translate(${endX - 6} ${endY - 2}) rotate(${end.angle + 8})`}>
					<Layer shadow={2}>
						<rect x={-190} y={-118} width={176} height={80} rx={14} fill="#B8573A" />
						<rect x={-170} y={-150} width={130} height={16} rx={8} fill="#3A332D" />
						<path d="M -150 -150 L -152 -206 L -70 -212 L -64 -150 Z" fill="#FBF6EA" />
						{[0, 1, 2, 3].map((r) => (
							<line key={r} x1={-140} x2={-84 - (r % 2) * 16} y1={-194 + r * 12} y2={-195 + r * 12} stroke="#B9A98A" strokeWidth={2.5} />
						))}
						{[0, 1, 2].map((r) =>
							[0, 1, 2, 3, 4, 5].map((c) => <circle key={`${r}${c}`} cx={-172 + c * 22 + r * 6} cy={-60 - r * 18} r={6.5} fill="#F3E3C6" />),
						)}
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
				{/* soft-focus foreground */}
				<Layer blur={6}>
					<path d="M 0 1080 L 0 930 C 60 900 90 960 130 900 C 170 850 200 960 260 930 C 330 900 360 1000 420 1080 Z" fill="#3F4B3C" />
					<path d="M 1920 1080 L 1920 880 C 1860 860 1840 930 1790 900 C 1740 870 1720 960 1660 960 C 1610 960 1600 1040 1560 1080 Z" fill="#3F4B3C" />
				</Layer>
			</svg>
			{/* title */}
			<div style={{position: 'absolute', left: 110, top: 80, color: INK}}>
				<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 20, letterSpacing: 6}}>Nº 1</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, lineHeight: 1.05}}>Track Layer</div>
				<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 18, letterSpacing: 7, marginTop: 8}}>THE MODEL THAT DOESN’T TALK</div>
			</div>
			{/* narration subtitle */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center'}}>
				<div style={{fontFamily: SERIF, fontSize: 40, lineHeight: 1.25, color: '#FFF8EA', textAlign: 'center', maxWidth: 1300, textShadow: '0 2px 12px rgba(30,20,10,0.75), 0 0 2px rgba(30,20,10,0.9)'}}>
					{NARRATION.c}
				</div>
			</div>
			<Grain id="paperGrain" opacity={0.18} freq={0.55} seed={9} />
		</AbsoluteFill>
	);
};
