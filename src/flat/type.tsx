import React from 'react';
import {FONT, K} from './kit';

// Text that lives in the world instead of in boxes.
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (t: number, p = 3) => 1 - Math.pow(1 - clamp01(t), p);

// Callout: a glowing dot on the object, a line that draws itself, and a label with no background.
// k: 0..1 build-in progress. anchor: which side of `to` the text sits.
export const Callout: React.FC<{
	from: {x: number; y: number};
	to: {x: number; y: number};
	title: string;
	sub?: string;
	k: number;
	color?: string;
	size?: number;
	anchor?: 'start' | 'end' | 'middle';
	icon?: 'check' | 'none';
}> = ({from, to, title, sub, k, color = K.white, size = 34, anchor = 'start', icon = 'none'}) => {
	if (k <= 0) return null;
	const elbow = {x: from.x + (to.x - from.x) * 0.35, y: to.y};
	const len = Math.hypot(elbow.x - from.x, elbow.y - from.y) + Math.hypot(to.x - elbow.x, to.y - elbow.y);
	const lineK = easeOut(k / 0.6, 2);
	const textK = easeOut((k - 0.35) / 0.65, 3);
	const dx = anchor === 'start' ? 14 : anchor === 'end' ? -14 : 0;
	return (
		<g>
			<circle cx={from.x} cy={from.y} r={14} fill={color} opacity={0.18 * lineK} />
			<circle cx={from.x} cy={from.y} r={5.5} fill={color} opacity={lineK} />
			<path d={`M ${from.x} ${from.y} L ${elbow.x} ${elbow.y} L ${to.x} ${to.y}`} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - lineK)} opacity={0.85} />
			<g opacity={textK} transform={`translate(${to.x + dx} ${to.y}) translate(0 ${(1 - textK) * 10})`}>
				{icon === 'check' ? (
					<g transform={`translate(${anchor === 'end' ? -18 : 18} ${-size * 0.32})`}>
						<circle r={size * 0.42} fill={K.teal} />
						<path d={`M ${-size * 0.18} 0 L ${-size * 0.04} ${size * 0.14} L ${size * 0.2} ${-size * 0.14}`} fill="none" stroke={K.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
					</g>
				) : null}
				<text x={icon === 'check' ? (anchor === 'end' ? -size * 1.1 : size * 1.1) : 0} y={-8} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.55)', strokeWidth: 6, strokeLinejoin: 'round'}}>
					{title}
				</text>
				{sub ? (
					<text x={icon === 'check' ? (anchor === 'end' ? -size * 1.1 : size * 1.1) : 0} y={size * 0.72} textAnchor={anchor} fontFamily={FONT} fontWeight={800} fontSize={size * 0.58} fill={K.mute} style={{paintOrder: 'stroke', stroke: 'rgba(8,10,40,0.55)', strokeWidth: 5, strokeLinejoin: 'round'}}>
						{sub}
					</text>
				) : null}
			</g>
		</g>
	);
};

// Kinetic type: each letter springs up into place, with a slight overshoot.
export const Kinetic: React.FC<{text: string; k: number; size: number; color?: string; weight?: number; spacing?: number; stagger?: number; style?: React.CSSProperties; glow?: string}> = ({text, k, size, color = K.white, weight = 900, spacing = 0, stagger = 0.04, style, glow}) => (
	<div style={{fontFamily: FONT, fontWeight: weight, fontSize: size, color, letterSpacing: spacing, whiteSpace: 'pre', lineHeight: 1, textShadow: glow ? `0 0 ${size * 0.35}px ${glow}` : '0 6px 18px rgba(5,8,32,0.55)', ...style}}>
		{text.split('').map((ch, i) => {
			const t = clamp01((k - i * stagger) / 0.4);
			const e = easeOut(t, 3);
			const over = Math.sin(Math.PI * t) * 0.12;
			return (
				<span key={i} style={{display: 'inline-block', opacity: t > 0 ? 1 : 0, transform: `translateY(${(1 - e) * size * 0.6}px) scale(${e + over}) rotate(${(1 - e) * (i % 2 ? 8 : -8)}deg)`}}>
					{ch}
				</span>
			);
		})}
	</div>
);

// Light projected onto a surface (a cloud bank): glowing, slightly soft, like a signal lamp.
export const Projected: React.FC<{x: number; y: number; text: string; size: number; k: number; sub?: string}> = ({x, y, text, size, k, sub}) => {
	if (k <= 0) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * easeOut(k)})`} opacity={easeOut(k, 2)}>
			<ellipse rx={size * 1.6} ry={size * 0.75} fill="#FFE9A0" opacity={0.28} filter="url(#glowBig)" />
			<text textAnchor="middle" y={size * 0.35} fontFamily={FONT} fontWeight={900} fontSize={size} fill="#FFF3C4" filter="url(#projGlow)">
				{text}
			</text>
			{sub ? (
				<text textAnchor="middle" y={size * 0.35 + size * 0.5} fontFamily={FONT} fontWeight={800} fontSize={size * 0.26} fill="#FFE9A0" opacity={0.85} letterSpacing={4}>
					{sub}
				</text>
			) : null}
		</g>
	);
};

// Marker: a label that floats above a point on the ground on a thin stem. No background.
export const Marker: React.FC<{x: number; y: number; s: number; title: string; sub?: string; hot?: boolean; opacity?: number; stem?: number}> = ({x, y, s, title, sub, hot, opacity = 1, stem = 60}) => {
	if (s <= 0.001) return null;
	const col = hot ? K.orangeHi : K.white;
	const halo = {paintOrder: 'stroke' as const, stroke: 'rgba(8,10,40,0.7)', strokeWidth: 7, strokeLinejoin: 'round' as const};
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
			<ellipse cx={0} cy={0} rx={10} ry={4} fill={col} opacity={0.5} />
			<line x1={0} y1={0} x2={0} y2={-stem} stroke={col} strokeWidth={2.5} opacity={0.8} />
			<circle cx={0} cy={-stem} r={4} fill={col} />
			<text x={0} y={-stem - (sub ? 42 : 14)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={col} style={halo}>
				{title}
			</text>
			{sub ? (
				<text x={0} y={-stem - 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={hot ? K.yellow : K.mute} style={halo}>
					{sub}
				</text>
			) : null}
		</g>
	);
};
