import React from 'react';
import {FONT, FlatDefs, FlatLighthouse, K, Motes, Stars} from '../../flat/kit';
import {Mountains, Moon, Clouds, WorldDefs} from '../../flat/world';
import {SteamPress, type Expr, type Speech} from '../../characters/steam';
import {clamp01, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {withLook} from '../flat-track/trainMood';
import {A, CoinStack, Gauge, LampHead, RED} from '../million-letters/parts';

// Chapter 4 palettes:
//   night rail (K): the junction outside, the tracks, the trains, the semaphore signals
//   signal box (G): the cabin inside, bottle green and cream with brass
//   teal (T, from chapter 3): the concept stages
//   red (RED): mistakes only
export const G = {
	green: '#1F4A3A',
	greenHi: '#2C6450',
	greenLo: '#15352A',
	cream: '#EDE3C8',
	creamLo: '#D6C9A6',
	board: '#0F2A22',
	brick: '#6B4430',
	brickLo: '#5A3A2A',
	slate: '#2A2F4A',
	lamp: '#FFC46B',
};

// ---------- geometry of the junction (world coordinates; the world is drawn well past the frame) ----------
export const J = {
	ground: 620, // horizon
	railY: 880, // the incoming line and the long line
	pointsX: 900,
	shortY: 790, // the short line, after it climbs
	shortEnd: 1230, // buffer stop on the short line
	longStop: 1430, // where carts stop behind the train's tender
	trainX: 1880, // the Claude train's front wheel on the long line
	trainS: 0.62,
	box: {x0: 430, x1: 770, top: 470, base: 800},
	signalX: 840,
	booth: {x0: 1250, x1: 1400, top: 650},
};

// A route along the tracks: s is the distance travelled from the far left (x = -300).
export type Route = 'short' | 'long';
const IN_LEN = J.pointsX + 300;
const SHORT_CURVE = 230; // approximate length of the climb
export const routeLen = (r: Route) => (r === 'short' ? IN_LEN + SHORT_CURVE + (J.shortEnd - 1100) : IN_LEN + (J.longStop - J.pointsX));
export const posOn = (r: Route, s: number) => {
	if (s <= IN_LEN) return {x: -300 + s, y: J.railY, a: 0};
	const u = s - IN_LEN;
	if (r === 'long') return {x: J.pointsX + Math.min(u, J.longStop - J.pointsX), y: J.railY, a: 0};
	if (u < SHORT_CURVE) {
		// cubic from (900, 880) via (1000, 880), (1000, 790) to (1100, 790)
		const t = u / SHORT_CURVE;
		const bx = (1 - t) ** 3 * 900 + 3 * (1 - t) ** 2 * t * 1000 + 3 * (1 - t) * t * t * 1000 + t ** 3 * 1100;
		const by = (1 - t) ** 3 * 880 + 3 * (1 - t) ** 2 * t * 880 + 3 * (1 - t) * t * t * 790 + t ** 3 * 790;
		const a = -Math.sin(Math.PI * t) * 38;
		return {x: bx, y: by, a};
	}
	return {x: Math.min(1100 + (u - SHORT_CURVE), J.shortEnd), y: J.shortY, a: 0};
};

// ---------- props ----------
// A small mail cart carrying one letter, with how sure Jev is about it on a tag.
export const Cart: React.FC<{x: number; y: number; a?: number; s?: number; p?: number; tint?: string; red?: boolean; lit?: number; letter?: boolean}> = ({x, y, a = 0, s = 1, p, tint, red, lit = 0, letter = true}) => (
	<g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
		<rect x={-36} y={-22} width={72} height={16} rx={4} fill="#3A2E4A" />
		<rect x={-36} y={-22} width={72} height={4} rx={2} fill="#5A4E7A" />
		{[-22, 22].map((wx) => (
			<g key={wx}>
				<circle cx={wx} cy={-6} r={8} fill="#1B1840" />
				<circle cx={wx} cy={-6} r={3} fill="#C9CCE0" />
			</g>
		))}
		{letter ? (
			<g transform="translate(0 -44)">
				{lit > 0 ? <rect x={-40} y={-26} width={80} height={52} rx={10} fill={K.yellow} opacity={0.5 * lit} filter="url(#glowBig)" /> : null}
				<rect x={-30} y={-20} width={60} height={40} rx={5} fill={red ? RED : tint ?? '#FBF3E4'} />
				<path d="M -30 -18 L 0 4 L 30 -18" fill="none" stroke={red ? '#B0243A' : '#C9B8A0'} strokeWidth={3} strokeLinejoin="round" />
				<rect x={14} y={-15} width={11} height={13} fill={K.orange} />
				<rect x={-22} y={6} width={26} height={4} rx={2} fill="#8C7CA8" opacity={0.8} />
			</g>
		) : null}
		{p !== undefined ? (
			<g transform="translate(0 -92)">
				<rect x={-30} y={-16} width={60} height={30} rx={8} fill="#0B1030" opacity={0.75} />
				<text y={7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={p >= 0.9 ? K.yellow : K.white}>
					{p.toFixed(2)}
				</text>
			</g>
		) : null}
	</g>
);

// Track seen side on: ballast, sleepers and a bright rail, along any SVG path.
const Track: React.FC<{d: string; hot?: number}> = ({d, hot = 0}) => (
	<g>
		<path d={d} fill="none" stroke="#262A66" strokeWidth={26} strokeLinecap="round" />
		<path d={d} fill="none" stroke="#6B4430" strokeWidth={12} strokeDasharray="8 14" transform="translate(0 4)" />
		<path d={d} fill="none" stroke="#C9CCE0" strokeWidth={4} transform="translate(0 -4)" />
		{hot > 0 ? <path d={d} fill="none" stroke={K.yellow} strokeWidth={6} transform="translate(0 -4)" opacity={0.7 * hot} /> : null}
	</g>
);

// A semaphore signal: two arms on one post, the upper for the short line, the lower for the long line.
// An arm raised to 40 degrees means "this way".
const Semaphore: React.FC<{x: number; route: Route; k: number}> = ({x, route, k}) => {
	const armA = (r: Route) => (r === route ? -40 * k : 0);
	return (
		<g>
			<rect x={x - 5} y={620} width={10} height={J.railY - 620} fill="#1B1840" />
			<circle cx={x} cy={612} r={9} fill="#C9CCE0" />
			{(['short', 'long'] as Route[]).map((r, i) => (
				<g key={r} transform={`translate(${x} ${650 + i * 56}) rotate(${armA(r)})`}>
					<rect x={-86} y={-8} width={86} height={16} rx={3} fill={K.yellow} />
					<rect x={-58} y={-8} width={14} height={16} fill="#1B1840" />
					<circle cx={0} cy={0} r={6} fill="#1B1840" />
				</g>
			))}
		</g>
	);
};

// The reply booth at the end of the short line, with a rubber stamp that comes down by itself.
const Booth: React.FC<{f: number; stampAt: number[]; red?: boolean}> = ({f, stampAt, red}) => {
	const {x0, x1, top} = J.booth;
	const hit = stampAt.reduce((m, t) => Math.max(m, 1 - Math.abs(f - t) / 5), 0);
	const down = clamp01(hit);
	return (
		<g>
			<rect x={x0} y={top + 30} width={x1 - x0} height={J.shortY - top - 30} fill={G.green} />
			<rect x={x0} y={top + 30} width={x1 - x0} height={10} fill={G.greenHi} />
			<path d={`M ${x0 - 14} ${top + 34} L ${(x0 + x1) / 2} ${top - 6} L ${x1 + 14} ${top + 34} Z`} fill={G.slate} />
			<rect x={x0 + 26} y={top + 58} width={50} height={40} rx={4} fill={G.lamp} opacity={0.85} />
			<rect x={x0 + 94} y={top + 60} width={34} height={J.shortY - top - 60} rx={3} fill={G.greenLo} />
			{/* the stamp: a handle and a block, swinging down onto the track end */}
			<g transform={`translate(${J.shortEnd - 20} ${lerp(top + 20, J.shortY - 70, down)})`}>
				<rect x={-5} y={-40} width={10} height={40} fill="#8A5A3C" />
				<circle cx={0} cy={-44} r={12} fill="#A8704A" />
				<rect x={-26} y={0} width={52} height={18} rx={4} fill={G.creamLo} />
				<rect x={-26} y={14} width={52} height={6} rx={2} fill={red ? RED : G.green} />
			</g>
		</g>
	);
};

// The signal box: a cabin with big windows on a brick base, stairs, a nameboard, a clock and a big gauge.
const SignalBoxBuilding: React.FC<{f: number; p?: number; lamp?: number}> = ({f, p, lamp = 1}) => {
	const {x0, x1, top, base} = J.box;
	const cab = top + 170; // floor of the cabin
	const hour = (f * 0.05) % 360;
	return (
		<g>
			{/* brick base */}
			<rect x={x0 + 20} y={cab} width={x1 - x0 - 40} height={base - cab} fill={G.brick} />
			{Array.from({length: 7}, (_, r) =>
				Array.from({length: 9}, (_, c) => <rect key={`${r}-${c}`} x={x0 + 24 + c * 34 - (r % 2) * 17} y={cab + 4 + r * 20} width={30} height={16} rx={2} fill={(r + c) % 4 ? G.brickLo : '#7A5040'} opacity={0.6} />),
			)}
			{/* the stairs up the side */}
			<path d={`M ${x0 - 160} ${base} L ${x0 + 20} ${cab + 10} L ${x0 + 20} ${cab + 26} L ${x0 - 136} ${base} Z`} fill="#3A2E4A" />
			{Array.from({length: 7}, (_, i) => {
				const t = (i + 1) / 8;
				return <rect key={i} x={lerp(x0 - 160, x0 + 20, t) - 14} y={lerp(base, cab + 10, t) - 3} width={28} height={6} fill="#5A4E7A" />;
			})}
			<path d={`M ${x0 - 160} ${base - 60} L ${x0 + 20} ${cab - 50}`} stroke="#C9CCE0" strokeWidth={4} />
			{/* the cabin */}
			<rect x={x0} y={top} width={x1 - x0} height={cab - top} fill={G.green} />
			<rect x={x0} y={cab - 46} width={x1 - x0} height={46} fill={G.greenLo} />
			{[0, 1, 2, 3].map((i) => {
				const w = (x1 - x0 - 50) / 4;
				const x = x0 + 10 + i * (w + 10);
				return (
					<g key={i}>
						<rect x={x} y={top + 20} width={w} height={cab - top - 80} fill={G.lamp} opacity={0.35 + 0.5 * lamp} />
						<rect x={x} y={top + 20} width={w} height={cab - top - 80} fill="none" stroke={G.cream} strokeWidth={6} />
						<line x1={x + w / 2} y1={top + 20} x2={x + w / 2} y2={cab - 60} stroke={G.cream} strokeWidth={3} />
					</g>
				);
			})}
			{/* Jev inside, glowing through the glass */}
			<circle cx={x0 + 120} cy={top + 60} r={60} fill={G.lamp} opacity={0.45 * lamp} filter="url(#glowBig)" />
			<path d={`M ${x0 + 104} ${top + 50} L ${x0 + 120} ${top + 36} L ${x0 + 136} ${top + 50} Z`} fill={K.rose} />
			<rect x={x0 + 108} y={top + 50} width={24} height={16} rx={4} fill="#FFF1C0" />
			{/* lever tops in the windows */}
			{Array.from({length: 6}, (_, i) => (
				<line key={i} x1={x0 + 170 + i * 24} y1={cab - 60} x2={x0 + 176 + i * 24} y2={cab - 96} stroke="#1B1840" strokeWidth={5} strokeLinecap="round" />
			))}
			{/* the roof and the nameboard */}
			<path d={`M ${x0 - 26} ${top + 4} L ${x0 + 30} ${top - 44} L ${x1 - 30} ${top - 44} L ${x1 + 26} ${top + 4} Z`} fill={G.slate} />
			<rect x={x0 + 50} y={top - 22} width={x1 - x0 - 100} height={32} rx={4} fill={G.cream} />
			<text x={(x0 + x1) / 2} y={top + 3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} letterSpacing={4} fill={G.green}>
				JUNCTION
			</text>
			{/* a clock on the corner */}
			<g transform={`translate(${x1 - 36} ${top + 46})`}>
				<circle r={22} fill={G.cream} stroke={G.slate} strokeWidth={4} />
				<line x1={0} y1={0} x2={0} y2={-15} stroke={G.slate} strokeWidth={3} transform={`rotate(${hour * 12})`} strokeLinecap="round" />
				<line x1={0} y1={0} x2={0} y2={-10} stroke={G.slate} strokeWidth={4} transform={`rotate(${hour})`} strokeLinecap="round" />
			</g>
			{/* how sure Jev is about the letter at the points */}
			{p !== undefined ? (
				<g>
					<rect x={x0 + 70} y={cab + 12} width={200} height={124} rx={12} fill="#1B1840" opacity={0.85} />
					<Gauge x={(x0 + x1) / 2} y={cab + 100} s={0.55} p={p} />
				</g>
			) : null}
		</g>
	);
};

// ---------- the junction, outside ----------
export type CartState = {route: Route; s: number; p?: number; tint?: string; red?: boolean; lit?: number; letter?: boolean; o?: number};
export type JunctionProps = {
	f: number;
	carts?: CartState[];
	route?: Route; // where the points are set
	switchK?: number; // 0..1 how far the points and signal have moved to `route`
	gaugeP?: number;
	boxLamp?: number;
	stampAt?: number[];
	stampRed?: boolean;
	train?: {x?: number; expr?: Expr; speech?: Speech; dist?: number};
	gpt?: {x: number; expr?: Expr; dist?: number} | null;
	coins?: {short: number; long: number} | null;
	dawn?: number;
	town?: number; // a second town's lights on the horizon
	townX?: number;
	lighthouse?: number;
	bare?: boolean; // no sky or ground: for the dawn panorama, which draws its own
	hideBox?: boolean; // the view from inside the box
	children?: React.ReactNode;
};

const SHORT_D = `M ${J.pointsX} ${J.railY} C 1000 ${J.railY} 1000 ${J.shortY} 1100 ${J.shortY} L ${J.shortEnd + 20} ${J.shortY}`;
export const Junction: React.FC<JunctionProps> = ({f, carts = [], route = 'short', switchK = 1, gaugeP, boxLamp = 1, stampAt = [], stampRed, train = {}, gpt = null, coins = null, dawn = 0, town = 0, townX = 2000, lighthouse = 0.7, bare, hideBox, children}) => {
	const trainX = train.x ?? J.trainX;
	return (
		<g>
			{bare ? null : (
				<>
					<FlatDefs />
					<WorldDefs />
					<defs>
						<linearGradient id="gDawn" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#3A3A8A" stopOpacity={0} />
							<stop offset="0.55" stopColor="#B86A9A" stopOpacity={0.55} />
							<stop offset="1" stopColor="#FFB38A" stopOpacity={0.9} />
						</linearGradient>
					</defs>
					<rect x={-1400} y={-900} width={4800} height={1600} fill="url(#gSky)" />
					{dawn > 0 ? <rect x={-1400} y={-900} width={4800} height={1530} fill="url(#gDawn)" opacity={dawn} /> : null}
					<Stars f={f} maxY={560} />
					<Moon x={1560} y={150} r={34} />
					<Clouds f={f} y={180} count={4} seed={27} opacity={0.85} />
					{dawn > 0 ? <circle cx={1300} cy={J.ground + 30} r={120 + 60 * dawn} fill="#FFD98A" opacity={0.55 * dawn} filter="url(#glowBig)" /> : null}
					<g transform="translate(-900 0)">
						<Mountains y={J.ground} seed={31} layers={2} />
					</g>
					<Mountains y={J.ground} seed={17} layers={2} />
					<g transform="translate(1920 0)">
						<Mountains y={J.ground} seed={23} layers={2} />
					</g>
				</>
			)}
			{/* the lighthouse far off on its hill: Jev, as in chapters 2 and 3 */}
			{lighthouse > 0 ? (
				<g>
					<path d={`M -260 ${J.ground + 10} C -160 ${J.ground - 90} 10 ${J.ground - 120} 160 ${J.ground - 110} C 300 ${J.ground - 100} 400 ${J.ground - 30} 480 ${J.ground + 10} Z`} fill="#262C74" />
					<g transform={`translate(160 ${J.ground - 108}) scale(0.5)`}>
						<FlatLighthouse on={lighthouse} />
					</g>
				</g>
			) : null}
			{/* a second town's lights on the horizon */}
			{town > 0 ? (
				<g opacity={town}>
					{Array.from({length: 14}, (_, i) => {
						const x = townX + i * 46;
						const h = 30 + ((i * 37) % 50);
						return (
							<g key={i}>
								<rect x={x} y={J.ground - h} width={38} height={h} fill="#262C74" />
								{Array.from({length: Math.floor(h / 16)}, (_, r) => (
									<rect key={r} x={x + 8 + (r % 2) * 14} y={J.ground - h + 6 + r * 16} width={8} height={8} fill="#9FD8FF" opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.05 + i + r))} />
								))}
							</g>
						);
					})}
				</g>
			) : null}
			{bare ? null : (
				<>
					<rect x={-1400} y={J.ground} width={4800} height={1000} fill="#1E2466" />
					<rect x={-1400} y={J.ground} width={4800} height={22} fill="#2A3180" />
					<rect x={-1400} y={J.railY + 60} width={4800} height={900} fill="#181D56" />
				</>
			)}
			{hideBox ? null : <SignalBoxBuilding f={f} p={gaugeP} lamp={boxLamp} />}
			<Booth f={f} stampAt={stampAt} red={stampRed} />
			{/* tracks */}
			<Track d={SHORT_D} hot={route === 'short' ? switchK : 0} />
			<Track d={`M -1400 ${J.railY} L 3400 ${J.railY}`} hot={0} />
			<rect x={J.shortEnd + 10} y={J.shortY - 30} width={16} height={30} rx={3} fill="#8A5A3C" />
			{/* the points: two blades that swing to the route that is set */}
			<g transform={`translate(${J.pointsX} ${J.railY - 4})`}>
				<line x1={0} y1={0} x2={110} y2={route === 'short' ? lerp(0, -22, switchK) : lerp(-22, 0, switchK)} stroke={K.yellow} strokeWidth={6} strokeLinecap="round" />
				<rect x={-20} y={14} width={34} height={20} rx={4} fill="#3A2E4A" />
			</g>
			<Semaphore x={J.signalX} route={route} k={switchK} />
			{/* coin piles at the ends of the lines */}
			{coins ? (
				<g>
					{Array.from({length: Math.round(coins.short)}, (_, i) => (
						<ellipse key={i} cx={J.shortEnd - 40 + ((i * 29) % 80) - 40} cy={J.shortY + 36 - Math.floor(i / 8) * 3} rx={7} ry={3} fill={i % 2 ? A.brass : A.brassHi} />
					))}
					<CoinStack x={J.longStop - 40} y={J.railY + 60} n={coins.long} w={60} />
				</g>
			) : null}
			{/* the Claude train, waiting at the end of the long line */}
			<g transform={`translate(${trainX} ${J.railY})`}>
				<SteamPress livery="claude" f={f} s={J.trainS} expr={train.expr ?? withLook('curious', -0.8, -0.2)} speech={train.speech ?? []} dist={train.dist ?? 0} smokeT={f * 0.012} />
			</g>
			{gpt ? (
				<g transform={`translate(${gpt.x} ${J.railY + 70})`}>
					<rect x={-420} y={-4} width={700} height={8} fill="#C9CCE0" opacity={0.6} />
					<SteamPress livery="gpt" f={f + 13} s={0.5} expr={gpt.expr ?? withLook('curious', 1, -0.5, {lid: 0.2})} speech={[]} dist={gpt.dist ?? 0} smokeT={f * 0.012} />
				</g>
			) : null}
			{carts.map((c, i) => {
				const q = posOn(c.route, c.s);
				return (
					<g key={i} opacity={c.o ?? 1}>
						<Cart x={q.x} y={q.y} a={q.a} p={c.p} tint={c.tint} red={c.red} lit={c.lit} letter={c.letter} />
					</g>
				);
			})}
			{children}
			{bare ? null : <Motes f={f} color={K.yellow} count={14} seed={12} />}
		</g>
	);
};

// ---------- inside the signal box ----------
export const LEVER = {x0: 1000, gap: 100, pivotY: 940, len: 300};
const LEVER_COLORS = ['#1A1A22', K.yellow, '#1A1A22', '#3D5A96', G.cream, '#1A1A22', K.yellow, G.cream];
export const leverTop = (i: number, thrown: number) => {
	const a = ((lerp(-12, 20, thrown) * Math.PI) / 180);
	return {x: LEVER.x0 + i * LEVER.gap + Math.sin(a) * LEVER.len, y: LEVER.pivotY - Math.cos(a) * LEVER.len};
};
export const LAMP_IN = {x: 600, y: 470, s: 1.25};
export type InteriorProps = {
	f: number;
	outside: React.ReactNode; // the junction, seen through the windows
	thrown?: number[]; // per lever, 0..1
	read?: number; // 0..1 a sweep of light over the letter on the desk
	beamTo?: {x: number; y: number; k: number} | null;
	letter?: boolean;
	board?: React.ReactNode; // what the diagram board shows
	boardRoute?: Route;
};
export const Interior: React.FC<InteriorProps> = ({f, outside, thrown = [], read = 0, beamTo = null, letter = true, board, boardRoute = 'short'}) => {
	const lamp = {x: LAMP_IN.x, y: LAMP_IN.y + 30};
	return (
		<g>
			<FlatDefs />
			<defs>
				<clipPath id="sbWindows">
					{[
						[100, 620],
						[700, 1220],
						[1300, 1820],
					].map(([a, b]) => (
						<rect key={a} x={a} y={200} width={b - a} height={360} />
					))}
				</clipPath>
				<linearGradient id="gSbCone" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={G.lamp} stopOpacity="0.45" />
					<stop offset="1" stopColor={G.lamp} stopOpacity="0" />
				</linearGradient>
			</defs>
			{/* the upper walls, cream, and the windows onto the junction */}
			<rect x={-800} y={-600} width={3600} height={1300} fill={G.cream} />
			<g clipPath="url(#sbWindows)">
				<g transform="translate(-60 -120) scale(0.72)">{outside}</g>
				<rect x={-800} y={-600} width={3600} height={1300} fill="#0B1030" opacity={0.2} />
			</g>
			{[
				[100, 620],
				[700, 1220],
				[1300, 1820],
			].map(([a, b]) => (
				<g key={a}>
					<rect x={a} y={200} width={b - a} height={360} fill="none" stroke={G.creamLo} strokeWidth={16} />
					<line x1={(a + b) / 2} y1={200} x2={(a + b) / 2} y2={560} stroke={G.creamLo} strokeWidth={10} />
					<line x1={a} y1={380} x2={b} y2={380} stroke={G.creamLo} strokeWidth={8} />
				</g>
			))}
			{/* green wainscot and floor */}
			<rect x={-800} y={580} width={3600} height={900} fill={G.green} />
			{Array.from({length: 26}, (_, i) => (
				<rect key={i} x={-760 + i * 150} y={610} width={120} height={250} rx={6} fill={G.greenHi} opacity={0.35} />
			))}
			<rect x={-800} y={570} width={3600} height={14} fill={A.brass} opacity={0.8} />
			<rect x={-800} y={960} width={3600} height={500} fill={G.greenLo} />
			{/* Jev, the lamp head */}
			{read > 0 && read < 1 ? <path d={`M ${lamp.x - 30} ${lamp.y} L ${lerp(440, 760, read) - 80} 720 L ${lerp(440, 760, read) + 80} 720 L ${lamp.x + 30} ${lamp.y} Z`} fill="url(#gSbCone)" opacity={Math.sin(Math.PI * read)} /> : null}
			{beamTo && beamTo.k > 0 ? <path d={`M ${lamp.x - 20} ${lamp.y} L ${beamTo.x - 50} ${beamTo.y} L ${beamTo.x + 50} ${beamTo.y} L ${lamp.x + 20} ${lamp.y} Z`} fill="url(#gSbCone)" opacity={beamTo.k} /> : null}
			<LampHead x={LAMP_IN.x} y={LAMP_IN.y} s={LAMP_IN.s} f={f} />
			{/* the track diagram board, hung from the ceiling */}
			<rect x={560} y={-100} width={8} height={140} fill="#1B1840" />
			<rect x={1360} y={-100} width={8} height={140} fill="#1B1840" />
			<rect x={420} y={30} width={1500} height={250} rx={14} fill={A.brass} />
			<rect x={432} y={42} width={1476} height={226} rx={10} fill={G.board} />
			{/* the diagram along the bottom of the board: incoming, the points, the two lines */}
			<g transform="translate(0 0)" opacity={0.9}>
				<path d="M 470 240 L 900 240" stroke={G.cream} strokeWidth={5} />
				<path d="M 900 240 C 960 240 960 200 1020 200 L 1220 200" stroke={boardRoute === 'short' ? K.yellow : G.cream} strokeWidth={5} fill="none" />
				<path d="M 900 240 L 1300 240" stroke={boardRoute === 'long' ? K.yellow : G.cream} strokeWidth={5} />
				<circle cx={1230} cy={200} r={9} fill={boardRoute === 'short' ? K.yellow : '#39513F'} />
				<circle cx={1310} cy={240} r={9} fill={boardRoute === 'long' ? K.yellow : '#39513F'} />
				<text x={1250} y={190} fontFamily={FONT} fontWeight={900} fontSize={20} fill={G.cream}>short</text>
				<text x={1330} y={248} fontFamily={FONT} fontWeight={900} fontSize={20} fill={G.cream}>long</text>
			</g>
			{board}
			{/* the desk, and the letter on it */}
			<rect x={280} y={720} width={600} height={30} rx={8} fill="#8A5A3C" />
			<rect x={300} y={750} width={20} height={210} fill="#6B4430" />
			<rect x={840} y={750} width={20} height={210} fill="#6B4430" />
			{letter ? (
				<g transform="translate(600 690) rotate(-4) scale(0.8)">
					<rect x={-120} y={-40} width={240} height={80} rx={8} fill="#FBF3E4" opacity={1} />
					{read > 0 ? <rect x={-120} y={-40} width={240} height={80} rx={8} fill={G.lamp} opacity={0.35 * Math.sin(Math.PI * clamp01(read))} /> : null}
					<rect x={70} y={-30} width={36} height={42} fill={K.orange} />
					<circle cx={40} cy={-10} r={20} fill="none" stroke="#3A2340" strokeWidth={3} opacity={0.5} />
					<rect x={-90} y={0} width={110} height={8} rx={4} fill="#8C7CA8" />
					<rect x={-90} y={16} width={80} height={8} rx={4} fill="#8C7CA8" />
				</g>
			) : null}
			{/* the lever frame */}
			<rect x={LEVER.x0 - 70} y={LEVER.pivotY - 10} width={LEVER.gap * 8 + 60} height={50} rx={8} fill="#2A2F2A" />
			{LEVER_COLORS.map((col, i) => {
				const t = leverTop(i, thrown[i] ?? 0);
				const bx = LEVER.x0 + i * LEVER.gap;
				return (
					<g key={i}>
						<line x1={bx} y1={LEVER.pivotY} x2={t.x} y2={t.y} stroke={col} strokeWidth={18} strokeLinecap="round" />
						<line x1={bx + (t.x - bx) * 0.72} y1={LEVER.pivotY + (t.y - LEVER.pivotY) * 0.72} x2={t.x} y2={t.y} stroke={A.brassHi} strokeWidth={22} strokeLinecap="round" />
						<rect x={bx - 22} y={LEVER.pivotY - 70} width={44} height={30} rx={5} fill={A.brass} />
						<text x={bx} y={LEVER.pivotY - 47} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={A.ink}>
							{i + 1}
						</text>
					</g>
				);
			})}
			<Motes f={f} color={G.lamp} count={16} seed={21} />
		</g>
	);
};

// the lever that sets the points
export const POINTS_LEVER = 2;
export const leverThrow = (f: number, t: number, len = 12) => easeInOut(progress(f, t, t + len));
export const beamK = (f: number, a: number, b: number) => Math.sin(Math.PI * clamp01((f - a) / (b - a)));
export {easeOut};
