import React from 'react';

// The beat every style frame shows: Gab's sentence so far, with the odds each word had when it was picked.
export const SENTENCE: {t: string; p: number}[] = [
	{t: 'Great', p: 0.38},
	{t: 'question', p: 0.81},
	{t: '!', p: 0.72},
	{t: 'This', p: 0.44},
	{t: 'email', p: 0.67},
	{t: 'looks', p: 0.41},
	{t: 'totally', p: 0.04},
	{t: 'legit', p: 0.72},
	{t: '!', p: 0.64},
];
export const UNLUCKY = 6;
export const JEV_P = 0.91;

export const NARRATION = {
	a: 'A language model never sees its whole answer. It writes one word, then asks what should come next.',
	b: 'Each word is sampled from a distribution, then fed back in as context for the next one.',
	c: 'Every word leans on the words before it. Pick one badly, and the rest follow it downhill.',
};

// Paper tooth / print grain overlay.
export const Grain: React.FC<{id: string; opacity: number; freq?: number; seed?: number}> = ({id, opacity, freq = 0.8, seed = 3}) => (
	<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity, pointerEvents: 'none'}}>
		<filter id={id}>
			<feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={3} seed={seed} />
			<feColorMatrix type="saturate" values="0" />
		</filter>
		<rect width={1920} height={1080} filter={`url(#${id})`} />
	</svg>
);
