import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT, FlatDefs, K} from '../flat/kit';
import {Mountains, WorldDefs} from '../flat/world';

// YouTube thumbnail (1280x720) for "How Jev Works (and Why It Never Writes a Word)".
// Jev as a robot, built from the lighthouse it is in the film: a striped tower for a body, the lamp room for a face
// (two eyes, no mouth: it never talks), the rose roof for a cap, its beam behind the claims.
// Lit from behind-left by the dusk sun and from within by its own lamp: gradients, rim light, glass reflections,
// a volumetric beam, grain, and glossy 3D lettering.
const W = 1280;
const H = 720;
const INK = '#0B1030';

const Defs: React.FC = () => (
	<defs>
		{/* texture */}
		<filter id="thGrain" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.2 -0.25" />
		</filter>
		<filter id="thSoft" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={6} />
		</filter>
		<filter id="thBlur2" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={2.2} />
		</filter>
		<filter id="thShadow" x="-30%" y="-30%" width="160%" height="160%">
			<feDropShadow dx={0} dy={16} stdDeviation={14} floodColor="#050820" floodOpacity={0.55} />
		</filter>
		{/* sky */}
		<radialGradient id="thSun" cx="0.28" cy="0.48" r="0.6">
			<stop offset="0" stopColor="#FFE6A8" stopOpacity={0.95} />
			<stop offset="0.25" stopColor="#FFB25E" stopOpacity={0.6} />
			<stop offset="0.6" stopColor="#C8579A" stopOpacity={0.25} />
			<stop offset="1" stopColor="#3B2F7A" stopOpacity={0} />
		</radialGradient>
		<radialGradient id="thNebula" cx="0.5" cy="0.5" r="0.5">
			<stop offset="0" stopColor="#8A5AD6" stopOpacity={0.45} />
			<stop offset="1" stopColor="#8A5AD6" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="thBeam" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#FFF4C8" stopOpacity={0.95} />
			<stop offset="0.35" stopColor="#FFE08A" stopOpacity={0.45} />
			<stop offset="1" stopColor="#FFD45C" stopOpacity={0.04} />
		</linearGradient>
		<linearGradient id="thBeamCore" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
			<stop offset="1" stopColor="#FFF4C8" stopOpacity={0} />
		</linearGradient>
		<linearGradient id="thGround" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#2B2F86" />
			<stop offset="1" stopColor="#10143E" />
		</linearGradient>
		{/* robot materials */}
		<linearGradient id="thWhite" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#FFF6E2" />
			<stop offset="0.35" stopColor="#F2F0FF" />
			<stop offset="0.75" stopColor="#C9C6EC" />
			<stop offset="1" stopColor="#9C98CF" />
		</linearGradient>
		<linearGradient id="thTeal" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#8FFBE6" />
			<stop offset="0.35" stopColor="#35E8C8" />
			<stop offset="0.8" stopColor="#16A99A" />
			<stop offset="1" stopColor="#0E7F7A" />
		</linearGradient>
		<linearGradient id="thRoof" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#FF9CC0" />
			<stop offset="0.5" stopColor="#E0628C" />
			<stop offset="1" stopColor="#A8386A" />
		</linearGradient>
		<linearGradient id="thMetal" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#4B4F8A" />
			<stop offset="0.45" stopColor="#1B1F4E" />
			<stop offset="1" stopColor="#0B0F30" />
		</linearGradient>
		<radialGradient id="thScreen" cx="0.45" cy="0.4" r="0.75">
			<stop offset="0" stopColor="#FFFBE6" />
			<stop offset="0.45" stopColor="#FFE9A0" />
			<stop offset="0.85" stopColor="#FFC45E" />
			<stop offset="1" stopColor="#F29A3A" />
		</radialGradient>
		<linearGradient id="thBezel" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#FFFFFF" />
			<stop offset="0.5" stopColor="#DAD7F4" />
			<stop offset="1" stopColor="#8C88C4" />
		</linearGradient>
		<radialGradient id="thIris" cx="0.4" cy="0.35" r="0.7">
			<stop offset="0" stopColor="#3D4DB0" />
			<stop offset="0.55" stopColor="#1A2266" />
			<stop offset="1" stopColor={INK} />
		</radialGradient>
		<radialGradient id="thBulb" cx="0.35" cy="0.35" r="0.7">
			<stop offset="0" stopColor="#FFFFFF" />
			<stop offset="0.4" stopColor="#FFE99A" />
			<stop offset="1" stopColor="#F2A03A" />
		</radialGradient>
		<radialGradient id="thHalo">
			<stop offset="0" stopColor="#FFF4C8" stopOpacity={0.9} />
			<stop offset="0.3" stopColor="#FFD45C" stopOpacity={0.45} />
			<stop offset="1" stopColor="#FFD45C" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="thPlate" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#2A3070" />
			<stop offset="1" stopColor="#0B1030" />
		</linearGradient>
		{/* lettering */}
		<linearGradient id="thGold" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#FFF6B8" />
			<stop offset="0.35" stopColor="#FFD84A" />
			<stop offset="0.75" stopColor="#FFB020" />
			<stop offset="1" stopColor="#F28A12" />
		</linearGradient>
		<linearGradient id="thOrange" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#FFE0B0" />
			<stop offset="0.35" stopColor="#FFA24D" />
			<stop offset="0.75" stopColor="#FF7A2E" />
			<stop offset="1" stopColor="#E0521E" />
		</linearGradient>
		<linearGradient id="thSilver" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#FFFFFF" />
			<stop offset="0.55" stopColor="#F1EEFF" />
			<stop offset="1" stopColor="#B9B3E8" />
		</linearGradient>
		<linearGradient id="thShine" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
			<stop offset="0.42" stopColor="#FFFFFF" stopOpacity={0.25} />
			<stop offset="0.46" stopColor="#FFFFFF" stopOpacity={0} />
		</linearGradient>
	</defs>
);

// a four-pointed glint
const Glint: React.FC<{x: number; y: number; s: number; o?: number}> = ({x, y, s, o = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
		<circle r={14} fill="#FFF4C8" opacity={0.5} filter="url(#thSoft)" />
		<path d="M 0 -26 Q 3 -3 26 0 Q 3 3 0 26 Q -3 3 -26 0 Q -3 -3 0 -26 Z" fill="#FFFFFF" />
	</g>
);

const Robot: React.FC = () => {
	const BODY = 'M -150 250 L -112 -110 Q -110 -130 -90 -130 L 90 -130 Q 110 -130 112 -110 L 150 250 Z';
	return (
		<g>
			{/* the beam: soft outer cone, bright core, and dust floating in it */}
			<path d="M 60 -250 L 1150 -560 L 1150 100 L 60 -170 Z" fill="url(#thBeam)" opacity={0.85} />
			<path d="M 60 -228 L 1150 -330 L 1150 -120 L 60 -196 Z" fill="url(#thBeamCore)" opacity={0.55} filter="url(#thSoft)" />
			{Array.from({length: 46}, (_, i) => {
				const u = ((i * 0.618) % 1) * 0.95;
				const x = 80 + u * 1050;
				const spread = 40 + u * 330;
				const y = -210 + (((i * 37) % 100) / 100 - 0.5) * 2 * spread * 0.85;
				return <circle key={i} cx={x} cy={y} r={1.2 + (i % 3) * 0.9} fill="#FFF4C8" opacity={0.25 + ((i * 13) % 10) / 20} />;
			})}
			{/* the lamp's glow */}
			<circle cx={0} cy={-260} r={360} fill="url(#thHalo)" opacity={0.55} />
			{/* back arm */}
			<g>
				<path d="M -118 -60 Q -190 20 -170 110" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
				<path d="M -118 -60 Q -190 20 -170 110" fill="none" stroke="url(#thWhite)" strokeWidth={30} strokeLinecap="round" />
				<path d="M -128 -50 Q -194 20 -178 100" fill="none" stroke="#FFF6E2" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
				<circle cx={-172} cy={30} r={17} fill="url(#thMetal)" stroke={INK} strokeWidth={5} />
			</g>
			{/* the tower */}
			<defs>
				<clipPath id="thBody">
					<path d={BODY} />
				</clipPath>
			</defs>
			<path d={BODY} fill="url(#thWhite)" stroke={INK} strokeWidth={8} strokeLinejoin="round" filter="url(#thShadow)" />
			<g clipPath="url(#thBody)">
				<rect x={-200} y={-20} width={400} height={70} fill="url(#thTeal)" />
				<rect x={-200} y={130} width={400} height={70} fill="url(#thTeal)" />
				{/* band edges catch the light */}
				{[-20, 130].map((y) => (
					<g key={y}>
						<rect x={-200} y={y} width={400} height={5} fill="#D4FFF6" opacity={0.7} />
						<rect x={-200} y={y + 65} width={400} height={6} fill="#0A5E5A" opacity={0.45} />
					</g>
				))}
				{/* panel seams and rivets */}
				{[60, 115, 215].map((y) => (
					<line key={y} x1={-200} x2={200} y1={y} y2={y} stroke="#7F7AB8" strokeWidth={2} opacity={0.5} />
				))}
				{[-95, 95].map((x) => [70, 105, 225].map((y) => <circle key={`${x}${y}`} cx={x + (y - 70) * 0.1 * Math.sign(x)} cy={y} r={3.2} fill="#8D88C6" />))}
				{/* a small lit window, as on the lighthouse */}
				<rect x={-18} y={70} width={36} height={52} rx={18} fill="#1B1F4E" />
				<rect x={-12} y={76} width={24} height={40} rx={12} fill="#FFD76A" />
				<rect x={-12} y={76} width={10} height={40} rx={5} fill="#FFFBE6" opacity={0.7} />
				{/* shading: warm rim light on the left, cool shadow on the right, texture over all */}
				<path d="M -200 -140 L -108 -140 L -150 260 L -200 260 Z" fill="#FFD9A0" opacity={0.3} />
				<path d="M 40 -140 L 200 -140 L 220 260 L 60 260 Z" fill="#241E6A" opacity={0.22} />
				<rect x={-200} y={-140} width={400} height={400} filter="url(#thGrain)" opacity={0.35} style={{mixBlendMode: 'multiply'}} />
				<rect x={-200} y={-140} width={400} height={30} fill="#0B1030" opacity={0.35} />
			</g>
			<path d="M -112 -110 L -150 250" stroke="#FFE8B8" strokeWidth={6} opacity={0.85} />
			{/* chest plate: its name, lit from behind the glass */}
			<rect x={-76} y={-104} width={152} height={64} rx={16} fill="#EDEBFF" stroke={INK} strokeWidth={6} />
			<rect x={-66} y={-96} width={132} height={48} rx={11} fill="url(#thPlate)" />
			<text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} letterSpacing={6} fill={K.yellow} filter="url(#thSoft)" opacity={0.8}>
				JEV
			</text>
			<text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} letterSpacing={6} fill="#FFF1B0">
				JEV
			</text>
			<path d="M -60 -92 L 20 -92 L -10 -54 L -60 -54 Z" fill="#FFFFFF" opacity={0.1} />
			{/* the gallery: a ring with a little railing, as on the lighthouse */}
			<rect x={-150} y={-166} width={300} height={42} rx={16} fill="url(#thMetal)" stroke={INK} strokeWidth={6} />
			<rect x={-138} y={-160} width={276} height={6} rx={3} fill="#8A90D6" opacity={0.7} />
			{Array.from({length: 11}, (_, i) => (
				<g key={i}>
					<rect x={-130 + i * 26} y={-192} width={6} height={30} rx={3} fill="#2A2F6A" />
					<rect x={-130 + i * 26} y={-192} width={2} height={30} fill="#9AA0E6" opacity={0.6} />
				</g>
			))}
			<rect x={-140} y={-198} width={280} height={9} rx={4.5} fill="#2A2F6A" stroke={INK} strokeWidth={3} />
			{/* the head: the lamp room with its bezel, screen, eyes, and reflections */}
			<rect x={-134} y={-392} width={268} height={232} rx={48} fill="url(#thBezel)" stroke={INK} strokeWidth={8} filter="url(#thShadow)" />
			<rect x={-108} y={-368} width={216} height={184} rx={34} fill="#3A2A30" />
			<rect x={-104} y={-364} width={208} height={176} rx={32} fill="url(#thScreen)" />
			{/* faint scanlines */}
			{Array.from({length: 22}, (_, i) => (
				<rect key={i} x={-104} y={-362 + i * 8} width={208} height={2} fill="#F29A3A" opacity={0.12} />
			))}
			{[-46, 46].map((ex) => (
				<g key={ex}>
					<ellipse cx={ex} cy={-266} rx={34} ry={44} fill="#F29A3A" opacity={0.35} filter="url(#thSoft)" />
					<ellipse cx={ex} cy={-268} rx={30} ry={40} fill="url(#thIris)" />
					<ellipse cx={ex + 2} cy={-262} rx={16} ry={22} fill="#0A0E28" />
					<circle cx={ex + 10} cy={-284} r={11} fill="#FFFFFF" />
					<circle cx={ex - 9} cy={-250} r={5} fill="#FFFFFF" opacity={0.85} />
					<path d={`M ${ex - 22} -236 Q ${ex} -228 ${ex + 22} -236`} fill="none" stroke="#7A8CFF" strokeWidth={3} opacity={0.6} />
					{/* a confident lid */}
					<path d={`M ${ex - 38} -306 Q ${ex} -326 ${ex + 38} -306 L ${ex + 38} -296 Q ${ex} -310 ${ex - 38} -296 Z`} fill={INK} />
				</g>
			))}
			<ellipse cx={-80} cy={-216} rx={15} ry={10} fill={K.rose} opacity={0.5} filter="url(#thBlur2)" />
			<ellipse cx={80} cy={-216} rx={15} ry={10} fill={K.rose} opacity={0.5} filter="url(#thBlur2)" />
			{/* glass reflections: a broad diagonal sheen and two thin streaks */}
			<path d="M -104 -364 L -20 -364 L -104 -250 Z" fill="#FFFFFF" opacity={0.28} />
			<path d="M 10 -364 L 34 -364 L -70 -196 L -94 -196 Z" fill="#FFFFFF" opacity={0.16} />
			<path d="M 44 -364 L 52 -364 L -48 -196 L -56 -196 Z" fill="#FFFFFF" opacity={0.2} />
			<rect x={-126} y={-386} width={252} height={10} rx={5} fill="#FFFFFF" opacity={0.7} />
			{/* the roof cap: shingles, a lit edge, and the bulb with its flare */}
			<path d="M -156 -380 L 0 -480 L 156 -380 Z" fill="url(#thRoof)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
			{[0.35, 0.65].map((t) => (
				<path key={t} d={`M ${-156 * (1 - t)} ${-380 - 100 * t} L ${156 * (1 - t)} ${-380 - 100 * t}`} stroke="#A8386A" strokeWidth={3} opacity={0.6} />
			))}
			<path d="M -150 -382 L -6 -474" stroke="#FFD0E2" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
			<rect x={-6} y={-510} width={12} height={34} fill="url(#thMetal)" />
			<circle cx={0} cy={-516} r={70} fill="url(#thHalo)" />
			<circle cx={0} cy={-516} r={22} fill="url(#thBulb)" stroke={INK} strokeWidth={6} />
			<Glint x={0} y={-516} s={1.6} />
			{/* front arm, raised, with a jointed elbow and a glowing tip */}
			<g>
				<path d="M 118 -70 Q 220 -120 250 -230" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
				<path d="M 118 -70 Q 220 -120 250 -230" fill="none" stroke="url(#thWhite)" strokeWidth={30} strokeLinecap="round" />
				<path d="M 116 -82 Q 210 -128 238 -226" fill="none" stroke="#FFF6E2" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
				<circle cx={206} cy={-118} r={17} fill="url(#thMetal)" stroke={INK} strokeWidth={5} />
				<circle cx={250} cy={-238} r={62} fill="url(#thHalo)" />
				<circle cx={250} cy={-238} r={24} fill="url(#thBulb)" stroke={INK} strokeWidth={7} />
				<Glint x={250} y={-238} s={1.2} />
			</g>
		</g>
	);
};

// "never writes a word": a speech bubble, crossed out
const NoWords: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
		<g filter="url(#thShadow)">
			<path d="M -110 -60 Q -110 -90 -80 -90 L 80 -90 Q 110 -90 110 -60 L 110 30 Q 110 60 80 60 L 10 60 L -30 100 L -30 60 L -80 60 Q -110 60 -110 30 Z" fill="url(#thSilver)" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
		</g>
		<path d="M -96 -76 L 60 -76 Q 30 -60 -96 -40 Z" fill="#FFFFFF" opacity={0.7} />
		{[-50, 0, 50].map((dx) => (
			<g key={dx}>
				<circle cx={dx} cy={-15} r={15} fill={INK} />
				<circle cx={dx - 4} cy={-20} r={4} fill="#FFFFFF" opacity={0.5} />
			</g>
		))}
		<line x1={-125} y1={80} x2={125} y2={-110} stroke={INK} strokeWidth={40} strokeLinecap="round" />
		<line x1={-125} y1={80} x2={125} y2={-110} stroke={K.rose} strokeWidth={24} strokeLinecap="round" />
		<line x1={-118} y1={70} x2={118} y2={-110} stroke="#FFC2D6" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
	</g>
);

// glossy 3D lettering: glow, a stepped extrusion, a gradient face, a hard shine on the top half, and grain
const Lettering: React.FC<{x: number; y: number; text: string; size: number; face: string; side: string; glow: string; depth: number; spacing?: number; id: string}> = ({x, y, text, size, face, side, glow, depth, spacing = 0, id}) => {
	const t = (dx: number, dy: number, props: React.SVGProps<SVGTextElement>, key?: number) => (
		<text key={key} x={x + dx} y={y + dy} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={spacing} {...props}>
			{text}
		</text>
	);
	const stroke = size * 0.13;
	return (
		<g>
			<defs>
				<clipPath id={`thClip${id}`}>{t(0, 0, {})}</clipPath>
			</defs>
			{t(0, depth * 0.5, {fill: glow, opacity: 0.55, filter: 'url(#glowBig)'})}
			{t(depth * 0.4, depth + 10, {fill: '#050820', opacity: 0.5, filter: 'url(#thSoft)'})}
			{Array.from({length: depth}, (_, i) => depth - i).map((d) => t(d * 0.35, d, {fill: side, stroke: INK, strokeWidth: stroke, strokeLinejoin: 'round', style: {paintOrder: 'stroke'}}, d))}
			{t(0, 0, {fill: face, stroke: INK, strokeWidth: stroke, strokeLinejoin: 'round', style: {paintOrder: 'stroke'}})}
			<g clipPath={`url(#thClip${id})`}>
				<rect x={x - 700} y={y - size * 0.85} width={1400} height={size * 0.9} fill="url(#thShine)" />
				<rect x={x - 700} y={y - size * 0.85} width={1400} height={size} filter="url(#thGrain)" opacity={0.25} style={{mixBlendMode: 'multiply'}} />
			</g>
			{t(0, 0, {fill: 'none', stroke: '#FFFFFF', strokeWidth: 2.5, opacity: 0.55})}
		</g>
	);
};

export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: K.night}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<FlatDefs />
			<WorldDefs />
			<Defs />
			{/* sky: gradient, nebula haze, sun glow, rays */}
			<rect x={0} y={0} width={W} height={H} fill="url(#gSky)" />
			<ellipse cx={980} cy={120} rx={420} ry={160} fill="url(#thNebula)" />
			<ellipse cx={520} cy={60} rx={300} ry={110} fill="url(#thNebula)" opacity={0.7} />
			<rect x={0} y={0} width={W} height={H} fill="url(#thSun)" />
			{Array.from({length: 9}, (_, i) => {
				const a = ((-70 + i * 18) * Math.PI) / 180;
				return <path key={i} d={`M 360 260 L ${360 + Math.cos(a - 0.05) * 900} ${260 + Math.sin(a - 0.05) * 900} L ${360 + Math.cos(a + 0.05) * 900} ${260 + Math.sin(a + 0.05) * 900} Z`} fill="#FFE6A8" opacity={0.05} />;
			})}
			{Array.from({length: 110}, (_, i) => {
				const x = (i * 397) % W;
				const y = (i * 211) % 520;
				const big = i % 17 === 0;
				return big ? <Glint key={i} x={x} y={y} s={0.35} o={0.8} /> : <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.6} fill="#FFFFFF" opacity={0.35 + (i % 5) * 0.12} />;
			})}
			{/* mountains, haze where they meet the ground, and the ground */}
			<g transform="scale(0.667)">
				<Mountains y={900} seed={12} layers={2} />
			</g>
			<rect x={0} y={560} width={W} height={90} fill="#FFB86B" opacity={0.12} filter="url(#thSoft)" />
			<rect x={0} y={640} width={W} height={100} fill="url(#thGround)" />
			<rect x={0} y={640} width={W} height={4} fill="#6F66D0" opacity={0.6} />
			<g transform="translate(360 530) rotate(-4) scale(0.92)">
				<Robot />
			</g>
			<NoWords x={118} y={262} s={0.74} />
			<Lettering id="a" x={1000} y={250} text="200×" size={176} face="url(#thGold)" side="#B8620E" glow={K.yellow} depth={12} />
			<Lettering id="b" x={1000} y={330} text="FASTER" size={76} face="url(#thSilver)" side="#6E68B0" glow="#FFFFFF" depth={6} spacing={4} />
			<Lettering id="c" x={1000} y={560} text="450×" size={176} face="url(#thOrange)" side="#9E3412" glow={K.orange} depth={12} />
			<Lettering id="d" x={1000} y={640} text="CHEAPER" size={76} face="url(#thSilver)" side="#6E68B0" glow="#FFFFFF" depth={6} spacing={4} />
			<Glint x={1170} y={130} s={0.9} />
			<Glint x={842} y={455} s={0.7} />
			<text x={1262} y={708} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={20} fill="#FFFFFF" opacity={0.8} style={{paintOrder: 'stroke', stroke: INK, strokeWidth: 4}}>
				*TypeSafe’s own tests
			</text>
			{/* finish: vignette and film grain over everything */}
			<rect x={0} y={0} width={W} height={H} fill="url(#gVignette)" opacity={0.8} />
			<rect x={0} y={0} width={W} height={H} filter="url(#thGrain)" opacity={0.18} style={{mixBlendMode: 'overlay'}} />
		</svg>
	</AbsoluteFill>
);
