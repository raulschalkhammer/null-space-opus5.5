import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, JEV_P, NARRATION, SENTENCE, UNLUCKY} from './Shared';

// Direction A: "Riso Press". Two-ink risograph print: medium blue + fluorescent pink on warm stock,
// halftone fills, slight misregistration, big editorial grotesk type. Characters become typographic objects.
const PAPER = '#F2ECDF';
const BLUE = '#2F4FA2';
const PINK = '#FF4FA8';
const GROTESK = '"Bricolage Grotesque", sans-serif';
const MONO = '"IBM Plex Mono", monospace';

const Halftone: React.FC = () => (
	<defs>
		<pattern id="htBlue" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
			<circle cx={4.5} cy={4.5} r={2.6} fill={BLUE} />
		</pattern>
		<pattern id="htPink" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
			<circle cx={4.5} cy={4.5} r={3.1} fill={PINK} />
		</pattern>
		<pattern id="htPinkFine" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
			<circle cx={3} cy={3} r={1.5} fill={PINK} />
		</pattern>
		<filter id="inkEdge">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</defs>
);

// One ink layer. Pink is printed slightly off-register, as a real two-pass riso job would be.
const Ink: React.FC<{ink: 'blue' | 'pink'; children: React.ReactNode}> = ({ink, children}) => (
	<g filter="url(#inkEdge)" style={{mixBlendMode: 'multiply'}} transform={ink === 'pink' ? 'translate(3 -2)' : undefined}>
		{children}
	</g>
);

export const StyleRiso: React.FC = () => {
	const x0 = 110;
	const baseY = 700;
	const gap = 14;
	const widths = SENTENCE.map((w) => Math.max(70, w.t.length * 27 + 44));
	const xs: number[] = [];
	widths.reduce((x, w) => (xs.push(x), x + w + gap), x0);
	return (
		<AbsoluteFill style={{background: PAPER}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<Halftone />
				{/* ---------- PINK PASS ---------- */}
				<Ink ink="pink">
					{/* Jev: a single printed disc */}
					<circle cx={1560} cy={420} r={250} fill="url(#htPink)" />
					<circle cx={1560} cy={420} r={250} fill="none" stroke={PINK} strokeWidth={8} />
					{/* the unlucky block */}
					<rect x={xs[UNLUCKY]} y={baseY} width={widths[UNLUCKY]} height={92} rx={10} fill={PINK} />
					{/* the words after it lean downhill */}
					{SENTENCE.map((w, i) =>
						i > UNLUCKY ? <rect key={i} x={xs[i]} y={baseY + (i - UNLUCKY) * 26} width={widths[i]} height={92} rx={10} fill="url(#htPinkFine)" transform={`rotate(${(i - UNLUCKY) * 6} ${xs[i]} ${baseY})`} /> : null,
					)}
					<text x={x0} y={452} fontFamily={GROTESK} fontWeight={800} fontSize={176} fill={PINK} letterSpacing={-6}>
						at a time.
					</text>
					<rect x={x0 + 60} y={962} width={40} height={40} fill={PINK} />
				</Ink>
				{/* ---------- BLUE PASS ---------- */}
				<Ink ink="blue">
					<text x={x0} y={96} fontFamily={MONO} fontSize={22} letterSpacing={4} fill={BLUE}>
						THE MODEL THAT DOESN’T TALK · Nº 01 · TRACK LAYER
					</text>
					<line x1={x0} x2={1810} y1={122} y2={122} stroke={BLUE} strokeWidth={3} />
					<text x={x0} y={292} fontFamily={GROTESK} fontWeight={800} fontSize={176} fill={BLUE} letterSpacing={-6}>
						One word
					</text>
					{/* odds bars above each block */}
					{SENTENCE.map((w, i) => {
						const h = 190 * w.p;
						const unlucky = i === UNLUCKY;
						const lean = i > UNLUCKY ? (i - UNLUCKY) * 6 : 0;
						const dy = i > UNLUCKY ? (i - UNLUCKY) * 26 : 0;
						return (
							<g key={i} transform={`rotate(${lean} ${xs[i]} ${baseY})`}>
								{i <= UNLUCKY ? (
									<>
										<rect x={xs[i] + widths[i] / 2 - 18} y={baseY - 24 - h} width={36} height={h} fill={unlucky ? 'none' : 'url(#htBlue)'} stroke={BLUE} strokeWidth={3} />
										{unlucky ? null : (
											<text x={xs[i] + widths[i] / 2} y={baseY - 36 - h} textAnchor="middle" fontFamily={MONO} fontSize={20} fill={BLUE}>
												{Math.round(w.p * 100)}%
											</text>
										)}
									</>
								) : null}
								<rect x={xs[i]} y={baseY + dy} width={widths[i]} height={92} rx={10} fill="none" stroke={BLUE} strokeWidth={4} />
								<text x={xs[i] + widths[i] / 2} y={baseY + dy + 62} textAnchor="middle" fontFamily={GROTESK} fontWeight={700} fontSize={44} fill={BLUE}>
									{w.t}
								</text>
							</g>
						);
					})}
					{/* feedback arrows: every block is read before the next is chosen */}
					{SENTENCE.slice(0, UNLUCKY + 1).map((_, i) =>
						i === 0 ? null : (
							<path key={i} d={`M ${xs[i - 1] + widths[i - 1] / 2} ${baseY + 104} Q ${(xs[i - 1] + xs[i] + widths[i]) / 2} ${baseY + 150} ${xs[i] + widths[i] / 2 - 6} ${baseY + 104}`} fill="none" stroke={BLUE} strokeWidth={2.5} markerEnd="url(#arrowBlue)" />
						),
					)}
					<defs>
						<marker id="arrowBlue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
							<path d="M 0 0 L 10 5 L 0 10 z" fill={BLUE} />
						</marker>
					</defs>
					<text x={xs[UNLUCKY] + widths[UNLUCKY] / 2} y={baseY - 92} textAnchor="middle" fontFamily={GROTESK} fontWeight={800} fontSize={64} fill={BLUE}>
						4%
					</text>
					<text x={xs[UNLUCKY] + widths[UNLUCKY] / 2} y={baseY - 62} textAnchor="middle" fontFamily={MONO} fontSize={18} fill={BLUE}>
						sampled anyway
					</text>
					{/* Jev: overprinted numerals */}
					<text x={1560} y={470} textAnchor="middle" fontFamily={GROTESK} fontWeight={800} fontSize={190} fill={BLUE} letterSpacing={-8}>
						{JEV_P.toFixed(2)}
					</text>
					<text x={1560} y={540} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={BLUE}>
						P(scam | email)
					</text>
					<text x={1590} y={590} textAnchor="middle" fontFamily={MONO} fontSize={20} letterSpacing={3} fill={BLUE}>
						JEV · ONE PASS
					</text>
					{/* narration lower-third */}
					<text x={x0 + 120} y={990} fontFamily={MONO} fontSize={20} letterSpacing={3} fill={BLUE}>
						VO
					</text>
					<foreignObject x={x0 + 180} y={948} width={1500} height={110}>
						<div style={{fontFamily: GROTESK, fontWeight: 500, fontSize: 38, lineHeight: 1.18, color: BLUE}}>{NARRATION.a}</div>
					</foreignObject>
				</Ink>
			</svg>
			<Grain id="risoGrain" opacity={0.2} freq={0.7} />
		</AbsoluteFill>
	);
};
