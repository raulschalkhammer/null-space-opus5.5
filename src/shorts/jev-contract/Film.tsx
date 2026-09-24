import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FONT, FlatDefs, FlatLighthouse, FlatSubtitle, K, LAMP_Y, Motes, Stars, Vignette} from '../../flat/kit';
import {Callout, Projected} from '../../flat/type';
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
const Harbor: React.FC<{f: number; lamp: number; lx?: number; children?: React.ReactNode}> = ({f, lamp, lx = 1500, children}) => (
	<>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={560} />
		<Moon x={860} y={110} r={32} />
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
					<Projected x={1260} y={250} text={CONTRACT.scam.p.toFixed(2)} size={100} k={number} sub="ONE NUMBER" />
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
							{bets} words · {bets} bets
						</text>
					) : null}
					{bets > 0 ? (
						<text x={1260} y={410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#FFF3C4" opacity={pop(f, at('C02', 0.7))} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.6)', strokeWidth: 6}}>
							1 number · 1 reading
						</text>
					) : null}
				</Harbor>
			</svg>
			<div style={{position: 'absolute', left: 110, top: 100}}>
				<Kin k={pop(f, at('C01', 0.05))}>an AI that isn’t</Kin>
				<Kin k={pop(f, at('C01', 0.12))} color={K.orangeHi}>
					allowed to write
				</Kin>
				<Kin k={pop(f, at('C01', 0.88))} size={30} color={K.mute} weight={800}>
					why would anyone want that?
				</Kin>
			</div>
			{f >= cues.C02.start ? (
				<div style={{position: 'absolute', left: 1180, top: 110, opacity: 1 - progress(f, at('C02', 0.5), at('C02', 0.6))}}>
					<Kin k={pop(f, at('C02', 0.05))} size={44}>
						more words
					</Kin>
					<Kin k={pop(f, at('C02', 0.14))} size={44} color={K.orangeHi}>
						= more understanding?
					</Kin>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 2. the contract: questions and allowed answers, fixed before reading ----------
const Chip: React.FC<{label: string; k: number; hot?: boolean}> = ({label, k, hot}) => (
	<span style={{display: 'inline-block', transform: `scale(${k})`, opacity: Math.min(1, k), background: hot ? K.orange : '#E4DCCB', color: K.ink, borderRadius: 18, padding: '6px 18px', marginRight: 12, fontWeight: 900, fontSize: 28}}>{label}</span>
);
const ContractScene: React.FC<{f: number}> = ({f}) => {
	const unroll = easeInOut(progress(f, S.contract.start + 6, S.contract.start + 40));
	const q1 = progress(f, at('C03', 0.33), at('C03', 0.36));
	const q2 = progress(f, at('C03', 0.5), at('C03', 0.53));
	const q3 = progress(f, at('C03', 0.78), at('C03', 0.81));
	const seal = pop(f, cues.C03.end + 2, 12);
	const H = 640;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Harbor f={f} lamp={0.4} lx={1700} />
				<rect x={-60} y={-60} width={2040} height={1200} fill="#0B1030" opacity={0.35} />
				{/* the scroll */}
				<g transform="translate(560 120)">
					<rect x={0} y={20} width={800} height={H * unroll} fill="#F3EEE3" />
					<rect x={0} y={20} width={800} height={H * unroll} fill="url(#gVignette)" opacity={0.15} />
					<rect x={-24} y={0} width={848} height={40} rx={20} fill="#8A5A3C" />
					<rect x={-24} y={H * unroll} width={848} height={40} rx={20} fill="#8A5A3C" />
					<rect x={-24} y={H * unroll} width={848} height={12} rx={6} fill="#B07A5A" />
				</g>
				{seal > 0 ? (
					<g transform={`translate(1290 ${120 + H - 40}) scale(${seal}) rotate(-12)`}>
						<circle r={62} fill="#C8463C" />
						<circle r={48} fill="none" stroke="#F3B0A0" strokeWidth={3} />
						<text y={-4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill="#FFE6DC">FIXED</text>
						<text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={13} fill="#FFE6DC">BEFORE READING</text>
					</g>
				) : null}
			</svg>
			<div style={{position: 'absolute', left: 620, top: 180, width: 700, height: 600 * unroll, overflow: 'hidden', fontFamily: FONT, color: '#3A2340'}}>
				<div style={{fontWeight: 900, fontSize: 24, letterSpacing: 8, color: '#8A5A3C', opacity: progress(f, S.contract.start + 30, S.contract.start + 44)}}>THE CONTRACT</div>
				<div style={{fontWeight: 800, fontSize: 22, color: '#8A6A60', marginTop: 4, opacity: progress(f, S.contract.start + 34, S.contract.start + 48)}}>questions and every allowed answer, written first</div>
				{[
					{q: '1 · Is this a scam?', k: q1, body: [<Chip key="y" label="yes" k={pop(f, at('C03', 0.37))} />, <Chip key="n" label="no" k={pop(f, at('C03', 0.39))} />]},
					{q: '2 · Which team handles it?', k: q2, body: [<Chip key="b" label="billing" k={pop(f, at('C03', 0.55))} />, <Chip key="f" label="fraud" k={pop(f, at('C03', 0.57))} />, <Chip key="l" label="lost card" k={pop(f, at('C03', 0.59))} />]},
					{
						q: '3 · How urgent?',
						k: q3,
						body: [
							<span key="s" style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontWeight: 900, fontSize: 26, opacity: progress(f, at('C03', 0.83), at('C03', 0.87))}}>
								0
								<span style={{display: 'inline-block', width: 420 * easeOut(progress(f, at('C03', 0.83), at('C03', 0.93))), height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #7FD8C5, #FF9A5C)'}} />1
							</span>,
						],
					},
				].map((row, i) => (
					<div key={i} style={{marginTop: i ? 44 : 50, opacity: row.k, transform: `translateX(${(1 - row.k) * -20}px)`}}>
						<div style={{fontWeight: 900, fontSize: 40}}>{row.q}</div>
						<div style={{marginTop: 14}}>{row.body}</div>
					</div>
				))}
			</div>
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
					<Callout from={{x: 1440, y: 600}} to={{x: 1300, y: 420}} title="can pick the wrong slot" sub="can never invent a new one" k={progress(f, at('C05', 0.7), at('C05', 0.85))} size={40} anchor="end" />
				) : null}
				<Motes f={f} count={20} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 560, top: 90, opacity: 1 - progress(f, c5.start, c5.start + 12)}}>
				<Kin k={pop(f, at('C04', 0.05))} size={30} color={K.teal}>
					<span style={{letterSpacing: 6}}>THE MAILROOM</span>
				</Kin>
			</div>
		</AbsoluteFill>
	);
};

// ---------- 4. one pass: every question answered at once ----------
const Pennants: React.FC<{items: {t: string; p: number; hot?: boolean}[]; k: number; x: number; y: number; title: string}> = ({items, k, x, y, title}) => {
	let yy = 0;
	return (
		<g transform={`translate(${x} ${y})`}>
			<text x={0} y={-24} fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.teal} letterSpacing={3} opacity={k}>
				{title}
			</text>
			<rect x={-6} y={-6} width={5} height={items.length * 70} rx={2} fill={K.white} opacity={k} />
			{items.map((it, i) => {
				const len = (40 + 330 * it.p) * easeOut(clamp01(k * 1.2 - i * 0.1), 3);
				const h = 54;
				const g = (
					<g key={it.t} transform={`translate(0 ${yy})`}>
						<path d={`M 0 0 L ${len * 0.8} 4 L ${len} ${h / 2} L ${len * 0.8} ${h - 4} L 0 ${h} Z`} fill={it.hot ? K.orange : '#4B52AE'} />
						<text x={len + 16} y={h / 2 + 10} fontFamily={FONT} fontWeight={900} fontSize={28} fill={it.hot ? K.orangeHi : K.white} opacity={k}>
							{it.t} {Math.round(it.p * 100)}%
						</text>
					</g>
				);
				yy += h + 14;
				return g;
			})}
		</g>
	);
};
const Prod: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size * 0.9} height={size * 1.05} viewBox="0 0 40 46" style={{verticalAlign: 'middle'}}>
		<rect x={2} y={2} width={36} height={7} rx={3.5} fill={color} />
		<rect x={7} y={2} width={7} height={42} rx={3.5} fill={color} />
		<rect x={26} y={2} width={7} height={42} rx={3.5} fill={color} />
	</svg>
);
const PassScene: React.FC<{f: number}> = ({f}) => {
	const sweep = progress(f, cues.C06.start + 8, cues.C06.start + 34);
	const all = easeOut(progress(f, at('C06', 0.4), at('C06', 0.48)), 3);
	const eq = easeOut(progress(f, at('C07', 0.12), at('C07', 0.2)), 3);
	const cmp = easeOut(progress(f, at('C07', 0.55), at('C07', 0.63)), 3);
	const sub = {fontSize: 24, position: 'relative' as const, top: 12};
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={1080} />
				{/* lamp at top left, letter below it */}
				<g transform="translate(250 190)">
					<circle r={110} fill="url(#gLamp)" />
					<rect x={-40} y={-40} width={80} height={60} rx={14} fill="#EDEBFF" />
					<rect x={-30} y={-26} width={60} height={34} rx={8} fill="#FFF1C0" />
					<path d="M -46 -40 L 0 -76 L 46 -40 Z" fill={K.rose} />
				</g>
				{sweep > 0 && sweep < 1 ? (
					<path d={`M 250 220 L ${lerp(140, 380, sweep) - 40} 430 L ${lerp(140, 380, sweep) + 40} 430 Z`} fill="#FFE9A0" opacity={0.45 * Math.sin(Math.PI * sweep)} style={{mixBlendMode: 'screen'}} />
				) : null}
				<Letter x={260} y={480} s={1.3} glow={sweep > 0 && sweep < 1 ? 1 : 0.2} />
				{/* one reading fans out into three answers, at the same instant */}
				{all > 0
					? [260, 520, 800].map((y, i) => <path key={i} d={`M 350 480 C 460 480 480 ${y} 600 ${y}`} fill="none" stroke="#FFE9A0" strokeWidth={4} opacity={0.6 * all} strokeDasharray="10 10" />)
					: null}
				<Pennants title="SCAM?" x={640} y={240} k={all} items={[{t: 'yes', p: CONTRACT.scam.p, hot: true}, {t: 'no', p: 1 - CONTRACT.scam.p}]} />
				<Pennants title="WHICH TEAM?" x={640} y={450} k={all} items={CONTRACT.team.map((t, i) => ({...t, hot: i === 0}))} />
				<g transform="translate(640 760)" opacity={all}>
					<text x={0} y={-24} fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.teal} letterSpacing={3}>
						HOW URGENT?
					</text>
					<rect x={0} y={0} width={400} height={14} rx={7} fill="#3B3F9A" />
					<rect x={0} y={0} width={400 * CONTRACT.urgency * all} height={14} rx={7} fill={K.orange} />
					<circle cx={400 * CONTRACT.urgency * all} cy={7} r={20} fill={K.orangeHi} />
					<text x={424} y={16} fontFamily={FONT} fontWeight={900} fontSize={28} fill={K.white}>
						{CONTRACT.urgency.toFixed(1)}
					</text>
				</g>
				{all > 0 ? <Callout from={{x: 260, y: 545}} to={{x: 200, y: 700}} title="one reading" sub="three answers, same instant" k={all} size={36} /> : null}
				<Motes f={f} />
				<Vignette />
			</svg>
			{/* the product, next to the chain rule it rhymes with */}
			<div style={{position: 'absolute', left: 1150, top: 250, fontFamily: FONT, color: K.white, opacity: eq}}>
				<div style={{fontWeight: 900, fontSize: 22, letterSpacing: 5, color: K.teal}}>JEV (AS DESCRIBED*)</div>
				<div style={{fontWeight: 800, fontSize: 34, marginTop: 10, whiteSpace: 'nowrap'}}>
					p(answers) = <Prod size={34} color={K.teal} />
					<span style={{...sub, color: K.teal}}>i</span> p(answer<span style={sub}>i</span> <span style={{color: K.mute}}>|</span> letter)
				</div>
				<div style={{fontWeight: 800, fontSize: 24, color: K.mute, marginTop: 10}}>each answer reads only the letter</div>
			</div>
			<div style={{position: 'absolute', left: 1150, top: 520, fontFamily: FONT, color: K.white, opacity: cmp}}>
				<div style={{fontWeight: 900, fontSize: 22, letterSpacing: 5, color: K.orangeHi}}>CHATBOT (CHAIN RULE)</div>
				<div style={{fontWeight: 800, fontSize: 34, marginTop: 10, whiteSpace: 'nowrap', opacity: 0.85}}>
					p(sentence) = <Prod size={34} color={K.orangeHi} />
					<span style={{...sub, color: K.orangeHi}}>t</span> p(word<span style={sub}>t</span> <span style={{color: K.mute}}>|</span> earlier words)
				</div>
				<div style={{fontWeight: 800, fontSize: 24, color: K.mute, marginTop: 10}}>each word waits for the one before it</div>
			</div>
			<div style={{position: 'absolute', left: 1150, top: 800, fontFamily: FONT, fontWeight: 700, fontSize: 18, color: K.mute, opacity: eq, maxWidth: 560}}>
				* how TypeSafe describes Jev’s design; numbers are illustrative placeholders
			</div>
		</AbsoluteFill>
	);
};

// ---------- 5. the triangle: where a three-way answer lives ----------
const TRI = {A: {x: 930, y: 760}, B: {x: 1260, y: 190}, C: {x: 1590, y: 760}}; // billing, fraud, lost card
const bary = (a: number, b: number, c: number) => ({x: a * TRI.A.x + b * TRI.B.x + c * TRI.C.x, y: a * TRI.A.y + b * TRI.B.y + c * TRI.C.y});
const TriScene: React.FC<{f: number}> = ({f}) => {
	const {hard, line} = CONTRACT;
	const letterK = easeOut(progress(f, S.tri.start + 10, S.tri.start + 30), 3);
	const pickStart = cues.C08.end;
	const inPause = f >= pickStart && f < cues.C09.start;
	const count = Math.floor(progress(f, pickStart, pickStart + PICK_PAUSE) * 3.5);
	const draw = easeInOut(progress(f, at('C09', 0.1), at('C09', 0.3)));
	const corners = easeOut(progress(f, at('C09', 0.25), at('C09', 0.35)));
	const center = pop(f, at('C09', 0.4));
	const move = easeInOut(progress(f, at('C09', 0.62), at('C09', 0.78)));
	const P0 = bary(1 / 3, 1 / 3, 1 / 3);
	const P1 = bary(hard.billing, hard.fraud, hard.lost);
	const P = {x: lerp(P0.x, P1.x, move), y: lerp(P0.y, P1.y, move)};
	const hexK = easeOut(progress(f, at('C10', 0.35), at('C10', 0.5)));
	const bell = pop(f, at('C10', 0.62), 12);
	const t = line;
	const hex = [bary(t, 1 - t, 0), bary(1 - t, t, 0), bary(0, t, 1 - t), bary(0, 1 - t, t), bary(1 - t, 0, t), bary(t, 0, 1 - t)];
	const per = draw * 3;
	const edge = (p: {x: number; y: number}, q: {x: number; y: number}, u: number) => `M ${p.x} ${p.y} L ${lerp(p.x, q.x, clamp01(u))} ${lerp(p.y, q.y, clamp01(u))}`;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={1080} />
				<Fireflies f={f} x={0} y={700} w={1920} h={300} count={10} color={K.cyan} />
				{/* the triangle */}
				<path d={`M ${TRI.A.x} ${TRI.A.y} L ${TRI.B.x} ${TRI.B.y} L ${TRI.C.x} ${TRI.C.y} Z`} fill="#2E3386" opacity={0.55 * draw} />
				<path d={`${edge(TRI.A, TRI.B, per)} ${edge(TRI.B, TRI.C, per - 1)} ${edge(TRI.C, TRI.A, per - 2)}`} fill="none" stroke="#C9CCFF" strokeWidth={5} strokeLinecap="round" />
				{hexK > 0 ? (
					<g opacity={hexK}>
						<path d={`M ${hex.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`} fill={K.teal} opacity={0.14} />
						<path d={`M ${hex.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`} fill="none" stroke={K.teal} strokeWidth={3} strokeDasharray="12 10" />
						<text x={1260} y={738} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={K.teal}>
							no answer above 60%
						</text>
					</g>
				) : null}
				{[
					{p: TRI.A, t: 'billing', dx: -30, dy: 50, a: 'end' as const},
					{p: TRI.B, t: 'fraud', dx: 44, dy: -6, a: 'start' as const},
					{p: TRI.C, t: 'lost card', dx: 30, dy: 50, a: 'start' as const},
				].map((c) => (
					<g key={c.t} opacity={corners}>
						<circle cx={c.p.x} cy={c.p.y} r={16} fill={K.white} />
						<circle cx={c.p.x} cy={c.p.y} r={34} fill={K.white} opacity={0.15} />
						<text x={c.p.x + c.dx} y={c.p.y + c.dy} textAnchor={c.a} fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>
							{c.t}
						</text>
						<text x={c.p.x + c.dx} y={c.p.y + c.dy + 28} textAnchor={c.a} fontFamily={FONT} fontWeight={800} fontSize={20} fill={K.mute}>
							100% sure
						</text>
					</g>
				))}
				{center > 0 ? (
					<g transform={`translate(${P0.x} ${P0.y})`} opacity={1 - 0.5 * move}>
						<circle r={10 * center} fill="none" stroke={K.white} strokeWidth={3} />
						<text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={K.mute} opacity={center}>
							no idea
						</text>
					</g>
				) : null}
				{move > 0 ? (
					<g>
						{/* how far the point sits toward each corner = that answer's chance */}
						{move >= 1
							? [
									{c: TRI.A, p: hard.billing, t: 'billing'},
									{c: TRI.B, p: hard.fraud, t: 'fraud'},
									{c: TRI.C, p: hard.lost, t: 'lost card'},
								].map((k, i) => (
									<g key={i} opacity={easeOut(progress(f, at('C09', 0.8) + i * 3, at('C09', 0.86) + i * 3))}>
										<line x1={P.x} y1={P.y} x2={lerp(P.x, k.c.x, 0.82)} y2={lerp(P.y, k.c.y, 0.82)} stroke={i === 1 ? K.orangeHi : '#9AA2E6'} strokeWidth={3} strokeDasharray="6 8" />
										<text x={lerp(P.x, k.c.x, 0.5) + (i === 2 ? 16 : -16)} y={lerp(P.y, k.c.y, 0.5) - 8} textAnchor={i === 2 ? 'start' : 'end'} fontFamily={FONT} fontWeight={900} fontSize={28} fill={i === 1 ? K.orangeHi : K.white} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.6)', strokeWidth: 6}}>
											{Math.round(k.p * 100)}%
										</text>
									</g>
								))
							: null}
						<circle cx={P.x} cy={P.y} r={36} fill={K.orange} opacity={0.3} filter="url(#glowBig)" />
						<circle cx={P.x} cy={P.y} r={16} fill={K.orange} />
						<circle cx={P.x - 5} cy={P.y - 5} r={5} fill="#FFE3C8" />
					</g>
				) : null}
				{bell > 0 ? (
					<g transform={`translate(${P.x + 170} ${P.y - 150}) scale(${bell}) rotate(${14 * Math.sin(f * 0.6) * (1 - progress(f, at('C10', 0.62), at('C10', 0.9)))})`}>
						<path d="M -34 20 Q -34 -34 0 -38 Q 34 -34 34 20 L 42 30 L -42 30 Z" fill={K.yellow} />
						<circle cx={0} cy={38} r={9} fill={K.yellow} />
						<rect x={-4} y={-50} width={8} height={14} rx={4} fill={K.yellow} />
					</g>
				) : null}
				{bell > 0 ? <Callout from={{x: P.x + 170, y: P.y - 130}} to={{x: P.x + 330, y: P.y - 260}} title="to a person" sub="instead of a bluff" k={progress(f, at('C10', 0.66), at('C10', 0.8))} size={38} /> : null}
				<Motes f={f} />
				<Vignette />
			</svg>
			{/* the harder letter */}
			<div style={{position: 'absolute', left: 110, top: 200, width: 560, opacity: letterK, transform: `translateY(${(1 - letterK) * 30}px) rotate(-2deg)`, background: 'linear-gradient(180deg, #FBF8FF, #ECE7FA)', padding: '34px 40px', boxShadow: '0 30px 60px rgba(5,8,32,0.6)', fontFamily: FONT, color: K.navy, borderRadius: 6}}>
				<div style={{fontWeight: 800, fontSize: 18, color: '#7A7AA8', letterSpacing: 1}}>to: support</div>
				<div style={{fontWeight: 900, fontSize: 38, lineHeight: 1.25, marginTop: 14}}>{hard.text}</div>
			</div>
			<div style={{position: 'absolute', left: 110, top: 540}}>
				<Kin k={pop(f, at('C08', 0.6))} size={40}>
					billing, <span style={{color: K.orangeHi}}>fraud</span> or lost card?
				</Kin>
			</div>
			{inPause ? (
				<div style={{position: 'absolute', left: 250, top: 660, fontFamily: FONT}}>
					<svg width={150} height={150} viewBox="-75 -75 150 150">
						<circle r={62} fill="none" stroke="#3B3F9A" strokeWidth={10} />
						<circle r={62} fill="none" stroke={K.teal} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${389.6 * (1 - progress(f, pickStart, cues.C09.start))} 400`} transform="rotate(-90)" />
						<text y={22} textAnchor="middle" fontWeight={900} fontSize={64} fill={K.white}>
							{Math.max(1, 3 - count)}
						</text>
					</svg>
					<div style={{textAlign: 'center', fontWeight: 800, fontSize: 22, color: K.mute, marginTop: 6}}>make your pick</div>
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
					<Projected x={1100} y={190} text="0.91" size={110} k={num} sub="SCAM, SAYS JEV" />
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
								100 letters Jev called 91%:
							</text>
							<text x={0} y={392} fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.orangeHi} opacity={progress(f, at('C11', 0.6), at('C11', 0.68))}>
								91 scams? <tspan fill={K.white}>that’s the promise</tspan>
							</text>
						</g>
					) : null}
				</Harbor>
			</svg>
			{name > 0 ? (
				<div style={{position: 'absolute', left: 700, width: 620, top: 440, textAlign: 'center', fontFamily: FONT, transform: `scale(${name})`}}>
					<div style={{fontWeight: 900, fontSize: 24, letterSpacing: 8, color: K.teal}}>ITS NAME</div>
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
					Draft · Jev’s numbers are illustrative placeholders · voice: Kokoro-82M · made with Remotion
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
		{span: S.tri, render: (x) => <TriScene f={x} />},
		{span: S.close, render: (x) => <CloseScene f={x} />},
		{span: S.endcard, render: (x) => <Card f={x - S.endcard.start} next />},
	];
	const line = contract.vo.find((l) => f >= cues[l.id].start - 2 && f < cues[l.id].end + 8);
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
			{line ? <FlatSubtitle text={line.text} /> : null}
			<Grain id="contractGrain" opacity={0.06} freq={0.8} seed={(f % 5) + 1} />
			{f < S.endcard.start ? (
				<div style={{position: 'absolute', right: 40, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 3, color: K.mute, border: `2px solid ${K.indigoHi}`, borderRadius: 14, padding: '4px 12px', opacity: 0.8}}>DRAFT · ILLUSTRATIVE NUMBERS</div>
			) : null}
			<Audio src={staticFile('audio/contract-track.wav')} />
		</AbsoluteFill>
	);
};
