import React from 'react';
import {FONT, FlatLighthouse, FlatLoco, Hills, K, LAMP_Y, Motes, Stars} from '../../flat/kit';
import {type Film, clamp01, easeIn, easeInOut, easeOut, lerp, onTwos, progress} from '../paper-track/timeline';

type SCam = {cx: number; cy: number; s: number};
const camT = (c: SCam) => `translate(960 540) scale(${c.s}) translate(${-c.cx} ${-c.cy})`;

const SkyLayer: React.FC<{f: number; c: SCam; horizon?: number}> = ({f, c, horizon = 600}) => (
	<>
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={520} />
		<g transform={`translate(0 ${(c.cy - 540) * -0.25})`}>
			<Hills y={horizon} shift={(c.cx - 960) * 0.6} />
		</g>
	</>
);

// ---------- station: the email arrives ----------
export const FlatStation: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const {S} = film;
	const g = onTwos(f);
	const push = easeInOut(progress(f, S.gab.start - 6, S.gab.end));
	const c: SCam = {cx: lerp(900, 780, push), cy: lerp(560, 610, push), s: lerp(1, 1.45, push)};
	const fl = progress(f, S.letter.start + 8, S.letter.start + 64);
	const lx = lerp(1250, 322, easeInOut(fl)) + 50 * Math.sin(fl * 9) * (1 - fl);
	const ly = lerp(-120, 612, easeOut(fl, 1.4));
	const lr = 24 * Math.sin(fl * 11) * (1 - fl) - 4;
	const roll = easeInOut(progress(f, S.gab.end - 60, S.gab.end + 12));
	const locoX = 820 + 380 * roll;
	return (
		<g>
			<SkyLayer f={f} c={c} />
			<g transform={camT(c)}>
				<path d="M -600 760 L 2700 760 L 2700 1500 L -600 1500 Z" fill="#232A6E" />
				<path d="M -600 760 L 2700 760 L 2700 774 L -600 774 Z" fill="#3A43A2" />
				<path d="M -600 900 C -200 860 300 910 700 880 C 1100 850 1500 905 1900 875 C 2200 855 2500 890 2700 880 L 2700 1500 L -600 1500 Z" fill="#1A2060" />
				{[[-120, 900, 1.2], [620, 884, 0.9], [1320, 890, 1.1], [1760, 878, 0.8]].map(([x, y, s], i) => (
					<g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
						<circle cx={0} cy={-30} r={46} fill="#27307C" />
						<circle cx={48} cy={-18} r={34} fill="#27307C" />
						<circle cx={-8} cy={-44} r={20} fill="#3A43A2" />
						<circle cx={30 + i * 6} cy={-64} r={6} fill={K.teal} opacity={0.9} />
						<circle cx={30 + i * 6} cy={-64} r={14} fill={K.teal} opacity={0.25} />
					</g>
				))}
				{/* station */}
				<g filter="url(#soft)">
					<rect x={200} y={600} width={240} height={160} rx={8} fill="#C9C4F2" />
					<rect x={330} y={600} width={110} height={160} fill="#A7A1E0" />
					<path d="M 176 612 L 320 530 L 464 612 Z" fill={K.rose} />
					<rect x={232} y={650} width={60} height={110} rx={8} fill={K.navy} />
					<rect x={236} y={484} width={168} height={42} rx={21} fill={K.indigoHi} />
				</g>
				<text x={320} y={513} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={3} fill={K.white}>
					QUESTION
				</text>
				{/* window glow */}
				<rect x={340} y={640} width={60} height={46} rx={8} fill={K.yellow} opacity={0.85} />
				<rect x={340} y={640} width={60} height={46} rx={8} fill={K.yellow} filter="url(#glowBig)" opacity={0.6} />
				{/* track stub */}
				<rect x={480} y={736} width={420 + 380 * roll} height={6} rx={3} fill={K.mute} />
				{Array.from({length: 4 + Math.floor(roll * 4)}, (_, i) => (
					<rect key={i} x={490 + i * 96} y={744} width={86} height={14} rx={7} fill="#3B47A8" />
				))}
				<g transform={`translate(${locoX} ${741 + (roll > 0 && roll < 1 ? Math.abs(Math.sin(g * 0.3)) * 2 : 0)})`}>
					<FlatLoco look={fl < 1 ? -1 : 0.6} blink={g % 80 < 4 ? 1 : 0} />
				</g>
				{[0, 1, 2].map((i) => {
					if (f < S.gab.start + 20) return null;
					const k = ((f - S.gab.start + i * 20) % 60) / 60;
					return <circle key={i} cx={locoX - 110 - 20 * k} cy={530 - 110 * k} r={10 + 18 * k} fill="#D8D4FF" opacity={0.8 * (1 - k)} />;
				})}
				{/* who the train stands for */}
				{film.cues.L02 && f >= film.cues.L02.start + 26 && f < film.cues.L02.end + 10
					? (() => {
							const a = film.cues.L02.start + 26;
							const k = (i: number) => easeOut(progress(f, a + i * 5, a + 12 + i * 5), 3) * (1 - progress(f, film.cues.L02.end, film.cues.L02.end + 10));
							const chips = ['ChatGPT', 'Claude', '…'];
							return (
								<g transform={`translate(${locoX - 110} 330)`}>
									<path d="M 0 118 L 0 176" stroke={K.white} strokeWidth={3} strokeDasharray="6 6" opacity={k(0)} />
									<g transform={`scale(${k(0)})`}>
										<rect x={-170} y={-8} width={340} height={56} rx={28} fill={K.teal} />
										<text x={0} y={29} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} letterSpacing={2} fill={K.ink}>
											LANGUAGE MODELS
										</text>
									</g>
									{chips.map((c, i) => (
										<g key={c} transform={`translate(${(i - 1) * 118} 84) scale(${k(i + 1)})`}>
											<rect x={-54} y={-22} width={108} height={44} rx={22} fill={K.navy} />
											<text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={21} fill={K.white}>
												{c}
											</text>
										</g>
									))}
								</g>
							);
						})()
					: null}
				{/* the letter, trailing sparks */}
				{fl < 1
					? [1, 2, 3, 4, 5].map((i) => {
							const t = Math.max(0, fl - i * 0.03);
							return <circle key={i} cx={lerp(1250, 322, easeInOut(t)) + 50 * Math.sin(t * 9) * (1 - t)} cy={lerp(-120, 612, easeOut(t, 1.4))} r={6 - i} fill={K.yellow} opacity={0.6 - i * 0.1} />;
						})
					: null}
				<g transform={`translate(${lx} ${ly}) rotate(${lr})`}>
					<rect x={-60} y={-42} width={120} height={84} rx={10} fill={K.yellow} filter="url(#glowBig)" opacity={0.5} />
					<g filter="url(#soft)">
						<rect x={-50} y={-34} width={100} height={68} rx={8} fill={K.white} />
						<path d="M -50 -30 L 0 6 L 50 -30" fill="none" stroke="#B9B4E6" strokeWidth={4} strokeLinejoin="round" />
						<circle cx={34} cy={-18} r={9} fill={K.rose} />
					</g>
				</g>
			</g>
			<Motes f={f} />
		</g>
	);
};

export const FlatEmailCard: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const cue = film.cues.L01;
	const k = easeOut(progress(f, cue.start - 4, cue.start + 10), 3) * (1 - easeIn(progress(f, cue.end + 6, cue.end + 20)));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 1030, top: 170, width: 720, transform: `translateY(${(1 - k) * 40}px) scale(${0.94 + 0.06 * k})`, opacity: k, background: K.navy, borderRadius: 34, padding: '34px 44px', boxShadow: '0 20px 40px rgba(5,8,32,0.55)', fontFamily: FONT, color: K.white}}>
			<div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
				<div style={{width: 44, height: 44, borderRadius: 22, background: K.rose, color: K.white, fontWeight: 900, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>!</div>
				<div style={{fontWeight: 700, fontSize: 18, color: K.mute, letterSpacing: 1}}>prizes@cruise-winner.biz</div>
			</div>
			<div style={{fontWeight: 800, fontSize: 34, lineHeight: 1.3, marginTop: 18}}>{film.fx.email}</div>
			<div style={{fontWeight: 900, fontSize: 34, color: K.orangeHi, marginTop: 18}}>{film.fx.question}</div>
		</div>
	);
};

// ---------- the valley: derail, lighthouse, close ----------
const L = 150;
function pieces(film: Film) {
	let x = 20;
	let y = 742;
	return film.fx.steps.map((s, i) => {
		const k = i - 6;
		const angle = k < 0 ? 0 : 7 + 12 * k;
		const r = (angle * Math.PI) / 180;
		const p = {x, y, angle, word: s.chosen.trim() || '␣'};
		x += L * Math.cos(r);
		y += L * Math.sin(r);
		return p;
	});
}

export const FlatValley: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const {S, cues} = film;
	const g = onTwos(f);
	const ps = pieces(film);
	const last = ps[ps.length - 1];
	const endX = last.x + L * Math.cos((last.angle * Math.PI) / 180);
	const endY = last.y + L * Math.sin((last.angle * Math.PI) / 180);
	const lampBase = {x: 1605, y: 443};
	const lamp = {x: lampBase.x, y: lampBase.y + LAMP_Y};
	const d0 = S.derail.start;
	const at = (s: number) => {
		const i = Math.min(ps.length - 1, Math.max(0, Math.floor(s / L)));
		const p = ps[i];
		const u = (s - i * L) / L;
		const r = (p.angle * Math.PI) / 180;
		return {x: p.x + u * L * Math.cos(r), y: p.y + u * L * Math.sin(r), a: p.angle};
	};
	const run = easeInOut(progress(f, d0, d0 + 26));
	const a0 = at(lerp(3 * L, 9 * L, run));
	let loco = {x: a0.x, y: a0.y, rot: a0.a};
	const tip = progress(f, d0 + 28, d0 + 44);
	if (f >= d0 + 26) loco = {x: endX + 70 * easeIn(tip) + 10, y: endY + 150 * easeIn(tip, 2.2), rot: last.angle + 8 + 55 * easeIn(tip)};
	if (f >= d0 + 44) {
		const u = (f - d0 - 44) / 24;
		const damp = Math.exp(-2.6 * u);
		loco = {x: endX + 120 + 60 * easeOut(clamp01(u / 1.4)), y: endY + 176 + 14 * damp * Math.cos(7 * u) + 3 * Math.sin(u * 2), rot: 12 + 40 * damp * Math.cos(6 * u)};
	}
	const J = S.jev.start;
	let dc: SCam = {cx: lerp(760, 1080, easeInOut(progress(f, d0, d0 + 40))), cy: lerp(700, 800, easeInOut(progress(f, d0, d0 + 40))), s: 1.45};
	if (cues.L10b) {
		const k = easeInOut(progress(f, cues.L10b.start + 90, cues.L10b.start + 130));
		dc = {cx: lerp(dc.cx, 780, k), cy: lerp(dc.cy, 720, k), s: lerp(dc.s, 1.02, k)};
	}
	const shake = f >= d0 + 44 ? Math.exp(-(f - d0 - 44) / 6) : 0;
	const jevK = easeInOut(progress(f, J, J + 40));
	let c: SCam = f < J ? {cx: dc.cx + 10 * shake * Math.sin(f * 2.1), cy: dc.cy + 8 * shake * Math.cos(f * 2.9), s: dc.s} : {cx: lerp(dc.cx, 1150, jevK), cy: lerp(dc.cy, 520, jevK), s: lerp(1.45, 1.12, jevK)};
	if (f >= cues.L12.start) {
		const k = easeInOut(progress(f, cues.L12.start, cues.L12.start + 50));
		c = {cx: lerp(1150, 960, k), cy: lerp(520, 540, k), s: lerp(1.12, 1, k)};
	}
	if (f >= S.close.start) {
		const k = easeInOut(progress(f, S.close.start, S.close.end));
		c = {cx: 960, cy: lerp(540, 520, k), s: lerp(1, 0.94, k)};
	}
	const lampOn = easeOut(progress(f, J + 20, J + 34), 2);
	const sweep = easeInOut(progress(f, cues.L12.start + 26, cues.L12.start + 76));
	const slots = easeOut(progress(f, cues.L12.end - 60, cues.L12.end - 40), 2);
	const widths = easeInOut(progress(f, cues.L12.end - 30, cues.L12.end + 6));
	const tagK = easeOut(progress(f, cues.L13.start - 4, cues.L13.start + 10), 2);
	const pYes = film.fx.jev.p;
	const letter = {x: 60, y: 520, w: 190, h: 130};
	const tx = letter.x + letter.w / 2 - lamp.x;
	const ty = letter.y + letter.h / 2 - lamp.y;
	const dist = Math.hypot(tx, ty);
	const baseAng = (Math.atan2(ty, tx) * 180) / Math.PI;
	const half = Math.tan(Math.atan2(letter.h * 0.8, dist)) * (dist + 60);
	const PEN = 170;
	return (
		<g>
			<SkyLayer f={f} c={c} horizon={560} />
			<g transform={camT(c)}>
				<path d="M -400 640 C 300 590 520 640 760 600 C 1000 560 1180 640 1360 560 C 1480 505 1560 430 1640 432 C 1760 436 1840 520 2400 540 L 2400 1500 L -400 1500 Z" fill="#2B2C78" />
				<path d="M 1360 560 C 1480 505 1560 430 1640 432 C 1760 436 1840 520 2400 540 L 2400 556 C 1840 536 1760 452 1640 448 C 1560 446 1480 521 1360 576 Z" fill="#3E3E9A" />
				{lampOn > 0 ? (
					<g transform={`translate(${lamp.x} ${lamp.y}) rotate(${baseAng + lerp(38, 0, sweep)})`} opacity={lampOn * (sweep > 0 ? 1 : 0.4)} style={{mixBlendMode: 'screen'}}>
						<path d={`M 0 -12 L ${dist + 60} ${-half} L ${dist + 60} ${half} L 0 12 Z`} fill="url(#gBeam)" />
					</g>
				) : null}
				<g transform={`translate(${lampBase.x} ${lampBase.y})`}>
					<FlatLighthouse on={f >= J ? lampOn : 0} />
				</g>
				{slots > 0 ? (
					<g transform="translate(1632 340)">
						{[
							{label: 'SCAM', p: pYes, fill: K.orange},
							{label: 'NOT SCAM', p: 1 - pYes, fill: K.teal},
						].map((pn, i) => {
							const h = Math.max(6, PEN * 0.5 * lerp(0.5, pn.p, widths)) * slots;
							const len = PEN * lerp(0.5, pn.p, widths) + 50;
							const y0 = i === 0 ? 0 : PEN * 0.5 * lerp(0.5, pYes, widths) + 14;
							const wave = 5 * Math.sin(g * 0.25 + i);
							const d = `M 0 0 L ${len * 0.5} ${wave} L ${len} ${h / 2 + wave * 0.5} L ${len * 0.5} ${h + wave} L 0 ${h} Z`;
							return (
								<g key={i} transform={`translate(0 ${y0})`}>
									<path d={d} fill={pn.fill} filter="url(#glowBig)" opacity={0.5} />
									<path d={d} fill={pn.fill} />
									<text x={len + 12} y={h / 2 + 8} fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={1} fill={K.white} opacity={slots}>
										{pn.label}
									</text>
								</g>
							);
						})}
						<rect x={-6} y={-8} width={5} height={PEN * 0.5 + 30} rx={2} fill={K.white} />
					</g>
				) : null}
				{tagK > 0 ? (
					<g transform={`translate(1636 ${566 - 10 * (1 - tagK)})`} opacity={tagK}>
						<g filter="url(#soft)">
							<rect x={0} y={0} width={262} height={96} rx={32} fill={K.navy} />
						</g>
						<text x={131} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={20} fill={K.mute}>
							p(scam | email)
						</text>
						<text x={131} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.orangeHi}>
							{pYes.toFixed(2)} · 1 pass
						</text>
					</g>
				) : null}
				{/* plateau, cliff, pond */}
				<path d="M -400 760 L 900 760 C 980 770 1040 820 1090 880 C 1120 920 1140 960 1150 1400 L -400 1400 Z" fill="#212872" />
				<path d="M -400 760 L 900 760 C 980 770 1040 820 1090 880 L 1082 890 C 1034 834 976 784 900 774 L -400 774 Z" fill="#3A43A2" />
				<path d="M 1130 930 C 1250 900 1450 905 1600 940 C 1650 960 1640 1000 1560 1010 C 1400 1030 1220 1020 1150 995 C 1100 975 1100 945 1130 930 Z" fill="#0C1340" />
				<path d="M 1140 936 C 1260 910 1440 914 1590 946" fill="none" stroke={K.cyan} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
				<path d="M 1220 972 C 1300 962 1380 962 1440 970" fill="none" stroke={K.cyan} strokeWidth={3} strokeLinecap="round" opacity={0.25} />
				{/* the letter */}
				<g transform={`translate(${letter.x} ${letter.y}) rotate(-3)`}>
					<rect x={-12} y={-12} width={letter.w + 24} height={letter.h + 24} rx={20} fill={K.yellow} filter="url(#glowBig)" opacity={0.25 + 0.5 * sweep} />
					<g filter="url(#soft)">
						<rect width={letter.w} height={letter.h} rx={12} fill={K.white} />
						<path d={`M 0 6 L ${letter.w / 2} ${letter.h * 0.55} L ${letter.w} 6`} fill="none" stroke="#B9B4E6" strokeWidth={5} strokeLinejoin="round" />
						<circle cx={letter.w - 28} cy={26} r={14} fill={K.rose} />
					</g>
				</g>
				<rect x={146} y={650} width={8} height={92} rx={4} fill={K.mute} />
				{/* track tiles */}
				{ps.map((p, i) => (
					<g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
						<rect x={4} y={6} width={142} height={32} rx={16} fill={i === 6 ? K.orange : '#3B47A8'} />
						<text x={75} y={29} textAnchor="middle" fontFamily={FONT} fontSize={18} fontWeight={900} letterSpacing={1.5} fill={i === 6 ? K.ink : K.white}>
							{p.word.toUpperCase()}
						</text>
						<rect x={0} y={-3} width={150} height={5} rx={2} fill={K.mute} />
					</g>
				))}
				{cues.L10b && f >= cues.L10b.start && f < S.jev.start + 30
					? ps.map((p, i) => {
							const step = film.fx.steps[i];
							const prob = step.options.find((o) => o.t === step.chosen)?.p ?? 0;
							const at = cues.L10b.start + 130 + i * 5;
							const k = easeOut(progress(f, at, at + 10), 3) * (1 - progress(f, S.jev.start, S.jev.start + 20));
							const bad = i === 6;
							const hot = bad && f >= cues.L10b.end - 50;
							if (k <= 0) return null;
							const r = (p.angle * Math.PI) / 180;
							const cx = p.x + 75 * Math.cos(r);
							const cy = p.y + 75 * Math.sin(r) - 58;
							return (
								<g key={`b${i}`} transform={`translate(${cx} ${cy}) scale(${k * (hot ? 1.3 : 1)})`}>
									{hot ? <circle r={44} fill={K.rose} opacity={0.35} filter="url(#glowBig)" /> : null}
									<rect x={-40} y={-20} width={80} height={40} rx={20} fill={bad ? K.rose : K.navy} />
									<text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={21} fill={K.white}>
										{Math.round(prob * 100)}%
									</text>
								</g>
							);
						})
					: null}
				{cues.L10b && f >= cues.L10b.start + 6 && f < cues.L10b.start + 110 ? (
					<g transform={`translate(1320 600) scale(${easeOut(progress(f, cues.L10b.start + 6, cues.L10b.start + 18), 3) * (1 - progress(f, cues.L10b.start + 96, cues.L10b.start + 110))})`}>
						<rect x={-240} y={-34} width={480} height={68} rx={34} fill={K.navy} />
						<circle cx={-200} cy={0} r={20} fill={K.teal} />
						<path d="M -210 0 L -202 8 L -189 -8" fill="none" stroke={K.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
						<text x={-166} y={9} fontFamily={FONT} fontWeight={800} fontSize={25} fill={K.white}>
							real models usually catch this one
						</text>
					</g>
				) : null}
				<g transform={`translate(${loco.x} ${loco.y}) rotate(${loco.rot})`}>
					<FlatLoco worried={f >= d0 + 20} look={f >= J + 150 ? 1 : 0.2} blink={g % 90 < 4 ? 1 : 0} />
				</g>
				{f >= d0 + 44 ? (
					<>
						<path d="M 1128 948 C 1250 925 1450 928 1598 956 C 1640 972 1632 1000 1556 1010 C 1400 1030 1220 1020 1150 995 C 1104 978 1104 958 1128 948 Z" fill="#0C1340" opacity={0.8} />
						<path d="M 1140 950 C 1260 928 1440 932 1590 960" fill="none" stroke={K.cyan} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
						{[0, 1, 2].map((i) => {
							const k = progress(f, d0 + 44 + i * 8, d0 + 90 + i * 8);
							if (k <= 0 || k >= 1) return null;
							return <ellipse key={i} cx={endX + 60} cy={950} rx={40 + 220 * k} ry={8 + 20 * k} fill="none" stroke={K.cyan} strokeWidth={4} opacity={0.8 * (1 - k)} />;
						})}
						{progress(f, d0 + 44, d0 + 80) < 1
							? Array.from({length: 16}, (_, i) => {
									const t = (f - d0 - 44) / 24;
									const vx = (((i * 37) % 13) - 5) * 90;
									const vy = -(500 + ((i * 53) % 7) * 90);
									const y = 940 + vy * t + 1300 * t * t;
									if (y > 950) return null;
									return <circle key={i} cx={endX + 60 + vx * t} cy={y} r={5 + (i % 3) * 3} fill={K.cyan} />;
								})
							: null}
					</>
				) : null}
			</g>
			<Motes f={f} color={K.yellow} count={18} seed={9} />
		</g>
	);
};
