import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rng} from '../../fx/rough';
import {FONT, FlatDefs, K, Motes, Stars, Vignette} from '../../flat/kit';
import {Callout} from '../../flat/type';
import {Equation} from '../../flat/math';
import {Clouds, Moon, Mountains, WorldDefs} from '../../flat/world';
import {SteamPress} from '../../characters/steam';
import {GUESS_PAUSE, clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import type {FlatFilm} from './timeline';
import {withLook} from './trainMood';

// Curiosity beats: the viewer guesses before the reveal, a historical moment, and an on-screen experiment.

const pop = (f: number, at: number, len = 10) => {
	const k = progress(f, at, at + len);
	return k <= 0 ? 0 : easeOut(k, 3) * (1 + 0.18 * Math.sin(Math.PI * k));
};

const Sky: React.FC<{f: number; horizon?: number}> = ({f, horizon = 760}) => (
	<>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={horizon - 160} />
		<Moon x={1640} y={140} r={34} />
		<circle cx={960} cy={horizon} r={340} fill="url(#gSun)" opacity={0.6} />
		<Clouds f={f} y={170} count={3} seed={21} opacity={0.7} />
		<Mountains y={horizon - 40} seed={9} layers={2} />
		<rect x={-60} y={horizon} width={2040} height={400} fill="#1E2466" />
	</>
);

const Kin: React.FC<{k: number; children: React.ReactNode; size?: number; color?: string; weight?: number}> = ({k, children, size = 56, color = K.white, weight = 900}) =>
	k <= 0 ? null : (
		<div style={{opacity: Math.min(1, k), transform: `translateY(${(1 - Math.min(1, k)) * 18}px) scale(${0.94 + 0.06 * Math.min(1, k)})`, fontFamily: FONT, fontWeight: weight, fontSize: size, color, lineHeight: 1.15, textShadow: '0 4px 18px rgba(5,8,32,0.6)'}}>{children}</div>
	);

// ---------- guess first: twenty safe bets ----------
export const GuessScene: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues} = film;
	const g1 = cues.G01;
	const g2 = cues.G02;
	const at = (u: number) => g1.start + (g1.end - g1.start) * u;
	const N = 20;
	const P = 0.8;
	const x0 = 380;
	const seg = 72;
	const H0 = 200;
	const cy = 640;
	const reveal = progress(f, g2.start + 6, g2.start + 6 + 60);
	const done = reveal * N;
	const hAt = (i: number) => H0 * Math.pow(P, Math.min(i, done)); // height at the left edge of segment i
	const cum = Math.pow(P, done);
	const count = Math.floor(progress(f, g1.end, g1.end + GUESS_PAUSE) * 3.5);
	const inPause = f >= g1.end && f < g2.start;
	const final = pop(f, g2.start + 70, 12);
	const worried = clamp01(reveal * 1.4);
	const face = withLook('curious', 0.9, 0.2);
	const expr = {...face, ...(worried > 0.5 ? withLook('nervous', 0.9, 0.3) : {})};
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Sky f={f} />
				{/* the sentence as track: each word keeps 80% of the width */}
				{Array.from({length: N}, (_, i) => {
					const xa = x0 + i * seg;
					const xb = xa + seg;
					const ha = hAt(i);
					const hb = hAt(i + 1);
					const lit = done > i;
					return (
						<g key={i}>
							<path d={`M ${xa} ${cy - ha / 2} L ${xb} ${cy - hb / 2} L ${xb} ${cy + hb / 2} L ${xa} ${cy + ha / 2} Z`} fill={lit ? K.orange : '#3B3F9A'} opacity={lit ? 0.95 : 0.8} />
							<path d={`M ${xa} ${cy - ha / 2} L ${xb} ${cy - hb / 2}`} stroke={lit ? '#FFD7A8' : '#6A6FD0'} strokeWidth={3} />
							<line x1={xb} y1={cy - hb / 2} x2={xb} y2={cy + hb / 2} stroke="#1E2466" strokeWidth={3} />
							<text x={xa + seg / 2} y={cy - H0 / 2 - 18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={lit ? K.orangeHi : K.mute} opacity={easeOut(progress(f, at(0.3) + i * 1.5, at(0.3) + i * 1.5 + 8))}>
								80%
							</text>
						</g>
					);
				})}
				<path d={`M ${x0} ${cy - H0 / 2} L ${x0} ${cy + H0 / 2}`} stroke="#FFD7A8" strokeWidth={4} />
				<rect x={x0 - 190} y={cy + 110} width={200} height={12} rx={6} fill="#14151B" opacity={0.6} />
				<g transform={`translate(${x0 - 20} ${cy + 112})`}>
					<SteamPress livery="claude" f={f} s={0.52} expr={expr} speech={[]} dist={0} smokeT={f * 0.012} />
				</g>
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 120, top: 110}}>
				<Kin k={pop(f, at(0.1))} size={30} color={K.teal}>
					<span style={{letterSpacing: 6}}>GUESS</span>
				</Kin>
				<Kin k={pop(f, at(0.62))} size={80}>
					<span style={{color: K.orangeHi}}>{f < g2.start + 6 ? '?' : `${(cum * 100).toFixed(cum > 0.1 ? 0 : 2)}%`}</span>
				</Kin>
			</div>
			{inPause ? (
				<div style={{position: 'absolute', left: 1500, top: 140, width: 150, height: 150, fontFamily: FONT}}>
					<svg width={150} height={150} viewBox="-75 -75 150 150">
						<circle r={62} fill="none" stroke="#3B3F9A" strokeWidth={10} />
						<circle r={62} fill="none" stroke={K.teal} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${389.6 * (1 - progress(f, g1.end, g2.start))} 400`} transform="rotate(-90)" />
						<text y={22} textAnchor="middle" fontWeight={900} fontSize={64} fill={K.white}>
							{Math.max(1, 3 - count)}
						</text>
					</svg>
				</div>
			) : null}
			{final > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center'}}>
					<Equation
						size={70}
						terms={[
							{tex: '0.8^{20}', k: final, color: K.orangeHi, label: 'words', labelK: final},
							{tex: '\\approx', k: final, color: K.mute},
							{tex: '0.0115', k: final},
						]}
					/>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- 1951: Shannon's guessing game ----------
const PHRASE = 'IS THIS EMAIL A SCAM';
const GUESSES = [3, 1, 1, 6, 1, 1, 1, 1, 4, 2, 1, 1, 1, 1, 2, 1, 5, 1, 1, 1]; // illustrative
export const ShannonScene: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues, S} = film;
	const s1 = cues.SH01;
	const s2 = cues.SH02;
	const at1 = (u: number) => s1.start + (s1.end - s1.start) * u;
	const at2 = (u: number) => s2.start + (s2.end - s2.start) * u;
	const letters = PHRASE.split('');
	const tileStart = at1(0.7);
	const per = Math.max(3, Math.floor((at2(0.35) - tileStart) / letters.length));
	const words = easeInOut(progress(f, at2(0.55), at2(0.72)));
	const push = lerp(1, 1.06, progress(f, S.shannon.start, S.shannon.end));
	const lamp = 0.85 + 0.15 * Math.sin(f * 0.07);
	// letters slide together into words for "with words instead of letters"
	let wi = 0;
	const layout = letters.map((ch, i) => {
		if (ch === ' ') wi++;
		return {ch, i, w: wi};
	});
	const TW = 62;
	const gapBase = 10;
	const xStart = 960 - (letters.length * (TW + gapBase)) / 2;
	return (
		<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<defs>
					<linearGradient id="gRoom" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2B1E4E" />
						<stop offset="1" stopColor="#4A2F5A" />
					</linearGradient>
					<radialGradient id="gDesk" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#FFD98A" stopOpacity={0.55} />
						<stop offset="1" stopColor="#FFD98A" stopOpacity={0} />
					</radialGradient>
				</defs>
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gRoom)" />
				{/* floor, window onto the night, bookshelf, chalkboard of letter frequencies */}
				<rect x={-60} y={820} width={2040} height={400} fill="#2A1C40" />
				<rect x={-60} y={816} width={2040} height={8} fill="#5E3E62" opacity={0.6} />
				<defs>
					<clipPath id="shWin">
						<rect x={1440} y={130} width={360} height={290} rx={14} />
					</clipPath>
				</defs>
				<rect x={1440} y={130} width={360} height={290} rx={14} fill="#161A4A" />
				<g clipPath="url(#shWin)">
					<Stars f={f} count={120} maxY={1080} seed={31} />
					<circle cx={1720} cy={200} r={26} fill="#EEF0FF" opacity={0.9} />
				</g>
				<rect x={1440} y={130} width={360} height={290} rx={14} fill="none" stroke="#6A4A7A" strokeWidth={14} />
				<line x1={1620} y1={130} x2={1620} y2={420} stroke="#6A4A7A" strokeWidth={10} />
				{[0, 1, 2].map((r) => (
					<g key={r}>
						<rect x={110} y={560 + r * 100} width={380} height={12} fill="#5E3E62" />
						{Array.from({length: 10}, (_, i) => (
							<rect key={i} x={120 + i * 36} y={560 + r * 100 - 64 - ((i * 13 + r * 7) % 20)} width={27} height={64 + ((i * 13 + r * 7) % 20)} rx={3} fill={['#8C5A6E', '#6E4A86', '#B07A5A', '#5A6E9A'][(i + r) % 4]} />
						))}
					</g>
				))}
				<g transform="translate(830 110)">
					<rect x={-14} y={-14} width={448} height={268} rx={12} fill="#7A4E3A" />
					<rect x={0} y={0} width={420} height={240} rx={6} fill="#2E4A48" />
					{['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H'].map((ch, i) => {
						const h = [12.7, 9.1, 8.2, 7.5, 7.0, 6.7, 6.3, 6.1][i] * 11;
						const k = easeOut(progress(f, S.shannon.start + 10 + i * 3, S.shannon.start + 30 + i * 3));
						return (
							<g key={ch}>
								<rect x={34 + i * 48} y={200 - h * k} width={30} height={h * k} rx={4} fill="#DCE8E0" opacity={0.75} />
								<text x={49 + i * 48} y={228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#DCE8E0">{ch}</text>
							</g>
						);
					})}
				</g>
				{/* desk, lamp, figure */}
				<ellipse cx={1010} cy={560} rx={520} ry={260} fill="url(#gDesk)" opacity={lamp} />
				<rect x={560} y={590} width={900} height={30} rx={10} fill="#7A4E3A" />
				<rect x={600} y={620} width={24} height={200} fill="#5E3A2C" />
				<rect x={1396} y={620} width={24} height={200} fill="#5E3A2C" />
				<path d="M 1300 590 L 1320 470 L 1260 420" stroke="#C9A35A" strokeWidth={8} fill="none" strokeLinecap="round" />
				<path d="M 1220 400 L 1300 400 L 1280 440 L 1240 440 Z" fill="#E0B85A" />
				<circle cx={1260} cy={446} r={16} fill="#FFF1C0" filter="url(#glow)" />
				<rect x={900} y={574} width={180} height={18} rx={3} fill="#F3EEE3" transform="rotate(-4 990 583)" />
				<g transform="translate(760 590)">
					<path d="M -70 0 Q -80 -140 0 -150 Q 80 -140 70 0 Z" fill="#2A2350" />
					<circle cx={0} cy={-190} r={44} fill="#2A2350" />
					<path d="M 40 -90 Q 120 -60 160 -20" stroke="#2A2350" strokeWidth={26} strokeLinecap="round" fill="none" />
					<path d="M -44 -196 A 44 44 0 0 1 30 -226" fill="none" stroke="#C9A35A" strokeWidth={4} opacity={0.7} />
				</g>
				<Callout from={{x: 740, y: 430}} to={{x: 560, y: 300}} title="Shannon" sub="1951" k={progress(f, at1(0.25), at1(0.45))} size={40} anchor="end" />
				{/* the guessing game: one tile per letter, the number of guesses it took underneath */}
				{layout.map(({ch, i, w}) => {
					const t = tileStart + i * per;
					const k = pop(f, t, 8);
					if (k <= 0) return null;
					const x = xStart + i * (TW + gapBase) - words * (i - w) * gapBase * 0.9 + words * w * 14;
					const g = GUESSES[i];
					const space = ch === ' ';
					return (
						<g key={i} transform={`translate(${x} 760) scale(${k})`}>
							{space ? (
								<rect x={4} y={10} width={TW - 8} height={60} rx={10} fill="#3A2C5E" opacity={0.5 * (1 - words)} />
							) : (
								<>
									<rect x={0} y={0} width={TW} height={80} rx={12} fill="#F3EEE3" />
									<rect x={0} y={62} width={TW} height={18} rx={6} fill="#E2D6C2" />
									<text x={TW / 2} y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#3A2340">
										{ch}
									</text>
								</>
							)}
							<text x={TW / 2} y={126} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={g === 1 ? K.teal : K.orangeHi} opacity={1 - words}>
								{g}
							</text>
						</g>
					);
				})}
				<text x={960} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={K.mute} opacity={easeOut(progress(f, tileStart + 30, tileStart + 50)) * (1 - words)}>
					guesses
				</text>
				<Motes f={f} color={K.yellow} count={16} seed={5} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 1020, top: 700, opacity: easeOut(progress(f, at2(0.1), at2(0.22))) * (1 - words)}}>
				<Kin k={1} size={30} color={K.teal}>
					<span style={{letterSpacing: 4}}>PREDICTABLE</span>
				</Kin>
			</div>
		</AbsoluteFill>
	);
};

// ---------- the experiment: a hundred runs through the "totally" junction ----------
const LANES = [
	{t: 'like', p: 0.46},
	{t: 'suspicious', p: 0.31},
	{t: 'very', p: 0.09},
	{t: 'totally', p: 0.04},
	{t: 'others', p: 0.1},
];
const DRAWS = (() => {
	// exactly the expected counts, in a shuffled order: an honest simulation at the odds shown
	const bag: number[] = [];
	LANES.forEach((l, i) => {
		for (let n = 0; n < Math.round(l.p * 100); n++) bag.push(i);
	});
	const r = rng(77);
	for (let i = bag.length - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[bag[i], bag[j]] = [bag[j], bag[i]];
	}
	return bag;
})();

export const RunsScene: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues} = film;
	const r1 = cues.R01;
	const r2 = cues.R02;
	const t0 = r1.end + 4;
	const mouthL = 520;
	const mouthW = 880;
	const mouthY = 250;
	const tubeTop = 470;
	const tubeBot = 810;
	const tubeW = 130;
	const tubeX = (i: number) => 960 + (i - 2) * 200;
	let acc = 0;
	const mouth = LANES.map((l) => {
		const a = mouthL + acc * mouthW;
		acc += l.p;
		return {a, b: mouthL + acc * mouthW};
	});
	const counts = LANES.map(() => 0);
	const MR = 11;
	const marbles = DRAWS.map((lane, n) => {
		const slot = counts[lane]++;
		const born = t0 + n * 1.05;
		const k = progress(f, born, born + 26);
		if (k <= 0) return null;
		const r = rng(n + 5);
		const mx = lerp(mouth[lane].a + 6, mouth[lane].b - 6, r());
		const col = slot % 5;
		const row = Math.floor(slot / 5);
		const sx = tubeX(lane) - 2 * 2 * MR + col * 2 * MR;
		const sy = tubeBot - MR - row * 2 * MR;
		let x: number;
		let y: number;
		if (k < 0.3) {
			const u = k / 0.3;
			x = lerp(960, mx, u);
			y = lerp(130, mouthY, easeIn(u, 2));
		} else if (k < 0.65) {
			const u = (k - 0.3) / 0.35;
			x = lerp(mx, tubeX(lane), easeInOut(u));
			y = lerp(mouthY, tubeTop, u);
		} else {
			const u = (k - 0.65) / 0.35;
			x = lerp(tubeX(lane), sx, u);
			y = lerp(tubeTop, sy, easeIn(u, 2));
		}
		return {x, y, lane, landed: k >= 1};
	});
	const landed = LANES.map((_, i) => marbles.filter((m) => m && m.landed && m.lane === i).length);
	const hot = pop(f, r2.start + 10, 14);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Sky f={f} horizon={1000} />
				{/* funnel and the junction mouth, widths = odds */}
				<path d={`M 880 120 L 1040 120 L ${mouthL + mouthW} ${mouthY - 40} L ${mouthL} ${mouthY - 40} Z`} fill="#2E3386" opacity={0.9} />
				{LANES.map((l, i) => {
					const m = mouth[i];
					const x = tubeX(i);
					const isHot = l.t === 'totally';
					return (
						<g key={l.t}>
							<path
								d={`M ${m.a} ${mouthY - 40} L ${m.b} ${mouthY - 40} L ${m.b} ${mouthY} C ${m.b} ${mouthY + 140} ${x + tubeW / 2} ${tubeTop - 120} ${x + tubeW / 2} ${tubeTop} L ${x - tubeW / 2} ${tubeTop} C ${x - tubeW / 2} ${tubeTop - 120} ${m.a} ${mouthY + 140} ${m.a} ${mouthY} Z`}
								fill={isHot ? K.orange : '#3B3F9A'}
								opacity={isHot ? 0.55 + 0.35 * hot : 0.55}
							/>
							<line x1={m.b} y1={mouthY - 40} x2={m.b} y2={mouthY} stroke="#1E2466" strokeWidth={3} />
							{/* glass tube */}
							<rect x={x - tubeW / 2} y={tubeTop} width={tubeW} height={tubeBot - tubeTop} rx={18} fill="#FFFFFF" opacity={0.06} />
							<rect x={x - tubeW / 2} y={tubeTop} width={tubeW} height={tubeBot - tubeTop} rx={18} fill="none" stroke={isHot ? K.orangeHi : '#9AA2E6'} strokeWidth={isHot ? 4 : 3} opacity={0.8} />
							<rect x={x - tubeW / 2 + 10} y={tubeTop + 14} width={6} height={tubeBot - tubeTop - 40} rx={3} fill="#FFFFFF" opacity={0.25} />
							<text x={x} y={tubeBot + 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={isHot ? K.orangeHi : K.white}>
								{l.t}
							</text>
							<text x={x} y={tubeBot + 80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={K.mute}>
								{Math.round(l.p * 100)}%
							</text>
							<text x={x} y={tubeTop - 18 - (i === 3 ? 0 : 0)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={isHot ? K.orangeHi : K.white} opacity={f >= t0 ? 1 : 0}>
								{landed[i]}
							</text>
						</g>
					);
				})}
				{marbles.map((m, n) =>
					m ? (
						<g key={n}>
							<circle cx={m.x} cy={m.y} r={MR} fill={m.lane === 3 ? K.orange : '#E8B06A'} />
							<circle cx={m.x - 3.5} cy={m.y - 3.5} r={3.5} fill="#FFF3D6" opacity={0.9} />
						</g>
					) : null,
				)}
				{hot > 0 ? <Callout from={{x: tubeX(3), y: tubeBot - 60}} to={{x: tubeX(3) + 290, y: 380}} title="4 / 100" k={hot} size={46} /> : null}
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 110, top: 110}}>
				<Kin k={pop(f, r1.end - 20)} size={72}>
					<span style={{color: K.orangeHi}}>100 runs</span>
				</Kin>
			</div>
			<div style={{position: 'absolute', left: 112, top: 300, fontFamily: FONT, fontWeight: 700, fontSize: 18, color: K.mute, opacity: progress(f, t0, t0 + 20)}}>
				simulated
			</div>
		</AbsoluteFill>
	);
};
