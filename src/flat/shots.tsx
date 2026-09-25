import React from 'react';
import {AbsoluteFill} from 'remotion';

// A scene as a list of shots. Only one shot is on screen at a time, so every change is a hard cut
// (a shot can ask for a short cross-fade with `xf`, for the few section changes that want one).
// Each shot gets a slow camera move on top of its own animation, so no picture is ever quite still.
export type Move = 'in' | 'out' | 'left' | 'right' | 'up' | 'down' | 'none';
export type Shot = {at: number; move?: Move; xf?: number; render: (f: number) => React.ReactNode};

const ease = (t: number) => t * t * (3 - 2 * t);
const Z = 0.1; // how far a push travels (10%)
const P = 70; // how far a pan travels, in px either side (inside the 10% overscan)

export const camMove = (move: Move, k: number) => {
	const e = ease(Math.max(0, Math.min(1, k)));
	switch (move) {
		case 'in':
			return `scale(${1 + Z * e})`;
		case 'out':
			return `scale(${1 + Z * (1 - e)})`;
		case 'left':
			return `scale(${1 + Z}) translateX(${P * (1 - 2 * e)}px)`;
		case 'right':
			return `scale(${1 + Z}) translateX(${-P * (1 - 2 * e)}px)`;
		case 'up':
			return `scale(${1 + Z}) translateY(${P * 0.6 * (1 - 2 * e)}px)`;
		case 'down':
			return `scale(${1 + Z}) translateY(${-P * 0.6 * (1 - 2 * e)}px)`;
		default:
			return undefined;
	}
};

const defaultMove = (i: number) => (['in', 'left', 'out', 'right'] as const)[i % 4];

// shots: sorted by `at`. The last shot runs until `end`. Shots without a move take turns: in, left, out, right.
export const Shots: React.FC<{f: number; end: number; shots: Shot[]}> = ({f, end, shots}) => {
	let i = -1;
	while (i + 1 < shots.length && f >= shots[i + 1].at) i++;
	if (i < 0) return null;
	const one = (j: number, opacity = 1) => {
		const s = shots[j];
		const t1 = j + 1 < shots.length ? shots[j + 1].at : end;
		const k = (f - s.at) / Math.max(1, t1 - s.at);
		return (
			<AbsoluteFill key={j} style={{transform: camMove(s.move ?? defaultMove(j), k), transformOrigin: '50% 50%', opacity}}>
				{s.render(f)}
			</AbsoluteFill>
		);
	};
	const s = shots[i];
	if (s.xf && i > 0 && f < s.at + s.xf) {
		return (
			<>
				{one(i - 1)}
				{one(i, (f - s.at) / s.xf)}
			</>
		);
	}
	return one(i);
};

// A camera for any picture, SVG or HTML: frames the point (cx, cy) of a 1920x1080 picture at the centre, at zoom z.
export const Zoom: React.FC<{cx: number; cy: number; z: number; children: React.ReactNode}> = ({cx, cy, z, children}) => (
	<AbsoluteFill style={{transform: `translate(960px, 540px) scale(${z}) translate(${-cx}px, ${-cy}px)`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>
);

// Split panels for any picture: each panel frames its own picture (cx, cy, z) in a vertical slice of the screen,
// with a dark gap between slices. `slide` (0..1) brings the panels in from the sides.
export type Pane = {cx: number; cy: number; z: number; render: () => React.ReactNode};
export const Split: React.FC<{panes: Pane[]; slide?: number}> = ({panes, slide = 1}) => {
	const n = panes.length;
	const w = 1920 / n;
	return (
		<AbsoluteFill style={{background: '#07081A'}}>
			{panes.map((p, i) => {
				const off = (1 - slide) * (i < n / 2 ? -1 : 1) * (i === (n - 1) / 2 ? 0 : 1) * 1920;
				return (
					<AbsoluteFill key={i} style={{clipPath: `inset(0 ${1920 - (i + 1) * w + 6}px 0 ${i * w + 6}px)`, transform: `translateX(${off}px)`}}>
						<AbsoluteFill style={{transform: `translate(${i * w + w / 2}px, 540px) scale(${p.z}) translate(${-p.cx}px, ${-p.cy}px)`, transformOrigin: '0 0'}}>{p.render()}</AbsoluteFill>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
