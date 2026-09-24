import React from 'react';
import katex from 'katex';
import {AbsoluteFill} from 'remotion';
import {Gab} from '../../characters/Gab';
import {Jev} from '../../characters/Jev';
import {ChalkDefs} from '../../fx/Filters';
import {rLine} from '../../fx/rough';
import {C, FONT} from '../../lib/palette';
import {type Timeline, MATH_PLANKS, MATH_WRITES, easeInOut, easeOut, onTwos, progress} from './timeline';

const tex = (s: string) => katex.renderToString(s, {throwOnError: false, output: 'html'});

// Reveal left-to-right like a chalk stroke being written.
const Write: React.FC<{k: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, children, style}) => (
	<div style={{clipPath: `inset(-20% ${100 - 100 * k}% -20% -2%)`, ...style}}>{children}</div>
);
const Tex: React.FC<{s: string; size: number; color?: string}> = ({s, size, color = C.chalk}) => (
	<span style={{fontSize: size, color}} dangerouslySetInnerHTML={{__html: tex(s)}} />
);

export const TitleCard: React.FC<{f: number}> = ({f}) => {
	const write = easeInOut(progress(f, 8, 40));
	const sub = easeOut(progress(f, 40, 52), 2);
	const seed = 1 + (onTwos(f) / 2) % 5;
	const trainX = -300 + f * 26;
	return (
		<AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: FONT.serif, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: C.ink}}>
				THE MODEL THAT DOESN’T TALK
			</div>
			<div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: FONT.note, fontSize: 46, color: C.gabDark}}>short no. 1</div>
			<Write k={write} style={{position: 'absolute', top: 340}}>
				<div style={{fontFamily: FONT.title, fontSize: 210, color: C.ink, lineHeight: 1}}>Track Layer</div>
			</Write>
			<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
				<g opacity={write}>{rLine(620, 580, 620 + 680 * write, 572, {seed, stroke: C.gab, strokeWidth: 8, roughness: 1.8})}</g>
				<g transform={`translate(${trainX} 930) scale(0.62)`}>
					<Gab wheelTurn={trainX / 17} face="happy" talk={0} look={{x: 1, y: 0}} blink={0} paperWave={Math.sin(onTwos(f) * 0.4)} sweat={0} />
				</g>
				{rLine(0, 932, 1920, 932, {seed: seed + 3, stroke: C.ink, strokeWidth: 4, roughness: 1})}
			</svg>
			<div style={{position: 'absolute', top: 620, width: '100%', textAlign: 'center', fontFamily: FONT.note, fontSize: 54, color: C.ink, opacity: sub}}>
				in which a train talks itself into a swamp
			</div>
		</AbsoluteFill>
	);
};

export const MathCard: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => {
	const m = f - tl.MATH_START;
	const w = (i: number) => easeInOut(progress(m, MATH_WRITES[i][0], MATH_WRITES[i][1]));
	const plank = (i: number) => easeOut(progress(m, MATH_PLANKS[i], MATH_PLANKS[i] + 12), 3);
	const notes = easeOut(progress(m, 196, 214), 2);
	const words = tl.steps.slice(0, 3).map((s) => s.chosen.t.trim() || '␣');
	const factors = ['p(y_1\\mid x)', 'p(y_2\\mid y_1,x)', 'p(y_3\\mid y_1,y_2,x)'];
	const passes = tl.steps.length;
	return (
		<AbsoluteFill style={{background: C.chalkboard}}>
			<ChalkDefs seed={1 + (onTwos(f) / 2) % 4} />
			<AbsoluteFill style={{border: `22px solid ${C.woodDark}`, boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)'}} />
			<div style={{position: 'absolute', inset: 0, filter: 'url(#chalk)'}}>
				<div style={{position: 'absolute', left: 120, top: 90, fontFamily: FONT.note, fontSize: 58, color: C.chalkYellow, opacity: easeOut(progress(m, 2, 12))}}>
					what just happened
				</div>
				{/* row 1: the chain rule, one factor per word */}
				<div style={{position: 'absolute', left: 120, top: 220, display: 'flex', alignItems: 'flex-start', gap: 28}}>
					<Write k={w(0)}>
						<Tex s={'p(y\\mid x) ='} size={64} />
					</Write>
					{factors.map((fa, i) => (
						<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
							<Write k={w(i + 1)}>
								<Tex s={fa} size={64} />
							</Write>
							<div
								style={{
									opacity: plank(i),
									transform: `translateY(${(1 - plank(i)) * 60}px)`,
									background: C.wood,
									border: `3px solid ${C.chalk}`,
									borderRadius: 6,
									padding: '2px 26px',
									fontFamily: FONT.hand,
									fontSize: 40,
									color: C.ink,
								}}
							>
								{words[i]}
							</div>
						</div>
					))}
					<Write k={w(3)}>
						<Tex s={'\\cdots'} size={64} />
					</Write>
				</div>
				{/* row 2: the product */}
				<div style={{position: 'absolute', left: 120, top: 450}}>
					<Write k={w(4)}>
						<Tex s={'\\displaystyle p(y\\mid x) = \\prod_{t=1}^{T} p\\big(y_t \\mid y_{<t},\\, x\\big)'} size={76} />
					</Write>
				</div>
				<div style={{position: 'absolute', left: 1300, top: 500, width: 540, fontFamily: FONT.note, fontSize: 44, lineHeight: 1.05, color: C.chalkYellow, opacity: notes, transform: 'rotate(-3deg)'}}>
					← one wheel = one forward pass per word (Gab needed {passes})
				</div>
				<div style={{position: 'absolute', left: 1300, top: 650, width: 540, fontFamily: FONT.note, fontSize: 44, lineHeight: 1.05, color: C.chalkYellow, opacity: notes, transform: 'rotate(2deg)'}}>
					← y&lt;t: every word leans on the ones before it
				</div>
				{/* row 3: Jev */}
				<div style={{position: 'absolute', left: 120, top: 850, display: 'flex', alignItems: 'baseline', gap: 30}}>
					<Write k={w(5)}>
						<span style={{fontFamily: FONT.hand, fontSize: 60, color: C.chalkTeal, marginRight: 24}}>Jev:</span>
						<Tex s={`P(\\text{scam}\\mid \\text{email}) = ${tl.fx.jev.p.toFixed(2)}`} size={66} color={C.chalkTeal} />
					</Write>
					<div style={{fontFamily: FONT.note, fontSize: 46, color: C.chalkTeal, opacity: easeOut(progress(m, 280, 292))}}>one look, one typed answer</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const EndCard: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => {
	const e = f - tl.END_START;
	const peek = easeOut(progress(e, 20, 34), 3);
	const blink = e >= 60 && e < 64 ? 1 : 0;
	const g = onTwos(f);
	return (
		<AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: FONT.note, fontSize: 60, color: C.gabDark}}>next time</div>
			<div style={{position: 'absolute', top: 370, width: '100%', textAlign: 'center', fontFamily: FONT.title, fontSize: 150, color: C.ink}}>The Mailroom</div>
			<div style={{position: 'absolute', top: 580, width: '100%', textAlign: 'center', fontFamily: FONT.serif, fontWeight: 600, fontSize: 28, letterSpacing: 8, color: C.ink}}>
				THE MODEL THAT DOESN’T TALK
			</div>
			<div style={{position: 'absolute', bottom: 90, width: '100%', textAlign: 'center', fontFamily: FONT.mono, fontSize: 18, color: C.inkSoft}}>
				draft render · Gab's word odds and Jev's answer are illustrative placeholders · made with Remotion, Rough.js and KaTeX
			</div>
			<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
				<g transform={`translate(${1920 - 150 * peek + 40} 1080) rotate(${-14 * peek})`}>
					<Jev blink={blink} lid={0} look={{x: -1, y: -0.4}} tilt={0} squash={1 + 0.03 * Math.sin(g * 0.2)} armRaise={0} glow={0} antenna={e >= 70 && e < 76 ? 1 : 0.4} tag={null} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};
