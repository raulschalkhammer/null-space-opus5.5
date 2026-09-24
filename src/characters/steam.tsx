import React, {useId} from 'react';
import {FONT, K} from '../flat/kit';
import {LIV, Livery, Wheel, WORDS} from './trains';

// B · Steam Press, the expressive version. Origin = front wheel contact on the rail, facing right.
// The headlamp is the eye (lids, a hood that works as a brow, a pupil); the smokebox door is the mouth
// (it opens onto the firebox glow). The rest of the engine acts too: lean, bounce, shake, the smoke,
// the safety valves (its sweat) and the whistle.

export type Expr = {
	lid: number; // upper lid closure, 0 open .. 1 shut
	low: number; // lower lid, rises into a happy squint
	tilt: number; // hood tilt in degrees; + = front end up (worried), - = front end down (determined)
	browY: number; // hood raise in px
	pupil: number; // pupil size scale
	lookX: number; // -1..1
	lookY: number; // -1..1
	smile: number; // -1 frown .. 1 smile
	open: number; // mouth opening 0..1
	mw: number; // mouth width scale
	wob: number; // mouth wobble 0..1
	lamp: number; // lamp brightness
	flicker: number; // lamp flicker 0..1
	swirl: number; // dizzy spiral in the eye 0..1
	bounce: number; // px
	lean: number; // degrees, + = forward
	shake: number; // px
	droop: number; // px the body sags
	smoke: number; // puff size scale
	rate: number; // puff rate
	dark: number; // smoke darkness 0..1
	sweat: number; // safety-valve steam and a sweat drop 0..1
	whistle: number; // 0..1
	blush: number; // 0..1
	speed: number; // how fast it drives
};

export type SteamMood = 'happy' | 'curious' | 'proud' | 'determined' | 'nervous' | 'panic' | 'sad' | 'dazed';

const BASE: Expr = {lid: 0.1, low: 0, tilt: 0, browY: 0, pupil: 1, lookX: 0.3, lookY: 0, smile: 0.2, open: 0, mw: 1, wob: 0, lamp: 1, flicker: 0, swirl: 0, bounce: 0, lean: 0, shake: 0, droop: 0, smoke: 1, rate: 1, dark: 0, sweat: 0, whistle: 0, blush: 0, speed: 1};

export const MOODS: Record<SteamMood, Expr> = {
	happy: {...BASE, lid: 0.12, low: 0.4, tilt: 5, browY: 5, lookX: 0.4, smile: 0.95, open: 0.4, lamp: 1.1, bounce: 7, lean: 1, smoke: 1.25, rate: 1.1, whistle: 0.7, blush: 0.8, speed: 1},
	curious: {...BASE, lid: 0, tilt: 12, browY: 12, pupil: 1.3, lookX: 0.7, lookY: -0.6, smile: 0.1, open: 0.25, mw: 0.45, lean: 4, bounce: 1.5, smoke: 0.9, rate: 0.7, speed: 0.7},
	proud: {...BASE, lid: 0.42, low: 0.3, browY: 6, lookX: 0.6, lookY: -0.5, smile: 0.75, lamp: 1.25, lean: -3, smoke: 1.7, rate: 0.8, blush: 0.35, speed: 0.8},
	determined: {...BASE, lid: 0.4, low: 0.18, tilt: -18, browY: -3, pupil: 0.9, lookX: 0.9, lookY: 0.1, smile: 0.4, open: 0.14, mw: 1.1, lamp: 1.4, lean: 6, bounce: 2, smoke: 1.4, rate: 2, speed: 1.7},
	nervous: {...BASE, lid: 0.04, low: 0.1, tilt: 18, browY: 6, pupil: 0.68, lookX: -0.5, lookY: 0.2, smile: -0.4, open: 0.12, wob: 1, lamp: 0.85, shake: 1.3, lean: -1, smoke: 0.6, rate: 1.7, dark: 0.2, sweat: 0.85, speed: 1.2},
	panic: {...BASE, lid: 0, tilt: 26, browY: 15, pupil: 0.42, lookX: 0.2, smile: -0.45, open: 1, mw: 0.62, lamp: 1.5, flicker: 0.3, shake: 3.6, lean: -7, smoke: 0.5, rate: 3, dark: 0.4, sweat: 1, whistle: 1, speed: 2.3},
	sad: {...BASE, lid: 0.52, low: 0.08, tilt: 20, browY: -4, pupil: 1.05, lookX: 0, lookY: 0.75, smile: -0.8, lamp: 0.5, lean: -2, droop: 6, smoke: 0.7, rate: 0.4, dark: 0.55, speed: 0.35},
	dazed: {...BASE, lid: 0.45, low: 0.2, tilt: 6, swirl: 1, smile: -0.1, open: 0.2, mw: 0.8, wob: 0.8, lamp: 0.6, flicker: 1, lean: -3, droop: 3, smoke: 0.5, rate: 0.5, dark: 0.5, speed: 0.2},
};

const PUFFS = 5; // puffs in the air at once
const PERIOD = 0.2; // clock units between puffs (one word each)
const TAPE = 300; // visible tape length

export const lerpExpr = (a: Expr, b: Expr, t: number): Expr => {
	const o = {} as Expr;
	for (const k of Object.keys(a) as (keyof Expr)[]) o[k] = a[k] + (b[k] - a[k]) * t;
	return o;
};

const mix = (a: string, b: string, t: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

// face plate colours per livery: a silver door on the graphite engine, a lighter clay door on the terracotta one
const PLATE = {gpt: {plate: '#AEB6C0', ring: '#6B7380', mouth: '#15161B', fire: '#6BEBC4'}, claude: {plate: '#E88F6F', ring: '#A9533A', mouth: '#4A2217', fire: '#FFB35C'}};

export const SteamPress: React.FC<{livery: Livery; f: number; s?: number; mood?: SteamMood; expr?: Expr; smokeT?: number; dist?: number; blink?: boolean}> = ({
	livery,
	f,
	s = 1,
	mood = 'happy',
	expr,
	smokeT,
	dist,
	blink = true,
}) => {
	const L = LIV[livery];
	const P = PLATE[livery];
	const E = expr ?? MOODS[mood];
	const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
	const d = dist ?? f * E.speed;
	const turn = d * 0.2;
	const st = smokeT ?? f * 0.012 * E.rate;
	const pin = {x: 14 * Math.cos(turn), y: 14 * Math.sin(turn)};
	const words = WORDS.split(' ');

	// lamp flicker: a jittery multiplier, deterministic in f
	const flk = 1 - E.flicker * (0.5 + 0.5 * Math.sin(f * 1.7) * Math.sin(f * 0.53)) * 0.8;
	const lamp = Math.max(0, E.lamp * flk);
	// blink every ~3.5 s (off while dizzy)
	const bp = (f + 23) % 84;
	const blinkAmt = blink && E.swirl < 0.5 ? (bp < 6 ? Math.sin((bp / 6) * Math.PI) : 0) : 0;
	const lid = Math.min(1, E.lid + (1 - E.lid) * blinkAmt);

	// body language
	const bob = -Math.abs(Math.sin(d * 0.12)) * E.bounce;
	const sx = E.shake * Math.sin(f * 2.1);
	const sy = E.shake * 0.5 * Math.cos(f * 2.7) + E.droop;
	const body = `translate(${sx} ${bob + sy}) rotate(${E.lean} -110 -60)`;

	// eye (headlamp) and mouth (smokebox door)
	const ex = 22;
	const ey = -202;
	const R = 25;
	const r = 19;
	const cx = 18;
	const cy = -120;
	const D = 37;

	// mouth geometry: sample the lip lines
	const w = 25 * E.mw;
	const n = 12;
	const ts = Array.from({length: n + 1}, (_, i) => -1 + (2 * i) / n);
	const base = (t: number) => cy + 8 - E.smile * 8 + (1 - t * t) * E.smile * 14 + E.wob * 2.6 * Math.sin(t * 9 + f * 0.6);
	const up = ts.map((t) => [cx + t * w, base(t) - E.open * 9 * Math.sqrt(1 - t * t)]);
	const lo = ts.map((t) => [cx + t * w, base(t) + E.open * 24 * Math.sqrt(1 - t * t)]);
	const mouthD = `M ${up.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} L ${lo
		.slice()
		.reverse()
		.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
		.join(' L ')} Z`;
	const lineD = `M ${up.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`;

	// one shared word clock drives the smoke and the press, so the tape always shows what the smoke just said
	const clock = st + 2;
	const kNow = Math.floor(clock / PERIOD);
	const prog = (clock - kNow * PERIOD) / PERIOD;
	const wordAt = (k: number) => words[((k % words.length) + words.length) % words.length];
	// stack top in the engine's leaning, shaking frame
	const th = (E.lean * Math.PI) / 180;
	const O = {x: -110 + 69 * Math.cos(th) + 184 * Math.sin(th) + sx, y: -60 + 69 * Math.sin(th) - 184 * Math.cos(th) + bob + sy};
	// the tape: drawn tail -> press so the text reads left to right; its ripples travel backwards with the paper
	const tapeD = `M ${Array.from({length: 25}, (_, i) => {
		const u = i / 24;
		const x = -150 - TAPE * (1 - u);
		const y = -90 + (1 - u) * (2 + 7 * (1 - u)) * Math.sin((1 - u) * 7 - d * 0.16) - 2 * u;
		return `${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(' L ')}`;
	// on the tape a small mark separates one pass of the sentence from the next
	const tapeWord = (k: number) => (((k % words.length) + words.length) % words.length === 0 ? '•  ' : '') + wordAt(k);
	const tapeText = Array.from({length: 6}, (_, j) => tapeWord(kNow - 5 + j)).join(' ');
	const emerge = Math.min(1, prog * 2.2);
	const tapeOffset = TAPE - 10 + (1 - emerge * emerge * (3 - 2 * emerge)) * ((tapeWord(kNow).length + 1) * 8.4);
	const puffLight = livery === 'gpt' ? '#C9CED6' : '#F1E3D6';
	const puff = mix(puffLight, '#5A5470', E.dark);
	const toot = E.whistle * (E.whistle > 0.9 ? 1 : Math.max(0, Math.sin(f * 0.22)));

	return (
		<g transform={`scale(${s})`}>
			<defs>
				<clipPath id={`lens${uid}`}>
					<circle cx={ex} cy={ey} r={r} />
				</clipPath>
				<clipPath id={`mouth${uid}`}>
					<path d={mouthD} />
				</clipPath>
			</defs>
			{/* headlamp beam, behind everything */}
			<g transform={body}>
				<path
					d={`M ${ex + R - 4} ${ey - 10} L ${ex + 280} ${ey - 56 + E.lookY * 40} L ${ex + 280} ${ey + 64 + E.lookY * 40} L ${ex + R - 4} ${ey + 10} Z`}
					fill={L.glow}
					opacity={0.14 * lamp}
				/>
			</g>
			{/* smoke made of words: one puff per word, in sentence order, drifting back and up with the train's speed.
			    Only the newest puffs still carry their word; older ones dissolve into plain smoke. */}
			{Array.from({length: PUFFS}, (_, j) => {
				const k = kNow - j;
				const a = (clock - k * PERIOD) / (PERIOD * PUFFS);
				if (a < 0 || a >= 1) return null;
				const wd = wordAt(k);
				const tw = wd.length * 9.6 + 24;
				const sc = (0.85 + 0.5 * a) * (0.75 + 0.25 * E.smoke);
				const drift = 0.55 + 0.45 * Math.min(2, E.speed);
				const x = O.x - 200 * Math.pow(a, 0.85) * drift + 6 * Math.sin(a * 6 + k) + E.shake * 3 * Math.sin(f * 0.9 + k);
				const y = O.y - 24 * sc - 170 * (1 - E.dark * 0.4) * (1 - (1 - a) * (1 - a));
				const puffOp = Math.min(1, a * 10) * Math.pow(1 - a, 1.2);
				const textOp = a < 0.34 ? 1 : Math.max(0, 1 - (a - 0.34) / 0.2);
				return (
					<g key={k} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`} opacity={puffOp}>
						<rect x={-tw / 2} y={-17} width={tw} height={34} rx={17} fill={puff} />
						<circle cx={-tw * 0.18} cy={-15} r={15} fill={puff} />
						<circle cx={tw * 0.16} cy={-17} r={18} fill={puff} />
						<circle cx={-tw * 0.22} cy={-19} r={6} fill="#FFFFFF" opacity={0.35 * (1 - E.dark)} />
						{textOp > 0.01 && (
							<text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill={L.ink} opacity={textOp}>
								{wd}
							</text>
						)}
					</g>
				);
			})}
			{/* tender: a printing press; each word from the smoke is printed onto the tape, which feeds out backwards */}
			<g transform="translate(-300 0)">
				<defs>
					<linearGradient id={`tapeFade${uid}`} gradientUnits="userSpaceOnUse" x1={-150 - TAPE} y1={0} x2={-150} y2={0}>
						<stop offset="0" stopColor="#fff" stopOpacity={0} />
						<stop offset="0.16" stopColor="#fff" stopOpacity={1} />
						<stop offset="1" stopColor="#fff" stopOpacity={1} />
					</linearGradient>
					<mask id={`tapeMask${uid}`} maskUnits="userSpaceOnUse" x={-160 - TAPE} y={-160} width={TAPE + 40} height={140}>
						<rect x={-160 - TAPE} y={-160} width={TAPE + 40} height={140} fill={`url(#tapeFade${uid})`} />
					</mask>
					<path id={`tape${uid}`} d={tapeD} />
				</defs>
				<path d={tapeD} fill="none" stroke={L.lo} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} transform="translate(0 3)" />
				<path d={tapeD} fill="none" stroke={L.paper} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
				<g mask={`url(#tapeMask${uid})`}>
					<text fontFamily={FONT} fontWeight={800} fontSize={15} fill={L.ink} dominantBaseline="central" letterSpacing={0.3}>
						<textPath href={`#tape${uid}`} startOffset={tapeOffset.toFixed(1)} textAnchor="end">
							{tapeText}
						</textPath>
					</text>
				</g>
				{/* the press mouth the tape comes out of */}
				<rect x={-158} y={-104} width={14} height={28} rx={4} fill={L.lo} />
				<rect x={-150} y={-170} width={190} height={112} rx={10} fill={L.body} />
				<rect x={-150} y={-170} width={190} height={16} rx={8} fill={L.hi} />
				<rect x={-150} y={-86} width={190} height={10} fill={L.trim} />
				{[-100, -30].map((x, i) => (
					<g key={x} transform={`translate(${x} -122) rotate(${(d * 6 * (i ? -1 : 1)) % 360})`}>
						<circle r={24} fill={L.metal} />
						<circle r={24} fill="none" stroke={L.lo} strokeWidth={4} />
						<rect x={-2} y={-22} width={4} height={44} fill={L.lo} opacity={0.6} />
					</g>
				))}
				<rect x={-160} y={-62} width={214} height={14} rx={5} fill="#14151B" />
				<Wheel x={-120} y={-26} r={22} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
				<Wheel x={10} y={-26} r={22} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
				<rect x={54} y={-46} width={40} height={6} rx={3} fill="#14151B" />
			</g>

			<g transform={body}>
				{/* cab */}
				<rect x={-250} y={-210} width={92} height={150} rx={8} fill={L.body} />
				<rect x={-262} y={-222} width={116} height={16} rx={8} fill={L.lo} />
				<rect x={-236} y={-190} width={60} height={46} rx={8} fill={L.window} />
				<rect x={-236} y={-190} width={60} height={46} rx={8} fill={L.glow} opacity={0.35 * Math.min(1.3, lamp)} filter="url(#glow)" />
				{/* boiler */}
				<rect x={-160} y={-176} width={150} height={100} rx={18} fill={L.body} />
				<rect x={-160} y={-176} width={150} height={22} rx={11} fill={L.hi} />
				{[-134, -96, -58].map((x) => (
					<rect key={x} x={x} y={-176} width={8} height={100} fill={L.trim} opacity={0.9} />
				))}
				{/* whistle */}
				<rect x={-152} y={-198} width={9} height={22} rx={3} fill={L.brass} />
				<path d="M -156 -198 L -139 -198 L -142 -210 L -153 -210 Z" fill={L.brass} />
				{toot > 0.02 && (
					<g opacity={toot}>
						{[0, 1, 2].map((k) => {
							const a = (f * 0.09 + k / 3) % 1;
							return <ellipse key={k} cx={-148 - 18 * a} cy={-216 - 46 * a} rx={8 + 16 * a} ry={6 + 10 * a} fill="#FFFFFF" opacity={0.75 * (1 - a)} />;
						})}
						{[-60, -35, -10].map((ang, k) => (
							<path
								key={k}
								d={`M 0 -24 L 0 -40`}
								transform={`translate(-148 -206) rotate(${ang})`}
								stroke={K.yellow}
								strokeWidth={4}
								strokeLinecap="round"
								opacity={0.5 + 0.5 * Math.sin(f * 0.5 + k)}
							/>
						))}
					</g>
				)}
				{/* domes = safety valves; steam escapes when it is nervous */}
				<path d="M -132 -176 Q -132 -204 -114 -204 Q -96 -204 -96 -176 Z" fill={L.brass} />
				<path d="M -86 -176 Q -86 -194 -75 -194 Q -64 -194 -64 -176 Z" fill={L.brass} />
				{E.sweat > 0.02 &&
					[-114, -75].map((x, j) =>
						[0, 1, 2].map((k) => {
							const a = (f * 0.11 + k / 3 + j * 0.17) % 1;
							return <circle key={`${j}${k}`} cx={x + 7 * Math.sin(a * 7 + k) - 10 * a} cy={-206 + j * 10 - 44 * a} r={4 + 9 * a} fill="#FFFFFF" opacity={0.7 * (1 - a) * E.sweat} />;
						}),
					)}
				{/* smokebox + stack */}
				<rect x={-24} y={-176} width={56} height={104} rx={12} fill={L.lo} />
				<path d="M -58 -176 L -64 -236 L -18 -236 L -24 -176 Z" fill={L.lo} />
				<g transform={`translate(-41 -238) scale(${1 + 0.14 * Math.max(0, 1 - prog * 4)} ${1 - 0.05 * Math.max(0, 1 - prog * 4)})`}>
					<rect x={-29} y={-6} width={58} height={12} rx={6} fill={L.body} />
				</g>

				{/* mouth: the smokebox door */}
				<circle cx={cx} cy={cy} r={D} fill={P.plate} />
				<circle cx={cx} cy={cy} r={D} fill="none" stroke={P.ring} strokeWidth={5} />
				<path d={`M ${cx - D * 0.8} ${cy - D * 0.45} A ${D * 0.92} ${D * 0.92} 0 0 1 ${cx + D * 0.2} ${cy - D * 0.9}`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.35} />
				{Array.from({length: 10}, (_, i) => {
					const a = (i / 10) * Math.PI * 2 + 0.3;
					return <circle key={i} cx={cx + Math.cos(a) * (D - 6)} cy={cy + Math.sin(a) * (D - 6)} r={2.2} fill={P.ring} />;
				})}
				{E.blush > 0.02 && <ellipse cx={cx - 20} cy={cy - 8} rx={9} ry={5.5} fill="#FF7F98" opacity={0.55 * E.blush} />}
				{E.open < 0.06 ? (
					<path d={lineD} fill="none" stroke={P.mouth} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
				) : (
					<g>
						<path d={mouthD} fill={P.mouth} />
						<g clipPath={`url(#mouth${uid})`}>
							<ellipse cx={cx} cy={cy + 24 + E.smile * 4} rx={w * 1.1} ry={16} fill={P.fire} opacity={0.85 * (0.75 + 0.25 * Math.sin(f * 0.8))} />
							<ellipse cx={cx} cy={cy + 28 + E.smile * 4} rx={w * 0.6} ry={9} fill="#FFF3C4" opacity={0.7} />
						</g>
						<path d={mouthD} fill="none" stroke={P.mouth} strokeWidth={3.5} strokeLinejoin="round" />
					</g>
				)}

				{/* eye: the headlamp */}
				<circle cx={ex} cy={ey} r={R * 1.7} fill={L.glow} opacity={0.22 * lamp} filter="url(#glow)" />
				<rect x={ex - 14} y={ey + R - 6} width={28} height={12} rx={4} fill={L.lo} />
				<circle cx={ex} cy={ey} r={R} fill={L.lo} />
				<g clipPath={`url(#lens${uid})`}>
					<circle cx={ex} cy={ey} r={r} fill={L.paper} />
					<circle cx={ex} cy={ey} r={r} fill={L.glow} opacity={0.18 * lamp} />
					{E.swirl > 0.5 ? (
						<path
							d={Array.from({length: 40}, (_, i) => {
								const a = i * 0.45 + f * 0.25;
								const rr = 1 + i * 0.36;
								return `${i ? 'L' : 'M'} ${(ex + Math.cos(a) * rr).toFixed(1)} ${(ey + Math.sin(a) * rr).toFixed(1)}`;
							}).join(' ')}
							fill="none"
							stroke={L.ink}
							strokeWidth={2.6}
							strokeLinecap="round"
						/>
					) : (
						<g transform={`translate(${ex + E.lookX * 6} ${ey + E.lookY * 6})`}>
							<circle r={11 * Math.min(1.25, 0.55 + E.pupil * 0.45)} fill={L.glow} />
							<circle r={11 * Math.min(1.25, 0.55 + E.pupil * 0.45)} fill="none" stroke={L.ink} strokeWidth={1.5} opacity={0.35} />
							<circle r={5.5 * E.pupil} fill={L.ink} />
							<circle cx={-3.5} cy={-4} r={2.6} fill="#FFFFFF" />
						</g>
					)}
					{/* upper lid, tilted with the hood */}
					<g transform={`rotate(${-E.tilt * 0.8} ${ex} ${ey})`}>
						<rect x={ex - r - 10} y={ey - r - 40} width={2 * r + 20} height={40 + 2 * r * lid} fill={L.body} />
						<rect x={ex - r - 10} y={ey - r + 2 * r * lid - 3} width={2 * r + 20} height={3} fill={L.lo} opacity={lid > 0.03 ? 1 : 0} />
					</g>
					{/* lower lid: curves up into a squint */}
					<path
						d={`M ${ex - r - 4} ${ey + r + 6} L ${ex - r - 4} ${ey + r - 2 * r * E.low * 0.7} Q ${ex} ${ey + r - 2 * r * E.low * 1.5} ${ex + r + 4} ${ey + r - 2 * r * E.low * 0.7} L ${ex + r + 4} ${ey + r + 6} Z`}
						fill={L.body}
					/>
				</g>
				<circle cx={ex} cy={ey} r={r} fill="none" stroke={L.metal} strokeWidth={3} opacity={0.9} />
				{/* hood = brow */}
				<g transform={`translate(0 ${-E.browY + lid * 5}) rotate(${-E.tilt} ${ex} ${ey})`}>
					<path d={`M ${ex - R - 4} ${ey - 4} A ${R + 5} ${R + 5} 0 0 1 ${ex + R + 4} ${ey - 4}`} fill="none" stroke={L.body} strokeWidth={11} strokeLinecap="round" />
					<path d={`M ${ex - R + 2} ${ey - 14} A ${R + 5} ${R + 5} 0 0 1 ${ex + R * 0.4} ${ey - R - 3}`} fill="none" stroke={L.hi} strokeWidth={3} strokeLinecap="round" />
				</g>
				{/* a sweat drop sliding down the smokebox */}
				{E.sweat > 0.5 && (
					<path
						transform={`translate(${ex - 30} ${ey + 20 + ((f * 0.7) % 26)})`}
						d="M 0 -10 Q 7 0 6 5 A 6 6 0 0 1 -6 5 Q -7 0 0 -10 Z"
						fill="#BFE6FF"
						opacity={(E.sweat - 0.5) * 2 * (1 - ((f * 0.7) % 26) / 26)}
					/>
				)}
			</g>

			{/* running gear stays on the rail */}
			<rect x={-252} y={-62} width={292} height={16} rx={6} fill="#14151B" />
			<rect x={-8} y={-74} width={44} height={26} rx={6} fill={L.metal} />
			<Wheel x={-210} y={-40} r={40} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<Wheel x={-112} y={-40} r={40} turn={turn} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<Wheel x={4} y={-20} r={20} turn={turn * 2} c="#1B1D24" hub={L.metal} rim={L.trimHi} />
			<rect x={-210 + pin.x} y={-43 + pin.y} width={98} height={7} rx={3.5} fill={L.metal} />
			<path d={`M ${-112 + pin.x} ${-40 + pin.y} L 10 -62`} stroke={L.metal} strokeWidth={6} strokeLinecap="round" />
			<path d="M 28 -60 L 58 -4 L 22 -4 Z" fill={L.trim} />
		</g>
	);
};
