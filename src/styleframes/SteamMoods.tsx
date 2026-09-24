import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Expr, lerpExpr, MOODS, SteamMood, SteamPress} from '../characters/steam';
import {Livery} from '../characters/trains';
import {FONT, FlatDefs, K, Motes, Stars, Vignette} from '../flat/kit';
import {RailDefs, SideTrack, Terrain} from '../flat/rail';
import {Clouds, Fireflies, Moon, Mountains, WorldDefs} from '../flat/world';

const LINES: Record<SteamMood, string> = {
	happy: '“Great question!”',
	curious: 'a new prompt arrives',
	proud: 'a fluent, confident answer',
	determined: 'full steam, word after word',
	nervous: 'the odds are getting thin',
	panic: 'the track runs out',
	sad: 'it can’t take a word back',
	dazed: 'after the lake',
};
const ORDER: SteamMood[] = ['happy', 'curious', 'proud', 'determined', 'nervous', 'panic', 'sad', 'dazed'];

// 4 × 2 expression sheet for one livery.
export const SteamMoodSheet: React.FC<{livery: Livery}> = ({livery}) => {
	const f = useCurrentFrame() + 40;
	const top = 120;
	const cw = 480;
	const ch = (1080 - top) / 2;
	const accent = livery === 'gpt' ? K.teal : '#FFB08A';
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<RailDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={1080} />
				{ORDER.map((m, i) => {
					const x = (i % 4) * cw;
					const y = top + Math.floor(i / 4) * ch;
					const rail = ch - 96;
					return (
						<g key={m} transform={`translate(${x} ${y})`}>
							<clipPath id={`cell${i}`}>
								<rect x={8} y={8} width={cw - 16} height={ch - 16} rx={22} />
							</clipPath>
							<g clipPath={`url(#cell${i})`}>
								<rect x={0} y={0} width={cw} height={ch} fill="#1A1F5C" opacity={0.55} />
								<circle cx={cw * 0.6} cy={rail - 60} r={210} fill="url(#gSun)" opacity={0.5} />
								<Mountains y={rail - 40} seed={3 + i} layers={1} />
								<Terrain line={[[-100, rail + 14], [cw + 100, rail + 14]]} bottom={ch + 40} f={f} seed={i + 2} />
								<SideTrack pieces={Array.from({length: 5}, (_, k) => ({x: -40 + k * 150, y: rail, angle: 0, len: 151}))} f={f} glint={false} />
								<g transform={`translate(${cw - 120} ${rail - 3})`}>
									<SteamPress livery={livery} f={f + i * 13} s={1.1} mood={m} blink={false} />
								</g>
							</g>
							<rect x={8} y={8} width={cw - 16} height={ch - 16} rx={22} fill="none" stroke="#8C7AD6" strokeWidth={2} opacity={0.35} />
							<text x={34} y={ch - 50} fontFamily={FONT} fontWeight={900} fontSize={32} fill={K.white}>
								{m}
							</text>
							<text x={34} y={ch - 22} fontFamily={FONT} fontWeight={800} fontSize={20} fill={K.mute}>
								{LINES[m]}
							</text>
						</g>
					);
				})}
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 44, top: 34, fontFamily: FONT, textShadow: '0 4px 16px rgba(5,8,32,0.7)'}}>
				<div style={{fontWeight: 900, fontSize: 22, letterSpacing: 8, color: accent}}>OPTION B · {livery === 'gpt' ? 'CHATGPT-INSPIRED' : 'CLAUDE-INSPIRED'}</div>
				<div style={{fontWeight: 900, fontSize: 58, color: K.white, lineHeight: 1.1}}>Steam Press · expressions</div>
			</div>
			<div style={{position: 'absolute', right: 48, top: 44, width: 1000, textAlign: 'right', fontFamily: FONT, fontWeight: 800, fontSize: 21, color: K.mute, lineHeight: 1.4}}>
				headlamp eye with lids and a hood for a brow · smokebox-door mouth that glows with the fire when it opens · lean, bounce, shake, smoke, valves and whistle act too
			</div>
		</AbsoluteFill>
	);
};

export const SteamMoodsClaude: React.FC = () => <SteamMoodSheet livery="claude" />;
export const SteamMoodsGpt: React.FC = () => <SteamMoodSheet livery="gpt" />;

// ---- acting test: both engines run through the story's emotional arc ----
const ARC: [SteamMood, number][] = [
	['curious', 0],
	['happy', 40],
	['determined', 84],
	['nervous', 132],
	['panic', 180],
	['dazed', 226],
	['sad', 262],
];
export const ACT_FRAMES = 312;
const BLEND = 10;
const ease = (t: number) => t * t * (3 - 2 * t);

const exprAt = (f: number): Expr => {
	let i = 0;
	while (i + 1 < ARC.length && f >= ARC[i + 1][1]) i++;
	const cur = MOODS[ARC[i][0]];
	if (i === 0) return cur;
	const t = Math.min(1, (f - ARC[i][1]) / BLEND);
	return lerpExpr(MOODS[ARC[i - 1][0]], cur, ease(t));
};
const moodAt = (f: number) => {
	let i = 0;
	while (i + 1 < ARC.length && f >= ARC[i + 1][1]) i++;
	return {m: ARC[i][0], start: ARC[i][1]};
};
// integrate speed and smoke rate so mood changes never make wheels or smoke jump
const clocks = (f: number) => {
	let dist = 0;
	let smoke = 0;
	for (let k = 0; k < f; k++) {
		const e = exprAt(k);
		dist += e.speed;
		smoke += 0.012 * e.rate;
	}
	return {dist, smoke};
};

export const SteamActing: React.FC = () => {
	const f = useCurrentFrame();
	const lag = 7;
	const eNear = exprAt(f);
	const eFar = exprAt(Math.max(0, f - lag));
	const cNear = clocks(f);
	const cFar = clocks(Math.max(0, f - lag));
	const farY = 600;
	const nearY = 900;
	const scroll = (v: number, sp: number) => -((v * sp) % 150);
	const {m, start} = moodAt(f);
	const a = Math.min(1, (f - start) / 8);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<RailDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={520} />
				<Moon x={1540} y={130} r={40} />
				<circle cx={900} cy={560} r={320} fill="url(#gSun)" opacity={0.85} />
				<Clouds f={f} y={140} count={4} seed={5} opacity={0.9} />
				<Mountains y={560} seed={3} layers={2} shift={cNear.dist * 1.2} />
				<Terrain line={[[-100, farY + 14], [2020, farY + 14]]} bottom={1200} f={f} seed={2} />
				<SideTrack pieces={Array.from({length: 15}, (_, i) => ({x: scroll(cFar.dist, 3) - 40 + i * 150, y: farY, angle: 0, len: 151}))} f={f} />
				<g transform={`translate(1180 ${farY - 3})`}>
					<SteamPress livery="gpt" f={f + 17} s={0.8} expr={eFar} dist={cFar.dist} smokeT={cFar.smoke} />
				</g>
				<Terrain line={[[-100, nearY + 14], [2020, nearY + 14]]} bottom={1200} f={f} seed={7} />
				<SideTrack pieces={Array.from({length: 15}, (_, i) => ({x: scroll(cNear.dist, 4) - 40 + i * 150, y: nearY, angle: 0, len: 151}))} f={f} />
				<g transform={`translate(1500 ${nearY - 3})`}>
					<SteamPress livery="claude" f={f} s={1.3} expr={eNear} dist={cNear.dist} smokeT={cNear.smoke} />
				</g>
				<Fireflies f={f} x={0} y={640} w={1920} h={180} count={12} />
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT, textShadow: '0 4px 16px rgba(5,8,32,0.7)'}}>
				<div style={{fontWeight: 900, fontSize: 24, letterSpacing: 8, color: K.teal}}>OPTION B · ACTING TEST</div>
				<div style={{fontWeight: 900, fontSize: 76, color: K.white, lineHeight: 1.05, opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>{m}</div>
				<div style={{fontWeight: 800, fontSize: 28, color: K.mute, marginTop: 6, opacity: a}}>{LINES[m]}</div>
			</div>
		</AbsoluteFill>
	);
};
