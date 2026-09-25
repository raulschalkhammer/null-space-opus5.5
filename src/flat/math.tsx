import React from 'react';
import katex from 'katex';
import {FONT, K} from './kit';

// Equations, typeset like a math explainer: real math type (KaTeX, Computer Modern), large and centred,
// built one term at a time, each term coloured like the object it stands for, with a curly brace and a
// single-word label underneath. No panels or boxes: the equation sits on the scene with a soft shadow.

const cache = new Map<string, string>();
const tex = (s: string) => {
	if (!cache.has(s)) cache.set(s, katex.renderToString(s, {throwOnError: false, output: 'html'}));
	return cache.get(s)!;
};

export type Term = {
	tex: string;
	k: number; // 0..1 reveal
	color?: string;
	label?: string; // one word, under a brace
	labelK?: number;
	pop?: number; // 0..1 emphasis pulse
};

const Brace: React.FC<{color: string}> = ({color}) => (
	<svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none" style={{display: 'block', overflow: 'visible'}}>
		<path d="M 2 2 Q 2 10 12 10 L 40 10 Q 50 10 50 18 Q 50 10 60 10 L 88 10 Q 98 10 98 2" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
	</svg>
);

export const Equation: React.FC<{terms: Term[]; size?: number; gap?: number; style?: React.CSSProperties}> = ({terms, size = 72, gap = 0.22, style}) => (
	<div style={{display: 'inline-flex', alignItems: 'baseline', gap: size * gap, fontSize: size, color: K.white, whiteSpace: 'nowrap', textShadow: '0 4px 24px rgba(5,8,32,0.85)', ...style}}>
		{terms.map((t, i) => {
			const k = Math.max(0, Math.min(1, t.k));
			const lk = Math.max(0, Math.min(1, t.labelK ?? 0));
			return (
				<span key={i} style={{position: 'relative', display: 'inline-block', color: t.color ?? K.white, opacity: k, transform: `translateY(${(1 - k) * size * 0.35}px) scale(${1 + 0.12 * (t.pop ?? 0)})`, transformOrigin: '50% 60%'}}>
					<span dangerouslySetInnerHTML={{__html: tex(t.tex)}} />
					{t.label ? (
						<span style={{position: 'absolute', left: '-4%', right: '-4%', top: '112%', opacity: lk, transform: `translateY(${(1 - lk) * 10}px)`, textAlign: 'center'}}>
							<span style={{display: 'block', height: size * 0.26, margin: '0 auto', width: '100%'}}>
								<Brace color={t.color ?? K.mute} />
							</span>
							<span style={{display: 'block', marginTop: size * 0.08, fontFamily: FONT, fontWeight: 900, fontSize: size * 0.34, color: t.color ?? K.mute, letterSpacing: 1}}>{t.label}</span>
						</span>
					) : null}
				</span>
			);
		})}
	</div>
);
