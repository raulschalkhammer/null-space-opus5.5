import React from 'react';
import {Layer, Loco, P, SERIF} from '../../paper/kit';
import {rng} from '../../fx/rough';
import {type Film, type ForkGeo, ROUTE, buildRoute, clamp01, easeInOut, easeOut, lerp, onTwos, progress} from './timeline';

// Tabletop shots: the route seen from above at an angle. Probability is width: the paper track is exactly
// as wide as the chance of the sentence so far, forks split it, and a marble picks a branch with a
// chance equal to its width.

export type TCam = {camX: number; f: number; H: number; horizon: number};
const proj = (c: TCam, X: number, Z: number) => ({x: 960 + (c.f * (X - c.camX)) / Z, y: c.horizon + (c.f * c.H) / Z, s: c.f / Z});
const smooth = (t: number) => {
	const x = clamp01(t);
	return x * x * (3 - 2 * x);
};

// Paper strip between two edge curves (Sankey link), projected. u0..u1 limits how much of it is drawn.
function strip(c: TCam, x0: number, zb0: number, w: number, x1: number, zb1: number, u1 = 1, n = 28) {
	const pts: {x: number; y: number}[] = [];
	const edge = (off: number) => Array.from({length: n + 1}, (_, i) => {
		const u = (i / n) * u1;
		return proj(c, lerp(x0, x1, u), lerp(zb0, zb1, smooth(u)) + off);
	});
	pts.push(...edge(w), ...edge(0).reverse());
	return `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`;
}
const rect = (c: TCam, x0: number, x1: number, zb: number, w: number) => strip(c, x0, zb, w, x1, zb);

// Upright paper card on a little stick, standing on the ground plane.
const Card: React.FC<{c: TCam; X: number; Z: number; title: string; sub?: string; hot?: boolean; opacity?: number; pop?: number; big?: number}> = ({c, X, Z, title, sub, hot, opacity = 1, pop = 1, big = 1}) => {
	const p = proj(c, X, Z);
	const s = p.s * 2.3 * big * pop;
	if (pop <= 0.01) return null;
	const w = Math.max(90, title.length * 17 + 40);
	return (
		<g transform={`translate(${p.x} ${p.y}) scale(${s})`} opacity={opacity}>
			<Layer shadow={1}>
				<rect x={-2} y={-46} width={4} height={46} fill={P.ink} />
				<rect x={-w / 2} y={-46 - (sub ? 76 : 50)} width={w} height={sub ? 76 : 50} rx={5} fill={hot ? '#F1D3AE' : P.card} />
				<text x={0} y={-46 - (sub ? 44 : 16)} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={28} fill={P.ink}>
					{title}
				</text>
				{sub ? (
					<text x={0} y={-58} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={24} fill={hot ? P.rust : '#6D6152'}>
						{sub}
					</text>
				) : null}
			</Layer>
		</g>
	);
};

const pct = (p: number) => `${Math.round(p * 100)}%`;
export const fmt = (p: number) => (p >= 0.1 ? p.toFixed(2) : p >= 0.01 ? p.toFixed(3) : p.toPrecision(2));

// ---------- state over time ----------
export function forkState(film: Film, geo: ForkGeo, f: number, revealAt: number) {
	const t = film.forkTimes.find((x) => x.k === geo.k)!;
	return {
		reveal: easeOut(progress(f, revealAt, revealAt + 18), 2),
		decided: easeOut(progress(f, t.land, t.land + 10), 2),
		t,
	};
}

export function trainAt(film: Film, route: ForkGeo[], f: number, start: number) {
	const {WAIT, BRANCH, Zc} = ROUTE;
	let X = route[0].x - WAIT - 700 + 700 * easeInOut(progress(f, start, start + 40));
	let k = 0;
	for (const ft of film.forkTimes) {
		if (!route[ft.k] || route[ft.k].k !== ft.k) continue;
		if (f >= ft.go) {
			const nx = route[ft.k + 1]?.x ?? route[ft.k].x + BRANCH + 900;
			X = lerp(route[ft.k].x - WAIT, nx - WAIT, easeInOut(progress(f, ft.go, ft.arrive)));
			k = ft.k;
		}
	}
	const g = route[k];
	let Z = Zc;
	if (X > g.x && X < g.x + BRANCH) Z = lerp(g.chosen.z0 + g.chosen.w / 2, Zc, smooth((X - g.x) / BRANCH));
	const cum = f >= (film.forkTimes.find((x) => x.k === k)?.land ?? Infinity) ? g.cumAfter : g.cumBefore;
	return {X, Z, cum, k};
}

// Marble position for fork k: rolls down the trunk, wobbles across the mouth, settles in the chosen lane.
function marbleAt(film: Film, geo: ForkGeo, f: number) {
	const t = film.forkTimes.find((x) => x.k === geo.k)!;
	if (f < t.roll || f > t.land + 24) return null;
	const {Zc, BRANCH} = ROUTE;
	const a = progress(f, t.roll, t.land - 8);
	const wob = Math.sin(a * 13) * geo.win * 0.42 * (1 - a) * (a > 0.25 ? 1 : a * 4);
	if (f < t.land - 8) return {X: lerp(geo.x - 760, geo.x + 30, easeOut(a, 1.6)), Z: Zc + wob, fade: 1};
	const b = progress(f, t.land - 8, t.land + 24);
	const X = geo.x + 30 + b * BRANCH * 0.55;
	const Z = lerp(geo.chosen.z0 + geo.chosen.w / 2, Zc, smooth((X - geo.x) / BRANCH));
	return {X, Z, fade: 1 - progress(f, t.land + 14, t.land + 24)};
}

// ---------- one fork ----------
const ForkGround: React.FC<{c: TCam; geo: ForkGeo; reveal: number; decided: number; nextX: number; laidTo: number}> = ({c, geo, reveal, decided, nextX, laidTo}) => {
	const {BRANCH, STUB, Zc} = ROUTE;
	const x = geo.x;
	return (
		<g>
			{geo.branches.map((b, i) => {
				const faded = b.chosen ? 1 : 1 - 0.55 * decided;
				const fill = b.chosen && decided > 0 ? P.stripHot : b.other ? '#DDD3BF' : P.strip;
				const len = reveal;
				return (
					<g key={i} opacity={faded}>
						<Layer shadow={1}>
							<path d={strip(c, x, b.z0, Math.max(b.w, 1.2), x + BRANCH, b.z1, len)} fill={fill} />
							{!b.chosen && len > 0.99 ? <path d={rect(c, x + BRANCH - 2, x + BRANCH + STUB * reveal, b.z1, Math.max(b.w, 1.2))} fill={fill} /> : null}
						</Layer>
					</g>
				);
			})}
			{/* the chosen branch keeps going: the track is laid just ahead of the train */}
			{decided > 0 && laidTo > x + BRANCH ? (
				<Layer shadow={1}>
					<path d={rect(c, x + BRANCH - 2, Math.min(nextX, laidTo), Zc - geo.chosen.w / 2, Math.max(geo.chosen.w, 1.2))} fill={P.stripHot} />
				</Layer>
			) : null}
		</g>
	);
};

const Sleepers: React.FC<{c: TCam; x0: number; x1: number; zc: (X: number) => number; w: number}> = ({c, x0, x1, zc, w}) => {
	if (w < 18) return null;
	const lines: React.ReactNode[] = [];
	for (let X = Math.ceil(x0 / 90) * 90; X < x1; X += 90) {
		const a = proj(c, X, zc(X) - w * 0.42);
		const b = proj(c, X, zc(X) + w * 0.42);
		lines.push(<line key={X} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C9B48E" strokeWidth={Math.max(1, 3 * a.s)} />);
	}
	return <g>{lines}</g>;
};

// ---------- the table world ----------
export const TableWorld: React.FC<{
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
	glowCards?: number; // how many "× p" cards glow (chain-rule beat)
}> = ({film, f, c, route, trunkFrom, revealAt, train, showGauge, pond, contextCard, glowCards = -1}) => {
	const {Zc, W0, BRANCH, STUB} = ROUTE;
	const g = onTwos(f);
	// ground dressing: tufts and trees at fixed plane positions
	const r = rng(8);
	const tufts = Array.from({length: 90}, () => ({X: -3000 + r() * 16000, Z: 1500 + r() * 3200, h: 0.6 + r() * 0.8}));
	const upright: {Z: number; node: React.ReactNode}[] = [];
	for (const t of tufts) {
		if (Math.abs(t.Z - Zc) < W0 * 0.8) continue;
		const p = proj(c, t.X, t.Z);
		if (p.x < -100 || p.x > 2020) continue;
		upright.push({Z: t.Z, node: (
			<g key={`t${t.X}`} transform={`translate(${p.x} ${p.y}) scale(${p.s * 2 * t.h})`}>
				<Layer shadow={1}>
					<path d="M -22 0 L -12 -34 L -4 0 Z M -6 0 L 4 -46 L 12 0 Z M 8 0 L 20 -28 L 26 0 Z" fill={t.Z > 3400 ? '#8FA07F' : P.grass} />
				</Layer>
			</g>
		)});
	}
	const cards: React.ReactNode[] = [];
	const grounds: React.ReactNode[] = [];
	route.forEach((geo, i) => {
		const reveal = forkState(film, geo, f, revealAt(i));
		if (reveal.reveal <= 0) return;
		const nextX = route[i + 1]?.x ?? geo.x + BRANCH + 900;
		grounds.push(<ForkGround key={i} c={c} geo={geo} reveal={reveal.reveal} decided={reveal.decided} nextX={nextX} laidTo={train.X + 520} />);
		// branch labels
		geo.branches.forEach((b, j) => {
			if (b.chosen || b.p < 0.07) return;
			upright.push({Z: b.z1 + b.w / 2, node: <Card key={`l${i}-${j}`} c={c} X={geo.x + BRANCH + STUB + 60 + j * 175} Z={b.z1 + b.w / 2} title={b.other ? 'others' : b.t.trim() || '␣'} sub={pct(b.p)} opacity={1 - 0.8 * reveal.decided} pop={easeOut(progress(f, revealAt(i) + 8 + j * 2, revealAt(i) + 18 + j * 2), 2)} />});
		});
		// chosen label becomes the "× p" card
		const ch = geo.chosen;
		const glow = glowCards >= i;
		upright.push({Z: Zc + ch.w / 2 + 60, node: <Card key={`c${i}`} c={c} X={geo.x + BRANCH * 0.62} Z={Zc + Math.max(ch.w, 30) / 2 + 70} title={ch.t.trim() || '␣'} sub={reveal.decided > 0.5 ? `× ${fmt(ch.p)}` : pct(ch.p)} hot={reveal.decided > 0.5 || glow} pop={easeOut(progress(f, revealAt(i) + 8, revealAt(i) + 18), 2)} big={glow ? 1.25 : 1} />});
		// marble
		const m = marbleAt(film, geo, f);
		if (m) {
			const p = proj(c, m.X, m.Z);
			const mr = Math.min(26, geo.win * 0.3) * p.s;
			upright.push({Z: m.Z - 1, node: (
				<g key={`m${i}`} opacity={m.fade}>
					<ellipse cx={p.x + 0.25 * mr} cy={p.y} rx={1.3 * mr} ry={0.4 * mr} fill="rgba(40,30,20,0.35)" />
					<circle cx={p.x} cy={p.y - mr} r={mr} fill="url(#brass)" stroke="#6E5424" strokeWidth={Math.min(1.5, mr * 0.1)} />
				</g>
			)});
		}
	});
	// trunk before the first fork
	const first = route[0];
	const trunk = <Layer shadow={1}><path d={rect(c, trunkFrom, first.x + 2, Zc - first.win / 2, first.win)} fill={P.stripHot} /></Layer>;
	// train + gauge
	const tp = proj(c, train.X, train.Z);
	upright.push({Z: train.Z - 2, node: (
		<g key="train" transform={`translate(${tp.x + 150 * tp.s * 1.6} ${tp.y + 4 * Math.sin(g * 0.5) * tp.s})`}>
			<Loco scale={tp.s * 1.6} />
			{showGauge ? (
				<g transform={`translate(${-120 * tp.s * 1.6} ${-440 * tp.s * 1.6}) scale(${tp.s * 2.2})`}>
					<line x1={0} y1={96} x2={0} y2={150} stroke={P.ink} strokeWidth={1.5} />
					<Layer shadow={1}>
						<rect x={-118} y={0} width={236} height={96} rx={6} fill={P.card} />
						<text x={0} y={34} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={22} fill="#6D6152">
							chance so far
						</text>
						<text x={0} y={78} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={40} fill={P.rust}>
							{fmt(train.cum)}
						</text>
					</Layer>
				</g>
			) : null}
		</g>
	)});
	if (contextCard) upright.push({Z: Zc + W0 / 2 + 90, node: <Card key="ctx" c={c} X={route[0].x - 900} Z={Zc + W0 / 2 + 90} title={contextCard} big={1.2} />});
	upright.sort((a, b) => b.Z - a.Z);
	// ground plane
	const hz = c.horizon;
	const pondC = pond ? proj(c, route[0].x + BRANCH + 1350, Zc) : null;
	return (
		<g>
			<defs>
				<radialGradient id="brass" cx="0.35" cy="0.3">
					<stop offset="0" stopColor="#FFF1C4" />
					<stop offset="0.45" stopColor="#D9A441" />
					<stop offset="1" stopColor="#7A5A1E" />
				</radialGradient>
				<linearGradient id="plane" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#B7C3A0" />
					<stop offset="1" stopColor="#93A77F" />
				</linearGradient>
			</defs>
			<rect x={-50} y={hz} width={2020} height={Math.max(0, 1140 - hz)} fill="url(#plane)" />
			{pondC ? (
				<Layer shadow={1}>
					<ellipse cx={pondC.x} cy={pondC.y} rx={1300 * pondC.s} ry={420 * pondC.s * (c.H / 1300) * 0.55} fill={P.pond} />
				</Layer>
			) : null}
			{trunk}
			{grounds}
			<Sleepers c={c} x0={trunkFrom} x1={first.x} zc={() => Zc} w={first.win} />
			{upright.map((u) => u.node)}
		</g>
	);
};

export const routeOf = (film: Film) => film.route;
export const leanRoute = (film: Film) => {
	const geo = buildRoute([film.fx.steps[7]])[0];
	return [{...geo, k: 7}];
};
