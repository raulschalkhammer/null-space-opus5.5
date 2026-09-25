import React from 'react';
import {FlatDefs, FlatLighthouse, K, Motes, Stars, Vignette} from './kit';
import {Clouds, Moon, Mountains, WorldDefs} from './world';

// Shared by chapters 2 and 3: the night harbor with Jev's lighthouse, and the letter.
// ---------- the harbor: sky, sea, the lighthouse on its rock ----------
export const Harbor: React.FC<{f: number; lamp: number; lx?: number; moon?: [number, number]; children?: React.ReactNode}> = ({f, lamp, lx = 1500, moon = [860, 110], children}) => (
	<>
		<FlatDefs />
		<WorldDefs />
		<rect x={-60} y={-60} width={2040} height={1200} fill="url(#gSky)" />
		<Stars f={f} maxY={560} />
		<Moon x={moon[0]} y={moon[1]} r={32} />
		<circle cx={1000} cy={660} r={330} fill="url(#gSun)" opacity={0.75} />
		<Clouds f={f} y={150} count={4} seed={33} opacity={0.9} />
		<Mountains y={640} seed={12} layers={2} />
		<rect x={-60} y={680} width={2040} height={520} fill="url(#gSea)" />
		{Array.from({length: 14}, (_, i) => (
			<rect key={i} x={((i * 283 + f * (0.6 + (i % 3) * 0.2)) % 2100) - 100} y={700 + ((i * 53) % 300)} width={60 + (i % 4) * 30} height={3} rx={1.5} fill="#9AA2E6" opacity={0.35} />
		))}
		{/* the rock and the lighthouse */}
		<path d={`M ${lx - 260} 720 C ${lx - 200} 640 ${lx - 120} 600 ${lx} 596 C ${lx + 120} 600 ${lx + 200} 650 ${lx + 280} 720 Z`} fill="#2A2F7A" />
		<path d={`M ${lx - 260} 720 C ${lx - 200} 640 ${lx - 120} 600 ${lx} 596 L ${lx} 720 Z`} fill="#3A40A0" />
		{/* reflection of the lamp on the water */}
		<rect x={lx - 16} y={730} width={32} height={260} fill="#FFE9A0" opacity={0.12 * lamp} filter="url(#glowBig)" />
		<g transform={`translate(${lx} 604) scale(1.3)`}>
			<FlatLighthouse on={lamp} />
		</g>
		{children}
		<Motes f={f} color={K.yellow} count={16} seed={4} />
		<Vignette />
	</>
);

export const Letter: React.FC<{x: number; y: number; r?: number; s?: number; glow?: number}> = ({x, y, r = 0, s = 1, glow = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		{glow > 0 ? <rect x={-80} y={-56} width={160} height={112} rx={20} fill={K.yellow} opacity={0.5 * glow} filter="url(#glowBig)" /> : null}
		<rect x={-66} y={-44} width={132} height={88} rx={10} fill="#FBF8FF" />
		<path d="M -66 -40 L 0 6 L 66 -40" fill="none" stroke="#B9B4E6" strokeWidth={4} strokeLinejoin="round" />
		<circle cx={44} cy={-22} r={9} fill={K.rose} />
	</g>
);
