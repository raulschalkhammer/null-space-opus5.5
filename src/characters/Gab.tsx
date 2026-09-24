import React from 'react';
import {C} from '../lib/palette';

// Gab: a chatty typewriter-locomotive. Cutout rig drawn in local coords:
// origin = front wheel contact on the rail, x runs backwards to -250, y up to about -250.
export type GabFace = 'happy' | 'talk' | 'gulp' | 'panic' | 'dazed' | 'curious';

type Props = {
	wheelTurn: number; // radians
	face: GabFace;
	talk: number; // 0..1 mouth open
	look: {x: number; y: number}; // -1..1
	blink: number; // 0 open .. 1 closed
	paperWave: number;
	sweat: number; // 0..1
};

const ink = {stroke: C.ink, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

const Wheel: React.FC<{x: number; turn: number}> = ({x, turn}) => (
	<g transform={`translate(${x} -30) rotate(${(turn * 180) / Math.PI})`}>
		<circle r={28} fill={C.metal} {...ink} />
		<circle r={17} fill={C.metalLight} stroke={C.ink} strokeWidth={2.5} />
		{[0, 60, 120].map((a) => (
			<line key={a} x1={-17} y1={0} x2={17} y2={0} transform={`rotate(${a})`} stroke={C.ink} strokeWidth={3} />
		))}
		<circle r={5} fill={C.ink} />
	</g>
);

export const Gab: React.FC<Props> = ({wheelTurn, face, talk, look, blink, paperWave, sweat}) => {
	const pinX = 12 * Math.cos(wheelTurn);
	const pinY = 12 * Math.sin(wheelTurn);
	const wide = face === 'panic';
	const eyeRx = wide ? 18 : 15;
	const eyeRy = (wide ? 23 : 19) * (1 - 0.92 * blink);
	const pupilR = wide ? 4.5 : 7;
	const lx = look.x * 5;
	const ly = look.y * 7;
	const w = paperWave;
	return (
		<g>
			{/* paper sheet (the "chimney") */}
			<path
				d={`M -184 -166 L ${-186 + w * 3} -232 Q ${-186 + w * 5} -246 ${-172 + w * 5} -248 L ${-80 + w * 6} -254 Q ${-66 + w * 6} -254 ${-67 + w * 4} -240 L -72 -166 Z`}
				fill={C.cream}
				{...ink}
				strokeWidth={3.5}
			/>
			{[0, 1, 2, 3].map((i) => (
				<line
					key={i}
					x1={-170 + w * (3 + i)}
					y1={-234 + i * 16}
					x2={-92 - (i % 2) * 22 + w * (3 + i)}
					y2={-236 + i * 16}
					stroke={C.inkSoft}
					strokeWidth={3}
					strokeLinecap="round"
				/>
			))}
			{/* platen roller + knobs */}
			<rect x={-220} y={-176} width={192} height={20} rx={10} fill={C.metal} {...ink} strokeWidth={3.5} />
			<circle cx={-228} cy={-166} r={12} fill={C.metal} {...ink} strokeWidth={3.5} />
			<circle cx={-20} cy={-166} r={12} fill={C.metal} {...ink} strokeWidth={3.5} />
			{/* bell */}
			<line x1={-40} y1={-176} x2={-40} y2={-186} stroke={C.ink} strokeWidth={3} />
			<path d="M -50 -186 Q -40 -206 -30 -186 Z" fill={C.gold} {...ink} strokeWidth={3} />
			{/* chassis */}
			<rect x={-240} y={-68} width={236} height={24} rx={7} fill={C.chassis} {...ink} />
			{/* cow-catcher */}
			<path d="M -6 -48 L 26 -6 L -8 -6 Z" fill={C.gabDark} {...ink} strokeWidth={3.5} />
			{/* body */}
			<rect x={-234} y={-160} width={216} height={98} rx={24} fill={C.gab} {...ink} />
			<path d="M -228 -86 Q -126 -74 -24 -86 L -24 -80 Q -24 -64 -40 -64 L -214 -64 Q -230 -64 -230 -80 Z" fill={C.gabDark} opacity={0.35} />
			{/* keys */}
			{[0, 1, 2].map((r) =>
				[0, 1, 2, 3, 4, 5].map((c) => (
					<circle key={`${r}-${c}`} cx={-212 + c * 21 + r * 8} cy={-86 - r * 20} r={7.5} fill={C.cream} stroke={C.ink} strokeWidth={2.5} />
				)),
			)}
			{/* face */}
			<circle cx={-78} cy={-98} r={7} fill={C.blush} opacity={0.7} />
			<circle cx={-24} cy={-98} r={6} fill={C.blush} opacity={0.7} />
			{[-66, -34].map((ex) => (
				<g key={ex}>
					<ellipse cx={ex} cy={-124} rx={eyeRx} ry={Math.max(1.5, eyeRy)} fill="#fff" stroke={C.ink} strokeWidth={3.5} />
					{blink < 0.6 ? <circle cx={ex + lx} cy={-124 + ly} r={pupilR} fill={C.ink} /> : null}
					{blink < 0.6 && !wide ? <circle cx={ex + lx - 2.5} cy={-127 + ly} r={2} fill="#fff" /> : null}
				</g>
			))}
			{face === 'dazed' ? (
				<>
					<path d="M -80 -148 L -54 -142" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
					<path d="M -20 -142 L -46 -148" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
				</>
			) : null}
			{face === 'curious' ? <path d="M -46 -150 Q -34 -158 -22 -150" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
			<Mouth face={face} talk={talk} />
			{sweat > 0.01 ? (
				<path
					d="M -8 -150 Q -2 -140 -8 -134 Q -14 -140 -8 -150 Z"
					transform={`translate(0 ${sweat * 16})`}
					fill={C.sweat}
					stroke={C.ink}
					strokeWidth={2}
					opacity={Math.min(1, sweat * 2)}
				/>
			) : null}
			{/* wheels + connecting rod */}
			<Wheel x={-210} turn={wheelTurn} />
			<Wheel x={-125} turn={wheelTurn} />
			<Wheel x={-40} turn={wheelTurn} />
			<line x1={-210 + pinX} y1={-30 + pinY} x2={-40 + pinX} y2={-30 + pinY} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
			<line x1={-210 + pinX} y1={-30 + pinY} x2={-40 + pinX} y2={-30 + pinY} stroke={C.metalLight} strokeWidth={3} strokeLinecap="round" />
		</g>
	);
};

const Mouth: React.FC<{face: GabFace; talk: number}> = ({face, talk}) => {
	const cx = -50;
	const cy = -92;
	if (face === 'talk' && talk > 0.05) {
		return <ellipse cx={cx} cy={cy} rx={10} ry={3 + 9 * talk} fill={C.mouth} stroke={C.ink} strokeWidth={3} />;
	}
	if (face === 'gulp') {
		return <path d={`M ${cx - 13} ${cy} q 4 -5 8.5 0 t 8.5 0 t 8.5 0`} fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
	}
	if (face === 'panic') {
		return <ellipse cx={cx} cy={cy + 2} rx={9} ry={12} fill={C.mouth} stroke={C.ink} strokeWidth={3} />;
	}
	if (face === 'dazed' || face === 'curious') {
		return <path d={`M ${cx - 9} ${cy + 1} Q ${cx} ${cy - 3} ${cx + 9} ${cy + 2}`} fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
	}
	return <path d={`M ${cx - 13} ${cy - 3} Q ${cx} ${cy + 11} ${cx + 13} ${cy - 3}`} fill={C.mouth} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />;
};
