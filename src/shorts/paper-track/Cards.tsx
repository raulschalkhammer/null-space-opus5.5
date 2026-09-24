import React from 'react';
import katex from 'katex';
import {AbsoluteFill} from 'remotion';
import {Layer, P, SERIF} from '../../paper/kit';
import {fmt} from './Table';
import {type Film, easeIn, easeInOut, easeOut, lerp, progress} from './timeline';

const tex = (s: string) => katex.renderToString(s, {throwOnError: false, output: 'html'});

// Layered paper hills that rise into place: opening and closing card.
const RisingHills: React.FC<{k: number}> = ({k}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		<g transform={`translate(0 ${(1 - easeOut(k, 3)) * 420})`}>
			<Layer blur={2}>
				<path d="M 0 700 C 300 620 520 680 800 640 C 1060 600 1300 680 1540 630 C 1700 600 1820 650 1920 630 L 1920 1080 L 0 1080 Z" fill={P.sageFar} />
			</Layer>
		</g>
		<g transform={`translate(0 ${(1 - easeOut(k - 0.12, 3)) * 520})`}>
			<Layer shadow={2}>
				<path d="M 0 800 C 260 740 520 800 800 760 C 1060 720 1300 790 1540 740 C 1700 710 1820 760 1920 750 L 1920 1080 L 0 1080 Z" fill={P.sage} />
			</Layer>
		</g>
		<g transform={`translate(0 ${(1 - easeOut(k - 0.24, 3)) * 620})`}>
			<Layer shadow={3}>
				<path d="M 0 900 C 300 870 600 930 960 890 C 1300 860 1600 930 1920 890 L 1920 1080 L 0 1080 Z" fill={P.sageDeep} />
			</Layer>
		</g>
	</svg>
);

export const TitleCard: React.FC<{f: number}> = ({f}) => {
	const t = easeOut(progress(f, 18, 40), 2);
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.skyTop} 0%, ${P.skyMid} 60%, ${P.skyLow} 100%)`}}>
			<RisingHills k={progress(f, 0, 34)} />
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', color: P.ink, opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
				<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 22, letterSpacing: 10}}>Nº 1</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, lineHeight: 1.05}}>Track Layer</div>
				<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 22, letterSpacing: 10, marginTop: 14}}>THE MODEL THAT DOESN’T TALK</div>
			</div>
		</AbsoluteFill>
	);
};

// The chain rule, printed on a paper banner that drops into the scene. Numbers first, then the symbols.
export const ChainBanner: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const {S, route, cues} = film;
	const a = S.chain.start;
	const drop = easeOut(progress(f, a + 4, a + 22), 3) * (1 - easeIn(progress(f, S.chain.end - 6, S.chain.end + 8)));
	if (drop <= 0) return null;
	const n = 6;
	const shown = Math.floor(progress(f, a + 10, a + 10 + n * 8) * n + 0.001);
	const nums = route.slice(0, n).map((g) => fmt(g.chosen.p));
	const total = route[n - 1].cumAfter;
	const eqK = easeOut(progress(f, cues.L06.start + 10, cues.L06.start + 28), 2);
	const nameK = easeOut(progress(f, cues.L06.start + 36, cues.L06.start + 50), 2);
	return (
		<div style={{position: 'absolute', left: 260, right: 260, top: 70, transform: `translateY(${(1 - drop) * -420}px)`}}>
			<svg width={1400} height={70} style={{position: 'absolute', top: -60, left: 0}}>
				<line x1={60} y1={0} x2={60} y2={70} stroke={P.ink} strokeWidth={2} />
				<line x1={1340} y1={0} x2={1340} y2={70} stroke={P.ink} strokeWidth={2} />
			</svg>
			<div style={{background: P.card, padding: '26px 44px 30px', boxShadow: '10px 18px 34px rgba(58,42,24,0.35)', color: P.ink, textAlign: 'center'}}>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: '#6D6152'}}>the chance of the whole sentence</div>
				<div style={{fontFamily: SERIF, fontSize: 50, marginTop: 8, whiteSpace: 'nowrap'}}>
					{nums.map((v, i) => (
						<span key={i} style={{opacity: i < shown ? 1 : 0.12}}>
							{i ? <span style={{color: '#8A7B66'}}> × </span> : null}
							<span style={{fontWeight: 600}}>{v}</span>
						</span>
					))}
					<span style={{opacity: shown >= n ? 1 : 0.12}}>
						<span style={{color: '#8A7B66'}}> = </span>
						<span style={{fontWeight: 600, color: P.rust}}>{fmt(total)}</span>
					</span>
				</div>
				<div style={{height: 1.5, background: '#D9C9A8', margin: '22px 60px 18px', opacity: eqK}} />
				<div style={{opacity: eqK, transform: `translateY(${(1 - eqK) * 12}px)`, fontSize: 46, color: P.ink}} dangerouslySetInnerHTML={{__html: tex('p(\\text{sentence}) = \\prod_{t} \\, p\\big(\\,\\text{word}_t \\mid \\text{words before it}\\,\\big)')}} />
				<div style={{opacity: nameK, fontFamily: SERIF, fontWeight: 600, fontSize: 18, letterSpacing: 8, marginTop: 14, color: P.rust}}>THE CHAIN RULE</div>
			</div>
		</div>
	);
};

export const EndCard: React.FC<{film: Film; f: number}> = ({film, f}) => {
	const e = f - film.S.endcard.start;
	const t = easeOut(progress(e, 10, 30), 2);
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.skyTop} 0%, ${P.skyMid} 60%, ${P.skyLow} 100%)`}}>
			<RisingHills k={1} />
			<div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', color: P.ink, opacity: t}}>
				<div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 22, letterSpacing: 10}}>THE MODEL THAT DOESN’T TALK</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, marginTop: 40, color: '#6D6152'}}>next time</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, lineHeight: 1.05}}>The Mailroom</div>
			</div>
			<div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 18, color: '#F3EAD7', opacity: lerp(0, 0.9, t)}}>
				Draft · word odds and Jev’s answer are illustrative placeholders · voice: Kokoro-82M · made with Remotion
			</div>
		</AbsoluteFill>
	);
};

export const Stamp: React.FC = () => (
	<div style={{position: 'absolute', right: 40, top: 34, fontFamily: SERIF, fontWeight: 600, fontSize: 13, letterSpacing: 4, color: P.rust, border: `1.5px solid ${P.rust}`, padding: '4px 10px', opacity: 0.7, background: 'rgba(251,246,234,0.6)'}}>
		DRAFT · ILLUSTRATIVE NUMBERS
	</div>
);

export const easeCard = easeInOut;
