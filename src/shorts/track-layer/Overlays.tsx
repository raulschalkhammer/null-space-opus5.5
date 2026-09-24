import React from 'react';
import {C, FONT} from '../../lib/palette';
import {type Cam, type Timeline, easeInOut, easeOut, progress} from './timeline';

const toScreen = (cam: Cam, x: number, y: number) => ({x: 960 + (x - cam.cx) * cam.s, y: 540 + (y - cam.cy) * cam.s});

// The email Gab was asked about: a note that drops in, then docks in the corner.
export const EmailNote: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => {
	if (f < 140 || f >= tl.JEV_START + 8) return null;
	const inK = easeOut(progress(f, 140, 154), 3);
	const dock = easeInOut(progress(f, 236, 262));
	const x = 960 + (1590 - 960) * dock;
	const y = -260 + (330 + 260) * inK - (330 - 150) * dock;
	const s = 1 - 0.55 * dock;
	const fadeOut = 1 - progress(f, tl.JEV_START - 4, tl.JEV_START + 8);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 820,
				transform: `translate(-50%, -50%) scale(${s}) rotate(${-2 + 1.5 * dock}deg)`,
				opacity: fadeOut,
				background: '#FFFDF6',
				border: `4px solid ${C.ink}`,
				borderRadius: 10,
				padding: '26px 34px 22px',
				boxShadow: '8px 10px 0 rgba(46,42,38,0.18)',
			}}
		>
			<div style={{fontFamily: FONT.mono, fontSize: 20, color: C.inkSoft, letterSpacing: 2}}>✉ INCOMING</div>
			<div style={{fontFamily: FONT.mono, fontSize: 30, color: C.ink, marginTop: 10, lineHeight: 1.35}}>{tl.fx.email}</div>
			<div style={{fontFamily: FONT.note, fontSize: 56, color: C.stamp, marginTop: 12, transform: 'rotate(-2deg)'}}>{tl.fx.question.toLowerCase()}</div>
		</div>
	);
};

// Gab's speech: every word it has laid so far.
export const SpeechBubble: React.FC<{tl: Timeline; f: number; cam: Cam}> = ({tl, f, cam}) => {
	const first = tl.steps[0];
	if (f < first.slam || f > tl.LAND + 8) return null;
	const words = tl.steps.filter((st) => f >= st.slam);
	const last = words[words.length - 1];
	const pop = 1 + 0.25 * Math.exp(-(f - last.slam) / 3);
	const pose = tl.gabPose(f);
	const anchor = toScreen(cam, pose.x - 60, pose.y - 290);
	const fade = 1 - progress(f, tl.LAND, tl.LAND + 8);
	return (
		<div
			style={{
				position: 'absolute',
				left: anchor.x,
				top: anchor.y,
				transform: `translate(-100%, -100%) scale(${cam.s})`,
				transformOrigin: '100% 100%',
				opacity: fade,
				maxWidth: 560,
				background: '#FFFDF6',
				border: `4px solid ${C.ink}`,
				borderRadius: 28,
				padding: '14px 26px',
				fontFamily: FONT.hand,
				fontSize: 42,
				color: C.ink,
				lineHeight: 1.15,
				whiteSpace: 'pre-wrap',
			}}
		>
			{words.map((st, i) => (
				<span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: i === words.length - 1 ? `scale(${pop})` : undefined, color: st.kind === 'unlucky' ? C.stamp : C.ink}}>
					{st.chosen.t}
				</span>
			))}
			<div style={{position: 'absolute', right: 40, bottom: -26, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `26px solid ${C.ink}`}} />
		</div>
	);
};

export const QuestionBubble: React.FC<{tl: Timeline; f: number; cam: Cam}> = ({tl, f, cam}) => {
	const shows: [number, number][] = [
		[tl.LAND + 58, tl.JEV_START],
		[tl.JEV_START + 212, tl.MATH_START],
	];
	const on = shows.find(([a, b]) => f >= a && f < b);
	if (!on) return null;
	const pose = tl.gabPose(f);
	const p = toScreen(cam, pose.x - 40, pose.y - 250);
	const k = easeOut(progress(f, on[0], on[0] + 6), 2);
	return (
		<div
			style={{
				position: 'absolute',
				left: p.x,
				top: p.y,
				transform: `translate(-50%, -100%) scale(${cam.s * (0.4 + 0.6 * k)})`,
				transformOrigin: '50% 100%',
				background: '#FFFDF6',
				border: `4px solid ${C.ink}`,
				borderRadius: 999,
				width: 96,
				height: 96,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: FONT.hand,
				fontSize: 70,
				color: C.ink,
			}}
		>
			?
		</div>
	);
};

// Ticket-stub counter of forward passes.
export const PassCounter: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => {
	if (f < tl.STEPS_START || f >= tl.MATH_START) return null;
	const gab = tl.steps.filter((st) => f >= st.start).length;
	const lastStart = [...tl.steps].reverse().find((st) => f >= st.start)?.start ?? 0;
	const pop = 1 + 0.35 * Math.exp(-(f - lastStart) / 3);
	const jevK = easeOut(progress(f, tl.JEV_START + 46, tl.JEV_START + 56), 2);
	const inK = easeOut(progress(f, tl.STEPS_START, tl.STEPS_START + 10), 2);
	const row = (who: string, n: number, color: string, scale = 1) => (
		<div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
			<span style={{fontFamily: FONT.mono, fontSize: 22, color: C.inkSoft, width: 60}}>{who}</span>
			<span style={{fontFamily: FONT.serif, fontWeight: 600, fontSize: 56, color, display: 'inline-block', transform: `scale(${scale})`, transformOrigin: '0 70%'}}>{n}</span>
		</div>
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: 44,
				top: 40,
				transform: `translateY(${(1 - inK) * -200}px) rotate(-2deg)`,
				background: '#FFFDF6',
				border: `4px dashed ${C.ink}`,
				borderRadius: 12,
				padding: '12px 26px 10px',
				minWidth: 210,
			}}
		>
			<div style={{fontFamily: FONT.mono, fontSize: 17, letterSpacing: 2, color: C.ink}}>FORWARD PASSES</div>
			{row('GAB', gab, C.gabDark, pop)}
			{jevK > 0 ? <div style={{opacity: jevK}}>{row('JEV', 1, C.jevDark)}</div> : null}
		</div>
	);
};

// Silent-film style notes at the bottom of the frame.
export const Captions: React.FC<{tl: Timeline; f: number}> = ({tl, f}) => {
	const cues: {a: number; b: number; text: string}[] = [];
	const s0 = tl.steps[0];
	cues.push({a: s0.start + 6, b: tl.steps[1].end, text: 'Gab builds its answer one word at a time: spin the odds, lay the word, repeat.'});
	if (tl.unlucky >= 0) {
		const u = tl.steps[tl.unlucky];
		cues.push({a: u.spinEnd + 4, b: u.end, text: `only a ${Math.round(u.chosen.p * 100)}% chance… but the wheel landed on “${u.chosen.t.trim()}”.`});
		const lean = tl.steps[tl.unlucky + 1];
		if (lean) cues.push({a: lean.start + 4, b: lean.end + 6, text: 'and every next word leans on the words already laid.'});
	}
	cues.push({a: tl.JEV_START + 70, b: tl.JEV_START + 146, text: 'Jev read the whole email once, and has been holding its answer ever since.'});
	const cue = cues.find((c) => f >= c.a && f < c.b);
	if (!cue) return null;
	const k = easeOut(progress(f, cue.a, cue.a + 8), 2) * (1 - progress(f, cue.b - 6, cue.b));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center', opacity: k}}>
			<div
				style={{
					transform: `translateY(${(1 - k) * 30}px) rotate(-1deg)`,
					background: '#FFFDF6',
					border: `3px solid ${C.ink}`,
					padding: '8px 30px 6px',
					fontFamily: FONT.note,
					fontSize: 50,
					color: C.ink,
					boxShadow: '6px 6px 0 rgba(46,42,38,0.18)',
					maxWidth: 1500,
					textAlign: 'center',
				}}
			>
				{cue.text}
			</div>
		</div>
	);
};

export const DraftStamp: React.FC<{status: string}> = ({status}) =>
	status === 'measured' ? null : (
		<div
			style={{
				position: 'absolute',
				right: 36,
				bottom: 26,
				transform: 'rotate(-4deg)',
				border: `3px solid ${C.stamp}`,
				color: C.stamp,
				fontFamily: FONT.mono,
				fontSize: 17,
				letterSpacing: 2,
				padding: '5px 12px',
				opacity: 0.75,
				background: 'rgba(255,253,246,0.6)',
			}}
		>
			DRAFT · ILLUSTRATIVE NUMBERS
		</div>
	);
