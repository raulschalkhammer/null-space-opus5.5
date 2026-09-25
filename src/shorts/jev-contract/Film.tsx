import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import {FONT, FlatDefs, K, LAMP_Y} from '../../flat/kit';
import {Projected} from '../../flat/type';
import {Equation} from '../../flat/math';
import {Harbor} from '../../flat/harbor';
import {Shots, type Shot} from '../../flat/shots';
import {LAID, TR, TrackWorld, laidAt} from '../../flat/bets';
import {SteamPress, type Speech} from '../../characters/steam';
import {Grain} from '../../styleframes/Shared';
import vo from '../../../fixtures/jev-contract-vo.json';
import fixture from '../../../fixtures/track-layer.json';
import type {VoLine} from '../paper-track/timeline';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {withLook} from '../flat-track/trainMood';
import {A, Env, Grid10, LampHead, LetterBig, Mailroom, MailroomDefs, Panel, RED, Reviewer, Say, Stage, T, cam, pop} from '../million-letters/parts';
import {CONTRACT, PICK_PAUSE, buildContract} from './timeline';

// Chapter 2 as shots (docs/chapter2-plan.md). Four worlds, one palette each:
//   night (K): the harbor, the pier, the signal mast, the lighthouse and the trains
//   amber (A): the mailroom with Jev's lamp head, the slot wall, the grain tubes, the reviewer
//   teal  (T): short concept stages, one idea on a glowing tile
//   red (RED): mistakes only
export const contract = buildContract((vo as {lines: VoLine[]}).lines);
const {S, cues} = contract;
const at = (id: string, u: number) => Math.round(cues[id].start + (cues[id].end - cues[id].start) * u);

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		{children}
	</svg>
);
const Cam: React.FC<{x: number; y: number; z: number; children: React.ReactNode}> = ({x, y, z, children}) => <g transform={cam(x, y, z)}>{children}</g>;

// ======================= the night harbor =======================
// The chatty train talks: its speech tape carries what it says, one word every few frames.
const CHATTER = 'Well , it depends . On one hand the offer looks great , but on the other hand there are many factors to weigh , so let me explain in detail'.split(' ');
const chatter = (f: number, t0: number, every = 7): Speech => CHATTER.slice(0, clamp01((f - t0) / (every * CHATTER.length)) * CHATTER.length + 1).map((w, i) => ({word: w, age: f - (t0 + i * every)}));

const PIER_Y = 742;
const PierWorld: React.FC<{f: number; lamp: number; trainX?: number; expr?: ReturnType<typeof withLook>; speech?: Speech; pile?: number; children?: React.ReactNode}> = ({f, lamp, trainX = 560, expr, speech, pile = 0, children}) => (
	<Harbor f={f} lamp={lamp}>
		{lamp > 0 ? (
			<g transform={`translate(1500 ${604 + LAMP_Y * 1.3}) rotate(${-28 + 4 * Math.sin(f * 0.02)})`} opacity={lamp} style={{mixBlendMode: 'screen'}}>
				<path d="M 0 -14 L 700 -200 L 700 160 L 0 14 Z" fill="url(#gBeam)" />
			</g>
		) : null}
		<rect x={-60} y={PIER_Y} width={1100} height={20} fill="#3A2E4A" />
		{Array.from({length: 16}, (_, i) => (
			<rect key={i} x={i * 68} y={PIER_Y + 20} width={10} height={80} fill="#2A2238" />
		))}
		{/* pages of words piling up on the pier */}
		{Array.from({length: Math.floor(pile)}, (_, i) => (
			<rect key={`p${i}`} x={760 + ((i * 13) % 9) - 4} y={PIER_Y - 8 - i * 7} width={150} height={6} rx={2} fill={i % 2 ? '#EDE8FA' : '#DCD5F2'} transform={`rotate(${((i * 7) % 5) - 2} 835 ${PIER_Y - i * 7})`} />
		))}
		<g transform={`translate(${trainX} ${PIER_Y})`}>
			<SteamPress livery="claude" f={f} s={0.9} expr={expr ?? withLook('happy', 0.8, -0.3, {bounce: 3})} speech={speech} dist={f * 0.6} />
		</g>
		{children}
	</Harbor>
);

// ---------- the signal mast: the contract, built before any letter arrives ----------
const MX = 1080; // mast
const BASE = 840; // pier top
const ARMS = [
	{y: 170, q: 'scam?', flags: ['yes', 'no'], x0: MX + 190, gap: 230},
	{y: 570, q: 'team?', flags: ['billing', 'fraud', 'lost card'], x0: MX + 170, gap: 210},
];
const HAL = {x: MX - 70, top: 180, bot: 740};
const FLAG_COLORS = [K.orange, '#5A63C8', '#8C5AAE'];
const PROBS = {a: [CONTRACT.scam.p, 1 - CONTRACT.scam.p], b: [0.1, 0.83, 0.07], u: CONTRACT.urgency};

type MastProps = {f: number; build: number[]; open?: number; lock?: number; ball?: number; glow?: number[]};
const Mast: React.FC<MastProps> = ({f, build, open = 0, lock = 0, ball, glow = []}) => {
	const armK = (i: number) => Math.min(1, build[i] ?? 1);
	const spark = (i: number) => {
		const k = build[i] ?? 0;
		return k > 1 && k < 1.2 ? Math.sin(((k - 1) / 0.2) * Math.PI) : 0;
	};
	return (
		<g>
			{/* the stone pier */}
			<rect x={640} y={BASE} width={1400} height={300} fill="#2A2458" />
			<rect x={640} y={BASE} width={1400} height={14} fill="#5A4E9A" />
			{Array.from({length: 9}, (_, i) => (
				<rect key={i} x={660 + i * 150} y={BASE + 30} width={130} height={60} rx={10} fill="#332C6A" />
			))}
			{[720, 1840].map((x) => (
				<g key={x}>
					<rect x={x - 5} y={BASE - 110} width={10} height={110} fill="#1B1840" />
					<circle cx={x} cy={BASE - 120} r={14} fill={K.yellow} />
					<circle cx={x} cy={BASE - 120} r={60} fill={K.yellow} opacity={0.18} filter="url(#glowBig)" />
				</g>
			))}
			{/* rigging and the mast */}
			<path d={`M ${MX} 120 L 700 ${BASE} M ${MX} 120 L 1800 ${BASE}`} stroke="#6A5A9A" strokeWidth={2} opacity={0.6} />
			<rect x={MX - 10} y={110} width={20} height={BASE - 110} rx={6} fill="#8A5A3C" />
			<rect x={MX - 10} y={110} width={6} height={BASE - 110} rx={3} fill="#B07A5A" />
			<circle cx={MX} cy={104} r={14} fill="#E8B06A" />
			{/* the halyard for urgency: a signal ball, 0 at the bottom, 1 at the top */}
			{(() => {
				const k = armK(2);
				if (k <= 0) return null;
				const len = (HAL.bot - HAL.top) * k;
				const u = ball ?? PROBS.u * open;
				const by = HAL.bot - (HAL.bot - HAL.top) * u;
				const lit = open > 0 || ball !== undefined;
				return (
					<g>
						<line x1={HAL.x} y1={HAL.top} x2={HAL.x} y2={HAL.top + len} stroke="#DCD2F0" strokeWidth={3} />
						<line x1={HAL.x} y1={HAL.top} x2={MX} y2={HAL.top - 20} stroke="#DCD2F0" strokeWidth={3} opacity={k} />
						{k >= 1 ? (
							<>
								{[0, 0.25, 0.5, 0.75, 1].map((t) => (
									<line key={t} x1={HAL.x - 12} x2={HAL.x} y1={HAL.bot - (HAL.bot - HAL.top) * t} y2={HAL.bot - (HAL.bot - HAL.top) * t} stroke="#DCD2F0" strokeWidth={3} />
								))}
								<text x={HAL.x - 22} y={HAL.top + 10} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.white}>1</text>
								<text x={HAL.x - 22} y={HAL.bot + 10} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.white}>0</text>
								<text x={0} y={0} transform={`translate(${HAL.x - 44} ${(HAL.top + HAL.bot) / 2}) rotate(-90)`} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.yellow}>urgent?</text>
								<circle cx={HAL.x} cy={by} r={34} fill={K.orange} opacity={lit ? 0.3 : 0} filter="url(#glowBig)" />
								<circle cx={HAL.x} cy={by} r={24} fill={lit ? K.orange : '#5A63C8'} />
								<circle cx={HAL.x - 7} cy={by - 7} r={7} fill="#FFE3C8" opacity={0.8} />
								{open > 0.5 ? (
									<text x={HAL.x - 40} y={by + 10} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.orangeHi}>
										{PROBS.u.toFixed(1)}
									</text>
								) : null}
							</>
						) : null}
					</g>
				);
			})()}
			{/* yardarms, lowered in by crane, with their rolled flags */}
			{ARMS.map((arm, i) => {
				const k = armK(i);
				if (k <= 0) return null;
				const dy = -(1 - easeOut(k, 3)) * 700;
				const xEnd = arm.x0 + arm.gap * (arm.flags.length - 1) + 110;
				const mid = (MX + xEnd) / 2;
				const ps = i === 0 ? PROBS.a : PROBS.b;
				const best = ps.indexOf(Math.max(...ps));
				return (
					<g key={i}>
						{k < 1 ? <line x1={mid} y1={-40} x2={mid} y2={arm.y + dy - 30} stroke="#DCD2F0" strokeWidth={3} /> : null}
						{k < 1 ? <path d={`M ${mid - 16} ${arm.y + dy - 30} L ${mid} ${arm.y + dy - 50} L ${mid + 16} ${arm.y + dy - 30}`} fill="none" stroke="#DCD2F0" strokeWidth={4} /> : null}
						<g transform={`translate(0 ${dy})`}>
							<rect x={MX - 24} y={arm.y - 10} width={xEnd - MX + 24} height={20} rx={8} fill="#8A5A3C" />
							<rect x={MX - 24} y={arm.y - 10} width={xEnd - MX + 24} height={6} rx={3} fill="#B07A5A" />
							<circle cx={xEnd} cy={arm.y} r={13} fill="#E8B06A" />
							<circle cx={MX} cy={arm.y} r={15} fill="#E8B06A" />
							<text x={MX + 40} y={arm.y - 30} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.yellow}>
								{arm.q}
							</text>
							{arm.flags.map((fl, j) => {
								const x = arm.x0 + j * arm.gap;
								const p = ps[j];
								const L = (60 + 200 * p) * easeOut(open, 3);
								const hot = j === best;
								const col = hot ? K.orange : FLAG_COLORS[(j % 2) + 1];
								const sway = 4 * Math.sin(f * 0.08 + j + i);
								const g = glow[i] ?? 0;
								return (
									<g key={fl}>
										<g opacity={1 - open}>
											<rect x={x - 10} y={arm.y + 8} width={20} height={70} rx={10} fill={col} />
											<rect x={x - 12} y={arm.y + 26} width={24} height={6} rx={3} fill="#F3EEE3" />
											<rect x={x - 12} y={arm.y + 54} width={24} height={6} rx={3} fill="#F3EEE3" />
										</g>
										{open > 0 ? (
											<g>
												{hot ? <path d={`M ${x - 40} ${arm.y + 8} L ${x + 40} ${arm.y + 8} L ${x + sway} ${arm.y + 8 + L} Z`} fill={K.orange} opacity={0.45 + 0.4 * g} filter="url(#glowBig)" /> : null}
												<path d={`M ${x - 40} ${arm.y + 8} L ${x + 40} ${arm.y + 8} L ${x + sway} ${arm.y + 8 + L} Z`} fill={col} />
												<path d={`M ${x - 40} ${arm.y + 8} L ${x} ${arm.y + 8} L ${x + sway * 0.5} ${arm.y + 8 + L * 0.9} Z`} fill="#FFFFFF" opacity={0.12} />
											</g>
										) : null}
										<text x={x} y={arm.y + (open > 0 ? 8 + L + 46 : 118)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={hot && open > 0 ? K.orangeHi : K.white}>
											{fl}
										</text>
										{open > 0.5 ? (
											<text x={x} y={arm.y + 8 + L + 82} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={hot ? K.orangeHi : K.mute}>
												{Math.round(p * 100)}%
											</text>
										) : null}
									</g>
								);
							})}
						</g>
						{spark(i) > 0
							? Array.from({length: 10}, (_, s) => {
									const a = (s / 10) * Math.PI * 2;
									const r = 20 + 60 * (1 - spark(i));
									return <circle key={s} cx={MX + Math.cos(a) * r} cy={arm.y + Math.sin(a) * r} r={5} fill={K.yellow} opacity={spark(i)} />;
								})
							: null}
					</g>
				);
			})}
			{/* the lock: nothing can be added once the letter arrives */}
			{lock > 0 ? (
				<g transform={`translate(${MX} ${BASE - 70}) scale(${lock})`}>
					<circle r={70} fill={K.yellow} opacity={0.15} filter="url(#glowBig)" />
					<path d="M -24 -10 L -24 -40 A 24 24 0 0 1 24 -40 L 24 -10" fill="none" stroke="#C9CCE0" strokeWidth={10} />
					<rect x={-38} y={-14} width={76} height={62} rx={12} fill="#E8B06A" />
					<rect x={-38} y={-14} width={76} height={14} rx={7} fill="#F6CE8A" />
					<circle cx={0} cy={14} r={8} fill="#5A3E3A" />
					<rect x={-3} y={16} width={6} height={16} rx={3} fill="#5A3E3A" />
					<g transform="translate(-230 96) rotate(-6)" opacity={Math.min(1, lock)}>
						<rect x={0} y={-34} width={160} height={52} rx={12} fill="none" stroke="#FFD9A8" strokeWidth={5} />
						<text x={80} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} letterSpacing={5} fill="#FFD9A8">
							FIXED
						</text>
					</g>
				</g>
			) : null}
		</g>
	);
};

const Gulls: React.FC<{f: number}> = ({f}) => (
	<g>
		{[0, 1, 2].map((i) => {
			const x = ((f * (1.4 + i * 0.3) + i * 500) % 2300) - 200;
			const y = 180 + i * 60 + 12 * Math.sin(f * 0.05 + i);
			const w = 10 * Math.sin(f * 0.3 + i * 2);
			return <path key={i} d={`M ${x - 22} ${y + w} Q ${x - 10} ${y - 8} ${x} ${y} Q ${x + 10} ${y - 8} ${x + 22} ${y + w}`} fill="none" stroke="#DCD2F0" strokeWidth={3} strokeLinecap="round" opacity={0.7} />;
		})}
	</g>
);

// A small boat carrying a letter, waiting offshore until the contract is done.
const LetterBoat: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => (
	<g transform={`translate(${x} ${y + 6 * Math.sin(f * 0.08)}) rotate(${3 * Math.sin(f * 0.06)})`}>
		<path d="M -70 0 L 70 0 L 50 30 L -50 30 Z" fill="#8A5A3C" />
		<rect x={-3} y={-110} width={6} height={110} fill="#5A3E3A" />
		<g transform="translate(34 -62) scale(0.55)">
			<rect x={-66} y={-44} width={132} height={88} rx={10} fill="#FBF8FF" />
			<path d="M -66 -40 L 0 6 L 66 -40" fill="none" stroke="#B9B4E6" strokeWidth={4} strokeLinejoin="round" />
			<circle cx={44} cy={-22} r={9} fill={K.rose} />
		</g>
	</g>
);

const MastWorld: React.FC<MastProps & {lamp?: number; boat?: boolean; children?: React.ReactNode}> = ({lamp = 0.5, boat, children, ...m}) => (
	<Harbor f={m.f} lamp={lamp} lx={330} moon={[1780, 330]}>
		<Gulls f={m.f} />
		{boat ? <LetterBoat f={m.f} x={560} y={740} /> : null}
		<Mast {...m} />
		{children}
	</Harbor>
);

// A split panel of any world, framed on (x, y) at zoom z, centred in the panel.
const PanelCam: React.FC<{id: string; x0: number; w: number; cx: number; cy: number; z: number; children: React.ReactNode}> = ({id, x0, w, cx, cy, z, children}) => (
	<Panel id={id} x={x0} w={w}>
		<Cam x={cx} y={cy} z={z}>
			{children}
		</Cam>
	</Panel>
);

// ======================= the amber mailroom =======================
const SLOTS = ['billing', 'fraud', 'lost card'];
const slotX = (i: number) => 960 + (i - 1) * 270;
const CAB = {x0: 560, x1: 1360, top: 520, bot: 850, mouth: 600, plate: 690};
const RAIL = 930;
const SlotWall: React.FC<{f: number; hot?: number; hotK?: number; glowAll?: number}> = ({f, hot = -1, hotK = 0, glowAll = 0}) => (
	<g>
		<rect x={CAB.x0 + 20} y={CAB.bot} width={20} height={RAIL - CAB.bot - 20} fill={A.woodLo} />
		<rect x={CAB.x1 - 40} y={CAB.bot} width={20} height={RAIL - CAB.bot - 20} fill={A.woodLo} />
		<rect x={CAB.x0 - 10} y={CAB.top - 10} width={CAB.x1 - CAB.x0 + 20} height={CAB.bot - CAB.top + 20} rx={20} fill={A.brass} />
		<rect x={CAB.x0} y={CAB.top} width={CAB.x1 - CAB.x0} height={CAB.bot - CAB.top} rx={16} fill="#5A3E3A" />
		<rect x={CAB.x0} y={CAB.top} width={CAB.x1 - CAB.x0} height={24} rx={12} fill="#7A564E" />
		{[CAB.x0 + 20, CAB.x1 - 20].map((x) => [CAB.top + 40, CAB.bot - 30].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill={A.brass} />))}
		<rect x={860} y={CAB.top - 34} width={200} height={44} rx={10} fill={A.brass} />
		<text x={960} y={CAB.top - 3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} letterSpacing={4} fill={A.ink}>ANSWERS</text>
		{SLOTS.map((s, i) => {
			const g = Math.max(i === hot ? hotK : 0, glowAll * (0.6 + 0.4 * Math.sin(f * 0.3 + i * 2)));
			return (
				<g key={s}>
					<rect x={slotX(i) - 110} y={CAB.mouth} width={220} height={40} rx={10} fill="#1A1020" />
					{g > 0 ? <rect x={slotX(i) - 120} y={CAB.mouth - 10} width={240} height={60} rx={14} fill={A.lamp} opacity={0.55 * g} filter="url(#glowBig)" /> : null}
					<rect x={slotX(i) - 95} y={CAB.plate} width={190} height={54} rx={10} fill={g > 0.5 ? A.brassHi : A.brass} />
					<text x={slotX(i)} y={CAB.plate + 38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={A.ink}>
						{s}
					</text>
				</g>
			);
		})}
	</g>
);

// The chute the letters arrive through, top right.
const Chute: React.FC = () => (
	<g>
		<rect x={1600} y={-40} width={90} height={330} fill={A.brassLo} />
		<rect x={1612} y={-40} width={14} height={330} fill={A.brassHi} opacity={0.5} />
		<path d="M 1580 290 L 1710 290 L 1730 360 L 1560 360 Z" fill={A.brass} />
		<rect x={1566} y={350} width={160} height={16} rx={6} fill="#1A1020" />
	</g>
);

const LAMP = {x: 960, y: 250, s: 1.2};
const Room: React.FC<{f: number; lampX?: number; cone?: number; coneX?: number; children?: React.ReactNode; wall?: boolean; hot?: number; hotK?: number; glowAll?: number; chute?: boolean}> = ({f, lampX = LAMP.x, cone = 0, coneX = 960, children, wall = true, hot, hotK, glowAll, chute = true}) => (
	<g>
		<FlatDefs />
		<RoomPad />
		<Mailroom f={f} lamps={[]}>
			{chute ? <Chute /> : null}
			{wall ? <SlotWall f={f} hot={hot} hotK={hotK} glowAll={glowAll} /> : null}
			<rect x={-900} y={RAIL} width={3800} height={6} fill={A.brassLo} />
			{Array.from({length: 36}, (_, i) => (
				<rect key={i} x={-620 + i * 96} y={RAIL + 6} width={60} height={10} rx={3} fill="#3A2028" />
			))}
			{cone > 0 ? <path d={`M ${lampX - 30} ${LAMP.y + 20} L ${coneX - 150} 620 L ${coneX + 150} 620 L ${lampX + 30} ${LAMP.y + 20} Z`} fill="url(#gCone)" opacity={cone} /> : null}
			<LampHead x={lampX} y={LAMP.y} s={LAMP.s} f={f} />
			{children}
		</Mailroom>
	</g>
);

// wall and floor past the room's edges, so close-ups near the sides never show the void
const RoomPad: React.FC = () => (
	<>
		<rect x={-900} y={-500} width={3800} height={2000} fill={A.wallBot} />
		<rect x={-900} y={860} width={3800} height={900} fill={A.floor} />
	</>
);

// the tubes: a hundred grains of certainty, poured by the lamp
const TUBE = {top: 360, bot: 820, w: 150, r: 11};
const tubeX = (i: number) => 960 + (i - 1) * 270;
const tubeState = (f: number) => {
	const {hard} = CONTRACT;
	const fill = (s: number, e: number) => easeInOut(progress(f, at('C09', s), at('C09', e)));
	const drain = (s: number, e: number) => 1 - easeIn(progress(f, at('C09', s), at('C09', e)), 1.5);
	const Aa = fill(0.22, 0.32) * drain(0.37, 0.41);
	const B = fill(0.42, 0.52) * drain(0.57, 0.61);
	const C = fill(0.64, 0.8);
	const target = [
		[0, 100, 0],
		[33, 33, 34],
		[hard.billing * 100, hard.fraud * 100, hard.lost * 100],
	];
	const counts = [0, 1, 2].map((i) => Math.round(target[0][i] * Aa + target[1][i] * B + target[2][i] * C));
	const pouring = [progress(f, at('C09', 0.22), at('C09', 0.32)), progress(f, at('C09', 0.42), at('C09', 0.52)), progress(f, at('C09', 0.64), at('C09', 0.8))].map((k) => k > 0 && k < 1);
	const pourSet = pouring[0] ? target[0] : pouring[1] ? target[1] : pouring[2] ? target[2] : null;
	return {Aa, B, C, counts, pourSet};
};
const lineY = TUBE.bot - (TUBE.bot - TUBE.top) * CONTRACT.line;
const TubesRoom: React.FC<{f: number; lineK?: number; labels?: boolean; children?: React.ReactNode}> = ({f, lineK = 0, labels = true, children}) => {
	const {counts, pourSet} = tubeState(f);
	return (
		<g>
			<FlatDefs />
			<RoomPad />
			<Mailroom f={f} lamps={[]}>
				<rect x={tubeX(0) - 150} y={TUBE.bot + 4} width={tubeX(2) - tubeX(0) + 300} height={40} rx={10} fill={A.brass} />
				<rect x={tubeX(0) - 150} y={TUBE.bot + 4} width={tubeX(2) - tubeX(0) + 300} height={10} rx={5} fill={A.brassHi} />
				<LampHead x={960} y={200} s={1.2} f={f} />
				{pourSet
					? pourSet.map((n, i) =>
							n > 0
								? Array.from({length: 7}, (_, j) => {
										const u = (f * 0.07 + j / 7) % 1;
										return <circle key={`${i}-${j}`} cx={lerp(960, tubeX(i), u) + 6 * Math.sin(j + f * 0.2)} cy={lerp(240, TUBE.top + 10, u)} r={6} fill={K.yellow} opacity={0.9} />;
									})
								: null,
						)
					: null}
				{SLOTS.map((t, i) => {
					const x = tubeX(i);
					const n = counts[i];
					const pitch = (TUBE.bot - TUBE.top - 8) / 20;
					return (
						<g key={t}>
							<rect x={x - TUBE.w / 2} y={TUBE.top} width={TUBE.w} height={TUBE.bot - TUBE.top} rx={22} fill="#FFFFFF" opacity={0.07} />
							{Array.from({length: n}, (_, g) => (
								<circle key={g} cx={x - 4 * TUBE.r + (g % 5) * 2 * TUBE.r} cy={TUBE.bot - 4 - pitch / 2 - Math.floor(g / 5) * pitch} r={TUBE.r} fill={i === 1 ? K.orange : A.lamp} />
							))}
							<rect x={x - TUBE.w / 2} y={TUBE.top} width={TUBE.w} height={TUBE.bot - TUBE.top} rx={22} fill="none" stroke={A.brassHi} strokeWidth={4} opacity={0.9} />
							<rect x={x - TUBE.w / 2 + 12} y={TUBE.top + 18} width={7} height={TUBE.bot - TUBE.top - 50} rx={3.5} fill="#FFFFFF" opacity={0.25} />
							<rect x={x - TUBE.w / 2 - 10} y={TUBE.top - 12} width={TUBE.w + 20} height={16} rx={6} fill={A.brass} />
							{labels ? (
								<>
									<text x={x} y={TUBE.bot + 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={A.paper}>
										{t}
									</text>
									<text x={x} y={TUBE.top - 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={i === 1 ? K.orangeHi : A.paper} opacity={f >= at('C09', 0.2) ? 1 : 0}>
										{n}
									</text>
								</>
							) : null}
						</g>
					);
				})}
				{lineK > 0 ? (
					<g opacity={lineK}>
						<line x1={tubeX(0) - TUBE.w / 2 - 40} x2={lerp(tubeX(0) - TUBE.w / 2 - 40, tubeX(2) + TUBE.w / 2 + 40, lineK)} y1={lineY} y2={lineY} stroke={A.lamp} strokeWidth={6} strokeDasharray="18 12" />
						<text x={tubeX(2) + TUBE.w / 2 + 56} y={lineY + 14} fontFamily={FONT} fontWeight={900} fontSize={42} fill={A.lamp}>60</text>
					</g>
				) : null}
				{children}
			</Mailroom>
		</g>
	);
};

// The letter Jev reads, shown in full: the email text is the input.
const EMAIL = (fixture as {email: string}).email;
const HARD_WORDS = CONTRACT.hard.text.split(' ');
const Sheet: React.FC<{words: string[]; trace: number; band?: number; to: string; tilt?: number}> = ({words, trace, band, to, tilt = -2}) => (
	<>
		<Svg>
			<MailroomDefs />
			<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
			<circle cx={1500} cy={160} r={640} fill="url(#gAmberLamp)" />
			<rect x={-60} y={600} width={2040} height={600} fill="url(#gDesk)" />
			<rect x={420} y={230} width={1080} height={600} rx={10} fill="#FFFDF6" transform={`rotate(${tilt} 960 530)`} />
		</Svg>
		<div style={{position: 'absolute', left: 500, top: 300, width: 920, transform: `rotate(${tilt}deg)`, fontFamily: FONT, color: K.navy}}>
			<div style={{fontWeight: 800, fontSize: 26, color: '#7A7AA8', letterSpacing: 1}}>{to}</div>
			<div style={{fontWeight: 900, fontSize: 54, lineHeight: 1.35, marginTop: 18}}>
				{words.map((w, i) => {
					const k = clamp01(trace * (words.length + 1) - i);
					return (
						<span key={i} style={{position: 'relative', display: 'inline-block', marginRight: 14}}>
							<span style={{position: 'absolute', left: -6, right: -6, top: '8%', bottom: '4%', borderRadius: 8, background: A.lamp, opacity: 0.55 * k, transform: `scaleX(${k})`, transformOrigin: 'left'}} />
							<span style={{position: 'relative'}}>{w}</span>
						</span>
					);
				})}
			</div>
		</div>
		{band !== undefined && band > 0 && band < 1 ? (
			<div style={{position: 'absolute', top: 180, height: 720, left: lerp(360, 1560, band) - 90, width: 180, background: `linear-gradient(90deg, rgba(255,196,107,0), rgba(255,220,150,0.75), rgba(255,196,107,0))`, mixBlendMode: 'screen', transform: `rotate(-2deg)`}} />
		) : null}
	</>
);

// ======================= the teal concept stage =======================
const Bubble: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -260 -140 Q -260 -170 -230 -170 L 230 -170 Q 260 -170 260 -140 L 260 80 Q 260 110 230 110 L -60 110 L -130 170 L -110 110 L -230 110 Q -260 110 -260 80 Z" fill={T.tileTop} stroke={T.glow} strokeWidth={4} />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-210} y={-130 + i * 46} width={i === 4 ? 220 : 420} height={16} rx={8} fill={T.text} opacity={0.6} />
		))}
	</g>
);

// ======================= shots =======================
const OpenScene: React.FC<{f: number}> = ({f}) => {
	const t0 = S.open.start;
	const shots: Shot[] = [
		// 2. the harbor: the chatty train on the pier, words streaming out of it
		{
			at: t0,
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<PierWorld f={x} lamp={0} speech={chatter(x, t0 - 20, 6)} />
					</Svg>
					<Say x={330} y={130} k={pop(x, at('C01', 0.12))} text="write" size={110} color={K.orangeHi} strike={progress(x, at('C01', 0.25), at('C01', 0.35))} />
				</>
			),
		},
		// 3. close-up: the speech tape pours out of the cab
		{
			at: at('C01', 0.36),
			move: 'left',
			render: (x) => (
				<>
					<Svg>
						<Cam x={440} y={500} z={2.1}>
							<PierWorld f={x} lamp={0} speech={chatter(x, t0 - 20, 6)} expr={withLook('happy', 0.8, -0.3, {bounce: 3, open: 0.4})} />
						</Cam>
					</Svg>
					<Say x={960} y={150} k={pop(x, at('C01', 0.42))} text="sentences" size={96} color={A.paper} strike={progress(x, at('C01', 0.5), at('C01', 0.58))} />
				</>
			),
		},
		// 4. concept: a bubble full of words collapses into one number
		{
			at: at('C01', 0.6),
			render: (x) => {
				const t = at('C01', 0.6);
				const shrink = easeIn(progress(x, t + 16, t + 30), 2);
				const num = pop(x, t + 28, 12);
				return (
					<Svg>
						<Stage f={x} y={880} w={560}>
							{shrink < 1 ? <Bubble x={960} y={520} s={1 - shrink} /> : null}
							{num > 0 ? (
								<g transform={`translate(960 560) scale(${num})`}>
									<circle r={170} fill={T.glow} opacity={0.12} filter="url(#glowBig)" />
									<text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill={T.text}>
										0.91
									</text>
								</g>
							) : null}
						</Stage>
					</Svg>
				);
			},
		},
		// 5. close-up: the lighthouse lamp ignites and projects the number
		{
			at: at('C01', 0.73),
			move: 'out',
			render: (x) => {
				const lampOn = easeOut(progress(x, at('C01', 0.75), at('C01', 0.82)), 2);
				return (
					<>
						<Svg>
							<Cam x={1360} y={380} z={1.9}>
								<PierWorld f={x} lamp={lampOn}>
									<Projected x={1260} y={250} text="0.91" size={100} k={easeOut(progress(x, at('C01', 0.78), at('C01', 0.88)), 2)} sub="SCAM" />
								</PierWorld>
							</Cam>
						</Svg>
						<Say x={420} y={420} k={pop(x, at('C01', 0.9))} text="?" size={160} color={K.white} />
					</>
				);
			},
		},
		// 6. wide: the chatter piles up into pages on the pier
		{
			at: cues.C02.start,
			move: 'right',
			render: (x) => (
				<>
					<Svg>
						<PierWorld f={x} lamp={1} speech={chatter(x, cues.C02.start - 60, 4)} pile={progress(x, cues.C02.start, at('C02', 0.32)) * 40} expr={withLook('proud', -0.6, 0.3)} />
					</Svg>
					<Say x={330} y={180} k={pop(x, at('C02', 0.12))} text="more" size={110} color={K.orangeHi} />
				</>
			),
		},
		// 7. split panel: a paragraph against a single number
		{
			at: at('C02', 0.3),
			move: 'none',
			render: (x) => {
				const t = at('C02', 0.3);
				const k = easeOut(progress(x, t, t + 12), 3);
				const unroll = progress(x, t, at('C02', 0.65));
				return (
					<>
						<Svg>
							<rect x={-60} y={-60} width={2040} height={1200} fill="#07081A" />
							<Panel id="c2para" x={lerp(-960, 0, k)} w={960}>
								<Harbor f={x} lamp={0} lx={2400}>
									<g transform={`translate(960 ${160 - 40 * unroll})`}>
										<rect x={-260} y={0} width={520} height={200 + 660 * unroll} rx={8} fill="#FBF8FF" />
										{Array.from({length: Math.floor(4 + 26 * unroll)}, (_, i) => (
											<rect key={i} x={-220} y={30 + i * 26} width={i % 6 === 5 ? 220 : 400 - ((i * 37) % 60)} height={10} rx={5} fill="#B9B4E6" />
										))}
										<rect x={-280} y={180 + 660 * unroll} width={560} height={50} rx={25} fill="#DCD5F2" />
									</g>
								</Harbor>
							</Panel>
							<Panel id="c2num" x={lerp(1920, 960, k)} w={960}>
								<Harbor f={x} lamp={1} lx={2400}>
									<g transform="translate(960 470) rotate(-3)">
										<rect x={-190} y={-120} width={380} height={240} rx={16} fill="#FBF8FF" />
										<text y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={K.navy}>
											0.91
										</text>
									</g>
								</Harbor>
							</Panel>
						</Svg>
						<Say x={960} y={880} k={pop(x, at('C02', 0.42))} text="smarter?" size={88} color={K.orangeHi} />
					</>
				);
			},
		},
		// 8. match cut: the words become sleepers under the train, one bet each
		{
			at: at('C02', 0.65),
			move: 'out',
			render: (x) => {
				const t = at('C02', 0.65);
				const n = laidAt(x, t - 30, 5);
				return (
					<>
						<Svg>
							<Cam x={960} y={760} z={1.3}>
								<TrackWorld f={x} n={n} t0={t - 30} every={5} />
							</Cam>
						</Svg>
						<Say x={200} y={120} k={pop(x, t + 6)} text={`${n} bets`} size={72} color={K.yellow} anchor="start" />
					</>
				);
			},
		},
		// 9. close-up: a die tumbles over the newest sleeper
		{
			at: at('C02', 0.86),
			move: 'in',
			render: (x) => {
				const t = at('C02', 0.65);
				const n = laidAt(x, t - 30, 5);
				const fx = TR.x0 + (n - 1) * TR.gap;
				return (
					<>
						<Svg>
							<Cam x={fx + 120} y={TR.y - 130} z={2.3}>
								<TrackWorld f={x} n={n} t0={t - 30} every={5} />
							</Cam>
						</Svg>
						<Say x={420} y={140} k={1} text={`${n} bets`} size={80} color={K.yellow} />
					</>
				);
			},
		},
	];
	return <Shots f={f} end={S.open.end} shots={shots} />;
};

const ContractScene: React.FC<{f: number}> = ({f}) => {
	const t = [at('C03', 0.3), at('C03', 0.47), at('C03', 0.7)];
	const build = (x: number) => t.map((s) => progress(x, s, s + 36) * 1.2);
	const lock = (x: number) => pop(x, at('C03', 0.9), 14);
	const shots: Shot[] = [
		// 10. concept: a blank contract, sealed
		{
			at: S.contract.start,
			move: 'in',
			render: (x) => {
				const seal = pop(x, at('C03', 0.07), 8);
				return (
					<>
						<Svg>
							<Stage f={x} y={880} w={560}>
								<g transform="translate(960 560) rotate(-3)">
									<rect x={-200} y={-260} width={400} height={520} rx={10} fill="#F3EEE3" />
									{[0, 1, 2, 3, 4, 5].map((i) => (
										<rect key={i} x={-150} y={-200 + i * 50} width={i === 5 ? 150 : 300} height={14} rx={7} fill="#C9B8A0" />
									))}
									<g transform={`translate(100 170) scale(${seal ? 1.6 - 0.6 * Math.min(1, seal) : 0})`}>
										<circle r={56} fill={K.orange} />
										<circle r={40} fill="none" stroke={K.orangeHi} strokeWidth={6} />
										<path d="M -16 -8 L 0 -26 L 16 -8 L 8 -8 L 8 18 L -8 18 L -8 -8 Z" fill={K.orangeHi} />
									</g>
								</g>
							</Stage>
						</Svg>
						<Say x={960} y={70} k={pop(x, S.contract.start + 14)} text="contract" size={88} color={T.text} />
					</>
				);
			},
		},
		// 11. dusk harbor: a bare mast, and a letter waiting offshore
		{at: at('C03', 0.15), move: 'right', render: (x) => <Svg><MastWorld f={x} build={[0, 0, 0]} boat /></Svg>},
		// 12. low angle: the crane lowers the first yardarm
		{
			at: at('C03', 0.28),
			move: 'up',
			render: (x) => (
				<Svg>
					<Cam x={1330} y={330} z={1.35}>
						<MastWorld f={x} build={build(x)} />
					</Cam>
				</Svg>
			),
		},
		// 13. close-up: it seats with a clank
		{
			at: t[0] + 26,
			move: 'in',
			render: (x) => (
				<Svg>
					<Cam x={MX + 180} y={ARMS[0].y + 40} z={2.5}>
						<MastWorld f={x} build={build(x)} />
					</Cam>
				</Svg>
			),
		},
		// 14. the team yardarm swings in
		{
			at: t[1],
			move: 'down',
			render: (x) => (
				<Svg>
					<Cam x={1330} y={520} z={1.4}>
						<MastWorld f={x} build={build(x)} />
					</Cam>
				</Svg>
			),
		},
		// 14b. close-up along its rolled flags
		{
			at: t[1] + 44,
			move: 'left',
			render: (x) => (
				<Svg>
					<Cam x={1460} y={ARMS[1].y + 60} z={2.3}>
						<MastWorld f={x} build={build(x)} />
					</Cam>
				</Svg>
			),
		},
		// 15. close-up: the urgency halyard, its ball running from 0 to 1 and back
		{
			at: t[2],
			move: 'up',
			render: (x) => {
				const u = Math.sin(Math.PI * progress(x, t[2] + 30, at('C03', 0.83)));
				return (
					<Svg>
						<Cam x={HAL.x + 60} y={470} z={1.7}>
							<MastWorld f={x} build={build(x)} ball={u} />
						</Cam>
					</Svg>
				);
			},
		},
		// 16. pull back to the whole mast
		{at: at('C03', 0.83), move: 'out', render: (x) => <Svg><MastWorld f={x} build={build(x)} lock={lock(x)} /></Svg>},
		// 17. close-up: the padlock. FIXED
		{
			at: at('C03', 0.9) - 4,
			move: 'in',
			render: (x) => (
				<Svg>
					<Cam x={MX - 30} y={BASE - 20} z={2.6}>
						<MastWorld f={x} build={build(x)} lock={lock(x)} />
					</Cam>
				</Svg>
			),
		},
	];
	return <Shots f={f} end={S.contract.end} shots={shots} />;
};

const MailScene: React.FC<{f: number}> = ({f}) => {
	const drop = contract.mailDrop;
	const c5 = cues.C05;
	const chuteAt = at('C04', 0.42);
	const reject = (x: number) => progress(x, at('C05', 0.5), at('C05', 0.62));
	const build = (x: number) => progress(x, at('C05', 0.28), at('C05', 0.45));
	const mood = (x: number) => (x < at('C05', 0.3) ? withLook('happy', 1, -0.3) : x < at('C05', 0.5) ? withLook('determined', -0.8, -0.6) : x < at('C05', 0.62) ? withLook('panic', -1, -0.6) : withLook('sad', -0.6, -0.2));
	const trainX = (x: number) => (x < at('C05', 0.75) ? lerp(-300, 1800, easeOut(progress(x, c5.start, c5.start + 40), 2)) : lerp(1800, 1500, easeInOut(progress(x, at('C05', 0.8), S.mail.end))));
	const Train: React.FC<{x: number}> = ({x}) => (
		<g transform={`translate(${trainX(x)} ${RAIL})`}>
			<SteamPress livery="claude" f={x} s={0.72} expr={mood(x)} speech={x >= at('C05', 0.3) ? [{word: 'Miscellaneous-ish', age: x - at('C05', 0.3)}] : []} dist={trainX(x) * 0.4} smokeT={x * 0.012} />
		</g>
	);
	// the board the train builds: grows, tries the wall, falls
	const Board: React.FC<{x: number}> = ({x}) => {
		const b = build(x);
		if (b <= 0) return null;
		const r = reject(x);
		const push = easeInOut(progress(x, at('C05', 0.42), at('C05', 0.5)));
		const bx = lerp(1560, 1470, push) + (r > 0 ? 0 : 6 * Math.sin(x * 0.9) * push);
		const by = CAB.mouth + 20 + (RAIL - 40 - CAB.mouth) * easeIn(r, 2);
		return (
			<g transform={`translate(${bx} ${by}) rotate(${40 * r})`}>
				<rect x={-150} y={-30} width={300 * b} height={60} rx={8} fill={A.woodHi} />
				<text x={-130} y={10} fontFamily={FONT} fontWeight={900} fontSize={26} fill={A.ink} opacity={b > 0.9 ? 1 : 0}>
					MISCELLANEOUS-ISH
				</text>
			</g>
		);
	};
	const letterAt = (x: number) => {
		const k = easeInOut(progress(x, chuteAt, chuteAt + 22));
		return {x: lerp(1646, 960, k), y: lerp(330, 430, k) - 50 * Math.sin(Math.PI * k), r: lerp(-20, -4, k)};
	};
	const shots: Shot[] = [
		// 18. the amber mailroom: the brass wall of slots, Jev's lamp head above
		{at: S.mail.start, move: 'in', render: (x) => <Svg><Room f={x} /></Svg>},
		// 18b. along the slots
		{
			at: at('C04', 0.2),
			move: 'left',
			render: (x) => (
				<Svg>
					<Cam x={960} y={680} z={1.9}>
						<Room f={x} glowAll={0.4} />
					</Cam>
				</Svg>
			),
		},
		// 19. the cruise letter slides out of the chute
		{
			at: chuteAt - 6,
			move: 'right',
			render: (x) => {
				const l = letterAt(x);
				return (
					<Svg>
						<Cam x={1300} y={380} z={1.6}>
							<Room f={x}>
								<LetterBig x={l.x} y={l.y} s={0.42} r={l.r} />
							</Room>
						</Cam>
					</Svg>
				);
			},
		},
		// 20. under the lamp the letter opens: one sweep of light reads the whole email
		{
			at: at('C04', 0.58),
			move: 'in',
			render: (x) => <Sheet words={EMAIL.split(' ')} trace={0} band={progress(x, at('C04', 0.62), at('C04', 0.62) + 26)} to="from: prizes@cruise-winner.biz" />,
		},
		// 21. it drops into "fraud"; two more letters are sorted fast
		{
			at: drop - 12,
			move: 'out',
			render: (x) => {
				const fall = easeIn(progress(x, drop - 10, drop), 2);
				const extra = [
					{t: drop + 20, slot: 0},
					{t: drop + 34, slot: 2},
				];
				return (
					<Svg>
						<Cam x={960} y={600} z={1.45}>
							<Room f={x} hot={1} hotK={1 - progress(x, drop, drop + 30)} cone={0.8} coneX={slotX(1)}>
								{x < drop + 2 ? <LetterBig x={lerp(960, slotX(1), fall)} y={lerp(430, CAB.mouth + 10, fall)} s={0.4 * (1 - 0.3 * fall)} /> : null}
								{extra.map((e, i) => {
									const k = progress(x, e.t - 12, e.t);
									return k > 0 && k < 1 ? <Env key={i} x={lerp(960, slotX(e.slot), k)} y={lerp(380, CAB.mouth + 10, easeIn(k, 2))} s={1.1} /> : null;
								})}
							</Room>
						</Cam>
					</Svg>
				);
			},
		},
		// 22. low along the floor rail: the train rolls in, happy to help
		{
			at: c5.start,
			move: 'right',
			render: (x) => (
				<Svg>
					<Cam x={1250} y={760} z={1.35}>
						<Room f={x}>
							<Train x={x} />
						</Room>
					</Cam>
				</Svg>
			),
		},
		// 23. close-up: determined, it builds a new slot
		{
			at: at('C05', 0.24),
			move: 'in',
			render: (x) => (
				<Svg>
					<Cam x={1620} y={680} z={1.9}>
						<Room f={x}>
							<Board x={x} />
							<Train x={x} />
						</Room>
					</Cam>
				</Svg>
			),
		},
		// 24. wide: no room on the wall. The board falls
		{
			at: at('C05', 0.44),
			move: 'out',
			render: (x) => (
				<Svg>
					<Room f={x}>
						<Board x={x} />
						<Train x={x} />
					</Room>
				</Svg>
			),
		},
		// 25. split: the wrong slot is possible, a new slot is not
		{
			at: at('C05', 0.62),
			move: 'none',
			render: (x) => {
				const k = easeOut(progress(x, at('C05', 0.62), at('C05', 0.62) + 10), 3);
				const wrong = easeIn(progress(x, at('C05', 0.64), at('C05', 0.7)), 2);
				return (
					<>
						<Svg>
							<rect x={-60} y={-60} width={2040} height={1200} fill="#07081A" />
							<PanelCam id="c2wrong" x0={lerp(-960, 0, k)} w={960} cx={slotX(0)} cy={620} z={1.7}>
								<Room f={x} hot={0} hotK={wrong > 0.9 ? 0.6 : 0}>
									{wrong < 1 ? <Env x={slotX(0)} y={lerp(300, CAB.mouth + 10, wrong)} s={1.4} red /> : null}
									{wrong >= 1 ? <path d={`M ${slotX(0) - 70} ${CAB.mouth - 70} L ${slotX(0) + 70} ${CAB.mouth + 70} M ${slotX(0) + 70} ${CAB.mouth - 70} L ${slotX(0) - 70} ${CAB.mouth + 70}`} stroke={RED} strokeWidth={22} strokeLinecap="round" /> : null}
								</Room>
							</PanelCam>
							<PanelCam id="c2new" x0={lerp(1920, 960, k)} w={960} cx={1500} cy={800} z={1.6}>
								<Room f={x}>
									<g transform={`translate(1500 ${RAIL - 40}) rotate(40)`}>
										<rect x={-150} y={-30} width={300} height={60} rx={8} fill={A.woodHi} />
									</g>
								</Room>
							</PanelCam>
						</Svg>
						<Say x={480} y={110} k={pop(x, at('C05', 0.66))} text="possible" size={72} color={A.paper} />
						<Say x={1440} y={110} k={pop(x, at('C05', 0.8))} text="impossible" size={72} color={A.lamp} />
					</>
				);
			},
		},
		// 26. close-up: the train backs out, sad
		{
			at: at('C05', 0.93),
			move: 'left',
			render: (x) => (
				<Svg>
					<Cam x={trainX(x) - 80} y={RAIL - 150} z={2.2}>
						<Room f={x}>
							<Train x={x} />
						</Room>
					</Cam>
				</Svg>
			),
		},
	];
	return <Shots f={f} end={S.mail.end} shots={shots} />;
};

const PassScene: React.FC<{f: number}> = ({f}) => {
	const lampX = 330;
	const lampY = 604 + LAMP_Y * 1.3;
	const letter = {x: 640, y: 640};
	const open = (x: number) => easeOut(progress(x, at('C06', 0.42), at('C06', 0.52)), 3);
	const beam = (x: number) => progress(x, at('C06', 0.36), at('C06', 0.46));
	const ang = (Math.atan2(letter.y - lampY, letter.x - lampX) * 180) / Math.PI;
	const Wide: React.FC<{x: number; glow?: number[]}> = ({x, glow}) => {
		const sweep = progress(x, cues.C06.start + 8, cues.C06.start + 40);
		const b = beam(x);
		return (
			<MastWorld f={x} build={[1, 1, 1]} open={open(x)} lock={1} lamp={1} glow={glow}>
				{sweep > 0 ? (
					<g transform={`translate(${lampX} ${lampY}) rotate(${ang + lerp(-14, 14, sweep)})`} style={{mixBlendMode: 'screen'}} opacity={Math.min(1, sweep * 4) * (1 - b * 0.6)}>
						<path d="M 0 -12 L 420 -80 L 420 80 L 0 12 Z" fill="url(#gBeam)" />
					</g>
				) : null}
				{b > 0 && b < 1
					? [ARMS[0].y, ARMS[1].y, HAL.top + 200].map((y, i) => (
							<path key={i} d={`M ${letter.x + 60} ${letter.y} Q ${(letter.x + MX) / 2} ${y + 80} ${MX} ${y}`} fill="none" stroke="#FFE9A0" strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-x * 3} opacity={Math.sin(Math.PI * b)} />
						))
					: null}
				<g transform={`translate(${letter.x} ${letter.y}) scale(1.2)`}>
					{sweep > 0 && sweep < 1 ? <rect x={-80} y={-56} width={160} height={112} rx={20} fill={K.yellow} opacity={0.5 * Math.sin(Math.PI * sweep)} filter="url(#glowBig)" /> : null}
					<rect x={-66} y={-44} width={132} height={88} rx={10} fill="#FBF8FF" />
					<path d="M -66 -40 L 0 6 L 66 -40" fill="none" stroke="#B9B4E6" strokeWidth={4} strokeLinejoin="round" />
					<circle cx={44} cy={-22} r={9} fill={K.rose} />
				</g>
			</MastWorld>
		);
	};
	const e = (x: number, a: number, b: number) => easeOut(progress(x, at('C07', a), at('C07', b)), 3);
	const jevEq = (x: number, size: number, all?: boolean) => (
		<Equation
			size={size}
			terms={[
				{tex: 'P(\\text{answers})', k: all ? 1 : e(x, 0.05, 0.14), color: K.orangeHi},
				{tex: '=', k: all ? 1 : e(x, 0.05, 0.14), color: K.mute},
				{tex: '\\prod_{i}', k: all ? 1 : e(x, 0.14, 0.24), color: K.yellow, label: 'questions', labelK: all ? 1 : e(x, 0.38, 0.48)},
				{tex: 'P(a_i \\mid \\text{letter})', k: all ? 1 : e(x, 0.24, 0.34), label: 'letter', labelK: all ? 1 : e(x, 0.38, 0.48)},
			]}
		/>
	);
	const chainEq = (size: number) => (
		<Equation
			size={size}
			terms={[
				{tex: 'P(\\text{sentence})', k: 1, color: K.mute},
				{tex: '=', k: 1, color: K.mute},
				{tex: '\\prod_{t}', k: 1, color: K.yellow, label: 'words', labelK: 1},
				{tex: 'P(w_t \\mid w_{<t})', k: 1, color: K.mute, label: 'history', labelK: 1},
			]}
		/>
	);
	const t30 = at('C06', 0.78);
	const shots: Shot[] = [
		// 27. night harbor: one sweep of the beam over the letter
		{at: S.pass.start, move: 'in', render: (x) => <Svg><Wide x={x} /></Svg>},
		// 28. low angle: every signal unfurls at once
		{
			at: at('C06', 0.26),
			move: 'up',
			render: (x) => (
				<>
					<Svg>
						<Cam x={1250} y={480} z={1.3}>
							<Wide x={x} />
						</Cam>
					</Svg>
					<Say x={420} y={820} k={pop(x, at('C06', 0.5))} text="1 pass" size={84} color={K.yellow} />
				</>
			),
		},
		// 29. three-way split: scam, team, urgency, all moving together
		{
			at: at('C06', 0.55),
			move: 'none',
			render: (x) => {
				const k = (i: number) => easeOut(progress(x, at('C06', 0.55) + i * 3, at('C06', 0.55) + i * 3 + 10), 3);
				return (
					<Svg>
						<rect x={-60} y={-60} width={2040} height={1200} fill="#07081A" />
						<PanelCam id="c2p1" x0={0} w={640} cx={ARMS[0].x0 + 110} cy={ARMS[0].y + 170 - 60 * (1 - k(0))} z={1.5}>
							<Wide x={x} />
						</PanelCam>
						<PanelCam id="c2p2" x0={640} w={640} cx={ARMS[1].x0 + ARMS[1].gap} cy={ARMS[1].y + 180 - 60 * (1 - k(1))} z={1.5}>
							<Wide x={x} />
						</PanelCam>
						<PanelCam id="c2p3" x0={1280} w={640} cx={HAL.x + 40} cy={430 - 60 * (1 - k(2))} z={1.3}>
							<Wide x={x} />
						</PanelCam>
					</Svg>
				);
			},
		},
		// 30. split: the train lays one word after another; the mast answers once
		{
			at: t30,
			move: 'none',
			render: (x) => {
				const n = laidAt(x, t30, 5);
				const once = easeOut(progress(x, t30 + 20, t30 + 30), 3);
				return (
					<>
						<Svg>
							<PanelCam id="c2seqL" x0={0} w={960} cx={TR.x0 + (n - 1) * TR.gap + 200} cy={TR.y - 200} z={1.3}>
								<TrackWorld f={x} n={n} t0={t30} every={5} dice={false} />
							</PanelCam>
							<PanelCam id="c2seqR" x0={960} w={960} cx={1450} cy={470} z={0.95}>
								<MastWorld f={x} build={[1, 1, 1]} open={once} lock={1} lamp={1} />
							</PanelCam>
						</Svg>
						<Say x={480} y={100} k={1} text={`${n}`} size={110} color={K.orangeHi} />
						<Say x={1440} y={100} k={pop(x, t30 + 22)} text="1" size={110} color={K.yellow} />
					</>
				);
			},
		},
		// 31. the math builds in the sky over the mast
		{
			at: cues.C07.start,
			move: 'right',
			render: (x) => (
				<>
					<Svg>
						<Wide x={x} />
					</Svg>
					<div style={{position: 'absolute', left: 70, top: 60}}>{jevEq(x, 58)}</div>
				</>
			),
		},
		// 32. closer on the yardarms: each factor lights as it multiplies
		{
			at: at('C07', 0.26),
			move: 'in',
			render: (x) => {
				const g = [0, 1].map((i) => Math.max(0, Math.sin(Math.PI * progress(x, at('C07', 0.3 + i * 0.08), at('C07', 0.38 + i * 0.08)))));
				return (
					<>
						<Svg>
							<Cam x={760} y={400} z={1.25}>
								<Wide x={x} glow={g} />
							</Cam>
						</Svg>
						<div style={{position: 'absolute', left: 170, top: 150}}>{jevEq(x, 60)}</div>
					</>
				);
			},
		},
		// 33. split: the chain rule over the rail, Jev's product over the mast. The same symbol
		{
			at: at('C07', 0.55),
			move: 'none',
			render: (x) => (
				<>
					<Svg>
						<PanelCam id="c2sameL" x0={0} w={960} cx={900} cy={TR.y - 280} z={1.0}>
							<TrackWorld f={x} n={LAID.length} t0={-999} every={1} dice={false} />
						</PanelCam>
						<PanelCam id="c2sameR" x0={960} w={960} cx={1450} cy={560} z={0.95}>
							<MastWorld f={x} build={[1, 1, 1]} open={1} lock={1} lamp={1} />
						</PanelCam>
					</Svg>
					<div style={{position: 'absolute', left: 40, top: 70}}>{chainEq(40)}</div>
					<div style={{position: 'absolute', left: 1000, top: 70}}>{jevEq(x, 40, true)}</div>
					<Say x={960} y={880} k={pop(x, at('C07', 0.6))} text="same" size={96} color={K.yellow} />
				</>
			),
		},
		// 34. close-up on the rail: each word waits for the one before it
		{
			at: at('C07', 0.76),
			move: 'left',
			render: (x) => {
				const t = at('C07', 0.76);
				const n = 5 + laidAt(x, t, 14);
				return (
					<>
						<Svg>
							<Cam x={TR.x0 + n * TR.gap + 100} y={TR.y - 120} z={2.2}>
								<TrackWorld f={x} n={n} t0={t - 5 * 14} every={14} ghosts={3} dice={false} />
							</Cam>
						</Svg>
						<Say x={960} y={130} k={pop(x, t + 6)} text="wait" size={100} color={A.paper} />
					</>
				);
			},
		},
		// 35. the mast: all at once. No waiting
		{
			at: at('C07', 0.88),
			move: 'out',
			render: (x) => (
				<>
					<Svg>
						<Cam x={1420} y={470} z={1.3}>
							<Wide x={x} glow={[1, 1]} />
						</Cam>
					</Svg>
					<Say x={250} y={600} k={1} text="wait" size={100} color={A.paper} strike={progress(x, at('C07', 0.9), at('C07', 0.97))} />
				</>
			),
		},
	];
	return <Shots f={f} end={S.pass.end} shots={shots} />;
};

const TriScene: React.FC<{f: number}> = ({f}) => {
	const pickStart = cues.C08.end;
	const lineK = (x: number) => easeOut(progress(x, at('C10', 0.28), at('C10', 0.4)), 3);
	const bell = (x: number) => pop(x, at('C10', 0.62), 12);
	const st = S.tri.start;
	const shots: Shot[] = [
		// 36. a second letter slides from the chute
		{
			at: st,
			move: 'in',
			render: (x) => {
				const k = easeInOut(progress(x, st + 8, st + 34));
				return (
					<Svg>
						<Cam x={1250} y={420} z={1.4}>
							<Room f={x} cone={k}>
								<LetterBig x={lerp(1646, 960, k)} y={lerp(330, 440, k) - 50 * Math.sin(Math.PI * k)} s={0.42} r={lerp(-20, 3, k)} glow={0.5 * k} />
							</Room>
						</Cam>
					</Svg>
				);
			},
		},
		// 37. close-up: the hard letter, its words lighting up as they are read
		{at: at('C08', 0.2), move: 'in', render: (x) => <Sheet words={HARD_WORDS} trace={progress(x, at('C08', 0.2), at('C08', 0.6))} to="to: support" tilt={2} />},
		// 38. the lamp swings between the three slots, unsure
		{
			at: at('C08', 0.62),
			move: 'right',
			render: (x) => {
				const s = Math.sin((x - at('C08', 0.62)) * 0.09);
				const i = s < -0.33 ? 0 : s > 0.33 ? 2 : 1;
				return (
					<Svg>
						<Cam x={960} y={520} z={1.3}>
							<Room f={x} cone={0.9} coneX={960 + 270 * s} hot={i} hotK={0.9} />
						</Cam>
					</Svg>
				);
			},
		},
		// 39. concept: three doors, your pick. 3, 2, 1
		{
			at: at('C08', 0.85),
			move: 'none',
			render: (x) => {
				const inPause = x >= pickStart;
				const count = Math.floor(progress(x, pickStart, pickStart + PICK_PAUSE) * 3);
				return (
					<>
						<Svg>
							<Stage f={x} y={880} w={900}>
								{SLOTS.map((s, i) => (
									<g key={s} transform={`translate(${960 + (i - 1) * 260} 820)`}>
										<rect x={-90} y={-330} width={180} height={330} rx={90} fill={T.tile} stroke={T.glow} strokeWidth={4} />
										<rect x={-70} y={-310} width={140} height={300} rx={70} fill={T.voidHi} />
										<circle cx={46} cy={-150} r={9} fill={T.glow} />
										<text y={-360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={T.text}>
											{s}
										</text>
									</g>
								))}
							</Stage>
						</Svg>
						<Say x={960} y={140} k={pop(x, at('C08', 0.86))} text="?" size={130} color={T.text} />
						{inPause ? (
							<>
								<div style={{position: 'absolute', left: 1560, top: 380}}>
									<svg width={170} height={170} viewBox="-85 -85 170 170">
										<circle r={70} fill="none" stroke={T.tile} strokeWidth={12} />
										<circle r={70} fill="none" stroke={T.glow} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${440 * (1 - progress(x, pickStart, pickStart + PICK_PAUSE))} 460`} transform="rotate(-90)" />
										<text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={T.text}>
											{Math.max(1, 3 - count)}
										</text>
									</svg>
								</div>
								<Say x={1645} y={590} k={pop(x, pickStart)} text="GUESS" size={48} color={T.glow} spacing={6} />
							</>
						) : null}
					</>
				);
			},
		},
		// 40. close-up: a hundred grains of light inside Jev's lamp
		{
			at: cues.C09.start,
			move: 'out',
			render: (x) => (
				<>
					<Svg>
						<Cam x={960} y={230} z={2.6}>
							<TubesRoom f={x}>
								{Array.from({length: 100}, (_, g) => {
									const a = g * 2.39996 + x * 0.03;
									const r = 12 + 60 * Math.sqrt(g / 100);
									return <circle key={g} cx={960 + Math.cos(a) * r} cy={200 + Math.sin(a) * r * 0.7} r={3.2} fill={K.yellow} opacity={0.9} />;
								})}
							</TubesRoom>
						</Cam>
					</Svg>
					<Say x={1480} y={420} k={pop(x, at('C09', 0.1))} text="100" size={120} color={K.yellow} />
				</>
			),
		},
		// 41. wide: every grain pours into one tube
		{
			at: at('C09', 0.19),
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<TubesRoom f={x} />
					</Svg>
					<Say x={1600} y={380} k={pop(x, at('C09', 0.33))} text="sure" size={80} color={A.lamp} />
				</>
			),
		},
		// 42. close-up: the full tube, then it empties
		{
			at: at('C09', 0.35),
			move: 'up',
			render: (x) => (
				<Svg>
					<Cam x={tubeX(1)} y={560} z={1.9}>
						<TubesRoom f={x} />
					</Cam>
				</Svg>
			),
		},
		// 43. wide: spread evenly. No idea
		{
			at: at('C09', 0.42),
			move: 'left',
			render: (x) => (
				<>
					<Svg>
						<TubesRoom f={x} />
					</Svg>
					<Say x={1600} y={380} k={pop(x, at('C09', 0.52))} text="unsure" size={80} color={A.lamp} />
				</>
			),
		},
		// 44. close-up: the lamp pours three streams at once for this letter
		{
			at: at('C09', 0.62),
			move: 'in',
			render: (x) => (
				<Svg>
					<Cam x={960} y={300} z={1.8}>
						<TubesRoom f={x} />
					</Cam>
				</Svg>
			),
		},
		// 45. three-way split: one tube each. 28, 47, 25
		{
			at: at('C09', 0.78),
			move: 'none',
			render: (x) => {
				const t = at('C09', 0.78);
				const counts = tubeState(x).counts;
				return (
					<>
						<Svg>
							<rect x={-60} y={-60} width={2040} height={1200} fill="#07081A" />
							{[0, 1, 2].map((i) => (
								<PanelCam key={i} id={`c2tube${i}`} x0={i * 640} w={640} cx={tubeX(i)} cy={620 - 50 * easeOut(progress(x, t + i * 4, t + i * 4 + 40), 2)} z={1.9}>
									<TubesRoom f={x} labels={false} />
								</PanelCam>
							))}
						</Svg>
						{[0, 1, 2].map((i) => (
							<React.Fragment key={i}>
								<Say x={320 + i * 640} y={90} k={pop(x, t + 6 + i * 6)} text={`${counts[i]}`} size={120} color={i === 1 ? K.orangeHi : A.paper} />
								<Say x={320 + i * 640} y={940} k={pop(x, t + 10 + i * 6)} text={SLOTS[i]} size={56} color={A.paper} />
							</React.Fragment>
						))}
					</>
				);
			},
		},
		// 46a. that spread is useful: someone is there for the unsure ones
		{
			at: cues.C10.start - 8,
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<MailroomDefs />
						<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
						<circle cx={1250} cy={260} r={640} fill="url(#gAmberLamp)" />
						<Reviewer x={640} y={790} s={2.6} f={x} look={1} desk={false} />
						<rect x={-60} y={700} width={2040} height={500} fill="url(#gDesk)" />
						<rect x={-60} y={700} width={2040} height={14} fill={A.woodHi} />
						<rect x={1080} y={760} width={360} height={60} rx={8} fill={A.woodLo} />
						<rect x={1096} y={748} width={328} height={20} rx={6} fill={A.brass} />
					</Svg>
					<Say x={1260} y={140} k={pop(x, cues.C10.start + 6)} text="useful" size={96} color={A.lamp} />
				</>
			),
		},
		// 46. a brass line slides across at 60
		{at: at('C10', 0.22), move: 'in', render: (x) => <Svg><TubesRoom f={x} lineK={lineK(x)} /></Svg>},
		// 47. close-up: fraud stops short of the line. No bluffing
		{
			at: at('C10', 0.44),
			move: 'up',
			render: (x) => (
				<>
					<Svg>
						<Cam x={tubeX(1) + 150} y={lineY + 60} z={2.0}>
							<TubesRoom f={x} lineK={1} />
						</Cam>
					</Svg>
					<Say x={960} y={70} k={pop(x, at('C10', 0.46))} text="bluff" size={96} color={A.paper} strike={progress(x, at('C10', 0.5), at('C10', 0.56))} />
				</>
			),
		},
		// 48. a bell rings; the letter slides away down a chute
		{
			at: at('C10', 0.6),
			move: 'right',
			render: (x) => {
				const b = bell(x);
				const slide = easeIn(progress(x, at('C10', 0.66), at('C10', 0.8)), 2);
				return (
					<Svg>
						<Cam x={1480} y={560} z={1.5}>
							<TubesRoom f={x} lineK={1}>
								<path d="M 1490 560 L 2100 960 L 2100 1020 L 1490 620 Z" fill={A.brassLo} />
								<path d="M 1490 560 L 2100 960" stroke={A.brassHi} strokeWidth={6} />
								<g transform={`translate(${lerp(1510, 2090, slide)} ${lerp(540, 920, slide)}) rotate(34)`}>
									<Env x={0} y={0} s={1.2} />
								</g>
								{b > 0 ? (
									<g transform={`translate(1560 300) scale(${b}) rotate(${14 * Math.sin(x * 0.6) * (1 - progress(x, at('C10', 0.62), at('C10', 0.9)))})`}>
										<circle r={70} fill={A.lamp} opacity={0.2} filter="url(#glowBig)" />
										<path d="M -34 20 Q -34 -34 0 -38 Q 34 -34 34 20 L 42 30 L -42 30 Z" fill={A.brass} />
										<circle cx={0} cy={38} r={9} fill={A.brass} />
									</g>
								) : null}
							</TubesRoom>
						</Cam>
					</Svg>
				);
			},
		},
		// 49. the reviewer from chapter 3: the letter lands on their desk
		{
			at: at('C10', 0.8),
			move: 'in',
			render: (x) => {
				const land = easeOut(progress(x, at('C10', 0.8), at('C10', 0.88)), 3);
				return (
					<>
						<Svg>
							<MailroomDefs />
							<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gAmberWall)" />
							<circle cx={1250} cy={260} r={640} fill="url(#gAmberLamp)" />
							<Reviewer x={640} y={790} s={2.6} f={x} look={1} desk={false} />
							<rect x={-60} y={700} width={2040} height={500} fill="url(#gDesk)" />
							<rect x={-60} y={700} width={2040} height={14} fill={A.woodHi} />
							<rect x={1080} y={760} width={360} height={60} rx={8} fill={A.woodLo} />
							<rect x={1096} y={748} width={328} height={20} rx={6} fill={A.brass} />
							<LetterBig x={lerp(1900, 1260, land)} y={lerp(400, 740, land)} s={0.8} r={lerp(30, -4, land)} />
						</Svg>
						<Say x={1250} y={140} k={pop(x, at('C10', 0.86))} text="person" size={96} color={A.lamp} />
					</>
				);
			},
		},
	];
	return <Shots f={f} end={S.tri.end} shots={shots} />;
};

const CloseScene: React.FC<{f: number}> = ({f}) => {
	const Wide: React.FC<{x: number; flicker?: number; trains?: boolean}> = ({x, flicker = 0, trains}) => {
		const on = 1 - flicker * (0.5 + 0.5 * Math.sin(x * 1.3) * Math.sin(x * 0.41));
		return (
			<Harbor f={x} lamp={on}>
				<g transform={`translate(1500 ${604 + LAMP_Y * 1.3}) rotate(-34)`} style={{mixBlendMode: 'screen'}} opacity={on}>
					<path d="M 0 -14 L 760 -220 L 760 180 L 0 14 Z" fill="url(#gBeam)" />
				</g>
				<Projected x={1100} y={190} text="0.91" size={110} k={on * easeOut(progress(x, at('C11', 0.2), at('C11', 0.3)), 2)} sub="SCAM" />
				{trains ? (
					<>
						<rect x={-60} y={PIER_Y} width={1100} height={18} fill="#3A2E4A" />
						<g transform={`translate(760 ${PIER_Y})`}>
							<SteamPress livery="claude" f={x} s={0.6} speech={[]} expr={withLook('curious', 1, -0.6, {lid: 0.2})} dist={0} smokeT={x * 0.012} />
						</g>
						<g transform={`translate(300 ${PIER_Y})`}>
							<SteamPress livery="gpt" f={x + 13} s={0.6} speech={[]} expr={withLook('curious', 1, -0.6, {lid: 0.2})} dist={0} smokeT={x * 0.012} />
						</g>
					</>
				) : null}
			</Harbor>
		);
	};
	const shots: Shot[] = [
		// 50. the harbor: all of this rests on one promise
		{
			at: S.close.start,
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<Wide x={x} />
					</Svg>
					<Say x={480} y={380} k={pop(x, at('C11', 0.12))} text="promise" size={110} color={K.white} />
				</>
			),
		},
		// 51. close-up: the lamp projects 0.91
		{
			at: at('C11', 0.2),
			move: 'left',
			render: (x) => (
				<Svg>
					<Cam x={1280} y={320} z={1.8}>
						<Wide x={x} />
					</Cam>
				</Svg>
			),
		},
		// 52. concept: a hundred letters it called 91%. Were 91 of them scams?
		{
			at: at('C11', 0.38),
			move: 'none',
			render: (x) => {
				const g = progress(x, at('C11', 0.38) + 4, at('C11', 0.58));
				return (
					<>
						<Svg>
							<Stage f={x} y={930} w={620}>
								<Grid10 x={960 - 220} y={330} cell={44} k={g} lit={91} />
							</Stage>
						</Svg>
						<Say x={960} y={130} k={pop(x, at('C11', 0.5))} text="91 / 100?" size={96} color={T.text} />
					</>
				);
			},
		},
		// 53. close-up: the lamp flickers. The promise has a name
		{
			at: at('C11', 0.62),
			move: 'in',
			render: (x) => (
				<>
					<Svg>
						<Cam x={1500} y={440} z={2.6}>
							<Wide x={x} flicker={0.4} />
						</Cam>
					</Svg>
					<Say x={500} y={470} k={pop(x, at('C11', 0.72), 14)} text="calibration" size={120} color={K.white} />
				</>
			),
		},
		// 54. pull back: the harbor, the two trains waiting on the pier
		{at: at('C11', 0.84), move: 'out', render: (x) => <Svg><Wide x={x} trains /></Svg>},
	];
	return <Shots f={f} end={S.close.end} shots={shots} />;
};

const Card: React.FC<{f: number; next?: boolean}> = ({f, next}) => {
	const t = easeOut(progress(f, next ? 10 : 14, next ? 30 : 40), 2);
	return (
		<AbsoluteFill>
			<Svg>
				<Harbor f={f} lamp={0.8}>
					<rect x={-60} y={PIER_Y} width={900} height={18} fill="#3A2E4A" />
					<g transform={`translate(700 ${PIER_Y})`}>
						<SteamPress livery="claude" f={f} s={0.55} speech={[]} expr={withLook('curious', 1, -0.5, {lid: 0.2})} dist={0} smokeT={f * 0.012} />
					</g>
					<g transform={`translate(260 ${PIER_Y})`}>
						<SteamPress livery="gpt" f={f + 13} s={0.55} speech={[]} expr={withLook('curious', 1, -0.5, {lid: 0.2})} dist={0} smokeT={f * 0.012} />
					</g>
				</Harbor>
			</Svg>
			<div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
				{next ? (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK</div>
						<div style={{fontWeight: 800, fontSize: 40, color: K.mute, marginTop: 40}}>next time</div>
						<div style={{fontWeight: 900, fontSize: 120, color: K.white, lineHeight: 1}}>What 0.91 Promises</div>
					</>
				) : (
					<>
						<div style={{fontWeight: 800, fontSize: 24, letterSpacing: 6, color: K.teal}}>THE MODEL THAT DOESN’T TALK · Nº 2</div>
						<div style={{fontWeight: 900, fontSize: 160, color: K.white, lineHeight: 1.05}}>Jev’s Contract</div>
					</>
				)}
			</div>
			{next ? (
				<div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 18, color: K.mute, opacity: t}}>
					Draft · illustrative numbers · Kokoro-82M · Remotion
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// Scenes, with how each one enters: a cross-fade (xf frames) or a hard cut (0). Cross-fades only at section changes.
type Scene = {span: {start: number; end: number}; xf: number; render: (f: number) => React.ReactNode};
export const JevContract: React.FC = () => {
	const f = useCurrentFrame();
	const scenes: Scene[] = [
		{span: S.title, xf: 0, render: (x) => <Card f={x} />},
		{span: S.open, xf: 12, render: (x) => <OpenScene f={x} />},
		{span: S.contract, xf: 12, render: (x) => <ContractScene f={x} />},
		{span: S.mail, xf: 12, render: (x) => <MailScene f={x} />},
		{span: S.pass, xf: 0, render: (x) => <PassScene f={x} />},
		{span: S.tri, xf: 0, render: (x) => <TriScene f={x} />},
		{span: S.close, xf: 12, render: (x) => <CloseScene f={x} />},
		{span: S.endcard, xf: 12, render: (x) => <Card f={x - S.endcard.start} next />},
	];
	return (
		<AbsoluteFill style={{background: K.night, overflow: 'hidden'}}>
			{scenes.map((sc, i) => {
				const next = scenes[i + 1];
				const tail = next ? next.xf : 0;
				if (f < sc.span.start || f >= sc.span.end + tail) return null;
				const fadeIn = sc.xf ? progress(f, sc.span.start, sc.span.start + sc.xf) : 1;
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn, overflow: 'hidden'}}>
						{sc.render(f)}
					</AbsoluteFill>
				);
			})}
			<Grain id="contractGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={track('contract-track')} />
		</AbsoluteFill>
	);
};
