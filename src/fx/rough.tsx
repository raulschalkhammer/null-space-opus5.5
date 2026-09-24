import React from 'react';
import rough from 'roughjs';
import type {Options} from 'roughjs/bin/core';

const gen = rough.generator();

type Drawable = ReturnType<typeof gen.line>;

// Render a Rough.js drawable as plain SVG paths. Pass a new seed every held frame for line boil.
export const RoughPaths: React.FC<{drawable: Drawable}> = ({drawable}) => (
	<>
		{gen.toPaths(drawable).map((p, i) => (
			<path
				key={i}
				d={p.d}
				stroke={p.stroke}
				strokeWidth={p.strokeWidth}
				fill={p.fill ?? 'none'}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		))}
	</>
);

export const rLine = (x1: number, y1: number, x2: number, y2: number, o: Options) => <RoughPaths drawable={gen.line(x1, y1, x2, y2, o)} />;
export const rRect = (x: number, y: number, w: number, h: number, o: Options) => <RoughPaths drawable={gen.rectangle(x, y, w, h, o)} />;
export const rEllipse = (x: number, y: number, w: number, h: number, o: Options) => <RoughPaths drawable={gen.ellipse(x, y, w, h, o)} />;
export const rPath = (d: string, o: Options) => <RoughPaths drawable={gen.path(d, o)} />;
export const rPolygon = (pts: [number, number][], o: Options) => <RoughPaths drawable={gen.polygon(pts, o)} />;

// Catmull-Rom spline through points, as an SVG path string.
export function smoothPath(pts: [number, number][]) {
	let d = `M ${pts[0][0]} ${pts[0][1]}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
	}
	return d;
}

// Deterministic pseudo-random numbers (mulberry32).
export function rng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
