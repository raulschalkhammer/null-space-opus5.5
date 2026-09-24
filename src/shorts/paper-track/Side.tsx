import React from 'react';
import {LAMP_Y, Layer, Lighthouse, Loco, P, SERIF} from '../../paper/kit';
import {type Film, clamp01, easeIn, easeInOut, easeOut, lerp, onTwos, progress} from './timeline';

// Side-view diorama shots. Camera = {cx, cy, s}: world point (cx, cy) sits at screen centre.
export type SCam = {cx: number; cy: number; s: number};
const camT = (c: SCam) => `translate(960 540) scale(${c.s}) translate(${-c.cx} ${-c.cy})`;
// Background layers move less than the camera (parallax), keyed by depth k (0 = fixed, 1 = world).
const Para: React.FC<{c: SCam; k: number; children: React.ReactNode}> = ({c, k, children}) => (
	<g transform={`translate(960 540) scale(${1 + (c.s - 1) * k}) translate(${-(960 + (c.cx - 960) * k)} ${-(540 + (c.cy - 540) * k)})`}>{children}</g>
);

const Backdrop: React.FC<{c: SCam; sunY?: number}> = ({c, sunY = 250}) => (
	<>
		<Para c={c} k={0.15}>
			<g filter="url(#dof2)">
				<circle cx={1230} cy={sunY} r={120} fill={P.sun} />
			</g>
		</Para>
		<Para c={c} k={0.35}>
			<g filter="url(#dof2)">
				<path d="M -800 560 C -400 480 0 520 260 470 C 520 420 420 520 640 480 C 900 430 1080 520 1320 470 C 1560 420 1760 470 2000 440 C 2300 400 2600 470 2900 450 L 2900 1400 L -800 1400 Z" fill={P.sageFar} />
			</g>
		</Para>
	</>
);

// ---------- station: the email arrives (S1, S2) ----------
export const StationScene: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const {S} = film;
	const g = onTwos(f);
	const push = easeInOut(progress(f, S.gab.start - 6, S.gab.end));
	const c: SCam = {cx: lerp(900, 780, push), cy: lerp(560, 600, push), s: lerp(1, 1.45, push)};
	// the letter flutters down onto the notice board
	const fl = progress(f, S.letter.start + 8, S.letter.start + 64);
	const lx = lerp(1150, 322, easeInOut(fl)) + 60 * Math.sin(fl * 9) * (1 - fl);
	const ly = lerp(-120, 612, easeOut(fl, 1.4));
	const lr = 28 * Math.sin(fl * 11) * (1 - fl) - 4;
	// Gab rolls forward a little at the end, sleepers appearing ahead of it
	const roll = easeInOut(progress(f, S.gab.end - 60, S.gab.end + 12));
	const locoX = 820 + 380 * roll;
	return (
		<g>
			<Backdrop c={c} />
			<g transform={camT(c)}>
				<Layer shadow={1}>
					<path d="M -600 640 C -300 590 20 640 300 610 C 560 580 800 630 1060 600 C 1300 570 1560 620 1800 590 C 2100 560 2400 610 2700 600 L 2700 1500 L -600 1500 Z" fill={P.sage} />
				</Layer>
				<Layer shadow={2}>
					<path d="M -600 760 L 2700 760 L 2700 1500 L -600 1500 Z" fill={P.sageDeep} />
				</Layer>
				{/* station booth */}
				<Layer shadow={2}>
					<rect x={200} y={600} width={240} height={160} fill={P.cream} />
					<path d="M 180 606 L 320 530 L 460 606 Z" fill={P.rust} />
					<rect x={230} y={650} width={60} height={110} fill="#6A5A48" />
					<rect x={296} y={590} width={144} height={6} fill={P.ink} />
				</Layer>
				<Layer shadow={1}>
					<rect x={236} y={488} width={168} height={40} fill={P.card} />
					<text x={320} y={516} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={20} letterSpacing={4} fill={P.ink}>
						QUESTION
					</text>
				</Layer>
				{/* rail stub + sleepers laid as Gab moves */}
				<rect x={480} y={738} width={420 + 380 * roll} height={5} fill={P.ink} />
				{Array.from({length: 4 + Math.floor(roll * 4)}, (_, i) => (
					<Layer key={i} shadow={1}>
						<rect x={490 + i * 96} y={743} width={88} height={22} fill={P.strip} />
					</Layer>
				))}
				<g transform={`translate(${locoX} ${741 + Math.abs(Math.sin(g * 0.3)) * (roll > 0 && roll < 1 ? 2 : 0)})`}>
					<Loco />
				</g>
				{/* paper steam puffs */}
				{[0, 1, 2].map((i) => {
					const k = ((f - S.gab.start + i * 20) % 60) / 60;
					if (f < S.gab.start + 20) return null;
					return <circle key={i} cx={locoX - 110 - 20 * k} cy={530 - 110 * k} r={10 + 16 * k} fill={P.card} opacity={0.9 * (1 - k)} filter="url(#cast1)" />;
				})}
				{/* the letter */}
				<g transform={`translate(${lx} ${ly}) rotate(${lr})`}>
					<Layer shadow={fl < 1 ? 3 : 1}>
						<rect x={-50} y={-34} width={100} height={68} fill={P.card} />
						<path d="M -50 -34 L 0 4 L 50 -34" fill="none" stroke={P.faint} strokeWidth={2.5} />
						<rect x={28} y={-28} width={14} height={18} fill={P.rust} />
					</Layer>
				</g>
			</g>
		</g>
	);
};

// The email itself, shown while the narrator reads it.
export const EmailCard: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const cue = film.cues.L01;
	const k = easeOut(progress(f, cue.start - 4, cue.start + 10), 3) * (1 - easeIn(progress(f, cue.end + 6, cue.end + 20)));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 1040, top: 180, width: 700, transform: `translateY(${(1 - k) * 40}px) rotate(1.5deg)`, opacity: k, background: P.card, padding: '34px 42px', boxShadow: '10px 16px 30px rgba(58,42,24,0.35)', fontFamily: SERIF, color: P.ink}}>
			<div style={{fontWeight: 600, fontSize: 16, letterSpacing: 5, color: '#8A7B66'}}>FROM: prizes@cruise-winner.biz</div>
			<div style={{fontSize: 34, lineHeight: 1.3, marginTop: 14}}>{film.fx.email}</div>
			<div style={{fontStyle: 'italic', fontSize: 34, color: P.rust, marginTop: 18}}>{film.fx.question}</div>
		</div>
	);
};

// ---------- the valley: derail, lighthouse, close (S8, S9, S10) ----------
const L = 150;
function pieces(film: Film) {
	let x = 20;
	let y = 742;
	const u = 6;
	return film.fx.steps.map((s, i) => {
		const k = i - u;
		const angle = k < 0 ? 0 : 7 + 12 * k;
		const r = (angle * Math.PI) / 180;
		const p = {x, y, angle, word: s.chosen.trim() || '␣'};
		x += L * Math.cos(r);
		y += L * Math.sin(r);
		return p;
	});
}

export const ValleyScene: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const {S, cues} = film;
	const g = onTwos(f);
	const ps = pieces(film);
	const last = ps[ps.length - 1];
	const endX = last.x + L * Math.cos((last.angle * Math.PI) / 180);
	const endY = last.y + L * Math.sin((last.angle * Math.PI) / 180);
	const lamp = {x: 1605, y: 443 + LAMP_Y};

	// ----- Gab's run to the edge, tip, splash, float -----
	const d0 = S.derail.start;
	const run = easeInOut(progress(f, d0, d0 + 26));
	const sAlong = lerp(3 * L, 9 * L, run); // distance along the track
	const at = (s: number) => {
		const i = Math.min(ps.length - 1, Math.max(0, Math.floor(s / L)));
		const p = ps[i];
		const u = (s - i * L) / L;
		const r = (p.angle * Math.PI) / 180;
		return {x: p.x + u * L * Math.cos(r), y: p.y + u * L * Math.sin(r), a: p.angle};
	};
	let loco = {...at(sAlong), rot: at(sAlong).a};
	const tip = progress(f, d0 + 28, d0 + 44);
	if (f >= d0 + 26) {
		loco = {x: endX + 70 * easeIn(tip) + 10, y: endY + 150 * easeIn(tip, 2.2), a: 0, rot: last.angle + 8 + 55 * easeIn(tip)};
	}
	const splashK = progress(f, d0 + 44, d0 + 80);
	if (f >= d0 + 44) {
		const u = (f - d0 - 44) / 24;
		const damp = Math.exp(-2.6 * u);
		loco = {x: endX + 120 + 60 * easeOut(clamp01(u / 1.4)), y: endY + 176 + 14 * damp * Math.cos(7 * u) + 3 * Math.sin(u * 2), a: 0, rot: 12 + 40 * damp * Math.cos(6 * u)};
	}

	// ----- camera -----
	const J = S.jev.start;
	const derailCam: SCam = {cx: lerp(760, 1080, easeInOut(progress(f, d0, d0 + 40))), cy: lerp(700, 800, easeInOut(progress(f, d0, d0 + 40))), s: 1.45};
	const shake = f >= d0 + 44 ? Math.exp(-(f - d0 - 44) / 6) : 0;
	const wide: SCam = {cx: 960, cy: 540, s: 1};
	const jevK = easeInOut(progress(f, J, J + 40));
	const closeK = easeInOut(progress(f, S.close.start, S.close.end));
	let c: SCam = f < J ? {cx: derailCam.cx + 10 * shake * Math.sin(f * 2.1), cy: derailCam.cy + 8 * shake * Math.cos(f * 2.9), s: derailCam.s} : {cx: lerp(derailCam.cx, 1150, jevK), cy: lerp(derailCam.cy, 520, jevK), s: lerp(1.45, 1.12, jevK)};
	if (f >= cues.L12.start) {
		const k = easeInOut(progress(f, cues.L12.start, cues.L12.start + 50));
		c = {cx: lerp(1150, wide.cx, k), cy: lerp(520, wide.cy, k), s: lerp(1.12, wide.s, k)};
	}
	if (f >= S.close.start) c = {cx: 960, cy: lerp(540, 520, closeK), s: lerp(1, 0.94, closeK)};

	// ----- Jev: lamp on, beam sweeps onto the letter, pennants unfurl -----
	const lampOn = easeOut(progress(f, J + 20, J + 34), 2);
	const sweep = easeInOut(progress(f, cues.L12.start + 26, cues.L12.start + 76));
	const beamAngle = lerp(38, 0, sweep); // 0 = pointing at the letter
	const slots = easeOut(progress(f, cues.L12.end - 60, cues.L12.end - 40), 2);
	const widths = easeInOut(progress(f, cues.L12.end - 30, cues.L12.end + 6));
	const tagK = easeOut(progress(f, cues.L13.start - 4, cues.L13.start + 10), 2);
	const pYes = film.fx.jev.p;
	const letter = {x: 60, y: 520, w: 190, h: 130};
	const beamTarget = {x: letter.x + letter.w / 2, y: letter.y + letter.h / 2};
	const dx = beamTarget.x - lamp.x;
	const dy = beamTarget.y - lamp.y;
	const dist = Math.hypot(dx, dy);
	const baseAng = (Math.atan2(dy, dx) * 180) / Math.PI;
	const spread = (Math.atan2(letter.h * 0.75, dist) * 180) / Math.PI;
	const PENNANT = 170; // full length/width scale of the signal pennants

	return (
		<g>
			<Backdrop c={c} />
			<g transform={camT(c)}>
				{/* mid hills + lighthouse hill */}
				<Layer shadow={1}>
					<path d="M -400 640 C 300 590 520 640 760 600 C 1000 560 1180 640 1360 560 C 1480 505 1560 430 1640 432 C 1760 436 1840 520 2400 540 L 2400 1500 L -400 1500 Z" fill={P.sage} />
				</Layer>
				{/* beam (under the lighthouse, screen-blended) */}
				{lampOn > 0 ? (
					<g transform={`translate(${lamp.x} ${lamp.y}) rotate(${baseAng + beamAngle})`} opacity={lampOn * (sweep > 0 ? 1 : 0.35)} style={{mixBlendMode: 'screen'}}>
						<path d={`M 0 -10 L ${dist + 40} ${-Math.tan((spread * Math.PI) / 180) * (dist + 40)} L ${dist + 40} ${Math.tan((spread * Math.PI) / 180) * (dist + 40)} L 0 10 Z`} fill="url(#beamR2L)" />
					</g>
				) : null}
				<g transform="translate(1605 443)">
					<Lighthouse />
				</g>
				<circle cx={lamp.x} cy={lamp.y} r={40 + 50 * lampOn} fill="url(#lampGlow)" opacity={lampOn} style={{mixBlendMode: 'screen'}} />
				{/* signal pennants: only the allowed answers, each as wide as its probability */}
				{slots > 0 ? (
					<g transform={`translate(${1632} ${340})`}>
						{[
							{label: 'SCAM', p: pYes, y: 0, fill: P.rust},
							{label: 'NOT SCAM', p: 1 - pYes, y: 0, fill: P.teal},
						].map((pn, i) => {
							const h = Math.max(6, PENNANT * 0.5 * lerp(0.5, pn.p, widths)) * slots;
							const len = PENNANT * lerp(0.5, pn.p, widths) + 50;
							const y0 = i === 0 ? 0 : PENNANT * 0.5 * lerp(0.5, pYes, widths) + 14;
							const wave = 5 * Math.sin(g * 0.25 + i);
							return (
								<g key={i} transform={`translate(0 ${y0})`}>
									<Layer shadow={1}>
										<path d={`M 0 0 L ${len * 0.5} ${wave} L ${len} ${h / 2 + wave * 0.5} L ${len * 0.5} ${h + wave} L 0 ${h} Z`} fill={pn.fill} />
									</Layer>
									<text x={len + 12} y={h / 2 + 7} fontFamily={SERIF} fontWeight={600} fontSize={18} letterSpacing={2} fill={P.ink} opacity={slots}>
										{pn.label}
									</text>
								</g>
							);
						})}
						<line x1={-4} y1={-6} x2={-4} y2={PENNANT * 0.5 + 20} stroke={P.ink} strokeWidth={3} />
					</g>
				) : null}
				{tagK > 0 ? (
					<g transform={`translate(1640 ${560 - 10 * (1 - tagK)}) rotate(-3)`} opacity={tagK}>
						<Layer shadow={1}>
							<rect x={0} y={0} width={248} height={92} rx={6} fill={P.card} />
							<text x={124} y={40} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={22} fill={P.ink}>
								p(scam | email) =
							</text>
							<text x={124} y={78} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={34} fill={P.rust}>
								{pYes.toFixed(2)} · one pass
							</text>
						</Layer>
					</g>
				) : null}
				{/* plateau, cliff, pond */}
				<Layer shadow={2}>
					<path d="M -400 760 L 900 760 C 980 770 1040 820 1090 880 C 1120 920 1140 960 1150 1400 L -400 1400 Z" fill={P.sageDeep} />
				</Layer>
				<Layer shadow={1}>
					<path d="M 1130 930 C 1250 900 1450 905 1600 940 C 1650 960 1640 1000 1560 1010 C 1400 1030 1220 1020 1150 995 C 1100 975 1100 945 1130 930 Z" fill={P.pond} />
				</Layer>
				{/* the letter on its post */}
				<Layer shadow={2}>
					<g transform={`translate(${letter.x} ${letter.y}) rotate(-3)`}>
						<rect width={letter.w} height={letter.h} fill={P.card} />
						<path d={`M 0 0 L ${letter.w / 2} ${letter.h * 0.55} L ${letter.w} 0`} fill="none" stroke={P.faint} strokeWidth={3} />
						<rect x={letter.w - 36} y={10} width={24} height={30} fill={P.rust} />
					</g>
					<line x1={150} y1={650} x2={150} y2={742} stroke={P.ink} strokeWidth={5} />
				</Layer>
				{/* track */}
				{ps.map((p, i) => (
					<g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
						<Layer shadow={1}>
							<rect x={4} y={4} width={142} height={34} fill={i === 6 ? P.stripHot : P.strip} />
							<text x={75} y={28} textAnchor="middle" fontFamily={SERIF} fontSize={20} fontWeight={600} letterSpacing={2.5} fill={i === 6 ? P.rust : P.ink}>
								{p.word.toUpperCase()}
							</text>
						</Layer>
						<rect x={0} y={-4} width={150} height={5} fill={P.ink} />
					</g>
				))}
				{/* Gab */}
				<g transform={`translate(${loco.x} ${loco.y}) rotate(${loco.rot})`}>
					<Loco />
				</g>
				{/* water in front of the sunk loco, ripples, droplets */}
				{f >= d0 + 44 ? (
					<>
						<path d="M 1128 948 C 1250 925 1450 928 1598 956 C 1640 972 1632 1000 1556 1010 C 1400 1030 1220 1020 1150 995 C 1104 978 1104 958 1128 948 Z" fill={P.pond} opacity={0.9} />
						{[0, 1, 2].map((i) => {
							const k = progress(f, d0 + 44 + i * 8, d0 + 90 + i * 8);
							if (k <= 0 || k >= 1) return null;
							return <ellipse key={i} cx={endX + 60} cy={950} rx={40 + 220 * k} ry={8 + 20 * k} fill="none" stroke={P.pondLight} strokeWidth={4} opacity={1 - k} />;
						})}
						{splashK < 1
							? Array.from({length: 14}, (_, i) => {
									const t = (f - d0 - 44) / 24;
									const vx = (((i * 37) % 13) - 5) * 90;
									const vy = -(500 + ((i * 53) % 7) * 90);
									const y = 940 + vy * t + 1300 * t * t;
									if (y > 950) return null;
									return <circle key={i} cx={endX + 60 + vx * t} cy={y} r={5 + (i % 3) * 3} fill={P.pondLight} filter="url(#cast1)" />;
								})
							: null}
					</>
				) : null}
				<Layer blur={6}>
					<path d="M -400 1400 L -400 930 C 60 900 90 960 130 900 C 170 850 200 960 260 930 C 330 900 360 1000 420 1400 Z" fill={P.shade} />
					<path d="M 2400 1400 L 2400 880 C 1860 860 1840 930 1790 900 C 1740 870 1720 960 1660 960 C 1610 960 1600 1040 1560 1400 Z" fill={P.shade} />
				</Layer>
			</g>
		</g>
	);
};
