import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT, FlatDefs, FlatLighthouse, K, Motes, Stars, Vignette} from '../../flat/kit';
import {Callout, Kinetic, Projected} from '../../flat/type';
import {City, Clouds, Fireflies, Foliage, Moon, Mountains, Rock, WorldDefs} from '../../flat/world';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import type {FlatFilm} from './timeline';

const LH = {x: 1600, y: 610, s: 1.5};
const LAMP = {x: LH.x, y: LH.y - 127 * LH.s};

const Cliff: React.FC = () => (
	<g>
		<path d="M 1290 1080 L 1330 830 L 1390 700 L 1470 640 L 1920 626 L 1920 1080 Z" fill="#1E2466" />
		<path d="M 1330 830 L 1390 700 L 1470 640 L 1520 650 L 1440 760 L 1400 900 L 1360 1080 L 1290 1080 Z" fill="#343C96" />
		<path d="M 1470 640 L 1920 626 L 1920 650 L 1520 664 Z" fill="#4B55B8" />
		<path d="M 1560 700 L 1640 690 L 1700 760 L 1590 790 Z" fill="#282E80" />
		<path d="M 1700 820 L 1800 800 L 1860 900 L 1740 930 Z" fill="#282E80" />
	</g>
);

const Coin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<ellipse cx={0} cy={6} rx={30} ry={10} fill="#C98A1A" />
		<rect x={-30} y={-2} width={60} height={8} fill="#C98A1A" />
		<ellipse cx={0} cy={-2} rx={30} ry={10} fill={K.yellow} />
		<ellipse cx={0} cy={-2} rx={18} ry={5.5} fill="none" stroke="#E0A92E" strokeWidth={3} />
	</g>
);

export const NewsScene: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues, S} = film;
	const n1 = cues.N01;
	const n2 = cues.N02;
	const n3 = cues.N03;
	const n4 = cues.N04;
	const lamp = easeOut(progress(f, n2.start + 8, n2.start + 22), 2);
	// J-E-V rises out of the sea
	const jev = (i: number) => easeOut(progress(f, n2.start + 4 + i * 6, n2.start + 26 + i * 6), 3) * (1 - 0.55 * easeInOut(progress(f, n3.start + 4, n3.start + 24))) * (1 - easeIn(progress(f, n4.start + 10 + i * 4, n4.start + 40 + i * 4), 2));
	// beam: first aimed low across the sea (burning up words), then swung up onto the clouds
	const up = easeInOut(progress(f, n2.start + 66, n2.start + 86));
	const beamAng = lerp(186, 222, up) + (up < 1 ? 3 * Math.sin(f * 0.1) : 0);
	const num = progress(f, n2.start + 80, n2.start + 96);
	const beatA = [n3.start, n3.start + 72];
	const beatB = [n3.start + 72, n3.start + 140];
	const beatC = [n3.start + 140, n4.start + 30];
	const inOut = (a: number, b: number, fade = 10) => easeOut(progress(f, a, a + 12), 2) * (1 - progress(f, b - fade, b));
	const push = easeInOut(progress(f, n4.start + 20, S.news.end + 10));
	const words = ['Great', 'question!', 'This', 'email', 'looks', 'totally', 'legit', 'and'];
	const wordsFrom = n2.start + 24;
	return (
		<AbsoluteFill style={{transform: `scale(${1 + 0.9 * easeIn(push, 2)})`, transformOrigin: '28% 64%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<WorldDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={560} count={120} />
				<Moon x={760} y={120} r={40} />
				<circle cx={960} cy={640} r={330} fill="url(#gSun)" opacity={0.85} />
				<Clouds f={f} y={120} count={4} seed={3} scale={1.3} opacity={0.95} />
				{/* the cloud bank the beam writes on */}
				<g transform="translate(1180 300)">
					<path d="M 0 0 Q 40 -90 150 -80 Q 200 -160 320 -130 Q 420 -190 520 -120 Q 640 -120 700 -40 Q 740 0 700 0 Z" fill="#4A3F96" />
					<path d="M 150 -80 Q 200 -160 320 -130 Q 420 -190 520 -120" fill="none" stroke="#8C7AD6" strokeWidth={4} opacity={0.6} />
					<path d="M 10 -3 Q 350 16 700 -3 L 700 0 L 0 0 Z" fill="#E07BA0" opacity={0.7} />
				</g>
				<Mountains y={610} shift={f * 0.3} seed={5} />
				<City x={80} y={706} w={880} f={f} />
				{/* sea */}
				<rect x={-60} y={700} width={2040} height={440} fill="url(#gSea)" />
				{Array.from({length: 26}, (_, i) => {
					const y = 720 + ((i * 53) % 330);
					const x = ((i * 211 + f * (0.6 + (i % 3) * 0.3)) % 2100) - 100;
					return <rect key={i} x={x} y={y} width={40 + (i % 4) * 30} height={3} rx={1.5} fill="#7E8AE0" opacity={0.25} />;
				})}
				<rect x={228} y={712} width={24} height={300} fill="#EEF0FF" opacity={0.08} />
				{/* J E V, rising from the sea like monuments, with reflections */}
				{['J', 'E', 'V'].map((ch, i) => {
					const k = jev(i);
					if (k <= 0) return null;
					const x = 470 + i * 205;
					const y = 712 + (1 - k) * 260;
					return (
						<g key={ch}>
							<text x={x + 12} y={y + 4} fontFamily={FONT} fontWeight={900} fontSize={300} fill="#1B7F77">
								{ch}
							</text>
							<text x={x} y={y} fontFamily={FONT} fontWeight={900} fontSize={300} fill="url(#gTeal)">
								{ch}
							</text>
							<text x={x} y={y} fontFamily={FONT} fontWeight={900} fontSize={300} fill="#FFF3C4" opacity={0.35 * lamp}>
								{ch}
							</text>
							<g transform="translate(0 1424) scale(1 -1)" opacity={0.16 * k}>
								<text x={x} y={y} fontFamily={FONT} fontWeight={900} fontSize={300} fill={K.teal}>
									{ch}
								</text>
							</g>
						</g>
					);
				})}
				<rect x={-60} y={704} width={2040} height={30} fill="#3B3A8E" opacity={0.55} />
				{/* the beam */}
				{lamp > 0 ? (
					<g transform={`translate(${LAMP.x} ${LAMP.y}) rotate(${beamAng})`} opacity={lamp} style={{mixBlendMode: 'screen'}}>
						<path d="M 0 -14 L 1500 -230 L 1500 230 L 0 14 Z" fill="url(#gBeam)" />
					</g>
				) : null}
				{/* chatbot words flying in and burning up in the light: Jev writes no words */}
				{f >= wordsFrom && f < n2.start + 90
					? words.map((w, i) => {
							const t = progress(f, wordsFrom + i * 6, wordsFrom + i * 6 + 34);
							if (t <= 0 || t >= 1) return null;
							const x = lerp(-120, 1320, t);
							const y = 520 + 60 * Math.sin(t * Math.PI) - i * 6;
							const burn = clamp01((t - 0.72) / 0.28);
							return (
								<g key={i} transform={`translate(${x} ${y}) scale(${1.45 * (1 - burn * 0.6)})`} opacity={1 - burn}>
									<rect x={-w.length * 9 - 14} y={-24} width={w.length * 18 + 28} height={44} rx={22} fill={K.indigoHi} />
									<text textAnchor="middle" y={8} fontFamily={FONT} fontWeight={900} fontSize={24} fill={K.white}>
										{w}
									</text>
									{burn > 0 ? <circle r={30 + 50 * burn} fill={K.orange} opacity={0.5 * (1 - burn)} filter="url(#glowBig)" /> : null}
								</g>
							);
						})
					: null}
				<Projected x={1530} y={206} text={film.fx.jev.p.toFixed(2)} size={130} k={num * (1 - progress(f, n4.start, n4.start + 20))} sub="SCAM" />
				<Cliff />
				<g transform={`translate(${LH.x} ${LH.y}) scale(${LH.s})`}>
					<FlatLighthouse on={lamp} />
				</g>
				<Fireflies f={f} x={1380} y={560} w={500} h={160} count={10} />
				{/* beat A: the race (speed claim) */}
				{(() => {
					const k = inOut(beatA[0], beatA[1]);
					if (k <= 0) return null;
					const t = f - beatA[0];
					const slowX = 180 + t * 2.4;
					const fastX = ((t * 70) % 1500) + 100;
					return (
						<g opacity={k}>
							{['Great', 'ques…', 'This', 'em…'].map((w, i) => (
								<g key={i} transform={`translate(${slowX - i * 92} 790)`}>
									<rect x={-42} y={-20} width={84} height={40} rx={20} fill={i === 0 ? K.orange : K.orangeLo} />
									<text textAnchor="middle" y={8} fontFamily={FONT} fontWeight={900} fontSize={21} fill={K.ink}>
										{w}
									</text>
								</g>
							))}
							<line x1={fastX - 320} y1={850} x2={fastX} y2={850} stroke="#FFF1B8" strokeWidth={10} strokeLinecap="round" opacity={0.95} filter="url(#glow)" />
							<Callout from={{x: 1150, y: 850}} to={{x: 1210, y: 780}} title="193× faster*" k={progress(f, beatA[0] + 10, beatA[0] + 40)} color="#FFF1B8" size={42} />
						</g>
					);
				})()}
				{/* beat B: the cost claim */}
				{(() => {
					const k = inOut(beatB[0], beatB[1]);
					if (k <= 0) return null;
					const t = f - beatB[0];
					const stack = Math.min(22, Math.floor(t / 1.4));
					return (
						<g opacity={k}>
							<g transform="translate(-100 -300) scale(1.25)">
								<ellipse cx={560} cy={930} rx={240} ry={32} fill="#2A2F7A" />
								<path d="M 330 930 A 240 32 0 0 0 790 930" fill="none" stroke="#4B55B8" strokeWidth={4} />
								{Array.from({length: stack}, (_, i) => (
									<Coin key={i} x={460} y={916 - i * 12} />
								))}
								<Coin x={680} y={916} s={easeOut(progress(f, beatB[0] + 8, beatB[0] + 18))} />
								<text x={400} y={900} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={24} fill={K.white} opacity={0.8}>
									chatbot
								</text>
								<text x={720} y={906} fontFamily={FONT} fontWeight={800} fontSize={24} fill={K.white} opacity={0.8}>
									Jev
								</text>
							</g>
							<Callout from={{x: 752, y: 832}} to={{x: 880, y: 700}} title="445× cheaper*" k={progress(f, beatB[0] + 14, beatB[0] + 44)} color={K.yellow} size={42} />
						</g>
					);
				})()}
				{/* beat C: forty million dollars */}
				{(() => {
					const k = inOut(beatC[0], beatC[1]);
					if (k <= 0) return null;
					const t = f - beatC[0];
					return (
						<g opacity={k}>
							{Array.from({length: 26}, (_, i) => {
								const tt = (t - (i % 13) * 3) / 30;
								if (tt < 0 || tt > 1) return null;
								const x = 250 + ((i * 97) % 900);
								const y = lerp(-40, 760, easeIn(tt, 1.8));
								return <Coin key={i} x={x} y={y} s={0.5} />;
							})}
						</g>
					);
				})()}
				<Foliage x={60} y={1100} s={1.4} f={f} blur />
				<Rock x={1260} y={1060} s={1.6} />
				<Motes f={f} color={K.yellow} count={16} seed={7} />
				<Vignette />
			</svg>
			{/* date + company, set straight into the sky */}
			<div style={{position: 'absolute', left: 120, top: 120, opacity: 1 - progress(f, n3.start - 10, n3.start + 6)}}>
				<Kinetic text="SEPTEMBER 15, 2026" k={progress(f, n1.start + 4, n1.start + 40)} size={30} spacing={8} color={K.teal} stagger={0.02} />
				<div style={{height: 12}} />
				<Kinetic text="TypeSafe AI" k={progress(f, n1.start + 34, n1.start + 70)} size={78} />
			</div>
			{/* forty million, counting up */}
			{f >= beatC[0] ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: inOut(beatC[0], beatC[1])}}>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 124, color: K.yellow, textShadow: '0 0 40px rgba(255,212,92,0.55)'}}>
						${Math.round(40 * easeOut(progress(f, beatC[0], beatC[0] + 34), 3)).toString()},000,000
					</div>
					<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: K.white, opacity: 0.85}}>SEED</div>
				</div>
			) : null}
			<div style={{position: 'absolute', right: 60, top: 76, fontFamily: FONT, fontWeight: 700, fontSize: 19, color: K.mute, opacity: easeOut(progress(f, beatA[0] + 20, beatA[0] + 34)) * (1 - progress(f, n4.start, n4.start + 12))}}>
				* TypeSafe’s own tests
			</div>
		</AbsoluteFill>
	);
};
