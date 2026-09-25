import React from 'react';
import {FONT, K} from '../../flat/kit';
import {clamp01, easeOut, lerp, progress} from '../paper-track/timeline';

// Chapter 3 palettes. Each section lives in one of three worlds, plus one colour kept for mistakes:
//   night  (K):   the city, the planet, the harbor. Where the million letters are.
//   amber  (A):   the human mailroom, the reviewer, the desk. Where people are.
//   teal   (T):   the concept stage: one idea on a glowing tile in a dark void. Short visits only.
//   red   (RED):  a mistake, and nothing else.
export const A = {
	wallTop: '#3E2433',
	wallBot: '#2A1822',
	brick: '#4A2C3B',
	brickHi: '#553443',
	floor: '#21131B',
	wood: '#8A5A3C',
	woodHi: '#A8704A',
	woodLo: '#6B4430',
	brass: '#D9A64A',
	brassHi: '#F2C66A',
	brassLo: '#A87A2E',
	lamp: '#FFC46B',
	paper: '#FBF3E4',
	paperLo: '#E9DCC4',
	ink: '#3A2340',
	skin: '#E7B48E',
	skinLo: '#C98F6A',
	sleeve: '#4F6FB0',
	sleeveLo: '#3D5A96',
	hair: '#2E1B26',
};
export const T = {
	void: '#05121A',
	voidHi: '#0A2230',
	tile: '#0E2E38',
	tileTop: '#154652',
	glow: '#2EE6C5',
	text: '#DFFBF5',
};
export const RED = '#FF4D5E';

export const pop = (f: number, t: number, len = 10) => {
	const k = progress(f, t, t + len);
	return k <= 0 ? 0 : easeOut(k, 3) * (1 + 0.18 * Math.sin(Math.PI * k));
};
export const within = (f: number, a: number, b: number) => f >= a && f < b;

// A word on screen: one high-impact word or number, with an optional strike-through.
export const Say: React.FC<{x: number; y: number; k: number; text: string; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; strike?: number; weight?: number; spacing?: number}> = ({x, y, k, text, size = 64, color = K.white, anchor = 'middle', strike = 0, weight = 900, spacing = 0}) =>
	k <= 0 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'middle' ? '-50%' : anchor === 'end' ? '-100%' : '0'}, ${(1 - Math.min(1, k)) * 18}px) scale(${0.9 + 0.1 * Math.min(1.2, k)})`, transformOrigin: anchor === 'middle' ? '50% 50%' : anchor === 'end' ? '100% 50%' : '0 50%', opacity: Math.min(1, k), fontFamily: FONT, fontWeight: weight, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: spacing, textShadow: '0 4px 20px rgba(5,8,32,0.65)'}}>
			<span style={{position: 'relative', display: 'inline-block'}}>
				{text}
				{strike > 0 ? <span style={{position: 'absolute', left: -8, right: -8, top: '50%', height: Math.max(6, size * 0.1), borderRadius: 6, background: color, transform: `scaleX(${easeOut(strike, 3)})`, transformOrigin: 'left'}} /> : null}
			</span>
		</div>
	);

// A camera: frames the point (cx, cy) at the centre of the screen, at zoom z.
export const cam = (cx: number, cy: number, z: number) => `translate(960 540) scale(${z}) translate(${-cx} ${-cy})`;
// Log-space zoom from z0 to z1 (a zoom that feels even), with the framed point sliding from p0 to p1.
export const zoomTo = (k: number, z0: number, z1: number, p0: [number, number], p1: [number, number]) => {
	const z = Math.exp(lerp(Math.log(z0), Math.log(z1), k));
	// keep the framed point fixed on screen while zooming, then slide it to the resting framing
	const u = (z0 === z1 ? k : (1 / z - 1 / z0) / (1 / z1 - 1 / z0));
	return cam(lerp(p0[0], p1[0], clamp01(u)), lerp(p0[1], p1[1], clamp01(u)), z);
};

// ---------- the concept stage: one idea on a glowing tile in a dark void ----------
export const StageDefs: React.FC = () => (
	<defs>
		<radialGradient id="gVoid" cx="0.5" cy="0.62" r="0.8">
			<stop offset="0" stopColor={T.voidHi} />
			<stop offset="1" stopColor={T.void} />
		</radialGradient>
		<radialGradient id="gTileGlow">
			<stop offset="0" stopColor={T.glow} stopOpacity="0.35" />
			<stop offset="1" stopColor={T.glow} stopOpacity="0" />
		</radialGradient>
		<linearGradient id="gBeamUp" x1="0" y1="1" x2="0" y2="0">
			<stop offset="0" stopColor={T.glow} stopOpacity="0.28" />
			<stop offset="1" stopColor={T.glow} stopOpacity="0" />
		</linearGradient>
	</defs>
);
export const Stage: React.FC<{f: number; x?: number; y?: number; w?: number; children?: React.ReactNode}> = ({f, x = 960, y = 860, w = 520, children}) => (
	<g>
		<StageDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gVoid)" />
		{/* slow drifting specks */}
		{Array.from({length: 40}, (_, i) => {
			const px = (i * 397) % 1920;
			const py = ((i * 211) % 1000) - ((f * (0.2 + (i % 5) * 0.08)) % 1000);
			return <circle key={i} cx={px} cy={py < 0 ? py + 1000 : py} r={1.5 + (i % 3)} fill={T.glow} opacity={0.12 + (i % 4) * 0.05} />;
		})}
		{/* light rising from the tile */}
		<path d={`M ${x - w * 0.42} ${y} L ${x - w * 0.6} ${y - 700} L ${x + w * 0.6} ${y - 700} L ${x + w * 0.42} ${y} Z`} fill="url(#gBeamUp)" />
		<ellipse cx={x} cy={y} rx={w * 0.9} ry={w * 0.22} fill="url(#gTileGlow)" />
		{/* the tile, in isometric */}
		<path d={`M ${x - w / 2} ${y} L ${x} ${y - w * 0.18} L ${x + w / 2} ${y} L ${x} ${y + w * 0.18} Z`} fill={T.tileTop} />
		<path d={`M ${x - w / 2} ${y} L ${x} ${y + w * 0.18} L ${x} ${y + w * 0.18 + 26} L ${x - w / 2} ${y + 26} Z`} fill={T.tile} />
		<path d={`M ${x + w / 2} ${y} L ${x} ${y + w * 0.18} L ${x} ${y + w * 0.18 + 26} L ${x + w / 2} ${y + 26} Z`} fill="#0A2229" />
		<path d={`M ${x - w / 2} ${y} L ${x} ${y - w * 0.18} L ${x + w / 2} ${y} L ${x} ${y + w * 0.18} Z`} fill="none" stroke={T.glow} strokeWidth={3} opacity={0.8} />
		{children}
	</g>
);

// ---------- the mailroom: warm brick, pigeonholes, lamps ----------
export const MailroomDefs: React.FC = () => (
	<defs>
		<linearGradient id="gAmberWall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={A.wallTop} />
			<stop offset="1" stopColor={A.wallBot} />
		</linearGradient>
		<radialGradient id="gAmberLamp">
			<stop offset="0" stopColor={A.lamp} stopOpacity="0.55" />
			<stop offset="1" stopColor={A.lamp} stopOpacity="0" />
		</radialGradient>
		<linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={A.lamp} stopOpacity="0.35" />
			<stop offset="1" stopColor={A.lamp} stopOpacity="0" />
		</linearGradient>
		<linearGradient id="gDesk" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={A.woodHi} />
			<stop offset="1" stopColor={A.woodLo} />
		</linearGradient>
	</defs>
);
export const Mailroom: React.FC<{f: number; floor?: number; lamps?: number[]; holes?: boolean; children?: React.ReactNode}> = ({f, floor = 860, lamps = [420, 1500], holes = true, children}) => (
	<g>
		<MailroomDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
		{Array.from({length: 11}, (_, r) =>
			Array.from({length: 14}, (_, c) => {
				const x = c * 150 - (r % 2) * 75 - 40;
				return <rect key={`${r}-${c}`} x={x + 3} y={r * 80 + 3} width={144} height={74} rx={10} fill={(r * 5 + c * 3) % 7 === 0 ? A.brickHi : A.brick} opacity={0.55} />;
			}),
		)}
		{holes
			? Array.from({length: 3}, (_, r) =>
					Array.from({length: 12}, (_, c) => (
						<g key={`h${r}-${c}`}>
							<rect x={160 + c * 134} y={130 + r * 86} width={120} height={72} rx={6} fill="#1E1017" />
							{(r * 12 + c) % 3 !== 0 ? <rect x={172 + c * 134} y={160 + r * 86} width={96} height={40} rx={4} fill={(r + c) % 4 === 0 ? A.paperLo : A.paper} opacity={0.85} transform={`rotate(${((r * 7 + c * 5) % 9) - 4} ${220 + c * 134} ${180 + r * 86})`} /> : null}
						</g>
					)),
				)
			: null}
		{lamps.map((x) => (
			<g key={x}>
				<rect x={x - 3} y={-20} width={6} height={120} fill="#2A1820" />
				<path d={`M ${x - 46} 150 L ${x - 360} ${floor} L ${x + 360} ${floor} L ${x + 46} 150 Z`} fill="url(#gCone)" opacity={0.7 + 0.05 * Math.sin(f * 0.07 + x)} />
				<circle cx={x} cy={140} r={120} fill="url(#gAmberLamp)" />
				<path d={`M ${x - 50} 150 L ${x - 26} 100 L ${x + 26} 100 L ${x + 50} 150 Z`} fill={A.brass} />
				<ellipse cx={x} cy={150} rx={50} ry={10} fill={A.lamp} />
			</g>
		))}
		<rect x={-60} y={floor} width={2040} height={400} fill={A.floor} />
		<rect x={-60} y={floor} width={2040} height={8} fill={A.brassLo} opacity={0.5} />
		{children}
		{/* dust in the lamp light */}
		{Array.from({length: 24}, (_, i) => {
			const px = ((i * 263 + f * (0.3 + (i % 3) * 0.15)) % 2000) - 40;
			const py = 200 + ((i * 131) % 600) + 10 * Math.sin(f * 0.03 + i);
			return <circle key={`d${i}`} cx={px} cy={py} r={1.6 + (i % 3) * 0.6} fill={A.lamp} opacity={0.35} />;
		})}
	</g>
);

// ---------- props ----------
// An envelope. `red` marks a mistake.
export const Env: React.FC<{x: number; y: number; s?: number; r?: number; red?: boolean; tint?: string; opacity?: number}> = ({x, y, s = 1, r = 0, red, tint, opacity = 1}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={opacity}>
		<rect x={-40} y={-26} width={80} height={52} rx={6} fill={red ? RED : tint ?? A.paper} />
		<path d="M -40 -24 L 0 4 L 40 -24" fill="none" stroke={red ? '#B0243A' : '#C9B8A0'} strokeWidth={3} strokeLinejoin="round" />
		{!red ? <circle cx={26} cy={-12} r={5} fill={K.rose} /> : null}
	</g>
);

// A coin with its value.
export const Coin: React.FC<{x: number; y: number; s?: number; label?: string; r?: number}> = ({x, y, s = 1, label, r = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		<circle r={46} fill={A.brassLo} />
		<circle r={42} cy={-4} fill={A.brass} />
		<circle r={32} cy={-4} fill="none" stroke={A.brassHi} strokeWidth={4} />
		{label ? (
			<text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 3 ? 22 : 30} fill={A.ink}>
				{label}
			</text>
		) : null}
	</g>
);
// A stack of coins seen from the side.
export const CoinStack: React.FC<{x: number; y: number; n: number; w?: number}> = ({x, y, n, w = 70}) => (
	<g>
		{Array.from({length: Math.max(0, Math.round(n))}, (_, i) => (
			<g key={i}>
				<ellipse cx={x + ((i * 7) % 5) - 2} cy={y - i * 9} rx={w / 2} ry={9} fill={A.brassLo} />
				<ellipse cx={x + ((i * 7) % 5) - 2} cy={y - i * 9 - 4} rx={w / 2} ry={9} fill={i % 2 ? A.brass : A.brassHi} />
			</g>
		))}
	</g>
);

// The reviewer: an original character, a person at a desk. Round face, short dark hair, blue sweater.
export const Reviewer: React.FC<{x: number; y: number; s?: number; f: number; look?: number; desk?: boolean; lamp?: boolean; seed?: number}> = ({x, y, s = 1, f, look = 0, desk = true, lamp = false, seed = 0}) => {
	const bob = 2 * Math.sin(f * 0.08 + seed);
	const blink = (f + seed * 17) % 97 < 4;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{lamp ? <circle cx={60} cy={-150} r={110} fill="url(#gAmberLamp)" /> : null}
			{/* body */}
			<path d={`M -58 0 Q -60 ${-92 + bob} 0 ${-96 + bob} Q 60 ${-92 + bob} 58 0 Z`} fill={A.sleeve} />
			<path d={`M -58 0 Q -60 ${-92 + bob} 0 ${-96 + bob} L 0 0 Z`} fill={A.sleeveLo} opacity={0.5} />
			{/* head */}
			<g transform={`translate(${look * 6} ${-128 + bob})`}>
				<circle r={36} fill={A.skin} />
				<path d="M -37 -4 Q -38 -44 0 -44 Q 38 -44 37 -6 Q 26 -26 -4 -24 Q -24 -22 -37 -4 Z" fill={A.hair} />
				{blink ? (
					<>
						<rect x={-17 + look * 5} y={2} width={11} height={3} rx={1.5} fill={A.ink} />
						<rect x={7 + look * 5} y={2} width={11} height={3} rx={1.5} fill={A.ink} />
					</>
				) : (
					<>
						<circle cx={-11 + look * 5} cy={3} r={4.5} fill={A.ink} />
						<circle cx={13 + look * 5} cy={3} r={4.5} fill={A.ink} />
					</>
				)}
				<path d={`M ${-7 + look * 4} 18 Q ${1 + look * 4} 23 ${9 + look * 4} 18`} fill="none" stroke={A.ink} strokeWidth={3} strokeLinecap="round" />
				<circle cx={-24} cy={14} r={6} fill={K.rose} opacity={0.35} />
				<circle cx={26} cy={14} r={6} fill={K.rose} opacity={0.35} />
			</g>
			{desk ? (
				<>
					<rect x={-110} y={-6} width={220} height={22} rx={6} fill="url(#gDesk)" />
					<rect x={-96} y={16} width={14} height={70} fill={A.woodLo} />
					<rect x={82} y={16} width={14} height={70} fill={A.woodLo} />
					<rect x={-40} y={-22} width={62} height={18} rx={3} fill={A.paper} transform="rotate(-6)" />
				</>
			) : null}
		</g>
	);
};

// A worried customer: an original, simple face for the "frozen card" beat.
export const Customer: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -80 120 Q -84 20 0 14 Q 84 20 80 120 Z" fill="#7A4E8C" />
		<g transform={`translate(0 ${-40 + 3 * Math.sin(f * 0.2)})`}>
			<circle r={56} fill="#C98F6A" />
			<path d="M -58 -6 Q -52 -66 4 -64 Q 56 -60 58 -10 Q 40 -40 0 -40 Q -34 -38 -58 -6 Z" fill="#6B3A2A" />
			<path d="M -30 -8 L -12 -2 M 30 -8 L 12 -2" stroke={A.ink} strokeWidth={4} strokeLinecap="round" />
			<circle cx={-20} cy={8} r={6} fill={A.ink} />
			<circle cx={20} cy={8} r={6} fill={A.ink} />
			<path d="M -16 34 Q 0 24 16 34" fill="none" stroke={A.ink} strokeWidth={4} strokeLinecap="round" />
			<path d={`M 44 -30 q 6 10 0 16 q -6 -6 0 -16 Z`} fill={K.cyan} opacity={0.8} transform={`translate(0 ${(f * 1.4) % 30})`} />
		</g>
	</g>
);

// Hands in extreme close-up, holding a letter that opens (open 0..1).
export const HandsWithLetter: React.FC<{f: number; open: number; text?: boolean}> = ({f, open}) => {
	const sway = 4 * Math.sin(f * 0.05);
	return (
		<g transform={`translate(960 ${640 + sway})`}>
			{/* envelope */}
			<rect x={-420} y={-230} width={840} height={520} rx={24} fill={A.paper} />
			<path d={`M -420 -222 L 0 ${lerp(60, -420, open)} L 420 -222`} fill={A.paperLo} stroke="#C9B8A0" strokeWidth={8} strokeLinejoin="round" />
			<circle cx={290} cy={-110} r={36} fill={K.rose} opacity={1 - open} />
			{/* the letter sliding out */}
			{open > 0.4 ? (
				<g transform={`translate(0 ${lerp(0, -200, (open - 0.4) / 0.6)})`}>
					<rect x={-330} y={-250} width={660} height={300} rx={10} fill="#FFFDF6" />
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={-280} y={-200 + i * 56} width={i === 3 ? 300 : 560} height={18} rx={9} fill="#D8CCB6" />
					))}
				</g>
			) : null}
			{/* hands */}
			{[-1, 1].map((side) => (
				<g key={side} transform={`translate(${side * 470} 120) scale(${side} 1)`}>
					<path d="M 160 260 L 60 40 Q 40 -10 -10 0 L -80 30 Q -110 50 -80 70 L -40 70 L 20 200 Z" fill={A.sleeve} />
					<path d="M -40 -40 Q -110 -60 -130 -10 Q -140 30 -100 50 L 30 60 Q 70 40 50 -10 Z" fill={A.skin} />
					<path d="M -120 -30 Q -170 -40 -176 -10 Q -178 16 -130 14 Z" fill={A.skin} />
					<path d="M -110 -10 Q -140 0 -128 12" fill="none" stroke={A.skinLo} strokeWidth={5} strokeLinecap="round" />
				</g>
			))}
		</g>
	);
};

// A brass balance scale. tilt: positive tips the right pan down.
export const Balance: React.FC<{x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode; labels?: [string, string]; labelK?: number}> = ({x, y, s = 1, tilt, left, right, labels, labelK = 0}) => {
	const a = (Math.max(-1, Math.min(1, tilt)) * 16 * Math.PI) / 180;
	const arm = 300;
	const lx = -arm * Math.cos(a);
	const ly = -arm * Math.sin(a);
	const rx = arm * Math.cos(a);
	const ry = arm * Math.sin(a);
	const pan = (px: number, py: number, content: React.ReactNode, label?: string) => (
		<g transform={`translate(${px} ${py})`}>
			<path d="M 0 0 L -90 170 M 0 0 L 90 170" stroke={A.brassLo} strokeWidth={4} />
			<path d="M -120 170 Q 0 240 120 170 Z" fill={A.brass} />
			<ellipse cx={0} cy={170} rx={120} ry={16} fill={A.brassHi} />
			<g transform="translate(0 164)">{content}</g>
			{label ? (
				<text y={290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={A.paper} opacity={labelK} style={{paintOrder: 'stroke', stroke: 'rgba(20,8,14,0.6)', strokeWidth: 6}}>
					{label}
				</text>
			) : null}
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d="M -130 420 L 130 420 L 90 380 L -90 380 Z" fill={A.brassLo} />
			<rect x={-14} y={0} width={28} height={390} fill={A.brass} />
			<rect x={-6} y={0} width={8} height={390} fill={A.brassHi} opacity={0.6} />
			<path d={`M ${lx} ${ly} L ${rx} ${ry}`} stroke={A.brass} strokeWidth={18} strokeLinecap="round" />
			<circle r={26} fill={A.brassHi} />
			<path d={`M 0 -10 L ${Math.sin(a) * 90} -90`} stroke={A.ink} strokeWidth={6} strokeLinecap="round" />
			{pan(lx, ly, left, labels?.[0])}
			{pan(rx, ry, right, labels?.[1])}
		</g>
	);
};

// A 10x10 grid of outcomes: `lit` cells in orange (right), `red` of the last cells in red (wrong).
export const Grid10: React.FC<{x: number; y: number; cell?: number; k: number; lit: number; red?: number; redK?: number}> = ({x, y, cell = 44, k, lit, red = 0, redK = 1}) => (
	<g transform={`translate(${x} ${y})`}>
		{Array.from({length: 100}, (_, i) => {
			const kk = clamp01(k * 110 - i);
			if (kk <= 0) return null;
			const isRed = i >= 100 - red && clamp01(redK * red - (i - (100 - red))) > 0.5;
			const on = i < lit;
			return <rect key={i} x={(i % 10) * cell} y={Math.floor(i / 10) * cell} width={cell - 8} height={cell - 8} rx={8} fill={isRed ? RED : on ? K.orange : '#2B4A5A'} opacity={kk} transform={isRed ? `translate(0 ${-4})` : undefined} />;
		})}
	</g>
);

// A split-screen panel: its own world clipped to a rectangle, with a dark gap around it.
export const Panel: React.FC<{id: string; x: number; w: number; children: React.ReactNode; dim?: number}> = ({id, x, w, children, dim = 0}) => (
	<g>
		<defs>
			<clipPath id={id}>
				<rect x={x} y={0} width={w} height={1080} />
			</clipPath>
		</defs>
		<g clipPath={`url(#${id})`}>
			{/* the panel's content is drawn for a 1920-wide frame, centred on the panel */}
			<g transform={`translate(${x + w / 2 - 960} 0)`}>{children}</g>
			{dim > 0 ? <rect x={x} y={0} width={w} height={1080} fill="#05060F" opacity={dim} /> : null}
		</g>
		<rect x={x - 6} y={0} width={12} height={1080} fill="#07081A" />
	</g>
);

// The line, made physical: a brass gauge post with a velvet rope whose height marks the threshold.
export type RopeTag = {at: number; text: string; red?: boolean; s?: number};
export const RopeLine: React.FC<{x0: number; x1: number; floor: number; v: number; lo?: number; hi?: number; h?: number; f: number; crank?: number; tags?: RopeTag[]}> = ({x0, x1, floor, v, lo = 0.5, hi = 1, h = 520, f, crank = 0, tags = []}) => {
	const yOf = (p: number) => floor - 40 - ((p - lo) / (hi - lo)) * (h - 60);
	const ry = yOf(v);
	const sag = 70 + 6 * Math.sin(f * 0.1);
	// a point on the rope: the quadratic curve from post to post, t in 0..1
	const on = (t: number) => ({x: lerp(x0, x1, t), y: ry + 2 * (1 - t) * t * sag});
	return (
		<g>
			{/* the far post */}
			<rect x={x0 - 12} y={ry - 20} width={24} height={floor - ry + 20} rx={8} fill={A.brassLo} />
			<circle cx={x0} cy={ry - 24} r={18} fill={A.brassHi} />
			{/* the rope */}
			<path d={`M ${x0} ${ry} Q ${(x0 + x1) / 2} ${ry + sag} ${x1} ${ry}`} fill="none" stroke="#B0243A" strokeWidth={16} strokeLinecap="round" />
			<path d={`M ${x0} ${ry - 4} Q ${(x0 + x1) / 2} ${ry + sag - 6} ${x1} ${ry - 4}`} fill="none" stroke="#E25563" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
			{/* price tags, tied onto the rope itself */}
			{tags.map((t, i) => {
				const pt = on(t.at);
				return t.s === 0 ? null : (
					<g key={i}>
						<Tag x={pt.x} y={pt.y + 62} text={t.text} f={f + i * 20} s={t.s ?? 1} red={t.red} />
						<circle cx={pt.x} cy={pt.y} r={7} fill={A.paperLo} />
					</g>
				);
			})}
			{/* the gauge post */}
			<rect x={x1 - 22} y={floor - h} width={44} height={h} rx={10} fill={A.brass} />
			{[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].filter((p) => p >= lo && p <= hi).map((p) => (
				<g key={p}>
					<rect x={x1 + 22} y={yOf(p) - 2} width={26} height={4} fill={A.brassHi} />
					<text x={x1 + 56} y={yOf(p) + 10} fontFamily={FONT} fontWeight={900} fontSize={28} fill={A.paper} opacity={0.8}>
						{p.toFixed(1)}
					</text>
				</g>
			))}
			<rect x={x1 - 30} y={ry - 16} width={60} height={32} rx={8} fill={A.brassHi} />
			{/* the crank */}
			<g transform={`translate(${x1} ${floor - h - 30}) rotate(${crank * 360})`}>
				<rect x={-6} y={-60} width={12} height={60} rx={6} fill={A.brassLo} />
				<circle cx={0} cy={-60} r={12} fill={A.woodHi} />
				<circle r={16} fill={A.brassHi} />
			</g>
		</g>
	);
};

// A price tag on a string.
export const Tag: React.FC<{x: number; y: number; text: string; f: number; s?: number; red?: boolean}> = ({x, y, text, f, s = 1, red}) => (
	<g transform={`translate(${x} ${y}) rotate(${8 * Math.sin(f * 0.09)}) scale(${s})`}>
		<path d="M 0 -60 L 0 0" stroke={A.paperLo} strokeWidth={3} />
		<path d="M -26 0 L 26 0 L 70 34 L 70 110 L -70 110 L -70 34 Z" fill={red ? RED : A.paper} />
		<circle cx={0} cy={22} r={7} fill={A.wallBot} />
		<text x={0} y={88} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={red ? '#FFFFFF' : A.ink}>
			{text}
		</text>
	</g>
);

// A letter you can read as a letter: address lines, a stamp, a postmark.
export const LetterBig: React.FC<{x: number; y: number; s?: number; r?: number; glow?: number}> = ({x, y, s = 1, r = 0, glow = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		{glow > 0 ? <rect x={-230} y={-150} width={460} height={300} rx={30} fill={A.lamp} opacity={0.45 * glow} filter="url(#glowBig)" /> : null}
		<rect x={-200} y={-124} width={400} height={248} rx={12} fill="#2A1510" opacity={0.25} transform="translate(8 10)" />
		<rect x={-200} y={-124} width={400} height={248} rx={12} fill={A.paper} />
		<rect x={-200} y={-124} width={400} height={248} rx={12} fill="none" stroke={A.paperLo} strokeWidth={4} />
		{/* airmail border */}
		{Array.from({length: 15}, (_, i) => (
			<rect key={i} x={-196 - 69 + 6 + i * 25} y={-120} width={12} height={8} fill={i % 2 ? '#4F6FB0' : '#C8463C'} transform={`skewX(-30)`} opacity={0.85} />
		))}
		{/* stamp */}
		<g transform="translate(140 -58)">
			<rect x={-38} y={-44} width={76} height={88} fill="#FFFFFF" />
			{Array.from({length: 8}, (_, i) => (
				<g key={i}>
					<circle cx={-38 + i * 10.8} cy={-44} r={3.5} fill={A.paperLo} />
					<circle cx={-38 + i * 10.8} cy={44} r={3.5} fill={A.paperLo} />
				</g>
			))}
			<rect x={-30} y={-36} width={60} height={72} fill={K.orange} />
			<path d="M -12 18 L -6 -14 L 6 -14 L 12 18 Z" fill="#FFFFFF" />
			<path d="M -8 -14 L 0 -24 L 8 -14 Z" fill={K.rose} />
		</g>
		{/* postmark */}
		<g transform="translate(70 -58)" opacity={0.55}>
			<circle r={30} fill="none" stroke={A.ink} strokeWidth={3} />
			{[-10, 0, 10].map((dy) => (
				<path key={dy} d={`M 36 ${dy} q 12 -8 24 0 t 24 0 t 24 0`} fill="none" stroke={A.ink} strokeWidth={3} />
			))}
		</g>
		{/* address */}
		{[0, 1, 2].map((i) => (
			<rect key={i} x={-120} y={10 + i * 30} width={[190, 150, 110][i]} height={12} rx={6} fill="#8C7CA8" opacity={0.8} />
		))}
		<rect x={-170} y={-70} width={120} height={10} rx={5} fill="#B8AAC8" />
		<rect x={-170} y={-52} width={90} height={10} rx={5} fill="#B8AAC8" />
	</g>
);

// A confidence gauge: how sure Jev is, from 0 to 1.
export const Gauge: React.FC<{x: number; y: number; s?: number; p: number; label?: string}> = ({x, y, s = 1, p, label = 'p'}) => {
	const a = Math.PI * (1 - p);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d="M -150 0 A 150 150 0 0 1 150 0 L 150 26 L -150 26 Z" fill="#2A1820" />
			<path d="M -120 0 A 120 120 0 0 1 120 0" fill="none" stroke="#4A2C3B" strokeWidth={22} />
			<path d={`M -120 0 A 120 120 0 0 1 ${Math.cos(a) * 120} ${-Math.sin(a) * 120}`} fill="none" stroke={K.yellow} strokeWidth={22} />
			{Array.from({length: 11}, (_, i) => {
				const b = Math.PI * (1 - i / 10);
				return <line key={i} x1={Math.cos(b) * 138} y1={-Math.sin(b) * 138} x2={Math.cos(b) * 146} y2={-Math.sin(b) * 146} stroke={A.paper} strokeWidth={i % 5 ? 2 : 4} />;
			})}
			<line x1={0} y1={0} x2={Math.cos(a) * 104} y2={-Math.sin(a) * 104} stroke={A.paper} strokeWidth={8} strokeLinecap="round" />
			<circle r={14} fill={A.brass} />
			<text x={-150} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={A.paperLo}>0</text>
			<text x={150} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={A.paperLo}>1</text>
			<text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={K.yellow}>
				{label} = {p.toFixed(2)}
			</text>
		</g>
	);
};

// A hand with its index finger pointing; the fingertip is at (0, 0), the arm comes in from below right.
export const PointingHand: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = -24}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		{/* sleeve */}
		<path d="M -70 300 L 110 300 L 130 620 L -90 620 Z" fill={A.sleeve} />
		<path d="M -76 300 L 116 300 L 116 330 L -76 330 Z" fill={A.sleeveLo} />
		{/* palm and curled fingers */}
		<path d="M -60 150 Q -80 230 -60 300 L 100 300 Q 124 230 104 160 Q 90 120 40 124 L -20 124 Q -54 124 -60 150 Z" fill={A.skin} />
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={30 + i * 26} cy={150 + i * 8} rx={20} ry={26} fill={A.skin} stroke={A.skinLo} strokeWidth={4} />
		))}
		{/* thumb */}
		<path d="M -58 190 Q -100 170 -96 130 Q -92 108 -70 116 Q -44 140 -34 176 Z" fill={A.skin} stroke={A.skinLo} strokeWidth={4} />
		{/* index finger, joined to the palm */}
		<path d="M -22 150 L -22 18 Q -22 -4 0 -4 Q 22 -4 22 18 L 22 150 Z" fill={A.skin} />
		<path d="M -22 150 L -22 18 Q -22 -4 0 -4 Q 22 -4 22 18 L 22 150" fill="none" stroke={A.skinLo} strokeWidth={4} />
		<path d="M -12 12 Q 0 4 12 12 L 12 26 Q 0 30 -12 26 Z" fill="#F4D6C0" />
		<path d="M -14 80 Q 0 86 14 80" fill="none" stroke={A.skinLo} strokeWidth={3} strokeLinecap="round" />
	</g>
);
