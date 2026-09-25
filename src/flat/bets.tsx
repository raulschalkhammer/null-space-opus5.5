import React from 'react';
import {FONT, K} from './kit';
import {Harbor} from './harbor';
import {SteamPress} from '../characters/steam';
import {easeOut, progress} from '../shorts/paper-track/timeline';
import {withLook} from '../shorts/flat-track/trainMood';
import {pop} from '../shorts/million-letters/parts';

// Shared by chapters 1 and 2: a train that lays its answer as track, one word per sleeper, with a die thrown for each word.
export const Dice: React.FC<{x: number; y: number; s: number; n: number}> = ({x, y, s, n}) => (
	<g transform={`translate(${x} ${y}) scale(${s}) rotate(${((n * 37) % 24) - 12})`}>
		<rect x={-11} y={-11} width={22} height={22} rx={6} fill={K.yellow} />
		{[[-4, -4], [4, 4], [0, 0]].slice(0, 1 + (n % 3)).map(([a, b], j) => (
			<circle key={j} cx={a} cy={b} r={2.4} fill={K.ink} />
		))}
	</g>
);

// The chain of bets: the train lays its answer as sleepers, one word each, and a die is thrown for every word.
export const LAID = 'Great question ! I think this email looks totally legit , so you should click it'.split(' ');
export const TR = {y: 900, x0: 110, gap: 112};
export const laidAt = (f: number, t0: number, every: number) => Math.max(0, Math.min(LAID.length, Math.floor((f - t0) / every) + 1));
export const TrackWorld: React.FC<{f: number; n: number; t0: number; every: number; ghosts?: number; dice?: boolean}> = ({f, n, t0, every, ghosts = 0, dice = true}) => {
	const front = TR.x0 + n * TR.gap + 40;
	return (
		<Harbor f={f} lamp={0} lx={2600}>
			<rect x={-60} y={TR.y + 8} width={2040} height={300} fill="#1B1F5A" />
			{/* the laid track: every sleeper is a word */}
			{LAID.slice(0, n).map((w, i) => {
				const x = TR.x0 + i * TR.gap;
				const k = easeOut(progress(f, t0 + i * every, t0 + i * every + 6), 3);
				return (
					<g key={i} transform={`translate(${x} ${TR.y}) scale(${0.6 + 0.4 * k})`}>
						<rect x={-50} y={-16} width={100} height={32} rx={6} fill="#8A5A3C" />
						<rect x={-50} y={-16} width={100} height={8} rx={4} fill="#B07A5A" />
						<text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={w.length > 7 ? 18 : 22} fill="#FFF3E0">
							{w}
						</text>
					</g>
				);
			})}
			{/* the next words, waiting their turn */}
			{Array.from({length: ghosts}, (_, j) => (
				<rect key={`g${j}`} x={TR.x0 + (n + j) * TR.gap - 50} y={TR.y - 16} width={100} height={32} rx={6} fill="none" stroke="#9AA2E6" strokeWidth={3} strokeDasharray="10 8" opacity={0.6 - j * 0.15} />
			))}
			<rect x={-60} y={TR.y - 22} width={front + 60} height={5} fill="#C9CCE0" />
			{dice
				? LAID.slice(0, n).map((_, i) => <Dice key={`d${i}`} x={TR.x0 + i * TR.gap} y={TR.y - 120 - (i % 2) * 40 + 6 * Math.sin(f * 0.08 + i)} s={2 * pop(f, t0 + i * every + 2, 8)} n={i} />)
				: null}
			<g transform={`translate(${front + 250} ${TR.y - 22})`}>
				<SteamPress livery="claude" f={f} s={0.7} expr={withLook('determined', 1, 0.2)} dist={front * 0.3} smokeT={f * 0.012} />
			</g>
		</Harbor>
	);
};

