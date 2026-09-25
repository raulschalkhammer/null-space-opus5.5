import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rng} from '../../fx/rough';
import {FONT, FlatDefs, FlatLighthouse, Hills, K, Motes, Stars, Vignette} from '../../flat/kit';
import {clamp01, easeIn, easeInOut, easeOut, lerp, progress} from '../paper-track/timeline';
import type {FlatFilm} from './timeline';

const pop = (f: number, at: number, len = 10) => {
	const k = progress(f, at, at + len);
	return k <= 0 ? 0 : easeOut(k, 3) * (1 + 0.18 * Math.sin(Math.PI * k));
};

// ---------- the planet of questions ----------
const Planet: React.FC<{f: number}> = ({f}) => {
	const R = 290;
	const drift = (f * 0.6) % 1400;
	const r = rng(21);
	const lands = Array.from({length: 7}, (_, i) => ({x: -700 + i * 230 + r() * 80, y: -220 + r() * 440, s: 0.7 + r() * 0.8}));
	const lights = Array.from({length: 70}, () => ({x: r() * 2 * R - R, y: r() * 2 * R - R}));
	return (
		<g>
			<circle r={R + 60} fill={K.cyan} opacity={0.18} filter="url(#glowBig)" />
			<defs>
				<clipPath id="planetClip">
					<circle r={R} />
				</clipPath>
				<linearGradient id="gPlanet" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#4B8BEA" />
					<stop offset="1" stopColor="#1C3288" />
				</linearGradient>
			</defs>
			<circle r={R} fill="url(#gPlanet)" />
			<g clipPath="url(#planetClip)">
				{[0, 1400].map((off) => (
					<g key={off} transform={`translate(${drift - off} 0)`}>
						{lands.map((l, i) => (
							<g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
								<path d="M -90 10 C -100 -40 -40 -70 10 -60 C 60 -80 110 -40 100 0 C 120 40 60 80 10 60 C -30 90 -90 60 -90 10 Z" fill="#2FBF8F" />
								<path d="M -90 10 C -80 40 -30 70 10 60 C 60 80 110 40 100 0 C 90 30 50 50 10 44 C -30 60 -70 40 -90 10 Z" fill="#1E9A7A" />
							</g>
						))}
					</g>
				))}
				{/* night side with city lights: people, asking */}
				<circle cx={170} cy={120} r={R * 1.05} fill="#0A1240" opacity={0.62} />
				{lights.map((l, i) => {
					const inNight = Math.hypot(l.x - 170, l.y - 120) < R * 1.02 && Math.hypot(l.x, l.y) < R - 6;
					return inNight ? <circle key={i} cx={l.x} cy={l.y} r={2.4} fill={K.yellow} opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.07 + i))} /> : null;
				})}
			</g>
			<path d={`M ${-R * 0.92} ${-R * 0.38} A ${R} ${R} 0 0 1 ${R * 0.1} ${-R * 0.99}`} fill="none" stroke="#A9E4FF" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
		</g>
	);
};

const Bubble: React.FC<{x: number; y: number; s: number; color: string; dots?: boolean}> = ({x, y, s, color, dots = true}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-34} y={-22} width={68} height={40} rx={18} fill={color} />
		<path d="M -14 16 L -22 30 L -2 16 Z" fill={color} />
		{dots ? [-14, 0, 14].map((dx) => <circle key={dx} cx={dx} cy={-2} r={4.5} fill={K.navy} opacity={0.75} />) : null}
	</g>
);

export const Hook: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues, qTimes} = film;
	const r = rng(4);
	const bubbles = Array.from({length: 46}, (_, i) => {
		const a = r() * Math.PI * 2;
		const rad = 330 + r() * 170;
		return {x: Math.cos(a) * rad, y: Math.sin(a) * rad * 0.8, at: cues.H03.start + 6 + i * 2.2 + r() * 4, color: [K.white, '#BFF5EA', '#FFD9B0', '#D9D4FF'][i % 4], s: 0.55 + r() * 0.5};
	});
	const planetIn = cues.H03.start - 10;
	const zoomIn = easeInOut(progress(f, cues.H04.start - 6, cues.H04.start + 16));
	const cam = lerp(1, 1.08, progress(f, planetIn, cues.H04.start));
	const qs = ['Should I sign this?', 'Is this rash normal?', 'Is this email a scam?'];
	const qPos = [{x: 470, y: 250}, {x: 960, y: 150}, {x: 1450, y: 250}];
	return (
		<AbsoluteFill>
			{f < planetIn + 16 ? <Twice film={film} f={f} out={progress(f, planetIn, planetIn + 16)} /> : null}
			{f >= planetIn ? (
			<AbsoluteFill style={{transform: `scale(${cam * (1 + 5 * easeIn(zoomIn, 2))})`, transformOrigin: `${qPos[2].x}px ${qPos[2].y}px`, opacity: progress(f, planetIn, planetIn + 16) * (1 - progress(f, cues.H04.start + 6, cues.H04.start + 16))}}>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<FlatDefs />
					<rect x={-60} y={-60} width={2040} height={1200} fill={K.night} />
					<Stars f={f} count={160} maxY={1080} seed={11} />
					<g transform="translate(960 610)">
						<Planet f={f} />
						{bubbles.map((b, i) => {
							const k = pop(f, b.at, 8);
							if (k <= 0) return null;
							return <Bubble key={i} x={b.x + 4 * Math.sin(f * 0.04 + i)} y={b.y - 6 * Math.sin(f * 0.05 + i * 1.3)} s={b.s * k} color={b.color} />;
						})}
					</g>
					<Motes f={f} />
					<Vignette />
				</svg>
				{qs.map((q, i) => {
					const k = pop(f, qTimes[i], 10);
					if (k <= 0) return null;
					const hot = i === 2;
					return (
						<div key={i} style={{position: 'absolute', left: qPos[i].x, top: qPos[i].y, transform: `translate(-50%, -50%) scale(${k})`, background: hot ? K.orange : K.white, color: hot ? K.ink : K.navy, fontFamily: FONT, fontWeight: 900, fontSize: 40, padding: '18px 34px', borderRadius: 40, boxShadow: '0 16px 36px rgba(5,8,32,0.5)', whiteSpace: 'nowrap'}}>
							{q}
						</div>
					);
				})}
			</AbsoluteFill>
			) : null}
			{f >= cues.H04.start + 6 ? <ChatWindows film={film} f={f} /> : null}
		</AbsoluteFill>
	);
};

// ---------- cold open puzzle: the same question, asked twice, answered differently ----------
const TWICE = {
	q: 'Should I sign this contract?',
	a: ['Yes, this looks like a standard lease. The terms are typical, so signing it seems reasonable.', 'I’d hold off. Clause 4 lets them raise the rent at any time, which is unusual for a lease.'],
};
const Twice: React.FC<{film: FlatFilm; f: number; out: number}> = ({film, f, out}) => {
	const {cues} = film;
	const h2 = cues.H02;
	const at = (u: number) => h2.start + (h2.end - h2.start) * u;
	const starts = [cues.H01.start + 4, cues.H01.end + 6];
	const sameQ = easeOut(progress(f, at(0), at(0.12)), 3);
	const diff = easeOut(progress(f, at(0.4), at(0.52)), 3);
	const which = pop(f, at(0.62), 12);
	const split = easeInOut(progress(f, at(0.62), at(0.8)));
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill={K.night} />
				<Stars f={f} count={140} maxY={1080} seed={13} />
				<Motes f={f} />
				<Vignette />
			</svg>
			{[0, 1].map((w) => {
				const inK = easeOut(progress(f, starts[w], starts[w] + 14), 3);
				if (inK <= 0) return null;
				const words = TWICE.a[w].split(' ');
				const t0 = starts[w] + 18;
				const shown = Math.max(0, Math.floor((f - t0) / 4));
				const tilt = (w ? 1 : -1) * 2.5 * split;
				return (
					<div key={w} style={{position: 'absolute', top: 210, left: w ? 1010 : 150, width: 760, opacity: inK, transform: `translateY(${(1 - inK) * 40}px) translateX(${(w ? 1 : -1) * 24 * split}px) rotate(${tilt}deg)`, background: K.navy, borderRadius: 36, padding: '26px 30px 34px', boxShadow: '0 24px 50px rgba(5,8,32,0.55)', fontFamily: FONT}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
							<div style={{width: 14, height: 14, borderRadius: 7, background: K.teal}} />
							<div style={{fontWeight: 900, fontSize: 28, color: K.white}}>A chatbot</div>
							<div style={{fontWeight: 800, fontSize: 20, color: w ? K.orangeHi : K.mute, marginLeft: 'auto', letterSpacing: 2}}>{w ? 'AGAIN' : 'ONCE'}</div>
						</div>
						<div style={{marginTop: 18, marginLeft: 'auto', width: 'fit-content', background: K.indigoHi, color: K.white, borderRadius: 22, padding: '10px 18px', fontWeight: 800, fontSize: 26, boxShadow: sameQ > 0 ? `0 0 ${30 * sameQ}px rgba(74,227,200,${0.6 * sameQ})` : undefined}}>{TWICE.q}</div>
						<div style={{marginTop: 24, fontWeight: 700, fontSize: 32, lineHeight: 1.5, color: K.white, minHeight: 200}}>
							{words.slice(0, shown).map((word, i) => {
								const fresh = clamp01(1 - (f - (t0 + (i + 1) * 4)) / 10);
								const first = i < 2;
								return (
									<span key={i} style={{display: 'inline-block', marginRight: 9, color: fresh > 0.1 ? K.orangeHi : first && diff > 0 ? (w ? K.orange : K.teal) : K.white, transform: first && diff > 0 ? `scale(${1 + 0.08 * diff})` : undefined}}>
										{word}
									</span>
								);
							})}
						</div>
					</div>
				);
			})}
			{/* labels live in the scene, joined to the cards by thin lines */}
			<svg width={1920} height={1080} style={{position: 'absolute', pointerEvents: 'none'}}>
				<g opacity={sameQ * (1 - diff * 0.4)}>
					<path d={`M 960 150 L ${lerp(960, 836, sameQ)} 286 M 960 150 L ${lerp(960, 1420, sameQ)} 296`} stroke={K.teal} strokeWidth={3} fill="none" strokeLinecap="round" />
					<circle cx={960} cy={150} r={6} fill={K.teal} />
					<text x={960} y={128} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>same</text>
				</g>
				<g opacity={diff}>
					<path d="M 960 860 L 520 720 M 960 860 L 1380 720" stroke={K.orange} strokeWidth={3} fill="none" strokeLinecap="round" />
					<circle cx={960} cy={860} r={6} fill={K.orange} />
					<text x={960} y={905} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>different</text>
				</g>
				{which > 0 ? (
					<g transform={`translate(960 520) scale(${which})`}>
						<circle r={78} fill={K.orange} opacity={0.3} filter="url(#glowBig)" />
						<circle r={62} fill={K.orange} />
						<text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={K.ink}>?</text>
					</g>
				) : null}
			</svg>
		</AbsoluteFill>
	);
};

// ---------- two chat windows answering, one word (one bet) at a time ----------
const ANSWERS = [
	{name: 'ChatGPT', text: 'This looks like a classic phishing scam. Real prizes rarely demand you click within 24 hours, and you never entered a cruise contest…'},
	{name: 'Claude', text: 'Yes, this is very likely a scam. The urgency, the capital letters and a prize you never signed up for are all red flags…'},
];
const ChatWindows: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues, streamStart} = film;
	const inK = easeOut(progress(f, cues.H04.start + 6, cues.H04.start + 20), 3);
	const bet = easeInOut(progress(f, cues.H04.end - 40, cues.H04.end - 20));
	const out = progress(f, film.S.hook.end - 12, film.S.hook.end + 8);
	return (
		<AbsoluteFill style={{opacity: inK * (1 - out)}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill={K.night} />
				<Stars f={f} count={120} maxY={1080} seed={12} />
				<Motes f={f} />
				<Vignette />
			</svg>
			<div style={{position: 'absolute', left: 150, right: 150, top: 150, display: 'flex', gap: 60, transform: `scale(${0.92 + 0.08 * inK})`}}>
				{ANSWERS.map((a, w) => {
					const words = a.text.split(' ');
					const shown = Math.max(0, Math.floor((f - streamStart - w * 2) / 5));
					return (
						<div key={w} style={{flex: 1, background: K.navy, borderRadius: 36, padding: '26px 30px 34px', boxShadow: '0 24px 50px rgba(5,8,32,0.55)', fontFamily: FONT}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
								<div style={{width: 14, height: 14, borderRadius: 7, background: w ? K.orange : K.teal}} />
								<div style={{fontWeight: 900, fontSize: 28, color: K.white}}>{a.name}</div>
							</div>
							<div style={{marginTop: 18, marginLeft: 'auto', width: 'fit-content', maxWidth: '80%', background: K.indigoHi, color: K.white, borderRadius: 22, padding: '10px 18px', fontWeight: 800, fontSize: 24}}>Is this email a scam?</div>
							<div style={{marginTop: 22, fontWeight: 700, fontSize: 30, lineHeight: 1.55, color: K.white, minHeight: 280}}>
								{words.slice(0, shown).map((word, i) => {
									const age = f - (streamStart + w * 2 + (i + 1) * 5);
									const fresh = clamp01(1 - age / 12);
									return (
										<span key={i} style={{position: 'relative', display: 'inline-block', marginRight: 8, color: fresh > 0.1 ? K.orangeHi : K.white}}>
											{word}
											{fresh > 0.05 || bet > 0 ? (
												<svg width={26} height={26} viewBox="0 0 26 26" style={{position: 'absolute', left: '50%', top: -24, transform: `translateX(-50%) scale(${Math.max(fresh, bet * 0.8)}) rotate(${(i * 37) % 30 - 15}deg)`}}>
													<rect x={2} y={2} width={22} height={22} rx={6} fill={K.yellow} />
													{[[8, 8], [18, 18], [13, 13]].slice(0, 1 + (i % 3)).map(([x, y], j) => (
														<circle key={j} cx={x} cy={y} r={2.6} fill={K.ink} />
													))}
												</svg>
											) : null}
										</span>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ---------- the news: Jev ----------
export const News: React.FC<{film: FlatFilm; f: number}> = ({film, f}) => {
	const {cues, S} = film;
	const cardK = easeOut(progress(f, cues.N01.start + 10, cues.N01.start + 26), 3);
	const lamp = easeOut(progress(f, cues.N02.start + 10, cues.N02.start + 26), 2);
	const noWords = pop(f, cues.N02.start + Math.round((cues.N02.end - cues.N02.start) * 0.35));
	const number = pop(f, cues.N02.end - 16, 12);
	const stats = [
		{big: '100×', small: 'faster*', at: cues.N03.start + 10},
		{big: '100×', small: 'cheaper*', at: cues.N03.start + 50},
		{big: '$40M', small: 'raised', at: cues.N03.end - 60},
	];
	const leave = easeIn(progress(f, cues.N04.start + 10, cues.N04.start + 40), 2);
	const push = lerp(1, 1.12, easeInOut(progress(f, cues.N04.start, S.news.end)));
	const sweep = Math.sin(f * 0.035) * 14;
	return (
		<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '72% 60%'}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<FlatDefs />
				<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
				<Stars f={f} maxY={560} />
				<Hills y={690} shift={f * 0.4} />
				<path d="M -60 740 C 400 700 900 760 1300 700 C 1440 680 1520 600 1600 600 C 1700 600 1780 700 1980 720 L 1980 1140 L -60 1140 Z" fill="#232A74" />
				<path d="M -60 740 C 400 700 900 760 1300 700 C 1440 680 1520 600 1600 600 C 1700 600 1780 700 1980 720" fill="none" stroke="#6F66D0" strokeWidth={3} opacity={0.7} />
				{lamp > 0 ? (
					<g transform={`translate(1600 ${600 - 168}) rotate(${190 + sweep})`} opacity={lamp} style={{mixBlendMode: 'screen'}}>
						<path d="M 0 -12 L 1300 -210 L 1300 210 L 0 12 Z" fill="url(#gBeam)" />
					</g>
				) : null}
				<g transform="translate(1600 604) scale(1.35)">
					<FlatLighthouse on={lamp} />
				</g>
				<Motes f={f} color={K.yellow} count={20} seed={7} />
				<Vignette />
			</svg>
			{/* headline card */}
			<div style={{position: 'absolute', left: 120, top: 150, opacity: cardK * (1 - leave), transform: `translateX(${(1 - cardK) * -60}px)`, background: K.navy, borderRadius: 40, padding: '30px 40px 34px', boxShadow: '0 24px 50px rgba(5,8,32,0.55)', fontFamily: FONT, maxWidth: 760}}>
				<div style={{display: 'inline-block', background: K.teal, color: K.ink, fontWeight: 900, fontSize: 20, letterSpacing: 2, padding: '6px 16px', borderRadius: 16}}>SEPTEMBER 15, 2026</div>
				<div style={{fontWeight: 900, fontSize: 64, color: K.white, marginTop: 14, lineHeight: 1.05}}>TypeSafe releases Jev</div>
				<div style={{fontWeight: 800, fontSize: 28, color: K.mute, marginTop: 10}}>an AI that answers without words</div>
			</div>
			{/* "no words" icon + the number, beside the lighthouse */}
			{noWords > 0 ? (
				<svg width={140} height={120} viewBox="0 0 140 120" style={{position: 'absolute', left: 1330, top: 250, transform: `scale(${noWords})`, opacity: 1 - leave}}>
					<rect x={10} y={10} width={120} height={78} rx={30} fill={K.white} />
					<path d="M 40 84 L 30 110 L 62 86 Z" fill={K.white} />
					{[45, 70, 95].map((x) => (
						<circle key={x} cx={x} cy={49} r={7} fill={K.navy} />
					))}
					<line x1={22} y1={100} x2={122} y2={12} stroke={K.rose} strokeWidth={12} strokeLinecap="round" />
				</svg>
			) : null}
			{number > 0 ? (
				<div style={{position: 'absolute', left: 1700, top: 300, transform: `translate(-50%, -50%) scale(${number})`, opacity: 1 - leave, background: K.orange, color: K.ink, fontFamily: FONT, fontWeight: 900, fontSize: 72, padding: '10px 36px', borderRadius: 50, boxShadow: '0 0 60px rgba(255,138,61,0.6)'}}>0.91</div>
			) : null}
			{/* claims */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 36, opacity: 1 - leave, transform: `translateY(${leave * 80}px)`}}>
				{stats.map((s, i) => {
					const k = pop(f, s.at, 12);
					return (
						<div key={i} style={{transform: `scale(${k})`, background: K.navy, borderRadius: 36, padding: '18px 34px', textAlign: 'center', fontFamily: FONT, boxShadow: '0 20px 40px rgba(5,8,32,0.5)', minWidth: 220}}>
							<div style={{fontWeight: 900, fontSize: 64, color: i === 2 ? K.teal : K.orangeHi, lineHeight: 1}}>{s.big}</div>
							<div style={{fontWeight: 800, fontSize: 26, color: K.white, marginTop: 6}}>{s.small}</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 20, color: K.mute, opacity: pop(f, cues.N03.start + 50) * (1 - leave)}}>
				* the company’s own claims, “up to”, for certain tasks
			</div>
		</AbsoluteFill>
	);
};
