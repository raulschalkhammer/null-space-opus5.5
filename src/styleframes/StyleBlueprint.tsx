import React from 'react';
import katex from 'katex';
import {AbsoluteFill} from 'remotion';
import {Grain, JEV_P, NARRATION, SENTENCE, UNLUCKY} from './Shared';

// Direction B: "Blueprint". Engineering drawings of imaginary machines: navy stock, cyan line work,
// one amber highlight colour, technical annotations and a title block. Precise, calm, a little noir.
const BG = '#0D2036';
const LINE = '#8FD8FF';
const DIM = 'rgba(143,216,255,0.55)';
const AMBER = '#FFB547';
const WHITE = '#EAF6FF';
const MONO = '"IBM Plex Mono", monospace';
const SERIF = '"IBM Plex Serif", serif';

const DIST = [
	{t: 'like', p: 0.46},
	{t: 'suspicious', p: 0.31},
	{t: 'very', p: 0.09},
	{t: 'totally', p: 0.04},
	{t: '(other)', p: 0.1},
];

const Label: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, children, size = 18, color = LINE, anchor = 'start'}) => (
	<text x={x} y={y} fontFamily={MONO} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={1.5}>
		{children}
	</text>
);

export const StyleBlueprint: React.FC = () => {
	const ctx = SENTENCE.slice(0, UNLUCKY);
	const widths = ctx.map((w) => w.t.length * 16 + 34);
	const xs: number[] = [];
	widths.reduce((x, w) => (xs.push(x), x + w + 10), 100);
	const newX = xs[xs.length - 1] + widths[widths.length - 1] + 10;
	const newW = 'totally'.length * 16 + 34;
	const stripY = 560;
	const histX = 900;
	const eq = katex.renderToString('p(y\\mid x)=\\prod_{t=1}^{T} p\\left(y_t \\mid y_{<t},\\,x\\right)', {output: 'html', throwOnError: false});
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 35%, #173150 0%, ${BG} 70%)`}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<defs>
					<pattern id="gridMinor" width={24} height={24} patternUnits="userSpaceOnUse">
						<path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(143,216,255,0.07)" strokeWidth={1} />
					</pattern>
					<pattern id="gridMajor" width={120} height={120} patternUnits="userSpaceOnUse">
						<rect width={120} height={120} fill="url(#gridMinor)" />
						<path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(143,216,255,0.14)" strokeWidth={1} />
					</pattern>
					<marker id="arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={LINE} />
					</marker>
					<marker id="arrAmber" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={AMBER} />
					</marker>
					<marker id="tick" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={10} markerHeight={10} orient="auto">
						<path d="M 5 0 L 5 10" stroke={LINE} strokeWidth={1.5} />
					</marker>
					<filter id="glow">
						<feGaussianBlur stdDeviation={3} result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				<rect width={1920} height={1080} fill="url(#gridMajor)" />
				<rect x={40} y={40} width={1840} height={1000} fill="none" stroke={DIM} strokeWidth={2} />
				<rect x={52} y={52} width={1816} height={976} fill="none" stroke={DIM} strokeWidth={1} />

				{/* ---------------- FIG. 1 ---------------- */}
				<Label x={100} y={112} size={22}>FIG. 1 · AUTOREGRESSIVE DECODING (GAB)</Label>
				<line x1={100} x2={700} y1={126} y2={126} stroke={DIM} />

				{/* the model block */}
				<g filter="url(#glow)">
					<rect x={330} y={200} width={420} height={140} rx={6} fill="rgba(143,216,255,0.05)" stroke={LINE} strokeWidth={2.5} />
					<rect x={342} y={212} width={396} height={116} rx={4} fill="none" stroke={DIM} strokeDasharray="4 6" />
				</g>
				<Label x={540} y={264} size={24} anchor="middle" color={WHITE}>LANGUAGE MODEL</Label>
				<Label x={540} y={296} size={16} anchor="middle">one forward pass</Label>

				{/* context strip */}
				{ctx.map((w, i) => (
					<g key={i}>
						<rect x={xs[i]} y={stripY} width={widths[i]} height={60} fill="rgba(143,216,255,0.06)" stroke={LINE} strokeWidth={2} />
						<Label x={xs[i] + widths[i] / 2} y={stripY + 38} size={22} anchor="middle" color={WHITE}>{w.t}</Label>
					</g>
				))}
				<rect x={newX} y={stripY} width={newW} height={60} fill="rgba(255,181,71,0.12)" stroke={AMBER} strokeWidth={2.5} strokeDasharray="8 5" filter="url(#glow)" />
				<Label x={newX + newW / 2} y={stripY + 38} size={22} anchor="middle" color={AMBER}>totally</Label>
				<Label x={100} y={stripY - 18} size={16}>CONTEXT y&lt;t</Label>

				{/* read everything so far → model */}
				<path d={`M 380 ${stripY - 6} L 380 460 L 460 460 L 460 346`} fill="none" stroke={LINE} strokeWidth={2} markerEnd="url(#arr)" />
				<Label x={392} y={452} size={15}>reads all of y&lt;t</Label>

				{/* model → distribution */}
				<path d={`M 752 270 L ${histX - 14} 270`} fill="none" stroke={LINE} strokeWidth={2} markerEnd="url(#arr)" />
				<Label x={histX} y={180} size={16}>NEXT-WORD DISTRIBUTION</Label>
				{DIST.map((d, i) => {
					const y = 205 + i * 46;
					const hit = d.t === 'totally';
					return (
						<g key={i}>
							<Label x={histX + 150} y={y + 23} size={18} anchor="end" color={hit ? AMBER : WHITE}>{d.t}</Label>
							<rect x={histX + 165} y={y + 6} width={Math.max(6, 360 * d.p)} height={24} fill={hit ? AMBER : 'rgba(143,216,255,0.28)'} stroke={hit ? AMBER : LINE} strokeWidth={1.5} />
							<Label x={histX + 175 + Math.max(6, 360 * d.p)} y={y + 24} size={16} color={hit ? AMBER : LINE}>{d.p.toFixed(2)}</Label>
						</g>
					);
				})}
				<Label x={histX + 250} y={364} size={15} color={AMBER}>◂ sampled</Label>

				{/* feedback loop: append and repeat */}
				<path d={`M ${histX + 170} 372 L ${histX + 170} 480 L ${newX + newW / 2} 480 L ${newX + newW / 2} ${stripY - 8}`} fill="none" stroke={AMBER} strokeWidth={2.5} strokeDasharray="10 6" markerEnd="url(#arrAmber)" />
				<Label x={histX + 186} y={470} size={16} color={AMBER}>append · repeat</Label>

				{/* dimension line */}
				<line x1={100} x2={newX + newW} y1={680} y2={680} stroke={LINE} strokeWidth={1.5} markerStart="url(#tick)" markerEnd="url(#tick)" />
				{[...xs, newX].map((x, i) => (
					<line key={i} x1={x} x2={x} y1={672} y2={688} stroke={LINE} strokeWidth={1.5} />
				))}
				<Label x={(100 + newX + newW) / 2} y={712} size={17} anchor="middle">7 TOKENS = 7 SEQUENTIAL PASSES</Label>

				{/* ---------------- FIG. 2 ---------------- */}
				<line x1={1290} x2={1290} y1={90} y2={830} stroke={DIM} strokeDasharray="3 8" />
				<Label x={1340} y={112} size={22}>FIG. 2 · SYSTEM ONE (JEV)</Label>
				<line x1={1340} x2={1820} y1={126} y2={126} stroke={DIM} />
				{/* the whole email */}
				<rect x={1440} y={170} width={280} height={170} fill="rgba(143,216,255,0.05)" stroke={LINE} strokeWidth={2} />
				{[0, 1, 2, 3, 4].map((i) => (
					<line key={i} x1={1462} x2={1462 + (i % 2 ? 190 : 236)} y1={204 + i * 26} y2={204 + i * 26} stroke={DIM} strokeWidth={3} />
				))}
				<Label x={1580} y={362} size={15} anchor="middle">STATE: WHOLE EMAIL</Label>
				{/* rays through the aperture */}
				{Array.from({length: 9}, (_, i) => {
					const x = 1460 + i * 30;
					return <path key={i} d={`M ${x} 372 L 1580 520`} stroke={LINE} strokeWidth={1.2} opacity={0.7} />;
				})}
				<g filter="url(#glow)">
					<circle cx={1580} cy={540} r={48} fill={BG} stroke={LINE} strokeWidth={2.5} />
					<path d="M 1580 504 L 1611 522 L 1611 558 L 1580 576 L 1549 558 L 1549 522 Z" fill="none" stroke={AMBER} strokeWidth={2} />
				</g>
				<Label x={1646} y={546} size={18} color={WHITE}>JEV</Label>
				<path d="M 1580 590 L 1580 640" stroke={AMBER} strokeWidth={2.5} markerEnd="url(#arrAmber)" />
				{/* typed answer card */}
				<rect x={1420} y={650} width={320} height={150} fill="rgba(255,181,71,0.08)" stroke={AMBER} strokeWidth={2.5} filter="url(#glow)" />
				<Label x={1440} y={684} size={18} color={AMBER}>scam?        type: noul</Label>
				<text x={1440} y={770} fontFamily={MONO} fontSize={72} fontWeight={600} fill={AMBER}>
					{JEV_P.toFixed(2)}
				</text>
				{/* dimension */}
				<line x1={1800} x2={1800} y1={170} y2={800} stroke={LINE} strokeWidth={1.5} markerStart="url(#tick)" markerEnd="url(#tick)" />
				<text x={1822} y={485} fontFamily={MONO} fontSize={17} fill={LINE} letterSpacing={1.5} transform="rotate(90 1822 485)" textAnchor="middle">
					1 PASS · 0 WORDS
				</text>

				{/* ---------------- title block ---------------- */}
				<g>
					<rect x={1340} y={870} width={500} height={140} fill="rgba(13,32,54,0.6)" stroke={LINE} strokeWidth={2} />
					<line x1={1340} x2={1840} y1={918} y2={918} stroke={DIM} />
					<line x1={1340} x2={1840} y1={964} y2={964} stroke={DIM} />
					<line x1={1590} x2={1590} y1={918} y2={1010} stroke={DIM} />
					<Label x={1358} y={902} size={17} color={WHITE}>THE MODEL THAT DOESN’T TALK</Label>
					<Label x={1358} y={948} size={14}>SHEET 01 · TRACK LAYER</Label>
					<Label x={1608} y={948} size={14}>SCALE 1 TOKEN : 1 PASS</Label>
					<Label x={1358} y={994} size={14}>DRAWN IN CODE</Label>
					<Label x={1608} y={994} size={14}>REV. A · DRAFT</Label>
				</g>
			</svg>
			{/* equation, set in the drawing */}
			<div style={{position: 'absolute', left: 100, top: 752, color: LINE, fontSize: 44}} dangerouslySetInnerHTML={{__html: eq}} />
			{/* narration */}
			<div style={{position: 'absolute', left: 100, top: 900, width: 1160, display: 'flex', gap: 22, alignItems: 'baseline'}}>
				<span style={{fontFamily: MONO, fontSize: 16, color: AMBER, letterSpacing: 3, border: `1.5px solid ${AMBER}`, padding: '3px 8px'}}>VO</span>
				<span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, lineHeight: 1.25, color: WHITE}}>{NARRATION.b}</span>
			</div>
			<Grain id="bpGrain" opacity={0.12} freq={0.9} />
		</AbsoluteFill>
	);
};
