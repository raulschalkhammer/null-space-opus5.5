import React from 'react';
import {Gab, type GabFace} from '../../characters/Gab';
import {Jev} from '../../characters/Jev';
import {C, FONT} from '../../lib/palette';
import {rEllipse, rLine, rPath, rRect, rng, smoothPath} from '../../fx/rough';
import {
	type Cam,
	type Pose,
	type StepTiming,
	type Timeline,
	PIECE,
	TRACK_X0,
	TRACK_Y,
	WHEEL_R,
	clamp01,
	easeIn,
	easeInOut,
	easeOut,
	lerp,
	onTwos,
	progress,
} from './timeline';

const deg = (d: number) => (d * Math.PI) / 180;
const local = (p: Pose, lx: number, ly: number) => {
	const r = deg(p.rot);
	return {x: p.x + lx * Math.cos(r) - ly * Math.sin(r), y: p.y + lx * Math.sin(r) + ly * Math.cos(r)};
};
const label = (t: string) => (t.trim() === '' ? '␣' : t.trim());

// ---------- expressions ----------
export function gabFace(tl: Timeline, f: number) {
	const pose = tl.gabPose(f);
	let face: GabFace = 'happy';
	let talk = 0;
	let look = {x: 0.6, y: -0.2};
	let sweat = 0;
	for (const st of tl.steps) {
		if (f >= st.start && f < st.drop) look = {x: 0.7, y: -1};
		if (f >= st.drop && f < st.slam + 4) look = {x: 1, y: 0.5};
		const n = Math.max(1, st.chosen.t.replace(/[^a-z]/gi, '').length > 0 ? Math.ceil(st.chosen.t.length / 4) : 1);
		if (f >= st.slam && f < st.slam + 3 + n * 3) {
			face = 'talk';
			talk = Math.abs(Math.sin(((f - st.slam) * Math.PI) / 3));
		}
		if (st.kind === 'unlucky' && f >= st.spinEnd && f < st.slam + 10) {
			face = 'gulp';
			sweat = progress(f, st.spinEnd, st.spinEnd + 12);
			look = {x: -0.2, y: 0.3};
		}
	}
	if (f >= tl.D && f < tl.LAND) {
		face = 'panic';
		look = {x: -0.3, y: 0.2};
		sweat = 1;
	}
	if (f >= tl.LAND) {
		face = f < tl.LAND + 52 ? 'dazed' : 'curious';
		look = f < tl.LAND + 52 ? {x: 0, y: 0} : {x: 1, y: -1};
		if (f >= tl.JEV_START + 150) look = {x: 1, y: -1};
	}
	const g = onTwos(f);
	const blink = face === 'dazed' ? 0.5 : g % 72 < 4 ? 1 : 0;
	return {pose, face, talk, look, sweat, blink};
}

export function jevState(tl: Timeline, f: number) {
	const J = tl.JEV_START;
	const g = onTwos(f);
	const planted = f >= tl.JEV_PLANT;
	let armRaise = 0;
	let glow = 0;
	let lid = 0.25;
	let look = {x: -0.6, y: 0.1};
	let tilt = 0;
	let squash = 1 + 0.025 * Math.sin(g * 0.16);
	let antenna = 0.35;
	if (planted) {
		const k = progress(f, tl.JEV_PLANT, tl.JEV_PLANT + 6);
		armRaise = easeOut(k) - 0.45 * easeInOut(progress(f, tl.JEV_PLANT + 50, tl.JEV_PLANT + 140));
		glow = Math.max(0.2, 1 - progress(f, tl.JEV_PLANT, tl.JEV_PLANT + 40) * 0.8);
		lid = 0.25 + 0.55 * progress(f, tl.JEV_PLANT + 60, tl.JEV_PLANT + 160);
		antenna = f < tl.JEV_PLANT + 10 ? 1 : 0.35;
	}
	if (f >= J + 28) {
		// perk up: blink, eyes open, tag held high with a fresh glow
		lid = lerp(0.8, 0, easeOut(progress(f, J + 34, J + 40)));
		look = {x: -0.1, y: 0};
		const up = progress(f, J + 38, J + 48);
		armRaise = lerp(0.55, 1, easeOut(up, 4)) + 0.08 * Math.sin(up * Math.PI);
		glow = f < J + 42 ? 0.2 : 0.55 + 0.45 * Math.exp(-(f - J - 42) / 14);
		squash *= 1 + 0.12 * Math.sin(Math.PI * progress(f, J + 36, J + 46));
		antenna = f >= J + 42 && f < J + 50 ? 1 : 0.4;
	}
	if (f >= J + 150) look = {x: -1, y: 0.8};
	if (f >= J + 222) tilt = -12 * easeInOut(progress(f, J + 222, J + 234));
	if ((f >= J + 240 && f < J + 244) || (f >= J + 250 && f < J + 254)) antenna = 1;
	const blinkNow = (f >= J + 28 && f < J + 34) || (g % 86 < 4 && f < J);
	return {armRaise, glow, lid, look, tilt, squash, antenna, blink: blinkNow ? 1 : 0, planted};
}

// ---------- background ----------
const hills = (k: number, base: number, amp: number, seed: number) => {
	const pts: [number, number][] = [];
	for (let x = -7000; x <= 11000; x += 220) {
		pts.push([x, base - amp * (0.6 * Math.sin(x / 900 + seed) + 0.4 * Math.sin(x / 370 + seed * 2.1))]);
	}
	return `${smoothPath(pts)} L 11000 3000 L -7000 3000 Z`;
};
const FAR = hills(0.3, 600, 70, 1.3);
const MID = hills(0.55, 700, 55, 4.2);

const Parallax: React.FC<{cam: Cam; k: number; children: React.ReactNode}> = ({cam, k, children}) => {
	const sl = 1 + (cam.s - 1) * k;
	return <g transform={`translate(960 540) scale(${sl}) translate(${-cam.cx * k} ${-540 - (cam.cy - 540) * k})`}>{children}</g>;
};

export const Sky: React.FC<{cam: Cam; frame: number}> = ({cam, frame}) => {
	const r = rng(11);
	const clouds = Array.from({length: 9}, (_, i) => ({x: -3000 + i * 1300 + r() * 500, y: 120 + r() * 220, w: 260 + r() * 200}));
	return (
		<>
			<defs>
				<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.skyTop} />
					<stop offset="1" stopColor={C.skyBottom} />
				</linearGradient>
			</defs>
			<rect x={-60} y={-60} width={2040} height={1200} fill="url(#sky)" />
			<Parallax cam={cam} k={0.12}>
				<circle cx={1500} cy={210} r={90} fill="#FBE3B0" opacity={0.9} />
				{clouds.map((c, i) => (
					<g key={i} transform={`translate(${c.x + frame * 0.6} ${c.y})`} opacity={0.9}>
						{rEllipse(0, 0, c.w, c.w * 0.32, {seed: 3 + i, fill: '#FFFDF7', fillStyle: 'solid', stroke: C.inkSoft, strokeWidth: 2, roughness: 1.6})}
						{rEllipse(c.w * 0.22, -c.w * 0.1, c.w * 0.5, c.w * 0.3, {seed: 13 + i, fill: '#FFFDF7', fillStyle: 'solid', stroke: 'none', roughness: 1.4})}
					</g>
				))}
			</Parallax>
			<Parallax cam={cam} k={0.3}>
				<path d={FAR} fill={C.farHill} stroke={C.inkSoft} strokeWidth={2} />
			</Parallax>
			<Parallax cam={cam} k={0.55}>
				<path d={MID} fill={C.midHill} stroke={C.inkSoft} strokeWidth={2.5} />
			</Parallax>
		</>
	);
};

// ---------- world pieces ----------
const groundY = (ground: [number, number][], x: number) => {
	for (let i = 0; i < ground.length - 1; i++) {
		const [x0, y0] = ground[i];
		const [x1, y1] = ground[i + 1];
		if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0 || 1));
	}
	return ground[ground.length - 1][1];
};

const Ground: React.FC<{tl: Timeline; seed: number; view: {x0: number; x1: number}}> = ({tl, seed, view}) => {
	const d = smoothPath(tl.ground);
	const fill = `${d} L ${tl.ground[tl.ground.length - 1][0]} 4200 L ${tl.ground[0][0]} 4200 Z`;
	const r = rng(5);
	const tufts: React.ReactNode[] = [];
	for (let x = -1500; x < tl.JEV_X + 1800; x += 70 + Math.floor(r() * 60)) {
		const inSwamp = x > tl.swamp.x0 - 30 && x < tl.swamp.x1 + 30;
		const skip = r() < 0.25;
		if (inSwamp || skip || x < view.x0 - 100 || x > view.x1 + 100) continue;
		const y = groundY(tl.ground, x) + 4;
		tufts.push(
			<g key={x}>
				{rLine(x, y, x - 8, y - 18, {seed: seed + x, stroke: C.grassDark, strokeWidth: 3, roughness: 1.2})}
				{rLine(x + 4, y, x + 6, y - 24, {seed: seed + x + 1, stroke: C.grassDark, strokeWidth: 3, roughness: 1.2})}
				{rLine(x + 8, y, x + 18, y - 15, {seed: seed + x + 2, stroke: C.grassDark, strokeWidth: 3, roughness: 1.2})}
			</g>,
		);
	}
	return (
		<g>
			<path d={fill} fill={C.grass} />
			<path d={fill} fill={C.grassDark} opacity={0.18} transform="translate(0 60)" />
			{rPath(d, {seed, stroke: C.ink, strokeWidth: 4, roughness: 1.1, bowing: 0.5})}
			{tufts}
		</g>
	);
};

const Tree: React.FC<{x: number; y: number; s: number; seed: number}> = ({x, y, s, seed}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{rRect(-9, -120, 18, 122, {seed, fill: C.woodDark, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3, roughness: 1})}
		{rEllipse(0, -175, 150, 140, {seed: seed + 1, fill: '#7FAE62', fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5, roughness: 1.5})}
		{rEllipse(-24, -190, 60, 46, {seed: seed + 2, fill: '#9CC77C', fillStyle: 'solid', stroke: 'none', roughness: 1.2})}
	</g>
);

const Station: React.FC<{seed: number; email: string}> = ({seed}) => (
	<g>
		{rRect(10, 800, 300, 30, {seed, fill: C.dirt, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5, roughness: 1})}
		{rRect(50, 640, 190, 160, {seed: seed + 1, fill: C.cream, fillStyle: 'solid', stroke: C.ink, strokeWidth: 4, roughness: 1})}
		{rPath('M 30 648 L 145 580 L 260 648 Z', {seed: seed + 2, fill: C.gabDark, fillStyle: 'solid', stroke: C.ink, strokeWidth: 4, roughness: 1})}
		{rRect(78, 690, 70, 110, {seed: seed + 3, fill: C.woodDark, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3, roughness: 1})}
		{/* envelope pinned to the wall */}
		<g transform="translate(168 690) rotate(-6)">
			{rRect(0, 0, 58, 40, {seed: seed + 4, fill: '#fff', fillStyle: 'solid', stroke: C.ink, strokeWidth: 2.5, roughness: 0.8})}
			{rPath('M 0 0 L 29 22 L 58 0', {seed: seed + 5, stroke: C.ink, strokeWidth: 2.5, roughness: 0.8})}
			<circle cx={50} cy={8} r={5} fill={C.stamp} />
		</g>
		{rRect(40, 540, 210, 52, {seed: seed + 6, fill: C.wood, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5, roughness: 1})}
		<text x={145} y={578} textAnchor="middle" fontFamily={FONT.title} fontSize={38} fill={C.ink}>
			QUESTION
		</text>
		{rLine(80, 592, 80, 640, {seed: seed + 7, stroke: C.ink, strokeWidth: 4})}
		{rLine(210, 592, 210, 640, {seed: seed + 8, stroke: C.ink, strokeWidth: 4})}
	</g>
);

const Rail: React.FC<{len: number; seed: number}> = ({len, seed}) => (
	<g>
		{Array.from({length: Math.floor(len / 26)}, (_, j) => (
			<rect key={j} x={6 + j * 26} y={2} width={11} height={12} rx={2} fill={C.woodDark} stroke={C.ink} strokeWidth={2} />
		))}
		{rLine(0, 0, len, 0, {seed, stroke: C.rail, strokeWidth: 7, roughness: 0.6})}
		{rLine(0, -3, len, -3, {seed: seed + 1, stroke: C.metalLight, strokeWidth: 2, roughness: 0.4})}
	</g>
);

const PieceBody: React.FC<{word: string; seed: number; squash: number}> = ({word, seed, squash}) => (
	<g transform={`translate(0 62) scale(1 ${squash}) translate(0 -62)`}>
		<Rail len={PIECE} seed={seed} />
		{rRect(8, 18, PIECE - 16, 44, {seed: seed + 2, fill: C.wood, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5, roughness: 1})}
		{rLine(30, 62, 30, 74, {seed: seed + 3, stroke: C.ink, strokeWidth: 5})}
		{rLine(PIECE - 30, 62, PIECE - 30, 74, {seed: seed + 4, stroke: C.ink, strokeWidth: 5})}
		<text x={PIECE / 2} y={52} textAnchor="middle" fontFamily={FONT.hand} fontSize={36} fill={C.ink}>
			{label(word)}
		</text>
	</g>
);

const Dust: React.FC<{x: number; y: number; k: number; seed: number}> = ({x, y, k, seed}) => {
	if (k <= 0 || k >= 1) return null;
	const r = rng(seed);
	return (
		<g opacity={1 - k}>
			{Array.from({length: 6}, (_, i) => {
				const dir = i < 3 ? -1 : 1;
				const dx = dir * (20 + r() * 50) * easeOut(k);
				const dy = -(10 + r() * 25) * easeOut(k);
				return <circle key={i} cx={x + dx} cy={y + dy} r={6 + 14 * k * (0.6 + r() * 0.6)} fill={C.paperDark} stroke={C.inkSoft} strokeWidth={2} />;
			})}
		</g>
	);
};

const Track: React.FC<{tl: Timeline; f: number; seed: number}> = ({tl, f, seed}) => (
	<g>
		{/* siding under Gab at the station */}
		<g transform={`translate(250 ${TRACK_Y})`}>
			{rRect(4, 18, TRACK_X0 - 258, 44, {seed: seed + 901, fill: C.woodDark, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5, roughness: 1})}
			<Rail len={TRACK_X0 - 250} seed={seed + 900} />
		</g>
		{tl.steps.map((st, i) => {
			const p = tl.pieces[i];
			if (f < st.drop) return null;
			const a = deg(p.angle);
			const final = {x: p.x0 + Math.cos(a) * (PIECE / 2) - Math.sin(a) * 30, y: p.y0 + Math.sin(a) * (PIECE / 2) + Math.cos(a) * 30};
			if (f < st.slam) {
				// the chosen word flies off the wheel and becomes a track piece
				const k = progress(f, st.drop, st.slam);
				const wc = tl.wheelCenter(st);
				const from = {x: wc.x + 40, y: wc.y + WHEEL_R * 0.4};
				const e = easeIn(k, 2);
				const cx = lerp(from.x, final.x, e);
				const cy = lerp(from.y, final.y, e) - 90 * Math.sin(Math.PI * k);
				const sc = lerp(0.35, 1, easeOut(k));
				const rot = lerp(-25, p.angle, e);
				return (
					<g key={i} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(${-PIECE / 2} -30)`}>
						<PieceBody word={st.chosen.t} seed={seed + i * 10} squash={1} />
					</g>
				);
			}
			const since = f - st.slam;
			const squash = since < 14 ? 1 - 0.28 * Math.exp(-since / 3) * Math.cos(since * 0.9) : 1;
			return (
				<g key={i}>
					<g transform={`translate(${p.x0} ${p.y0}) rotate(${p.angle})`}>
						<PieceBody word={st.chosen.t} seed={seed + i * 10} squash={squash} />
					</g>
					<Dust x={p.x0 + 6} y={p.y0 + 66} k={progress(f, st.slam, st.slam + 16)} seed={i * 7 + 1} />
					<Dust x={p.x1 - 6} y={p.y1 + 66} k={progress(f, st.slam, st.slam + 16)} seed={i * 7 + 2} />
				</g>
			);
		})}
	</g>
);

// ---------- the wheel of next-word odds ----------
const arc = (a0: number, a1: number, r: number) => {
	const p = (a: number) => [r * Math.sin(deg(a)), -r * Math.cos(deg(a))];
	const [x0, y0] = p(a0);
	const [x1, y1] = p(a1);
	return `M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
};

const Wheel: React.FC<{tl: Timeline; st: StepTiming; f: number; seed: number; gab: Pose}> = ({tl, st, f, seed, gab}) => {
	if (f < st.start || f > st.drop + 8) return null;
	const inK = progress(f, st.start, st.start + 8);
	const outK = progress(f, st.drop, st.drop + 8);
	const pop = easeOut(inK, 2) * (1 + 0.14 * Math.sin(Math.PI * inK)) * (1 - easeIn(outK, 2));
	const c = tl.wheelCenter(st);
	const pointer = tl.pointerAngle(st, f);
	const landed = f >= st.spinEnd;
	const hl = landed ? easeOut(progress(f, st.spinEnd, st.spinEnd + 6)) : 0;
	// pointer flicks as it passes the pegs
	const pa = ((pointer % 360) + 360) % 360;
	const near = Math.min(...st.slices.map((s) => Math.min(Math.abs(s.a0 - pa), Math.abs(s.a0 + 360 - pa))));
	const flick = f < st.spinEnd ? 16 * clamp01(1 - near / 7) : 0;
	const head = local(gab, -126, -262);
	const colors = C.slices;
	return (
		<g>
			{/* thought dots from Gab's paper up to the wheel */}
			{[0.28, 0.5, 0.72].map((t, i) => (
				<circle
					key={i}
					cx={lerp(head.x, c.x - WHEEL_R * 0.55, t)}
					cy={lerp(head.y, c.y + WHEEL_R * 0.75, t)}
					r={(7 + i * 5) * pop}
					fill="#fff"
					stroke={C.ink}
					strokeWidth={3}
				/>
			))}
			<g transform={`translate(${c.x} ${c.y}) scale(${pop})`}>
				<circle r={WHEEL_R + 14} fill={C.cream} stroke={C.ink} strokeWidth={5} />
				<g transform={`rotate(${-pointer})`}>
					{st.slices.map((s, i) => {
						const chosen = i === st.chosenIdx;
						const mid = (s.a0 + s.a1) / 2;
						const push = chosen ? 14 * hl : 0;
						return (
							<g key={i} transform={`translate(${push * Math.sin(deg(mid))} ${-push * Math.cos(deg(mid))})`} opacity={chosen ? 1 : 1 - 0.6 * hl}>
								<path d={arc(s.a0, s.a1, WHEEL_R)} fill={s.other ? C.sliceOther : colors[i % colors.length]} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
							</g>
						);
					})}
					{st.slices.map((s, i) => (
						<circle key={`peg${i}`} cx={(WHEEL_R + 4) * Math.sin(deg(s.a0))} cy={-(WHEEL_R + 4) * Math.cos(deg(s.a0))} r={5} fill={C.gold} stroke={C.ink} strokeWidth={2} />
					))}
				</g>
				{/* upright labels */}
				{st.slices.map((s, i) => {
					const chosen = i === st.chosenIdx;
					const small = s.p < 0.07;
					if (small && !chosen) return null;
					const mid = (s.a0 + s.a1) / 2 - pointer;
					const rr = small ? WHEEL_R + 62 : WHEEL_R * 0.62;
					const x = rr * Math.sin(deg(mid));
					const y = -rr * Math.cos(deg(mid));
					const sc = chosen ? 1 + 0.35 * hl : 1;
					return (
						<g key={`l${i}`} opacity={chosen ? 1 : 1 - 0.6 * hl}>
							{small ? (
								<line x1={(WHEEL_R + 10) * Math.sin(deg(mid))} y1={-(WHEEL_R + 10) * Math.cos(deg(mid))} x2={x * 0.86} y2={y * 0.86} stroke={C.ink} strokeWidth={2.5} />
							) : null}
							<g transform={`translate(${x} ${y}) scale(${sc})`}>
								{small ? <rect x={-62} y={-30} width={124} height={58} rx={10} fill={C.cream} stroke={C.ink} strokeWidth={2.5} /> : null}
								<text textAnchor="middle" y={-2} fontFamily={FONT.hand} fontSize={s.other ? 34 : 29} fill={C.ink}>
									{s.other ? '…' : label(s.t)}
								</text>
								<text textAnchor="middle" y={21} fontFamily={FONT.mono} fontSize={17} fill={C.ink} opacity={0.8}>
									{Math.round(s.p * 100)}%
								</text>
							</g>
						</g>
					);
				})}
				<circle r={22} fill={C.gabDark} stroke={C.ink} strokeWidth={4} />
				<circle r={7} fill={C.gold} stroke={C.ink} strokeWidth={2} />
				{/* pointer */}
				<g transform={`translate(0 ${-WHEEL_R - 8}) rotate(${flick})`}>
					<path d="M -18 -30 L 18 -30 L 0 14 Z" fill={C.stamp} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
				</g>
			</g>
		</g>
	);
};

// ---------- letters puffing out of Gab's paper like steam ----------
const LetterSteam: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => (
	<g>
		{tl.steps.map((st) => {
			if (f < st.slam || f > st.slam + 44) return null;
			const pose = tl.gabPose(st.slam);
			const origin = local(pose, -126, -262);
			const chars = st.chosen.t.trim().split('');
			const r = rng(st.index + 40);
			return chars.map((ch, i) => {
				const k = progress(f, st.slam + i * 2, st.slam + 40 + i * 2);
				if (k <= 0) return null;
				const x = origin.x - 40 + i * 16 + (r() - 0.5) * 30 - 60 * easeOut(k);
				const y = origin.y - 150 * easeOut(k);
				return (
					<text key={`${st.index}-${i}`} x={x} y={y} fontFamily={FONT.hand} fontSize={34} fill={C.inkSoft} opacity={1 - k} transform={`rotate(${(r() - 0.5) * 40} ${x} ${y})`}>
						{ch}
					</text>
				);
			});
		})}
	</g>
);

// ---------- swamp ----------
const SwampBack: React.FC<{tl: Timeline; seed: number}> = ({tl, seed}) => {
	const {x0, x1, y} = tl.swamp;
	return (
		<g>
			<path d={`M ${x0} ${y} L ${x1} ${y} L ${x1 - 90} ${y + 150} L ${x0 + 110} ${y + 150} Z`} fill={C.swamp} />
			{[x0 + 30, x0 + 70, x1 - 60, x1 - 20, x1 - 110].map((rx, i) => (
				<g key={i}>
					{rLine(rx, y + 10, rx + (i % 2 ? 8 : -6), y - 110 - (i % 3) * 20, {seed: seed + i, stroke: C.reed, strokeWidth: 4, roughness: 1})}
					<ellipse cx={rx + (i % 2 ? 8 : -6)} cy={y - 100 - (i % 3) * 20} rx={7} ry={20} fill={C.woodDark} stroke={C.ink} strokeWidth={2.5} />
				</g>
			))}
		</g>
	);
};

const SwampFront: React.FC<{tl: Timeline; f: number; seed: number}> = ({tl, f, seed}) => {
	const {x0, x1, y} = tl.swamp;
	const g = onTwos(f);
	const since = f - tl.LAND;
	const pose = tl.gabPose(f);
	const r = rng(77);
	const drops = Array.from({length: 20}, () => ({vx: (r() - 0.35) * 700, vy: -(400 + r() * 700), s: 5 + r() * 9}));
	return (
		<g>
			<path d={`M ${x0 - 10} ${y} L ${x1 + 10} ${y} L ${x1 - 90} ${y + 160} L ${x0 + 110} ${y + 160} Z`} fill={C.swamp} opacity={0.88} />
			{rLine(x0 - 10, y, x1 + 10, y, {seed: seed + (g % 6), stroke: C.ink, strokeWidth: 4, roughness: 1.4})}
			{[0.2, 0.45, 0.7].map((t, i) => (
				<path key={i} d={`M ${lerp(x0, x1, t) - 40} ${y + 30 + i * 22} q 20 -8 40 0 t 40 0`} fill="none" stroke={C.swampLight} strokeWidth={4} strokeLinecap="round" transform={`translate(${6 * Math.sin(g * 0.1 + i)} 0)`} />
			))}
			{since >= 0 && since < 60
				? [0, 1, 2].map((i) => {
						const k = progress(since, i * 8, 40 + i * 8);
						if (k <= 0 || k >= 1) return null;
						return <ellipse key={i} cx={pose.x - 120} cy={y + 4} rx={60 + 260 * k} ry={10 + 30 * k} fill="none" stroke={C.swampLight} strokeWidth={5} opacity={1 - k} />;
					})
				: null}
			{since >= 0 && since < 30
				? drops.map((d, i) => {
						const t = since / 24;
						const px = tl.landPose.x - 80 + d.vx * t;
						const py = y + d.vy * t + 0.5 * 2600 * t * t;
						if (py > y + 20) return null;
						return <circle key={i} cx={px} cy={py} r={d.s} fill={C.swampLight} stroke={C.ink} strokeWidth={2.5} />;
					})
				: null}
			{since >= 14
				? [0, 1, 2, 3, 4, 5, 6].map((i) => {
						const k = progress(since, 14 + i * 7 + (i % 3) * 3, 40 + i * 7 + (i % 3) * 3);
						if (k <= 0 || k >= 1) return null;
						return <circle key={i} cx={pose.x - 200 + i * 28} cy={y + 60 - 70 * k} r={5 + (i % 3) * 3} fill="none" stroke={C.cream} strokeWidth={3} opacity={1 - k * 0.6} />;
					})
				: null}
		</g>
	);
};

// ---------- Jev's hill ----------
const AnswerHill: React.FC<{tl: Timeline; f: number; seed: number}> = ({tl, f, seed}) => {
	const x = tl.JEV_X;
	const g = onTwos(f);
	const js = jevState(tl, f);
	const wave = (i: number) => 10 * Math.sin(g * 0.2 + i);
	const plantK = progress(f, tl.JEV_PLANT, tl.JEV_PLANT + 22);
	return (
		<g>
			{/* flag */}
			{rLine(x + 190, tl.JEV_GROUND + 30, x + 190, tl.JEV_GROUND - 230, {seed, stroke: C.ink, strokeWidth: 5})}
			<path d={`M ${x + 192} ${tl.JEV_GROUND - 228} Q ${x + 240} ${tl.JEV_GROUND - 222 + wave(0)} ${x + 290} ${tl.JEV_GROUND - 206 + wave(1)} Q ${x + 240} ${tl.JEV_GROUND - 190 + wave(2)} ${x + 192} ${tl.JEV_GROUND - 184} Z`} fill={C.jev} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
			{/* sign */}
			{rRect(x - 9, tl.SIGN_TOP + 60, 18, tl.JEV_GROUND - tl.SIGN_TOP - 50, {seed: seed + 1, fill: C.woodDark, fillStyle: 'solid', stroke: C.ink, strokeWidth: 3.5})}
			{rRect(x - 120, tl.SIGN_TOP, 240, 70, {seed: seed + 2, fill: C.wood, fillStyle: 'solid', stroke: C.ink, strokeWidth: 4})}
			<text x={x} y={tl.SIGN_TOP + 50} textAnchor="middle" fontFamily={FONT.title} fontSize={46} fill={C.ink}>
				ANSWER
			</text>
			{/* the instant answer, seen from far away */}
			{plantK > 0 && plantK < 1 ? <circle cx={x - 40} cy={tl.SIGN_TOP - 60} r={40 + 260 * plantK} fill="none" stroke={C.jevLight} strokeWidth={14} opacity={1 - plantK} /> : null}
			<g transform={`translate(${x - 44} ${tl.SIGN_TOP + 2})`}>
				<Jev
					blink={js.blink}
					lid={js.lid}
					look={js.look}
					tilt={js.tilt}
					squash={js.squash}
					armRaise={js.armRaise}
					glow={js.glow}
					antenna={js.antenna}
					tag={js.planted ? {label: tl.fx.jev.label, p: tl.fx.jev.p} : null}
				/>
			</g>
		</g>
	);
};

// ---------- the whole world ----------
export const World: React.FC<{tl: Timeline; f: number; cam: Cam}> = ({tl, f, cam}) => {
	const seed = 1 + (onTwos(f) / 2) % 5;
	const gf = gabFace(tl, f);
	const pose = gf.pose;
	const g = onTwos(f);
	const bounce = pose.phase === 'track' ? 2.5 * Math.abs(Math.sin(pose.s / 22)) : 0;
	const view = {x0: cam.cx - 960 / cam.s, x1: cam.cx + 960 / cam.s};
	const activeStep = tl.steps.find((st) => f >= st.start && f <= st.drop + 8);
	return (
		<g transform={`translate(960 540) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
			<Tree x={-380} y={TRACK_Y + 72} s={1.1} seed={21} />
			<Tree x={1020} y={TRACK_Y + 72} s={0.9} seed={31} />
			<Tree x={1880} y={TRACK_Y + 72} s={1.2} seed={41} />
			<Tree x={tl.JEV_X - 760} y={tl.JEV_GROUND + 150} s={1} seed={51} />
			<Tree x={tl.JEV_X + 620} y={tl.JEV_GROUND + 110} s={0.8} seed={61} />
			<SwampBack tl={tl} seed={seed + 300} />
			<Ground tl={tl} seed={seed} view={view} />
			<Station seed={seed + 100} email={tl.fx.email} />
			<Track tl={tl} f={f} seed={seed + 200} />
			<AnswerHill tl={tl} f={f} seed={seed + 400} />
			<g transform={`translate(${pose.x} ${pose.y - bounce}) rotate(${pose.rot})`}>
				<Gab
					wheelTurn={pose.s / 28}
					face={gf.face}
					talk={gf.talk}
					look={gf.look}
					blink={gf.blink}
					paperWave={Math.sin(g * 0.35) * (pose.phase === 'track' ? 1 : 0.4)}
					sweat={gf.sweat}
				/>
			</g>
			<LetterSteam tl={tl} f={f} />
			<SwampFront tl={tl} f={f} seed={seed + 500} />
			{activeStep ? <Wheel tl={tl} st={activeStep} f={f} seed={seed} gab={pose} /> : null}
		</g>
	);
};
