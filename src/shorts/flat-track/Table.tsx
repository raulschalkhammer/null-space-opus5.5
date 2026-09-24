import React from 'react';
import {rng} from '../../fx/rough';
import {FONT, K} from '../../flat/kit';
import {SteamPress} from '../../characters/steam';
import {WHEEL_DIST, moodAt, speechAt, storyKeys} from './trainMood';
import {Marker} from '../../flat/type';
import {type TCam, fmt, forkState, marbleAt, pct, proj, rect, smooth, strip} from '../paper-track/Table';
import {type Film, type ForkGeo, ROUTE, easeOut, onTwos, progress} from '../paper-track/timeline';

// Flat-vector tabletop: glowing ribbons on a dusk plain. Same geometry as the paper cut, so widths stay honest.

// Rails, sleepers and sheen laid along a track bed whose centreline runs from (x0, zc0) to (x1, zc1).
// The bed's width is the probability; the rails keep a gauge that shrinks only when the bed gets too thin.
const Rails: React.FC<{c: TCam; x0: number; zc0: number; x1: number; zc1: number; w: number; u1?: number; hot?: boolean; glintX?: number}> = ({c, x0, zc0, x1, zc1, w, u1 = 1, hot, glintX}) => {
	if (u1 <= 0.01) return null;
	const g = Math.min(w * 0.3, 42);
	const zAt = (X: number) => lerpZ(zc0, zc1, smooth((X - x0) / (x1 - x0 || 1)));
	const sleepers: React.ReactNode[] = [];
	if (g > 3) {
		const xe = x0 + (x1 - x0) * u1;
		for (let X = Math.ceil(x0 / 64) * 64; X < xe; X += 64) {
			const zc = zAt(X);
			const q = [proj(c, X - 7, zc - g * 1.45), proj(c, X + 7, zc - g * 1.45), proj(c, X + 7, zc + g * 1.45), proj(c, X - 7, zc + g * 1.45)];
			sleepers.push(<path key={X} d={`M ${q.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`} fill={hot ? '#7A4A3A' : '#3A3470'} />);
		}
	}
	const rail = (off: number, key: string) => (
		<g key={key}>
			<path d={strip(c, x0, zc0 + off - 3, 6, x1, zc1 + off - 3, u1)} fill={hot ? '#FFE3B8' : '#9AA2E6'} />
			<path d={strip(c, x0, zc0 + off + 1.2, 1.8, x1, zc1 + off + 1.2, u1)} fill="#FFFFFF" opacity={hot ? 0.95 : 0.55} />
		</g>
	);
	const glint = glintX !== undefined && glintX > x0 && glintX < x0 + (x1 - x0) * u1 ? [-g, g].map((off, i) => {
		const p = proj(c, glintX, zAt(glintX) + off);
		return <ellipse key={i} cx={p.x} cy={p.y} rx={30 * p.s} ry={4 * p.s} fill="#FFFFFF" opacity={0.95} />;
	}) : null;
	return (
		<g>
			<path d={strip(c, x0, zc0 - w * 0.12, w * 0.24, x1, zc1 - w * 0.12, u1)} fill="#FFFFFF" opacity={0.09} />
			{sleepers}
			{g > 1.2 ? [rail(-g, 'a'), rail(g, 'b')] : rail(0, 'a')}
			{glint}
		</g>
	);
};
const lerpZ = (a: number, b: number, t: number) => a + (b - a) * t;

const ForkRibbons: React.FC<{c: TCam; geo: ForkGeo; reveal: number; decided: number; nextX: number; laidTo: number; glintX?: number}> = ({c, geo, reveal, decided, nextX, laidTo, glintX}) => {
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
						<Rails c={c} x0={x} zc0={b.z0 + w / 2} x1={x + BRANCH} zc1={b.z1 + w / 2} w={w} u1={reveal} hot={hot} />
						{!b.chosen && reveal > 0.99 ? (
							<>
								<path d={rect(c, x + BRANCH - 2, x + BRANCH + STUB, b.z1, w)} fill={fill} />
								<Rails c={c} x0={x + BRANCH - 2} zc0={b.z1 + w / 2} x1={x + BRANCH + STUB} zc1={b.z1 + w / 2} w={w} />
							</>
						) : null}
					</g>
				);
			})}
			{decided > 0 && laidTo > x + BRANCH ? (
				<>
					<path d={rect(c, x + BRANCH - 2, Math.min(nextX, laidTo), Zc - geo.chosen.w / 2, Math.max(geo.chosen.w, 1.4))} fill={K.orange} filter="url(#glowBig)" opacity={0.5} />
					<path d={rect(c, x + BRANCH - 2, Math.min(nextX, laidTo), Zc - geo.chosen.w / 2, Math.max(geo.chosen.w, 1.4))} fill="url(#gChosen)" />
					<Rails c={c} x0={x + BRANCH - 2} zc0={Zc} x1={Math.min(nextX, laidTo)} zc1={Zc} w={Math.max(geo.chosen.w, 1.4)} hot glintX={glintX} />
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
	const glintX = train.X + 260 + ((f * 26) % 700);
	const upright: {Z: number; node: React.ReactNode}[] = [];
	// ground detail: light and dark patches lying flat, then tufts, pebbles and flowers standing up
	const rd = rng(15);
	const bits = Array.from({length: 320}, () => ({X: -4000 + rd() * 18000, Z: 1400 + rd() * 3600, k: rd(), s: 0.5 + rd() * 0.9, t: rd()}));
	const patches: React.ReactNode[] = [];
	for (const b of bits) {
		const p = proj(c, b.X, b.Z);
		if (p.x < -300 || p.x > 2220 || p.y < c.horizon) continue;
		if (b.k < 0.18) {
			const rx = 260 * b.s * p.s;
			patches.push(<ellipse key={`pa${b.X}`} cx={p.x} cy={p.y} rx={rx} ry={rx * (c.H / b.Z)} fill={b.t < 0.5 ? '#2F3790' : '#1A205A'} opacity={0.55} />);
			continue;
		}
		if (Math.abs(b.Z - Zc) < W0 * 0.65) continue;
		const sc = p.s * 2 * b.s;
		if (b.k < 0.6) {
			upright.push({Z: b.Z, node: (
				<g key={`tu${b.X}`} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
					{[-7, 0, 7].map((dx, j) => (
						<path key={j} d={`M ${dx} 0 Q ${dx + (j - 1) * 3 + 2 * Math.sin(f * 0.04 + b.X)} -12 ${dx + (j - 1) * 8} ${-20 - j * 3}`} stroke={b.t < 0.5 ? '#4B63C4' : '#2F9AA4'} strokeWidth={3.5} fill="none" strokeLinecap="round" />
					))}
				</g>
			)});
		} else if (b.k < 0.85) {
			upright.push({Z: b.Z, node: (
				<g key={`pb${b.X}`} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
					<ellipse cx={0} cy={0} rx={13} ry={6} fill="#262C74" />
					<ellipse cx={-3} cy={-2} rx={8} ry={3.5} fill="#4F58B6" />
				</g>
			)});
		} else {
			upright.push({Z: b.Z, node: (
				<g key={`fl${b.X}`} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
					<path d="M 0 0 L 0 -18" stroke="#2F9AA4" strokeWidth={2.5} />
					<circle cx={0} cy={-20} r={5} fill={b.t < 0.5 ? '#FF8FB1' : K.yellow} />
					<circle cx={0} cy={-20} r={2} fill="#FFFFFF" />
				</g>
			)});
		}
	}
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
		grounds.push(<ForkRibbons key={i} c={c} geo={geo} reveal={st.reveal} decided={st.decided} nextX={nextX} laidTo={train.X + 520} glintX={glintX} />);
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
		<g key="train" transform={`translate(${tp.x + 150 * ls} ${tp.y})`}>
			<SteamPress livery="claude" f={f} s={ls * 1.05} expr={moodAt(storyKeys(film), f)} speech={speechAt(film, f)} dist={WHEEL_DIST(train.X * tp.s, ls * 1.05)} smokeT={f * 0.012} />
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
		const X = route[0].x - 820;
		const Zt = Zc - W0 / 2 - 200;
		const p0 = proj(c, X, Zt);
		const px = proj(c, X + 1, Zt);
		const pz = proj(c, X, Zt - 1);
		painted.push(
			<g key="ctx" transform={`matrix(${px.x - p0.x} ${px.y - p0.y} ${pz.x - p0.x} ${pz.y - p0.y} ${p0.x} ${p0.y})`}>
				<text textAnchor="middle" y={60} fontFamily={FONT} fontWeight={900} fontSize={190} fill="#8E97D6" opacity={0.55}>
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
			{patches}
			{pondC ? (
				<>
					<ellipse cx={pondC.x} cy={pondC.y} rx={1300 * pondC.s} ry={300 * pondC.s} fill="#0A0F33" />
					<ellipse cx={pondC.x} cy={pondC.y} rx={1300 * pondC.s} ry={300 * pondC.s} fill="none" stroke="#A9C4FF" strokeWidth={4} opacity={0.55} />
					<ellipse cx={pondC.x} cy={pondC.y + 30 * pondC.s} rx={1150 * pondC.s} ry={240 * pondC.s} fill="#1C2A78" opacity={0.6} />
					{Array.from({length: 9}, (_, i) => (
						<rect key={i} x={pondC.x - 900 * pondC.s + ((i * 223 + f * 0.8) % 1700) * pondC.s} y={pondC.y - 150 * pondC.s + ((i * 67) % 300) * pondC.s} width={140 * pondC.s} height={4} rx={2} fill="#8FA2FF" opacity={0.3} />
					))}
					{[-1100, -700, 900, 1150].map((dx, i) => (
						<g key={`rd${i}`} transform={`translate(${pondC.x + dx * pondC.s} ${pondC.y - 120 * pondC.s + (i % 2) * 180 * pondC.s}) scale(${pondC.s * 1.4})`}>
							{[-12, 0, 12].map((x, j) => (
								<g key={j}>
									<path d={`M ${x} 0 L ${x + 3 * Math.sin(f * 0.04 + j)} -${90 + j * 12}`} stroke="#2B3470" strokeWidth={4} strokeLinecap="round" />
									<rect x={x - 5 + 3 * Math.sin(f * 0.04 + j)} y={-(110 + j * 12)} width={10} height={28} rx={5} fill="#8A5A3C" />
								</g>
							))}
						</g>
					))}
				</>
			) : null}
			<path d={rect(c, trunkFrom, first.x + 2, Zc - first.win / 2, first.win)} fill={K.orange} filter="url(#glowBig)" opacity={0.45} />
			<path d={rect(c, trunkFrom, first.x + 2, Zc - first.win / 2, first.win)} fill="url(#gChosen)" />
			<Rails c={c} x0={trunkFrom} zc0={Zc} x1={first.x + 2} zc1={Zc} w={first.win} hot glintX={glintX} />
			{painted}
			{grounds}
			{upright.map((u) => u.node)}
		</g>
	);
};
