import React from 'react';
import {rng} from '../../fx/rough';
import {FONT, FlatLoco, K} from '../../flat/kit';
import {Marker} from '../../flat/type';
import {type TCam, fmt, forkState, marbleAt, pct, proj, rect, strip} from '../paper-track/Table';
import {type Film, type ForkGeo, ROUTE, easeOut, onTwos, progress} from '../paper-track/timeline';

// Flat-vector tabletop: glowing ribbons on a dusk plain. Same geometry as the paper cut, so widths stay honest.

const ForkRibbons: React.FC<{c: TCam; geo: ForkGeo; reveal: number; decided: number; nextX: number; laidTo: number}> = ({c, geo, reveal, decided, nextX, laidTo}) => {
	const {BRANCH, STUB, Zc} = ROUTE;
	const x = geo.x;
	return (
		<g>
			{geo.branches.map((b, i) => {
				const hot = b.chosen && decided > 0;
				const fill = hot ? 'url(#gChosen)' : b.other ? '#3A3F86' : 'url(#gRibbon)';
				const op = b.chosen ? 1 : 1 - 0.6 * decided;
				const w = Math.max(b.w, 1.4);
				const d = strip(c, x, b.z0, w, x + BRANCH, b.z1, reveal);
				return (
					<g key={i} opacity={op}>
						{hot ? <path d={d} fill={K.orange} filter="url(#glowBig)" opacity={0.55} /> : null}
						<path d={d} fill={fill} />
						{!b.chosen && reveal > 0.99 ? <path d={rect(c, x + BRANCH - 2, x + BRANCH + STUB, b.z1, w)} fill={fill} /> : null}
					</g>
				);
			})}
			{decided > 0 && laidTo > x + BRANCH ? (
				<>
					<path d={rect(c, x + BRANCH - 2, Math.min(nextX, laidTo), Zc - geo.chosen.w / 2, Math.max(geo.chosen.w, 1.4))} fill={K.orange} filter="url(#glowBig)" opacity={0.5} />
					<path d={rect(c, x + BRANCH - 2, Math.min(nextX, laidTo), Zc - geo.chosen.w / 2, Math.max(geo.chosen.w, 1.4))} fill="url(#gChosen)" />
				</>
			) : null}
		</g>
	);
};

export const FlatTableWorld: React.FC<{
	film: Film;
	f: number;
	c: TCam;
	route: ForkGeo[];
	trunkFrom: number;
	revealAt: (k: number) => number;
	train: {X: number; Z: number; cum: number};
	showGauge?: boolean;
	pond?: boolean;
	contextCard?: string;
	glowCards?: number;
}> = ({film, f, c, route, trunkFrom, revealAt, train, showGauge, pond, contextCard, glowCards = -1}) => {
	const {Zc, W0, BRANCH, STUB} = ROUTE;
	const g = onTwos(f);
	const r = rng(8);
	const rocks = Array.from({length: 80}, () => ({X: -3000 + r() * 16000, Z: 1500 + r() * 3200, h: 0.6 + r() * 0.9, kind: r()}));
	const upright: {Z: number; node: React.ReactNode}[] = [];
	for (const t of rocks) {
		if (Math.abs(t.Z - Zc) < W0 * 0.8) continue;
		const p = proj(c, t.X, t.Z);
		if (p.x < -100 || p.x > 2020) continue;
		const sc = p.s * 2 * t.h;
		upright.push({Z: t.Z, node: t.kind < 0.6 ? (
			<g key={`r${t.X}`} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
				<path d="M -26 0 Q -22 -26 0 -30 Q 22 -26 26 0 Z" fill="#3A3F92" />
				<path d="M -26 0 Q -22 -26 0 -30 L 0 0 Z" fill="#4B52AE" />
			</g>
		) : (
			<g key={`p${t.X}`} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
				<rect x={-3} y={-50} width={6} height={50} rx={3} fill="#2A2F78" />
				<circle cx={0} cy={-58} r={20} fill="#27B8A5" />
				<circle cx={-6} cy={-64} r={8} fill="#5FE3CC" opacity={0.7} />
			</g>
		)});
	}
	const grounds: React.ReactNode[] = [];
	route.forEach((geo, i) => {
		const st = forkState(film, geo, f, revealAt(i));
		if (st.reveal <= 0) return;
		const nextX = route[i + 1]?.x ?? geo.x + BRANCH + 900;
		grounds.push(<ForkRibbons key={i} c={c} geo={geo} reveal={st.reveal} decided={st.decided} nextX={nextX} laidTo={train.X + 520} />);
		geo.branches.forEach((b, j) => {
			if (b.chosen || b.p < 0.07) return;
			const p = proj(c, geo.x + BRANCH + STUB + 60 + j * 175, b.z1 + b.w / 2);
			const pop = easeOut(progress(f, revealAt(i) + 8 + j * 2, revealAt(i) + 18 + j * 2), 2);
			if (pop > 0.01) upright.push({Z: b.z1 + b.w / 2, node: <Marker key={`l${i}-${j}`} x={p.x} y={p.y} s={p.s * 2.2 * pop} title={b.other ? 'others' : b.t.trim() || '␣'} sub={pct(b.p)} opacity={1 - 0.8 * st.decided} />});
		});
		const ch = geo.chosen;
		const glow = glowCards >= i;
		const cz = Zc + Math.max(ch.w, 30) / 2 + 70;
		const cp = proj(c, geo.x + BRANCH * 0.62, cz);
		const pop = easeOut(progress(f, revealAt(i) + 8, revealAt(i) + 18), 2);
		if (pop > 0.01) upright.push({Z: cz, node: <Marker key={`c${i}`} x={cp.x} y={cp.y} s={cp.s * 2.2 * pop * (glow ? 1.25 : 1)} title={ch.t.trim() || '␣'} sub={st.decided > 0.5 ? `× ${fmt(ch.p)}` : pct(ch.p)} hot={st.decided > 0.5 || glow} />});
		const m = marbleAt(film, geo, f);
		if (m) {
			const p = proj(c, m.X, m.Z);
			const mr = Math.min(26, geo.win * 0.3) * p.s;
			upright.push({Z: m.Z - 1, node: (
				<g key={`m${i}`} opacity={m.fade}>
					<circle cx={p.x} cy={p.y - mr} r={mr * 3} fill={K.yellow} opacity={0.25} filter="url(#glowBig)" />
					<ellipse cx={p.x} cy={p.y} rx={1.2 * mr} ry={0.35 * mr} fill="#070B26" opacity={0.5} />
					<circle cx={p.x} cy={p.y - mr} r={mr} fill="url(#gOrb)" />
				</g>
			)});
		}
	});
	const first = route[0];
	const tp = proj(c, train.X, train.Z);
	const ls = tp.s * 1.6;
	upright.push({Z: train.Z - 2, node: (
		<g key="train" transform={`translate(${tp.x + 150 * ls} ${tp.y + 3 * Math.sin(g * 0.5) * tp.s})`}>
			<FlatLoco scale={ls} look={0.8} blink={g % 90 < 4 ? 1 : 0} />
			{showGauge ? (
				<g transform={`translate(${-250 * ls} ${-250 * ls}) scale(${tp.s * 2.2})`}>
					<rect x={-14} y={-150} width={28} height={150} rx={14} fill="#0B1030" opacity={0.6} />
					<rect x={-10} y={-4 - 142 * Math.max(train.cum, 0.004)} width={20} height={142 * Math.max(train.cum, 0.004)} rx={10} fill={K.orange} />
					<rect x={-10} y={-4 - 142 * Math.max(train.cum, 0.004)} width={20} height={142 * Math.max(train.cum, 0.004)} rx={10} fill={K.orange} filter="url(#glow)" opacity={0.6} />
					<rect x={-14} y={-150} width={28} height={150} rx={14} fill="none" stroke="#C9CCFF" strokeWidth={3} opacity={0.8} />
					<rect x={-8} y={-140} width={5} height={120} rx={2.5} fill="#FFFFFF" opacity={0.25} />
					<text x={-26} y={-110} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40} fill={K.orangeHi} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 7}}>
						{fmt(train.cum)}
					</text>
					<text x={-26} y={-78} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={20} fill={K.mute} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.7)', strokeWidth: 6}}>
						chance so far
					</text>
				</g>
			) : null}
		</g>
	)});
	const painted: React.ReactNode[] = [];
	if (contextCard) {
		const X = route[0].x - 1250;
		const p0 = proj(c, X, Zc);
		const px = proj(c, X + 1, Zc);
		const pz = proj(c, X, Zc - 1);
		painted.push(
			<g key="ctx" transform={`matrix(${px.x - p0.x} ${px.y - p0.y} ${pz.x - p0.x} ${pz.y - p0.y} ${p0.x} ${p0.y})`}>
				<text textAnchor="middle" y={45} fontFamily={FONT} fontWeight={900} fontSize={150} fill="#A8421C" opacity={0.75}>
					{contextCard}
				</text>
			</g>,
		);
	}
	upright.sort((a, b) => b.Z - a.Z);
	const pondC = pond ? proj(c, route[0].x + BRANCH + 1350, Zc) : null;
	const hz = c.horizon;
	return (
		<g>
			<rect x={-50} y={hz} width={2020} height={Math.max(0, 1140 - hz)} fill="url(#gGround)" />
			{pondC ? (
				<>
					<ellipse cx={pondC.x} cy={pondC.y} rx={1300 * pondC.s} ry={300 * pondC.s} fill="#0A0F33" />
					<ellipse cx={pondC.x} cy={pondC.y - 10 * pondC.s} rx={1000 * pondC.s} ry={200 * pondC.s} fill="none" stroke={K.cyan} strokeWidth={3} opacity={0.3} />
				</>
			) : null}
			<path d={rect(c, trunkFrom, first.x + 2, Zc - first.win / 2, first.win)} fill={K.orange} filter="url(#glowBig)" opacity={0.45} />
			<path d={rect(c, trunkFrom, first.x + 2, Zc - first.win / 2, first.win)} fill="url(#gChosen)" />
			{painted}
			{grounds}
			{upright.map((u) => u.node)}
		</g>
	);
};
