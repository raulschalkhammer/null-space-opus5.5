import React from 'react';
import {AbsoluteFill} from 'remotion';

// SVG filter defs used across the film. `seed` changes on twos to make lines "boil" like inked cels.
export const FilterDefs: React.FC<{seed: number; blur: number}> = ({seed, blur}) => (
	<defs>
		<filter id="boil" filterUnits="userSpaceOnUse" x={-60} y={-60} width={2040} height={1200}>
			<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={seed} result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<filter id="whip" filterUnits="userSpaceOnUse" x={-60} y={-60} width={2040} height={1200}>
			<feGaussianBlur stdDeviation={`${blur} ${blur * 0.08}`} />
		</filter>
	</defs>
);

// Film grain + vignette over everything.
export const Grain: React.FC<{frame: number}> = ({frame}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg width={1920} height={1080} style={{position: 'absolute', mixBlendMode: 'multiply', opacity: 0.16}}>
			<filter id="grain">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} />
				<feColorMatrix type="saturate" values="0" />
				<feComponentTransfer>
					<feFuncA type="linear" slope={0.9} />
				</feComponentTransfer>
			</filter>
			<rect width={1920} height={1080} filter="url(#grain)" />
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(60,40,20,0.28) 100%)'}} />
	</AbsoluteFill>
);

// Chalk texture for the math card (applied to HTML via CSS filter).
export const ChalkDefs: React.FC<{seed: number}> = ({seed}) => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<filter id="chalk" x="-2%" y="-10%" width="104%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} result="grit" />
			<feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="mask" />
			<feComposite in="SourceGraphic" in2="mask" operator="in" result="gritty" />
			<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={seed + 3} result="wob" />
			<feDisplacementMap in="gritty" in2="wob" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</svg>
);
