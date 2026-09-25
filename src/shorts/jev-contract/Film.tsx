import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import {FONT, FlatDefs, FlatLighthouse, K, LAMP_Y, Motes, Stars, Vignette} from '../../flat/kit';
import {Callout, Projected} from '../../flat/type';
import {Equation} from '../../flat/math';
import {Clouds, Fireflies, Moon, Mountains, WorldDefs} from '../../flat/world';
import {SteamPress} from '../../characters/steam';
import {Grain} from '../../styleframes/Shared';
import vo from '../../../fixtures/jev-contract-vo.json';
import type {VoLine} from '../paper-track/timeline';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import {withLook} from '../flat-track/trainMood';
import {CONTRACT, PICK_PAUSE, buildContract} from './timeline';

export const contract = buildContract((vo as {lines: VoLine[]}).lines);
const {S, cues} = contract;
const at = (id: string, u: number) => cues[id].start + (cues[id].end - cues[id].start) * u;

const pop = (f: number, t: number, len = 10) => {
	const k = progress(f, t, t + len);
	return k <= 0 ? 0 : easeOut(k, 3) * (1 + 0.18 * Math.sin(Math.PI * k));
};

const Kin: React.FC<{k: number; children: React.ReactNode; size?: number; color?: string; weight?: number}> = ({k, children, size = 56, color = K.white, weight = 900}) =>
	k <= 0 ? null : (
		<div style={{opacity: Math.min(1, k), transform: `translateY(${(1 - Math.min(1, k)) * 18}px)`, fontFamily: FONT, fontWeight: weight, fontSize: size, color, lineHeight: 1.15, textShadow: '0 4px 18px rgba(5,8,32,0.6)'}}>{children}</div>
	);

// ---------- the harbor: sky, sea, the lighthouse on its rock ----------
const Harbor: React.FC<{f: number; lamp: number; lx?: number; moon?: [number, number]; children?: React.ReactNode}> = ({f, lamp, lx = 1500, moon = [860, 110], children}) => (
	<>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={560} />
		<Moon x={moon[0]} y={moon[1]} r={32} />
		<circle cx={1000} cy={660} r={330} fill="url(#gSun)" opacity={0.75} />
		<Clouds f={f} y={150} count={4} seed={33} opacity={0.9} />
		<Mountains y={640} seed={12} layers={2} />
		<rect x={-60} y={680} width={2040} height={520} fill="url(#gSea)" />
		{Array.from({length: 14}, (_, i) => (
			<rect key={i} x={((i * 283 + f * (0.6 + (i % 3) * 0.2)) % 2100) - 100} y={700 + ((i * 53) % 300)} width={60 + (i % 4) * 30} height={3} rx={1.5} fill="#9AA2E6" opacity={0.35} />
		))}
		{/* the rock and the lighthouse */}
		<path d={`M ${lx - 260} 720 C ${lx - 200} 640 ${lx - 120} 600 ${lx} 596 C ${lx + 120} 600 ${lx + 200} 650 ${lx + 280} 720 Z`} fill="#2A2F7A" />
		<path d={`M ${lx - 260} 720 C ${lx - 200} 640 ${lx - 120} 600 ${lx} 596 L ${lx} 720 Z`} fill="#3A40A0" />
		{/* reflection of the lamp on the water */}
		<rect x={lx - 16} y={730} width={32} height={260} fill="#FFE9A0" opacity={0.12 * lamp} filter="url(#glowBig)" />
		<g transform={`translate(${lx} 604) scale(1.3)`}>
			<FlatLighthouse on={lamp} />
		</g>
		{children}
		<Motes f={f} color={K.yellow} count={16} seed={4} />
		<Vignette />
	</>
);

const Dice: React.FC<{x: number; y: number; s: number; n: number}> = ({x, y, s, n}) => (
	<g transform={`translate(${x} ${y}) scale(${s}) rotate(${(n * 37) % 24 - 12})`}>
		<rect x={-11} y={-11} width={22} height={22} rx={6} fill={K.yellow} />
		{[[-4, -4], [4, 4], [0, 0]].slice(0, 1 + (n % 3)).map(([a, b], j) => (
			<circle key={j} cx={a} cy={b} r={2.4} fill={K.ink} />
		))}
	</g>
);

// ---------- 1. an AI that isn't allowed to write ----------
const OpenScene: React.FC<{f: number}> = ({f}) => {
	const lampOn = easeOut(progress(f, at('C01', 0.7), at('C01', 0.8)), 2);
	const number = easeOut(progress(f, at('C01', 0.74), at('C01', 0.86)), 2);
	const bets = f >= cues.C02.start ? Math.min(14, Math.floor((f - at('C02', 0.55)) / 6)) : -1;
	const cam = lerp(1, 1.05, progress(f, S.open.start, S.open.end));
	const trainX = 560;
	return (
		<AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 60%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={lampOn}>
					{lampOn > 0 ? (
						<g transform={`translate(1500 ${604 + LAMP_Y * 1.3}) rotate(${-28 + 4 * Math.sin(f * 0.02)})`} opacity={lampOn} style={{mixBlendMode: 'screen'}}>
							<path d="M 0 -14 L 700 -200 L 700 160 L 0 14 Z" fill="url(#gBeam)" />
						</g>
					) : null}
					<Projected x={1260} y={250} text={CONTRACT.scam.p.toFixed(2)} size={100} k={number} sub="SCAM" />
					{/* the chatty train on the pier */}
					<rect x={-60} y={742} width={1100} height={20} fill="#3A2E4A" />
					{Array.from({length: 16}, (_, i) => (
						<rect key={i} x={i * 68} y={762} width={10} height={80} fill="#2A2238" />
					))}
					<g transform={`translate(${trainX} 742)`}>
						<SteamPress livery="claude" f={f} s={0.9} expr={withLook(f < cues.C02.start ? 'happy' : 'curious', 0.8, -0.3, {bounce: 3})} dist={f * 0.6} />
					</g>
					{bets > 0
						? Array.from({length: bets}, (_, i) => <Dice key={i} x={trainX - 340 + (i % 7) * 34} y={400 - Math.floor(i / 7) * 34} s={pop(f, at('C02', 0.55) + i * 6, 8)} n={i} />)
						: null}
					{bets > 0 ? (
						<text x={trainX - 360} y={350} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.yellow} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.6)', strokeWidth: 6}}>
							{bets} bets
						</text>
					) : null}
					{bets > 0 ? (
						<text x={1260} y={410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#FFF3C4" opacity={pop(f, at('C02', 0.7))} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.6)', strokeWidth: 6}}>
							1 reading
						</text>
					) : null}
				</Harbor>
			</svg>
			<div style={{position: 'absolute', left: 110, top: 100}}>
				<Kin k={pop(f, at('C01', 0.12))} size={110} color={K.orangeHi}>
					<span style={{position: 'relative', display: 'inline-block'}}>
						write
						<span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 12, borderRadius: 6, background: K.white, transform: `scaleX(${easeOut(progress(f, at('C01', 0.25), at('C01', 0.35)), 3)})`, transformOrigin: 'left'}} />
					</span>
				</Kin>
				<Kin k={pop(f, at('C01', 0.88))} size={110} color={K.white}>
					?
				</Kin>
			</div>
			{f >= cues.C02.start ? (
				<div style={{position: 'absolute', left: 1180, top: 110, opacity: 1 - progress(f, at('C02', 0.5), at('C02', 0.6))}}>
					<Kin k={pop(f, at('C02', 0.1))} size={64} color={K.orangeHi}>
						smarter?
					</Kin>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 2. the contract: a signal mast, built before any letter arrives ----------
// The questions and every allowed answer become the only signals Jev can ever raise.
const MX = 1080; // mast
const BASE = 840; // pier top
const ARMS = [
	{y: 170, q: 'scam?', flags: ['yes', 'no'], x0: MX + 190, gap: 230},
	{y: 570, q: 'team?', flags: ['billing', 'fraud', 'lost card'], x0: MX + 170, gap: 210},
];
const HAL = {x: MX - 70, top: 180, bot: 740};
const FLAG_COLORS = [K.orange, '#5A63C8', '#8C5AAE'];

type MastProps = {f: number; build: number[]; open?: number; probs?: {a: number[]; b: number[]; u: number}; lock?: number};
const Mast: React.FC<MastProps> = ({f, build, open = 0, probs, lock = 0}) => {
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
				const u = (probs?.u ?? 0) * open;
				const by = HAL.bot - (HAL.bot - HAL.top) * u;
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
								<text x={0} y={0} transform={`translate(${HAL.x - 44} ${(HAL.top + HAL.bot) / 2}) rotate(-90)`} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.teal}>urgent?</text>
								<circle cx={HAL.x} cy={by} r={34 * (0.6 + 0.4 * open)} fill={K.orange} opacity={0.25 * open} filter="url(#glowBig)" />
								<circle cx={HAL.x} cy={by} r={24} fill={open > 0 ? K.orange : '#5A63C8'} />
								<circle cx={HAL.x - 7} cy={by - 7} r={7} fill="#FFE3C8" opacity={0.8} />
								{open > 0.5 ? (
									<text x={HAL.x - 40} y={by + 10} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.orangeHi}>
										{(probs?.u ?? 0).toFixed(1)}
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
				const ps = i === 0 ? probs?.a : probs?.b;
				const best = ps ? ps.indexOf(Math.max(...ps)) : -1;
				return (
					<g key={i}>
						{k < 1 ? <line x1={mid} y1={-40} x2={mid} y2={arm.y + dy - 30} stroke="#DCD2F0" strokeWidth={3} /> : null}
						{k < 1 ? <path d={`M ${mid - 16} ${arm.y + dy - 30} L ${mid} ${arm.y + dy - 50} L ${mid + 16} ${arm.y + dy - 30}`} fill="none" stroke="#DCD2F0" strokeWidth={4} /> : null}
						<g transform={`translate(0 ${dy})`}>
							<rect x={MX - 24} y={arm.y - 10} width={xEnd - MX + 24} height={20} rx={8} fill="#8A5A3C" />
							<rect x={MX - 24} y={arm.y - 10} width={xEnd - MX + 24} height={6} rx={3} fill="#B07A5A" />
							<circle cx={xEnd} cy={arm.y} r={13} fill="#E8B06A" />
							<circle cx={MX} cy={arm.y} r={15} fill="#E8B06A" />
							<text x={MX + 40} y={arm.y - 30} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.teal}>
								{arm.q}
							</text>
							{arm.flags.map((fl, j) => {
								const x = arm.x0 + j * arm.gap;
								const p = ps ? ps[j] : 0;
								const L = (60 + 200 * p) * easeOut(open, 3);
								const hot = j === best;
								const col = hot ? K.orange : FLAG_COLORS[(j % 2) + 1];
								const sway = 4 * Math.sin(f * 0.08 + j + i);
								return (
									<g key={fl}>
										{/* rolled flag, tied */}
										<g opacity={1 - open}>
											<rect x={x - 10} y={arm.y + 8} width={20} height={70} rx={10} fill={col} />
											<rect x={x - 12} y={arm.y + 26} width={24} height={6} rx={3} fill="#F3EEE3" />
											<rect x={x - 12} y={arm.y + 54} width={24} height={6} rx={3} fill="#F3EEE3" />
										</g>
										{/* unfurled: length = chance */}
										{open > 0 ? (
											<g>
												{hot ? <path d={`M ${x - 40} ${arm.y + 8} L ${x + 40} ${arm.y + 8} L ${x + sway} ${arm.y + 8 + L} Z`} fill={K.orange} opacity={0.45} filter="url(#glowBig)" /> : null}
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
							? Array.from({length: 8}, (_, s) => {
									const a = (s / 8) * Math.PI * 2;
									const r = 20 + 40 * (1 - spark(i));
									return <circle key={s} cx={MX + Math.cos(a) * r} cy={arm.y + Math.sin(a) * r} r={4} fill={K.yellow} opacity={spark(i)} />;
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

const ContractScene: React.FC<{f: number}> = ({f}) => {
	const t = [at('C03', 0.3), at('C03', 0.47), at('C03', 0.7)];
	const build = t.map((x) => progress(f, x, x + 36) * 1.2);
	const lock = pop(f, at('C03', 0.9), 14);
	const push = lerp(1, 1.05, progress(f, S.contract.start, S.contract.end));
	return (
		<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '60% 50%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={0.5} lx={330}>
					<Gulls f={f} />
					<Mast f={f} build={build} lock={lock} />
				</Harbor>
			</svg>
			<div style={{position: 'absolute', left: 110, top: 90}}>
				<Kin k={pop(f, S.contract.start + 16)} size={30} color={K.teal}>
					<span style={{letterSpacing: 8}}>CONTRACT</span>
				</Kin>
			</div>
			{lock > 0 ? (
				<div style={{position: 'absolute', left: MX + 70, top: BASE - 120, transform: `rotate(-8deg) scale(${lock})`, fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#FFB3A8', border: '5px solid #FFB3A8', borderRadius: 14, padding: '2px 18px', letterSpacing: 6}}>
					FIXED
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 3. the mailroom: a fixed wall of slots ----------
const SLOTS = ['billing', 'fraud', 'lost card'];
const slotX = (i: number) => 700 + i * 290;
const Letter: React.FC<{x: number; y: number; r?: number; s?: number; glow?: number}> = ({x, y, r = 0, s = 1, glow = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		{glow > 0 ? <rect x={-80} y={-56} width={160} height={112} rx={20} fill={K.yellow} opacity={0.5 * glow} filter="url(#glowBig)" /> : null}
		<rect x={-66} y={-44} width={132} height={88} rx={10} fill="#FBF8FF" />
		<path d="M -66 -40 L 0 6 L 66 -40" fill="none" stroke="#B9B4E6" strokeWidth={4} strokeLinejoin="round" />
		<circle cx={44} cy={-22} r={9} fill={K.rose} />
	</g>
);
const MailScene: React.FC<{f: number}> = ({f}) => {
	const drop = contract.mailDrop;
	const scanAt = at('C04', 0.55);
	const tIn = at('C04', 0.4);
	// the cruise letter: flies in, hangs under the lamp, is swept, drops into "fraud"
	const flyK = easeOut(progress(f, tIn, tIn + 24), 3);
	const fall = easeIn(progress(f, drop - 10, drop), 2);
	const lx = f < drop - 10 ? lerp(-100, 960, flyK) : lerp(960, slotX(1), fall);
	const ly = f < drop - 10 ? lerp(420, 470, flyK) + 8 * Math.sin(f * 0.1) : lerp(470, 640, fall);
	const scan = progress(f, scanAt, scanAt + 24);
	// two more letters, sorted fast
	const extra = [
		{t: drop + 8, slot: 0},
		{t: drop + 22, slot: 2},
	];
	// the train builds a slot that the wall has no room for
	const c5 = cues.C05;
	const trainIn = easeOut(progress(f, c5.start, c5.start + 36), 2);
	const build = progress(f, at('C05', 0.28), at('C05', 0.45));
	const reject = progress(f, at('C05', 0.55), at('C05', 0.68));
	const mood = f < at('C05', 0.3) ? withLook('happy', 1, -0.3) : f < at('C05', 0.55) ? withLook('determined', 1, -0.4) : f < at('C05', 0.62) ? withLook('panic', 1, -0.6) : withLook('sad', 0.8, -0.5);
	const boardY = 520 + 330 * easeIn(reject, 2);
	const boardR = 26 * reject;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<defs>
					<linearGradient id="gRoomWall" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2A2F7A" />
						<stop offset="1" stopColor="#1B205A" />
					</linearGradient>
				</defs>
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gRoomWall)" />
				{/* stone tower wall */}
				{Array.from({length: 9}, (_, r) =>
					Array.from({length: 13}, (_, c) => {
						const x = c * 170 - (r % 2) * 85 - 40;
						return <rect key={`${r}-${c}`} x={x + 4} y={r * 96 + 4} width={162} height={88} rx={14} fill={(r * 7 + c * 3) % 5 === 0 ? '#323884' : '#2B307A'} opacity={0.9} />;
					}),
				)}
				{/* arched window onto the sea */}
				<rect x={120} y={170} width={220} height={260} rx={110} fill="#141A4E" />
				<rect x={130} y={330} width={200} height={90} fill="url(#gSea)" />
				<circle cx={260} cy={260} r={18} fill="#EEF0FF" />
				<rect x={120} y={170} width={220} height={260} rx={110} fill="none" stroke="#4B52AE" strokeWidth={12} />
				{/* sconces */}
				{[430, 1500].map((x) => (
					<g key={x}>
						<circle cx={x} cy={300} r={90} fill={K.yellow} opacity={0.12} filter="url(#glowBig)" />
						<rect x={x - 6} y={300} width={12} height={40} rx={4} fill="#C9A35A" />
						<path d={`M ${x - 20} 300 L ${x + 20} 300 L ${x + 12} 270 L ${x - 12} 270 Z`} fill="#FFE9A0" />
					</g>
				))}
				{/* the contract, signed, pinned beside the wall */}
				<g transform="translate(1740 320) rotate(4)">
					<rect x={0} y={0} width={150} height={190} rx={6} fill="#F3EEE3" />
					{[30, 56, 82, 108, 134].map((y) => (
						<rect key={y} x={18} y={y} width={y % 52 ? 110 : 80} height={8} rx={4} fill="#C9B8A0" />
					))}
					<circle cx={112} cy={160} r={20} fill="#C8463C" />
					<circle cx={75} cy={8} r={8} fill={K.rose} />
				</g>
				{/* parcels */}
				{[
					[150, 790, 150, 80],
					[190, 720, 110, 70],
					[330, 810, 120, 60],
				].map(([x, y, w, h], i) => (
					<g key={i}>
						<rect x={x} y={y} width={w} height={h} rx={6} fill={['#B07A5A', '#8C5A6E', '#9A6A4A'][i]} />
						<rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#F3EEE3" opacity={0.6} />
					</g>
				))}
				{/* the wall of slots */}
				<rect x={530} y={550} width={920} height={320} rx={20} fill="#C9A35A" />
				<rect x={540} y={560} width={900} height={300} rx={16} fill="#5A3E3A" />
				<rect x={540} y={560} width={900} height={24} rx={12} fill="#7A564E" />
				{[560, 1420].map((x) => [600, 840].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill="#C9A35A" />))}
				<rect x={860} y={520} width={200} height={44} rx={10} fill="#C9A35A" />
				<text x={960} y={551} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} letterSpacing={4} fill="#3A2340">ANSWERS</text>
				{SLOTS.map((s, i) => {
					const hot = i === 1 && f >= drop;
					return (
						<g key={s}>
							<rect x={slotX(i) - 110} y={640} width={220} height={36} rx={10} fill="#1A1020" />
							{hot ? <rect x={slotX(i) - 110} y={640} width={220} height={36} rx={10} fill={K.orange} opacity={0.4 * (1 - progress(f, drop, drop + 30))} filter="url(#glowBig)" /> : null}
							<rect x={slotX(i) - 90} y={700} width={180} height={50} rx={10} fill="#C9A35A" />
							<text x={slotX(i)} y={735} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#3A2340">
								{s}
							</text>
						</g>
					);
				})}
				{/* Jev: the lamp head hanging over the table, the only thing that looks */}
				<rect x={955} y={-20} width={10} height={140} fill="#3A40A0" />
				<g transform="translate(960 160)">
					<circle r={90} fill="url(#gLamp)" opacity={0.9} />
					<rect x={-40} y={-40} width={80} height={60} rx={14} fill="#EDEBFF" />
					<rect x={-30} y={-26} width={60} height={34} rx={8} fill="#FFF1C0" />
					<path d="M -46 -40 L 0 -76 L 46 -40 Z" fill={K.rose} />
				</g>
				{scan > 0 && scan < 1 ? (
					<g style={{mixBlendMode: 'screen'}} opacity={Math.sin(Math.PI * scan)}>
						<path d={`M 960 190 L ${lerp(840, 1080, scan) - 30} 520 L ${lerp(840, 1080, scan) + 30} 520 Z`} fill="#FFE9A0" opacity={0.5} />
					</g>
				) : null}
				{f >= tIn && f < drop + 2 ? <Letter x={lx} y={ly} r={f < drop - 10 ? -6 + 6 * flyK : 0} glow={scan > 0 ? Math.sin(Math.PI * Math.min(1, scan)) : 0} /> : null}
				{extra.map((e, i) => {
					const k = progress(f, e.t - 16, e.t);
					if (k <= 0 || k >= 1) return null;
					return <Letter key={i} x={lerp(960, slotX(e.slot), k)} y={lerp(380, 640, easeIn(k, 2))} s={0.8} />;
				})}
				{/* the Miscellaneous-ish board */}
				{build > 0 ? (
					<g transform={`translate(1560 ${boardY}) rotate(${boardR + 3 * Math.sin(f * 0.4) * (1 - reject) * build})`} opacity={1 - progress(f, at('C05', 0.8), at('C05', 0.9))}>
						<rect x={-150} y={-30} width={300 * build} height={60} rx={8} fill="#B07A5A" />
						<text x={-130} y={10} fontFamily={FONT} fontWeight={900} fontSize={26} fill="#3A2340" opacity={build > 0.9 ? 1 : 0}>
							MISCELLANEOUS-ISH
						</text>
						{build > 0.5 && reject <= 0 ? [-120, 110].map((x) => <circle key={x} cx={x} cy={0} r={6} fill="#5A3E3A" />) : null}
					</g>
				) : null}
				{/* floor track and the train */}
				<rect x={-60} y={880} width={2040} height={300} fill="#15183F" />
				<rect x={-60} y={868} width={2040} height={12} fill="#9AA2E6" opacity={0.5} />
				{trainIn > 0 ? (
					<g transform={`translate(${lerp(-200, 1760, trainIn)} 868)`}>
						<SteamPress livery="claude" f={f} s={0.72} expr={mood} speech={f >= at('C05', 0.3) ? [{word: 'Miscellaneous-ish', age: f - at('C05', 0.3)}] : []} dist={trainIn * 400} smokeT={f * 0.012} />
					</g>
				) : null}
				{reject > 0.5 ? (
					<Callout from={{x: 1440, y: 600}} to={{x: 1300, y: 420}} title="impossible" k={progress(f, at('C05', 0.7), at('C05', 0.85))} size={40} anchor="end" />
				) : null}
				<Motes f={f} count={20} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 560, top: 90, opacity: 1 - progress(f, c5.start, c5.start + 12)}}>
				<Kin k={pop(f, at('C04', 0.05))} size={30} color={K.teal}>
					<span style={{letterSpacing: 6}}>MAILROOM</span>
				</Kin>
			</div>
		</AbsoluteFill>
	);
};

// ---------- 4. one pass: one reading, every flag at once ----------
const PassScene: React.FC<{f: number}> = ({f}) => {
	const lampX = 330;
	const lampY = 604 + LAMP_Y * 1.3;
	const letter = {x: 640, y: 640};
	const sweep = progress(f, cues.C06.start + 8, cues.C06.start + 40);
	const open = easeOut(progress(f, at('C06', 0.42), at('C06', 0.52)), 3);
	const beamToMast = progress(f, at('C06', 0.36), at('C06', 0.46));
	const e1 = easeOut(progress(f, at('C07', 0.05), at('C07', 0.14)), 3);
	const e2 = easeOut(progress(f, at('C07', 0.14), at('C07', 0.24)), 3);
	const e3 = easeOut(progress(f, at('C07', 0.24), at('C07', 0.34)), 3);
	const lab = easeOut(progress(f, at('C07', 0.38), at('C07', 0.48)), 2);
	const c1 = easeOut(progress(f, at('C07', 0.55), at('C07', 0.65)), 3);
	const clab = easeOut(progress(f, at('C07', 0.7), at('C07', 0.8)), 2);
	const ang = (Math.atan2(letter.y - lampY, letter.x - lampX) * 180) / Math.PI;
	const probs = {a: [CONTRACT.scam.p, 1 - CONTRACT.scam.p], b: [0.1, 0.83, 0.07], u: CONTRACT.urgency};
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={1} lx={lampX} moon={[1780, 330]}>
					{sweep > 0 ? (
						<g transform={`translate(${lampX} ${lampY}) rotate(${ang + lerp(-14, 14, sweep)})`} style={{mixBlendMode: 'screen'}} opacity={Math.min(1, sweep * 4) * (1 - beamToMast * 0.6)}>
							<path d="M 0 -12 L 420 -80 L 420 80 L 0 12 Z" fill="url(#gBeam)" />
						</g>
					) : null}
					<Mast f={f} build={[1, 1, 1]} open={open} probs={probs} lock={1} />
					{/* the answer travels from the letter to every flag at the same instant */}
					{beamToMast > 0 && beamToMast < 1
						? [ARMS[0].y, ARMS[1].y, HAL.top + 200].map((y, i) => (
								<path key={i} d={`M ${letter.x + 60} ${letter.y} Q ${(letter.x + MX) / 2} ${y + 80} ${MX} ${y}`} fill="none" stroke="#FFE9A0" strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-f * 3} opacity={Math.sin(Math.PI * beamToMast)} />
							))
						: null}
					<Letter x={letter.x} y={letter.y} s={1.2} glow={sweep > 0 && sweep < 1 ? Math.sin(Math.PI * sweep) : 0.15} />
				</Harbor>
			</svg>
			{open > 0 ? (
				<div style={{position: 'absolute', left: 530, top: 740, opacity: open * (1 - e1)}}>
					<Kin k={open} size={48} color={K.yellow}>
						1 pass
					</Kin>
				</div>
			) : null}
			{/* Jev's product, and the chain rule it rhymes with */}
			<div style={{position: 'absolute', left: 70, top: 70, opacity: e1}}>
				<Equation
					size={50}
					terms={[
						{tex: 'P(\\text{answers})', k: e1, color: K.orangeHi},
						{tex: '=', k: e1, color: K.mute},
						{tex: '\\prod_{i}', k: e2, color: K.teal, label: 'questions', labelK: lab},
						{tex: 'P(a_i \\mid \\text{letter})', k: e3, label: 'letter', labelK: lab},
					]}
				/>
			</div>
			<div style={{position: 'absolute', left: 70, top: 250, opacity: 0.8 * c1}}>
				<Equation
					size={36}
					terms={[
						{tex: 'P(\\text{sentence})', k: c1, color: K.mute},
						{tex: '=', k: c1, color: K.mute},
						{tex: '\\prod_{t}', k: c1, color: K.mute, label: 'words', labelK: clab},
						{tex: 'P(w_t \\mid w_{<t})', k: c1, color: K.mute, label: 'history', labelK: clab},
					]}
				/>
			</div>
		</AbsoluteFill>
	);
};

// ---------- 5. a hundred grains of certainty, poured into three tubes ----------
const TUBES = ['billing', 'fraud', 'lost card'];
const TubesScene: React.FC<{f: number}> = ({f}) => {
	const {hard, line} = CONTRACT;
	const letterK = easeOut(progress(f, S.tri.start + 10, S.tri.start + 30), 3);
	const pickStart = cues.C08.end;
	const inPause = f >= pickStart && f < cues.C09.start;
	const count = Math.floor(progress(f, pickStart, pickStart + PICK_PAUSE) * 3.5);
	const tubesK = easeOut(progress(f, at('C08', 0.55), at('C08', 0.75)), 3);
	const fill = (s: number, e: number) => easeInOut(progress(f, at('C09', s), at('C09', e)));
	const drain = (s: number, e: number) => 1 - easeIn(progress(f, at('C09', s), at('C09', e)), 1.5);
	const A = fill(0.22, 0.32) * drain(0.37, 0.41);
	const B = fill(0.42, 0.52) * drain(0.57, 0.61);
	const C = fill(0.64, 0.8);
	const target = [
		[0, 100, 0],
		[33, 33, 34],
		[hard.billing * 100, hard.fraud * 100, hard.lost * 100],
	];
	const counts = [0, 1, 2].map((i) => Math.round(target[0][i] * A + target[1][i] * B + target[2][i] * C));
	const pouring = [progress(f, at('C09', 0.22), at('C09', 0.32)), progress(f, at('C09', 0.42), at('C09', 0.52)), progress(f, at('C09', 0.64), at('C09', 0.8))].map((k) => k > 0 && k < 1);
	const pourSet = pouring[0] ? target[0] : pouring[1] ? target[1] : pouring[2] ? target[2] : null;
	const lineK = easeOut(progress(f, at('C10', 0.28), at('C10', 0.4)), 3);
	const bell = pop(f, at('C10', 0.62), 12);
	const handoff = easeInOut(progress(f, at('C10', 0.7), at('C10', 0.9)));
	const tx = (i: number) => 960 + i * 260;
	const TOP = 300;
	const BOT = 820;
	const TW = 150;
	const R = 11;
	const lineY = BOT - (BOT - TOP) * line;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={1080} />
				<Mountains y={900} seed={4} layers={2} />
				<rect x={-60} y={930} width={2040} height={200} fill="#1E2466" />
				<Fireflies f={f} x={0} y={760} w={1920} h={200} count={10} color={K.cyan} />
				{/* the lamp that pours */}
				<g transform={`translate(${tx(1)} 150)`} opacity={tubesK}>
					<circle r={90} fill="url(#gLamp)" />
					<rect x={-40} y={-40} width={80} height={60} rx={14} fill="#EDEBFF" />
					<rect x={-30} y={-26} width={60} height={34} rx={8} fill="#FFF1C0" />
					<path d="M -46 -40 L 0 -76 L 46 -40 Z" fill={K.rose} />
				</g>
				{pourSet
					? pourSet.map((n, i) =>
							n > 0
								? Array.from({length: 6}, (_, j) => {
										const u = ((f * 0.07 + j / 6) % 1);
										return <circle key={`${i}-${j}`} cx={lerp(tx(1), tx(i), u) + 6 * Math.sin(j + f * 0.2)} cy={lerp(190, TOP + 10, u)} r={6} fill={K.yellow} opacity={0.9} />;
									})
								: null,
						)
					: null}
				{TUBES.map((t, i) => {
					const x = tx(i);
					const n = counts[i];
					const top = n >= line * 100;
					return (
						<g key={t} opacity={tubesK}>
							<rect x={x - TW / 2} y={TOP} width={TW} height={BOT - TOP} rx={22} fill="#FFFFFF" opacity={0.06} />
							{Array.from({length: n}, (_, g) => {
								const col = g % 5;
								const row = Math.floor(g / 5);
								const pitch = (BOT - TOP - 8) / 20;
								return <circle key={g} cx={x - 4 * R + col * 2 * R} cy={BOT - 4 - pitch / 2 - row * pitch} r={R} fill={i === 1 ? K.orange : '#E8B06A'} />;
							})}
							<rect x={x - TW / 2} y={TOP} width={TW} height={BOT - TOP} rx={22} fill="none" stroke={top ? K.orangeHi : '#9AA2E6'} strokeWidth={3} opacity={0.85} />
							<rect x={x - TW / 2 + 12} y={TOP + 18} width={7} height={BOT - TOP - 50} rx={3.5} fill="#FFFFFF" opacity={0.25} />
							<text x={x} y={BOT + 56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>
								{t}
							</text>
							<text x={x} y={TOP - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={i === 1 ? K.orangeHi : K.white} opacity={f >= at('C09', 0.2) ? 1 : 0}>
								{n}
							</text>
						</g>
					);
				})}
				{A > 0.9 ? <text x={tx(1) + 120} y={TOP + 60} fontFamily={FONT} fontWeight={900} fontSize={40} fill={K.teal}>sure</text> : null}
				{B > 0.9 ? <text x={tx(2) + 110} y={BOT - 200} fontFamily={FONT} fontWeight={900} fontSize={40} fill={K.teal}>unsure</text> : null}
				{lineK > 0 ? (
					<g opacity={lineK}>
						<line x1={tx(0) - TW / 2 - 30} x2={lerp(tx(0) - TW / 2 - 30, tx(2) + TW / 2 + 30, lineK)} y1={lineY} y2={lineY} stroke={K.teal} strokeWidth={4} strokeDasharray="16 12" />
						<text x={tx(2) + TW / 2 + 44} y={lineY + 12} fontFamily={FONT} fontWeight={900} fontSize={36} fill={K.teal}>60</text>
					</g>
				) : null}
				{bell > 0 ? (
					<g transform={`translate(${tx(2) + 250} ${lineY - 150}) scale(${bell}) rotate(${14 * Math.sin(f * 0.6) * (1 - progress(f, at('C10', 0.62), at('C10', 0.9)))})`}>
						<circle r={70} fill={K.yellow} opacity={0.18} filter="url(#glowBig)" />
						<path d="M -34 20 Q -34 -34 0 -38 Q 34 -34 34 20 L 42 30 L -42 30 Z" fill={K.yellow} />
						<circle cx={0} cy={38} r={9} fill={K.yellow} />
					</g>
				) : null}
				{/* the person it goes to */}
				{bell > 0 ? (
					<g transform={`translate(${tx(2) + 250} ${BOT - 40})`} opacity={Math.min(1, bell)}>
						<circle cx={0} cy={-150} r={34} fill="#DCD2F0" />
						<path d="M -56 0 Q -56 -104 0 -106 Q 56 -104 56 0 Z" fill="#DCD2F0" />
						<rect x={-80} y={0} width={160} height={20} rx={8} fill="#8A5A3C" />
						<text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>person</text>
					</g>
				) : null}
				<Motes f={f} />
				<Vignette />
			</svg>
			{/* the harder letter: the input, shown in full */}
			<div style={{position: 'absolute', left: lerp(110, 1668, handoff), top: lerp(260, 720, handoff), width: 520, opacity: letterK * (1 - progress(f, at('C10', 0.86), at('C10', 0.95))), transform: `translateY(${(1 - letterK) * 30}px) rotate(-2deg) scale(${lerp(1, 0.35, handoff)})`, transformOrigin: '0 0', background: 'linear-gradient(180deg, #FBF8FF, #ECE7FA)', padding: '34px 40px', boxShadow: '0 30px 60px rgba(5,8,32,0.6)', fontFamily: FONT, color: K.navy, borderRadius: 6}}>
				<div style={{fontWeight: 800, fontSize: 18, color: '#7A7AA8', letterSpacing: 1}}>to: support</div>
				<div style={{fontWeight: 900, fontSize: 38, lineHeight: 1.25, marginTop: 14}}>{hard.text}</div>
			</div>
			{inPause ? (
				<div style={{position: 'absolute', left: 290, top: 620}}>
					<svg width={150} height={150} viewBox="-75 -75 150 150">
						<circle r={62} fill="none" stroke="#3B3F9A" strokeWidth={10} />
						<circle r={62} fill="none" stroke={K.teal} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${389.6 * (1 - progress(f, pickStart, cues.C09.start))} 400`} transform="rotate(-90)" />
						<text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={K.white}>
							{Math.max(1, 3 - count)}
						</text>
					</svg>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 6. the promise ----------
const CloseScene: React.FC<{f: number}> = ({f}) => {
	const num = easeOut(progress(f, at('C11', 0.08), at('C11', 0.2)), 2);
	const grid = progress(f, at('C11', 0.38), at('C11', 0.62));
	const name = pop(f, at('C11', 0.78), 14);
	const push = lerp(1, 1.08, progress(f, S.close.start, S.close.end));
	return (
		<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '60% 40%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={1}>
					<g transform={`translate(1500 ${604 + LAMP_Y * 1.3}) rotate(-34)`} style={{mixBlendMode: 'screen'}}>
						<path d="M 0 -14 L 760 -220 L 760 180 L 0 14 Z" fill="url(#gBeam)" />
					</g>
					<Projected x={1100} y={190} text="0.91" size={110} k={num} sub="SCAM" />
					{/* a hundred letters Jev called 91%: were 91 of them scams? */}
					{grid > 0 ? (
						<g transform="translate(260 300)">
							{Array.from({length: 100}, (_, i) => {
								const k = clamp01(grid * 100 - i);
								if (k <= 0) return null;
								const scam = i < 91;
								return <rect key={i} x={(i % 10) * 36} y={Math.floor(i / 10) * 36} width={28} height={28} rx={6} fill={scam ? K.orange : '#4B52AE'} opacity={k} />;
							})}
							<text x={0} y={-24} fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.white} opacity={grid}>
								91%
							</text>
							<text x={0} y={392} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.orangeHi} opacity={progress(f, at('C11', 0.6), at('C11', 0.68))}>
								91 / 100?
							</text>
						</g>
					) : null}
				</Harbor>
			</svg>
			{name > 0 ? (
				<div style={{position: 'absolute', left: 700, width: 620, top: 440, textAlign: 'center', fontFamily: FONT, transform: `scale(${name})`}}>
					<div style={{fontWeight: 900, fontSize: 96, color: K.white, lineHeight: 1}}>calibration</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

const Card: React.FC<{f: number; next?: boolean}> = ({f, next}) => {
	const t = easeOut(progress(f, next ? 10 : 14, next ? 30 : 40), 2);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={0.8}>
					<rect x={-60} y={742} width={900} height={18} fill="#3A2E4A" />
					<g transform="translate(700 742)">
						<SteamPress livery="claude" f={f} s={0.55} speech={[]} expr={withLook('curious', 1, -0.5, {lid: 0.2})} dist={0} smokeT={f * 0.012} />
					</g>
					<g transform="translate(260 742)">
						<SteamPress livery="gpt" f={f + 13} s={0.55} speech={[]} expr={withLook('curious', 1, -0.5, {lid: 0.2})} dist={0} smokeT={f * 0.012} />
					</g>
				</Harbor>
			</svg>
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

type Scene = {span: {start: number; end: number}; render: (f: number) => React.ReactNode};
export const JevContract: React.FC = () => {
	const f = useCurrentFrame();
	const {XF} = contract;
	const scenes: Scene[] = [
		{span: S.title, render: (x) => <Card f={x} />},
		{span: S.open, render: (x) => <OpenScene f={x} />},
		{span: S.contract, render: (x) => <ContractScene f={x} />},
		{span: S.mail, render: (x) => <MailScene f={x} />},
		{span: S.pass, render: (x) => <PassScene f={x} />},
		{span: S.tri, render: (x) => <TubesScene f={x} />},
		{span: S.close, render: (x) => <CloseScene f={x} />},
		{span: S.endcard, render: (x) => <Card f={x - S.endcard.start} next />},
	];
	return (
		<AbsoluteFill style={{background: K.night}}>
			{scenes.map((sc, i) => {
				if (f < sc.span.start || f >= sc.span.end + XF) return null;
				const fadeIn = i === 0 ? 1 : progress(f, sc.span.start, sc.span.start + XF);
				return (
					<AbsoluteFill key={i} style={{opacity: fadeIn}}>
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
