import React from 'react';
import {C, FONT} from '../lib/palette';

// Jev: small, quiet, quick. No mouth: it never talks, it only answers with typed tags.
// Local coords: origin = bottom centre (where it sits), body extends up to about -125.
type Props = {
	blink: number; // 0..1
	lid: number; // 0 wide awake .. 1 heavy-lidded (bored)
	look: {x: number; y: number};
	tilt: number; // degrees
	squash: number; // 1 = neutral
	armRaise: number; // 0 lowered .. 1 held high
	glow: number; // 0..1 tag glow
	antenna: number; // 0..1 bulb brightness
	tag: {label: string; p: number} | null;
};

export const Jev: React.FC<Props> = ({blink, lid, look, tilt, squash, armRaise, glow, antenna, tag}) => {
	const hand = {x: 62 - 6 * armRaise, y: -40 - 80 * armRaise};
	const eyeClose = Math.max(blink, lid * 0.55);
	return (
		<g transform={`rotate(${tilt}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
			{/* feet */}
			<ellipse cx={-18} cy={-4} rx={13} ry={6} fill={C.jevDark} stroke={C.ink} strokeWidth={3} />
			<ellipse cx={18} cy={-4} rx={13} ry={6} fill={C.jevDark} stroke={C.ink} strokeWidth={3} />
			{/* antenna */}
			<path d="M 4 -84 Q 6 -104 16 -114" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
			<circle cx={17} cy={-117} r={20} fill={C.glow} opacity={0.28 * antenna} />
			<circle cx={17} cy={-117} r={8} fill={C.glow} opacity={0.45 + 0.55 * antenna} stroke={C.ink} strokeWidth={3} />
			{/* arm (behind body) */}
			<path d={`M 34 -52 Q ${hand.x + 6} ${(hand.y - 52) / 2} ${hand.x} ${hand.y}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
			<path d={`M 34 -52 Q ${hand.x + 6} ${(hand.y - 52) / 2} ${hand.x} ${hand.y}`} fill="none" stroke={C.jev} strokeWidth={5} strokeLinecap="round" />
			{/* body */}
			<ellipse cx={0} cy={-46} rx={46} ry={42} fill={C.jev} stroke={C.ink} strokeWidth={4} />
			<ellipse cx={0} cy={-32} rx={30} ry={22} fill={C.jevLight} opacity={0.55} />
			{/* chest dial: a tiny probability triangle (foreshadows the Mailroom) */}
			<path d="M 24 -38 L 33 -22 L 15 -22 Z" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
			<circle cx={28} cy={-26} r={2.6} fill={C.glow} stroke={C.ink} strokeWidth={1.2} />
			{/* eyes */}
			{[-16, 16].map((ex) => (
				<g key={ex}>
					<ellipse cx={ex} cy={-58} rx={12} ry={Math.max(1.5, 15 * (1 - 0.92 * eyeClose))} fill="#fff" stroke={C.ink} strokeWidth={3} />
					{eyeClose < 0.6 ? (
						<>
							<circle cx={ex + look.x * 4} cy={-58 + look.y * 5 + lid * 3} r={6} fill={C.ink} />
							<circle cx={ex + look.x * 4 - 2} cy={-61 + look.y * 5 + lid * 3} r={1.8} fill="#fff" />
						</>
					) : null}
					{lid > 0.05 && blink < 0.6 ? (
						<path d={`M ${ex - 13} ${-62 + 2 * (1 - lid)} Q ${ex} ${-66} ${ex + 13} ${-62 + 2 * (1 - lid)}`} fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
					) : null}
				</g>
			))}
			{/* the typed answer */}
			{tag ? (
				<g transform={`translate(${hand.x - 8} ${hand.y - 104})`} style={{filter: `drop-shadow(0 0 ${4 + 18 * glow}px rgba(127,240,223,${0.35 + 0.6 * glow}))`}}>
					<rect x={0} y={0} width={176} height={100} rx={14} fill={C.tagBg} stroke={C.ink} strokeWidth={4} />
					<rect x={4} y={4} width={168} height={92} rx={11} fill="none" stroke={C.jevLight} strokeWidth={2} opacity={0.5 + 0.5 * glow} />
					<text x={16} y={30} fontFamily={FONT.mono} fontSize={19} fill={C.jevLight}>
						{tag.label}
					</text>
					<text x={16} y={70} fontFamily={FONT.mono} fontSize={40} fontWeight={700} fill="#EFFFFB">
						{tag.p.toFixed(2)}
					</text>
					<rect x={16} y={80} width={144} height={7} rx={3.5} fill="#2C5E57" />
					<rect x={16} y={80} width={144 * tag.p} height={7} rx={3.5} fill={C.jevLight} />
				</g>
			) : null}
			{/* hand on top of the tag */}
			<circle cx={hand.x} cy={hand.y} r={8} fill={C.jev} stroke={C.ink} strokeWidth={3} />
		</g>
	);
};
