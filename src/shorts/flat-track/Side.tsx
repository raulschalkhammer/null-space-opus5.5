import React from 'react';
import {FONT, FlatLighthouse, FlatLoco, Hills, K, LAMP_Y, Motes, Stars} from '../../flat/kit';
import {Callout, Projected} from '../../flat/type';
import {Clouds, Fireflies, Foliage, Moon, Mountains, Reeds, Rock, WorldDefs} from '../../flat/world';
import {Lake, Mist, RailDefs, SideTrack, Steam, Terrain, WaterFront} from '../../flat/rail';
import {type Film, clamp01, easeIn, easeInOut, easeOut, lerp, onTwos, progress} from '../paper-track/timeline';

type SCam = {cx: number; cy: number; s: number};
const camT = (c: SCam) => `translate(960 540) scale(${c.s}) translate(${-c.cx} ${-c.cy})`;

const SkyLayer: React.FC<{f: number; c: SCam; horizon?: number}> = ({f, c, horizon = 600}) => (
	<>
		<WorldDefs />
		<RailDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={520} />
		<g transform={`translate(0 ${(c.cy - 540) * -0.25})`}>
			<Moon x={560 - (c.cx - 960) * 0.05} y={150} r={38} />
			<Clouds f={f} y={150} count={4} seed={12} opacity={0.9} />
			<Mountains y={horizon - 40} shift={(c.cx - 960) * 0.5} seed={7} layers={2} />
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
				<Terrain line={[[-600, 772], [2700, 772]]} bottom={1500} f={f} seed={6} />
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
				{/* lamp post */}
				<rect x={496} y={600} width={8} height={160} rx={4} fill="#2A2F7A" />
				<circle cx={500} cy={596} r={12} fill={K.yellow} />
				<circle cx={500} cy={596} r={60} fill={K.yellow} opacity={0.18} filter="url(#glowBig)" />
				<Rock x={140} y={774} s={0.8} />
				<Rock x={1500} y={774} s={1.1} />
				<Fireflies f={f} x={-200} y={560} w={2200} h={200} count={16} />
				{/* window glow */}
				<rect x={340} y={640} width={60} height={46} rx={8} fill={K.yellow} opacity={0.85} />
				<rect x={340} y={640} width={60} height={46} rx={8} fill={K.yellow} filter="url(#glowBig)" opacity={0.6} />
				{/* track stub */}
				<SideTrack pieces={Array.from({length: 4 + Math.floor(roll * 4)}, (_, i) => ({x: 480 + i * 96, y: 741, angle: 0, len: 97}))} f={f} />
				<g transform={`translate(${locoX} ${741 + (roll > 0 && roll < 1 ? Math.abs(Math.sin(g * 0.3)) * 2 : 0)})`}>
					<FlatLoco look={fl < 1 ? -1 : 0.6} blink={g % 80 < 4 ? 1 : 0} />
				</g>
				{[0, 1, 2].map((i) => {
					if (f < S.gab.start + 20) return null;
					const k = ((f - S.gab.start + i * 20) % 60) / 60;
					return <circle key={i} cx={locoX - 110 - 20 * k} cy={530 - 110 * k} r={10 + 18 * k} fill="#D8D4FF" opacity={0.8 * (1 - k)} />;
				})}
				{/* who the train stands for: a callout, not a box */}
				{film.cues.L02 && f >= film.cues.L02.start + 26 && f < film.cues.L02.end + 14 ? (
					<g opacity={1 - progress(f, film.cues.L02.end, film.cues.L02.end + 14)}>
						<Callout from={{x: locoX - 110, y: 540}} to={{x: locoX + 40, y: 380}} title="a language model" sub="like ChatGPT or Claude" k={progress(f, film.cues.L02.start + 26, film.cues.L02.start + 60)} size={46} />
					</g>
				) : null}
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
			<Foliage x={-40} y={1120} s={1.5} f={f} blur />
			<Foliage x={1960} y={1130} s={1.7} f={f} blur flip />
			<Motes f={f} />
		</g>
	);
};

export const FlatEmailCard: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const cue = film.cues.L01;
	const k = easeOut(progress(f, cue.start - 4, cue.start + 10), 3) * (1 - easeIn(progress(f, cue.end + 6, cue.end + 20)));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 1040, top: 150, width: 700, transform: `translateY(${(1 - k) * 60}px) rotate(${2 - k}deg) scale(${0.9 + 0.1 * k})`, opacity: k, background: 'linear-gradient(180deg, #FBF8FF 0%, #EEEAFB 49.6%, #E2DDF4 50%, #F6F2FF 51%, #FBF8FF 100%)', padding: '40px 50px 44px', boxShadow: '0 30px 60px rgba(5,8,32,0.6)', fontFamily: FONT, color: K.navy, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 4% 100%, 0 96%)'}}>
			<div style={{position: 'absolute', right: 36, top: 30, width: 70, height: 84, border: `4px dashed ${K.rose}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.rose, fontWeight: 900, fontSize: 30, transform: 'rotate(6deg)'}}>$$$</div>
			<div style={{fontWeight: 800, fontSize: 19, color: '#7A7AA8', letterSpacing: 1}}>from: prizes@cruise-winner.biz</div>
			<div style={{fontWeight: 900, fontSize: 38, lineHeight: 1.25, marginTop: 20, maxWidth: 520}}>{film.fx.email}</div>
			<div style={{fontWeight: 900, fontSize: 36, color: K.orangeLo, marginTop: 22}}>{film.fx.question}</div>
		</div>
	);
};

// ---------- the valley: derail, lighthouse, close ----------
const L = 150;
const WATER = 905;
const BANK: [number, number][] = [[1312, 905], [1350, 925], [1420, 1000], [1440, 1500]];
function pieces(film: Film) {
	let x = 20;
	let y = 742;
	const angles = [0, 0, 0, 0, 0, 0, 10, 20, 28, 28];
	const words = [...film.fx.steps.map((s) => s.chosen.trim() || '␣'), ''];
	return words.map((word, i) => {
		const angle = angles[i] ?? 28;
		const r = (angle * Math.PI) / 180;
		const p = {x, y, angle, word};
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
	// front of the train: rolls down the bank, hits the water at d0 + 44, then drags to a stop
	const sFront = f < d0 + 44 ? lerp(3 * L + 120, 9 * L + 33, Math.pow(progress(f, d0, d0 + 44), 1.6)) : lerp(9 * L + 33, 9 * L + 225, easeOut(progress(f, d0 + 44, d0 + 84), 2));
	const front = at(sFront);
	const rear = at(sFront - 200);
	const bob = f > d0 + 84 ? 3 * Math.sin((f - d0) * 0.12) : 0;
	const loco = {x: front.x, y: front.y + bob, rot: (Math.atan2(front.y - rear.y, front.x - rear.x) * 180) / Math.PI};
	const entry = at(9 * L + 33);
	const J = S.jev.start;
	let dc: SCam = {cx: lerp(820, 1200, easeInOut(progress(f, d0, d0 + 44))), cy: lerp(700, 800, easeInOut(progress(f, d0, d0 + 44))), s: 1.4};
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
					<g transform="translate(1572 340)">
						{[
							{label: 'SCAM', p: pYes, fill: K.orange},
							{label: 'NOT SCAM', p: 1 - pYes, fill: K.teal},
						].map((pn, i) => {
							const h = Math.max(6, PEN * 0.5 * lerp(0.5, pn.p, widths)) * slots;
							const len = PEN * lerp(0.5, pn.p, widths) + 50;
							const y0 = i === 0 ? 0 : PEN * 0.5 * lerp(0.5, pYes, widths) + 14;
							const wave = 5 * Math.sin(g * 0.25 + i);
							const d = `M 0 0 L ${-len * 0.5} ${wave} L ${-len} ${h / 2 + wave * 0.5} L ${-len * 0.5} ${h + wave} L 0 ${h} Z`;
							return (
								<g key={i} transform={`translate(0 ${y0})`}>
									<path d={d} fill={pn.fill} filter="url(#glowBig)" opacity={0.5} />
									<path d={d} fill={pn.fill} />
									<text x={-len - 12} y={h / 2 + 8} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={20} letterSpacing={1} fill={K.white} opacity={slots}>
										{pn.label}
									</text>
								</g>
							);
						})}
						<rect x={-6} y={-8} width={5} height={PEN * 0.5 + 30} rx={2} fill={K.white} />
					</g>
				) : null}
				{tagK > 0 ? <path d={`M ${lamp.x} ${lamp.y} L 1260 120 L 1560 90 Z`} fill="#FFE9A0" opacity={0.18 * tagK} style={{mixBlendMode: 'screen'}} /> : null}
				<Projected x={1400} y={130} text={pYes.toFixed(2)} size={110} k={tagK} sub="P(SCAM) · ONE PASS" />
				{/* the lake at the foot of the lighthouse hill */}
				<Lake bank={BANK} level={WATER} right={2500} bottom={1500} f={f} reflectX={[lamp.x, 560]} lamp={f >= J ? lampOn : 0} />
				<Mist x={1300} y={WATER - 14} w={1200} f={f} />
				{/* ground the track sits on: a plateau and a bank running down into the water */}
				<Terrain line={[[-400, 772], [920, 774], [1070, 800], [1210, 852], [1350, 925], [1420, 1000], [1440, 1500]]} bottom={1500} f={f} seed={4} />
				<Reeds x={1250} y={WATER + 6} f={f} n={5} />
				<Reeds x={1720} y={WATER + 10} f={f} n={7} s={1.15} />
				<Reeds x={2050} y={WATER + 8} f={f} n={5} s={0.9} />
				<Rock x={380} y={786} s={0.7} />
				<Fireflies f={f} x={1150} y={760} w={800} h={130} count={14} color={K.cyan} />
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
				{/* the railway */}
				<SideTrack pieces={ps.map((p, i) => ({x: p.x, y: p.y, angle: p.angle, len: L + 1, word: p.word, hot: i === 6, underwater: i === 9}))} f={f} />
				{cues.L10b && f >= cues.L10b.start && f < S.jev.start + 30
					? (() => {
							const pts = ps.slice(0, film.fx.steps.length).map((p, i) => {
								const r = (p.angle * Math.PI) / 180;
								const step = film.fx.steps[i];
								return {x: p.x + 75 * Math.cos(r), y: p.y + 75 * Math.sin(r) - 70, prob: step.options.find((o) => o.t === step.chosen)?.p ?? 0};
							});
							const out = 1 - progress(f, S.jev.start, S.jev.start + 20);
							const hot = f >= cues.L10b.end - 56;
							const brk = easeOut(progress(f, cues.L10b.end - 56, cues.L10b.end - 36), 2);
							const halo = {paintOrder: 'stroke' as const, stroke: 'rgba(8,10,40,0.75)', strokeWidth: 7, strokeLinejoin: 'round' as const};
							return (
								<g opacity={out}>
									{pts.slice(0, -1).map((a, i) => {
										const b = pts[i + 1];
										const k = easeOut(progress(f, cues.L10b.start + 130 + i * 5, cues.L10b.start + 142 + i * 5), 3);
										if (k <= 0) return null;
										const broken = i === 5 || i === 6;
										const drop = broken ? brk * 40 : 0;
										return [0.3, 0.5, 0.7].map((t, j) => {
											const x = a.x + (b.x - a.x) * t;
											const y = a.y + (b.y - a.y) * t + drop * (j === 1 ? 1 : 0.5);
											const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
											return <ellipse key={`${i}-${j}`} cx={x} cy={y} rx={j % 2 ? 12 : 13} ry={j % 2 ? 4 : 7} transform={`rotate(${ang + (broken ? brk * (j - 1) * 30 : 0)} ${x} ${y})`} fill="none" stroke={broken && hot ? K.rose : '#C9CCFF'} strokeWidth={4} opacity={k * 0.9} />;
										});
									})}
									{pts.map((pt, i) => {
										const k = easeOut(progress(f, cues.L10b.start + 128 + i * 5, cues.L10b.start + 140 + i * 5), 3);
										if (k <= 0) return null;
										const bad = i === 6;
										return (
											<g key={`n${i}`} transform={`translate(${pt.x} ${pt.y}) scale(${k * (bad && hot ? 1.35 : 1)})`}>
												{bad && hot ? <circle r={46} fill={K.rose} opacity={0.4} filter="url(#glowBig)" /> : null}
												<text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={bad ? K.rose : K.white} style={halo}>
													{Math.round(pt.prob * 100)}%
												</text>
											</g>
										);
									})}
								</g>
							);
						})()
					: null}
				{cues.L10b && f >= cues.L10b.start + 6 && f < cues.L10b.start + 116 ? (
					<g opacity={1 - progress(f, cues.L10b.start + 100, cues.L10b.start + 116)}>
						<Callout from={{x: loco.x - 110, y: loco.y - 200}} to={{x: loco.x - 40, y: loco.y - 470}} title="real models usually catch this one" sub="the scene is exaggerated, the mechanism is not" k={progress(f, cues.L10b.start + 6, cues.L10b.start + 40)} size={38} anchor="end" icon="check" />
					</g>
				) : null}
				<g transform={`translate(${loco.x} ${loco.y}) rotate(${loco.rot})`}>
					<FlatLoco worried={f >= d0 + 20} look={f >= J + 150 ? 1 : 0.2} blink={g % 90 < 4 ? 1 : 0} />
				</g>
				{/* everything below the waterline is hidden: the lake is drawn again in front */}
				<WaterFront bank={BANK} level={WATER} right={2500} bottom={1500} f={f} />
				{f >= d0 + 44 ? (
					<>
						{[0, 1, 2, 3].map((i) => {
							const k = progress(f, d0 + 44 + i * 9, d0 + 100 + i * 9);
							if (k <= 0 || k >= 1) return null;
							return <ellipse key={i} cx={entry.x + 40} cy={WATER + 2} rx={40 + 260 * k} ry={6 + 18 * k} fill="none" stroke="#C9D8FF" strokeWidth={4} opacity={0.8 * (1 - k)} />;
						})}
						{progress(f, d0 + 44, d0 + 80) < 1
							? Array.from({length: 22}, (_, i) => {
									const t = (f - d0 - 44) / 24;
									const vx = (((i * 37) % 13) - 4) * 80;
									const vy = -(420 + ((i * 53) % 7) * 80);
									const y = WATER - 4 + vy * t + 1300 * t * t;
									if (y > WATER) return null;
									return (
										<g key={i}>
											<circle cx={entry.x + 40 + vx * t} cy={y} r={4 + (i % 3) * 3} fill="#DCE6FF" />
											<circle cx={entry.x + 40 + vx * t - 1.5} cy={y - 1.5} r={1.5} fill="#FFFFFF" />
										</g>
									);
								})
							: null}
						{/* hot metal meets cold water */}
						<Steam x={entry.x + 60} y={WATER} f={f} start={d0 + 46} dur={150} />
						<Steam x={loco.x - 150} y={WATER - 10} f={f} start={d0 + 70} dur={120} />
					</>
				) : null}
			</g>
			<Foliage x={-60} y={1140} s={1.6} f={f} blur />
			<Foliage x={1990} y={1150} s={1.5} f={f} blur flip />
			<Motes f={f} color={K.yellow} count={18} seed={9} />
		</g>
	);
};
