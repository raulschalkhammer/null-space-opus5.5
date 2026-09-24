import React from 'react';
import {FONT} from '../flat/kit';

// Three train designs, each in a ChatGPT-inspired and a Claude-inspired livery (colors and materials only,
// no logos). All share one convention: origin = front wheel contact on the rail, facing right.

export type Livery = 'gpt' | 'claude';
export type Mood = 'happy' | 'worried' | 'dazed';

export const LIV = {
	gpt: {body: '#23252C', hi: '#3A3D48', lo: '#15161B', trim: '#1FB58F', trimHi: '#6BEBC4', paper: '#F4F6F5', ink: '#23252C', glow: '#7CF5CC', metal: '#B9C2CC', brass: '#9FB0BC', window: '#A8FFE2'},
	claude: {body: '#D97757', hi: '#EB9678', lo: '#B35C3F', trim: '#F3EEE3', trimHi: '#FFFFFF', paper: '#FBF6EC', ink: '#5A2E20', glow: '#FFC08F', metal: '#E8D2B8', brass: '#E8B06A', window: '#FFE2B8'},
};

export const WORDS = 'Great question! This email looks totally legit!';

// A wheel with spokes, a lit rim and a hub; `turn` in radians.
export const Wheel: React.FC<{x: number; y: number; r: number; turn: number; c: string; hub: string; rim: string}> = ({x, y, r, turn, c, hub, rim}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={r} fill={c} />
		<circle r={r * 0.82} fill={hub} opacity={0.35} />
		<g transform={`rotate(${(turn * 180) / Math.PI})`}>
			{Array.from({length: 8}, (_, i) => (
				<rect key={i} x={-1.5} y={-r * 0.78} width={3} height={r * 1.56} rx={1.5} fill={hub} opacity={0.8} transform={`rotate(${i * 22.5})`} />
			))}
		</g>
		<circle r={r * 0.28} fill={hub} />
		<path d={`M ${-r * 0.85} ${-r * 0.4} A ${r} ${r} 0 0 1 ${r * 0.2} ${-r * 0.98}`} fill="none" stroke={rim} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
	</g>
);

// ---------------- A · Typewriter Express (expressive face) ----------------
export const TypewriterExpress: React.FC<{livery: Livery; f: number; mood?: Mood; s?: number}> = ({livery, f, mood = 'happy', s = 1}) => {
	const L = LIV[livery];
	const turn = f * 0.25;
	const pin = {x: 12 * Math.cos(turn), y: 12 * Math.sin(turn)};
	const tape = Array.from({length: 18}, (_, i) => {
		const x = -120 - i * 26;
		const y = -300 + 10 * Math.sin(f * 0.15 - i * 0.6) + i * 1.5;
		return [x, y] as const;
	});
	const brow = mood === 'worried' ? 1 : mood === 'dazed' ? -0.4 : 0;
	return (
		<g transform={`scale(${s})`}>
			{/* ticker tape: the words it has typed, trailing behind like steam */}
			<path d={`M -110 -262 ${tape.map(([x, y]) => `L ${x} ${y}`).join(' ')}`} fill="none" stroke={L.paper} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
			<path d={`M -110 -262 ${tape.map(([x, y]) => `L ${x} ${y}`).join(' ')}`} fill="none" stroke="#000" strokeWidth={22} opacity={0.06} strokeDasharray="4 26" />
			<g>
				{['Great', 'question!', 'This', 'email', 'looks'].map((w, j) => {
					const [x, y] = tape[tape.length - 2 - j * 3];
					return (
						<text key={w} x={x} y={y + 5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={14} fill={L.ink} opacity={0.8}>
							{w}
						</text>
					);
				})}
			</g>
			{/* paper sheet feeding up out of the platen */}
			<path d="M -150 -170 L -152 -250 Q -150 -262 -138 -262 L -86 -262 Q -76 -262 -76 -252 L -74 -170 Z" fill={L.paper} />
			{[0, 1, 2, 3].map((r) => (
				<rect key={r} x={-140} y={-248 + r * 14} width={50 - (r % 2) * 16} height={4} rx={2} fill={L.ink} opacity={0.35} />
			))}
			{/* platen, knobs, carriage lever, bell */}
			<rect x={-186} y={-182} width={150} height={22} rx={11} fill={L.lo} />
			<rect x={-186} y={-182} width={150} height={6} rx={3} fill={L.hi} />
			<circle cx={-194} cy={-171} r={14} fill={L.trim} />
			<circle cx={-28} cy={-171} r={14} fill={L.trim} />
			<path d="M -26 -186 Q 0 -214 22 -200" fill="none" stroke={L.metal} strokeWidth={6} strokeLinecap="round" />
			<circle cx={-50} cy={-196} r={9} fill={L.brass} />
			{/* body */}
			<path d="M -214 -160 Q -214 -170 -204 -170 L -22 -170 Q 4 -170 10 -144 L 18 -60 L -214 -60 Z" fill={L.body} />
			<path d="M -214 -160 Q -214 -170 -204 -170 L -22 -170 Q 4 -170 10 -144 L 11 -136 L -214 -136 Z" fill={L.hi} />
			<rect x={-214} y={-80} width={232} height={20} fill={L.lo} />
			<rect x={-214} y={-100} width={232} height={6} fill={L.trim} />
			{/* keyboard: three rows of keycaps with letters */}
			{[0, 1, 2].map((row) =>
				Array.from({length: 7}, (_, k) => {
					const x = -202 + k * 22 + row * 7;
					const y = -118 + row * 0 - row * 0;
					return row === 0 ? (
						<g key={`${row}-${k}`}>
							<circle cx={x} cy={y} r={8.5} fill={L.trim} />
							<circle cx={x} cy={y - 2} r={7} fill={L.paper} />
							<text x={x} y={y + 2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={9} fill={L.ink}>
								{'QWERTYU'[k]}
							</text>
						</g>
					) : null;
				}),
			)}
			{Array.from({length: 6}, (_, k) => (
				<g key={`r2-${k}`}>
					<circle cx={-196 + k * 22} cy={-144} r={7.5} fill={L.trim} />
					<circle cx={-196 + k * 22} cy={-146} r={6} fill={L.paper} />
				</g>
			))}
			{/* face plate */}
			<path d="M -64 -160 L -8 -160 Q 6 -160 8 -146 L 14 -104 L -64 -104 Z" fill={L.lo} opacity={0.55} />
			{[-46, -16].map((x, i) => (
				<g key={x}>
					<ellipse cx={x} cy={-134} rx={12} ry={mood === 'dazed' ? 6 : 14} fill="#FFFFFF" />
					{mood !== 'dazed' ? <circle cx={x + 4} cy={mood === 'worried' ? -130 : -134} r={6} fill="#111" /> : null}
					{mood !== 'dazed' ? <circle cx={x + 2} cy={-137} r={2} fill="#FFFFFF" /> : null}
					<path d={`M ${x - 12} ${-152 + (i ? -brow * 4 : brow * 4)} L ${x + 12} ${-152 - (i ? -brow * 4 : brow * 4)}`} stroke={L.trimHi} strokeWidth={4.5} strokeLinecap="round" />
				</g>
			))}
			<path d={mood === 'worried' ? 'M -40 -112 Q -30 -118 -20 -112' : mood === 'dazed' ? 'M -40 -114 L -20 -112' : 'M -40 -116 Q -30 -108 -20 -116'} fill="none" stroke={L.trimHi} strokeWidth={4} strokeLinecap="round" />
			{/* chassis, wheels, rods, cow-catcher */}
			<rect x={-222} y={-62} width={246} height={18} rx={6} fill="#14151B" />
			<Wheel x={-190} y={-26} r={26} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<Wheel x={-112} y={-26} r={26} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<Wheel x={-34} y={-26} r={26} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<rect x={-190 + pin.x} y={-29 + pin.y} width={156} height={6} rx={3} fill={L.metal} />
			<path d="M 14 -60 L 44 -6 L 10 -6 Z" fill={L.trim} />
			<path d="M 14 -60 L 44 -6 L 30 -6 Z" fill={L.lo} opacity={0.35} />
			{/* headlamp */}
			<circle cx={14} cy={-96} r={9} fill={L.glow} />
			<circle cx={14} cy={-96} r={22} fill={L.glow} opacity={0.25} />
		</g>
	);
};

// B · Steam Press lives in ./steam.tsx (the expressive version).

// ---------------- C · Bullet Stream (faceless) ----------------
export const BulletStream: React.FC<{livery: Livery; f: number; s?: number}> = ({livery, f, s = 1}) => {
	const L = LIV[livery];
	const body = livery === 'gpt' ? '#EEF1F3' : '#F3EEE3';
	const bodyLo = livery === 'gpt' ? '#C7CDD3' : '#E2D6C2';
	const stripe = livery === 'gpt' ? '#23252C' : '#D97757';
	const led = livery === 'gpt' ? '#6BEBC4' : '#FFB070';
	const scroll = (f * 5) % 900;
	return (
		<g transform={`scale(${s})`}>
			<defs>
				<clipPath id={`marq-${livery}`}>
					<rect x={-640} y={-104} width={600} height={30} rx={8} />
				</clipPath>
			</defs>
			{/* second car */}
			<g transform="translate(-360 0)">
				<rect x={-300} y={-150} width={318} height={104} rx={26} fill={body} />
				<rect x={-300} y={-150} width={318} height={14} rx={7} fill="#FFFFFF" opacity={0.7} />
				<rect x={-300} y={-70} width={318} height={24} fill={bodyLo} />
				{Array.from({length: 6}, (_, i) => (
					<rect key={i} x={-280 + i * 50} y={-138} width={38} height={26} rx={7} fill="#1A1C24" />
				))}
				{Array.from({length: 6}, (_, i) => (
					<rect key={`g${i}`} x={-276 + i * 50} y={-134} width={10} height={18} rx={3} fill="#FFFFFF" opacity={0.25} />
				))}
				<rect x={-60} y={-176} width={4} height={26} fill="#6C7280" />
				<path d="M -84 -176 L -40 -196 L -20 -176" fill="none" stroke="#6C7280" strokeWidth={3} />
			</g>
			{/* lead car with the long nose */}
			<path d="M -350 -150 L -120 -150 Q 20 -150 120 -80 Q 140 -64 120 -52 L 110 -46 L -350 -46 Z" fill={body} />
			<path d="M -350 -150 L -120 -150 Q 20 -150 120 -80 L 108 -88 Q 16 -140 -120 -140 L -350 -140 Z" fill="#FFFFFF" opacity={0.7} />
			<path d="M -350 -70 L 116 -70 Q 130 -60 120 -52 L 110 -46 L -350 -46 Z" fill={bodyLo} />
			{/* cockpit glass with a sliding reflection */}
			<path d="M -60 -140 Q 20 -136 76 -98 L 40 -98 Q -10 -122 -60 -124 Z" fill="#14161E" />
			<path d={`M ${-40 + (f * 3) % 120} -134 L ${-20 + (f * 3) % 120} -134 L ${10 + (f * 3) % 120} -104 L ${-10 + (f * 3) % 120} -104 Z`} fill="#FFFFFF" opacity={0.35} />
			{/* livery stripe running the full length */}
			<path d="M -720 -80 L 100 -80 Q 112 -74 116 -70 L -720 -70 Z" fill={stripe} />
			{/* LED marquee: the words it is writing scroll along its side */}
			<rect x={-640} y={-104} width={600} height={30} rx={8} fill="#0D0F16" />
			<g clipPath={`url(#marq-${livery})`}>
				<text x={-40 - scroll} y={-82} fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={3} fill={led} style={{filter: `drop-shadow(0 0 6px ${led})`}}>
					{`${WORDS}   ${WORDS}   ${WORDS}`.toUpperCase()}
				</text>
			</g>
			{/* light strip at the nose, the only "expression" */}
			<path d="M 86 -76 Q 104 -70 112 -60" fill="none" stroke={led} strokeWidth={6} strokeLinecap="round" />
			<path d="M 86 -76 Q 104 -70 112 -60" fill="none" stroke={led} strokeWidth={14} strokeLinecap="round" opacity={0.3} />
			{/* skirt and bogies */}
			<rect x={-720} y={-46} width={830} height={16} rx={6} fill="#20232D" />
			{[-640, -560, -260, -180, -20, 60].map((x) => (
				<Wheel key={x} x={x} y={-22} r={14} turn={f * 0.5} c="#1B1D24" hub="#8A92A6" rim="#FFFFFF" />
			))}
		</g>
	);
};
