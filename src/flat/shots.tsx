import React from 'react';
import {AbsoluteFill} from 'remotion';

// A scene as a list of shots. Only one shot is on screen at a time, so every change is a hard cut.
// Each shot gets a slow camera move on top of its own animation, so no picture is ever quite still.
export type Move = 'in' | 'out' | 'left' | 'right' | 'up' | 'down' | 'none';
export type Shot = {at: number; move?: Move; render: (f: number) => React.ReactNode};

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

// shots: sorted by `at`. The last shot runs until `end`. Shots without a move take turns: in, left, out, right.
export const Shots: React.FC<{f: number; end: number; shots: Shot[]}> = ({f, end, shots}) => {
	let i = -1;
	while (i + 1 < shots.length && f >= shots[i + 1].at) i++;
	if (i < 0) return null;
	const s = shots[i];
	const t1 = i + 1 < shots.length ? shots[i + 1].at : end;
	const move = s.move ?? (['in', 'left', 'out', 'right'] as const)[i % 4];
	return <AbsoluteFill style={{transform: camMove(move, (f - s.at) / Math.max(1, t1 - s.at)), transformOrigin: '50% 50%'}}>{s.render(f)}</AbsoluteFill>;
};
