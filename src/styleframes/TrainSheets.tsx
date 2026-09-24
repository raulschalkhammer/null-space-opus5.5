import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BulletStream, SteamPress, TypewriterExpress} from '../characters/trains';
import {FONT, FlatDefs, K, Motes, Stars, Vignette} from '../flat/kit';
import {RailDefs, SideTrack, Terrain} from '../flat/rail';
import {Callout} from '../flat/type';
import {Clouds, Fireflies, Moon, Mountains, WorldDefs} from '../flat/world';

type Opt = 'A' | 'B' | 'C';
const META: Record<Opt, {name: string; line: string; notes: {from: [number, number]; to: [number, number]; title: string; sub: string; anchor?: 'start' | 'end'}[]; far: number; near: number}> = {
	A: {
		name: 'Typewriter Express',
		line: 'keeps the writing machine · expressive face · types its words onto a ticker tape',
		far: 1000,
		near: 1560,
		notes: [
			{from: [972, 505], to: [1100, 380], title: 'eyes and brows react', sub: 'happy, worried at the edge, dazed in the lake'},
			{from: [620, 390], to: [520, 330], title: 'its answer trails behind', sub: 'every typed word stays on the tape', anchor: 'end'},
			{from: [1420, 800], to: [1260, 960], title: 'same anatomy, two liveries', sub: 'graphite and green / terracotta and cream', anchor: 'end'},
		],
	},
	B: {
		name: 'Steam Press',
		line: 'a classic engine · the headlamp is its only eye · the smoke is made of words',
		far: 1300,
		near: 1560,
		notes: [
			{from: [1150, 350], to: [960, 310], title: 'words rise as smoke', sub: 'one puff per word, one word per pass', anchor: 'end'},
			{from: [1320, 463], to: [1880, 270], title: 'the headlamp does the acting', sub: 'bright, flickering, then dark in the lake', anchor: 'end'},
			{from: [1180, 748], to: [760, 680], title: 'the tender is a printing press', sub: 'rollers print the sentence onto paper', anchor: 'end'},
		],
	},
	C: {
		name: 'Bullet Stream',
		line: 'sleek and modern · no face · the words it writes scroll along its side',
		far: 1380,
		near: 1640,
		notes: [
			{from: [1250, 541], to: [900, 380], title: 'an LED marquee', sub: 'the generated words stream along the train', anchor: 'end'},
			{from: [1468, 553], to: [1580, 380], title: 'no face at all', sub: 'the nose light is its only expression'},
			{from: [1720, 740], to: [1500, 660], title: 'feels like today’s AI products', sub: 'clean, fast, and still one word at a time', anchor: 'end'},
		],
	},
};

const Train: React.FC<{opt: Opt; livery: 'gpt' | 'claude'; f: number; s: number}> = ({opt, livery, f, s}) =>
	opt === 'A' ? <TypewriterExpress livery={livery} f={f} s={s} mood={livery === 'claude' ? 'worried' : 'happy'} /> : opt === 'B' ? <SteamPress livery={livery} f={f} s={s} /> : <BulletStream livery={livery} f={f} s={s} />;

export const TrainSheet: React.FC<{opt: Opt}> = ({opt}) => {
	const f = useCurrentFrame() + 40;
	const m = META[opt];
	const farY = 610;
	const nearY = 870;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<RailDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={520} />
				<Moon x={1500} y={130} r={40} />
				<circle cx={900} cy={560} r={320} fill="url(#gSun)" opacity={0.85} />
				<Clouds f={f} y={140} count={4} seed={5} opacity={0.9} />
				<Mountains y={560} seed={3} layers={2} />
				{/* far track: ChatGPT-inspired */}
				<Terrain line={[[-100, farY + 14], [2020, farY + 14]]} bottom={1200} f={f} seed={2} />
				<SideTrack pieces={Array.from({length: 14}, (_, i) => ({x: -40 + i * 150, y: farY, angle: 0, len: 151}))} f={f} />
				<g transform={`translate(${m.far} ${farY - 3})`}>
					<Train opt={opt} livery="gpt" f={f} s={0.78} />
				</g>
				{/* near track: Claude-inspired */}
				<Terrain line={[[-100, nearY + 14], [2020, nearY + 14]]} bottom={1200} f={f} seed={7} />
				<SideTrack pieces={Array.from({length: 14}, (_, i) => ({x: -40 + i * 150, y: nearY, angle: 0, len: 151}))} f={f} />
				<g transform={`translate(${m.near} ${nearY - 3})`}>
					<Train opt={opt} livery="claude" f={f + 17} s={1} />
				</g>
				<Fireflies f={f} x={0} y={640} w={1920} h={180} count={12} />
				{m.notes.map((n, i) => (
					<Callout key={i} from={{x: n.from[0], y: n.from[1]}} to={{x: n.to[0], y: n.to[1]}} title={n.title} sub={n.sub} k={1} size={30} anchor={n.anchor ?? 'start'} />
				))}
				<text x={40} y={farY - 30} fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={4} fill={K.teal} opacity={0.9}>
					CHATGPT-INSPIRED
				</text>
				<text x={40} y={nearY - 40} fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={4} fill="#FFB08A" opacity={0.95}>
					CLAUDE-INSPIRED
				</text>
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT, textShadow: '0 4px 16px rgba(5,8,32,0.7)'}}>
				<div style={{fontWeight: 900, fontSize: 24, letterSpacing: 8, color: K.teal}}>OPTION {opt}</div>
				<div style={{fontWeight: 900, fontSize: 76, color: K.white, lineHeight: 1.05}}>{m.name}</div>
				<div style={{fontWeight: 800, fontSize: 26, color: K.mute, marginTop: 6}}>{m.line}</div>
			</div>
		</AbsoluteFill>
	);
};

export const TrainSheetA: React.FC = () => <TrainSheet opt="A" />;
export const TrainSheetB: React.FC = () => <TrainSheet opt="B" />;
export const TrainSheetC: React.FC = () => <TrainSheet opt="C" />;
