import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, useCurrentFrame} from 'remotion';
import {track} from '../../flat/audio';
import cuts from '../../../fixtures/final-cuts.json';
import {type Edl, blackAt, buildEdls, mapFrame} from '../../final';
import {TrackLayerFlat, film} from '../flat-track/Film';
import {JevContract, contract} from '../jev-contract/Film';
import {MillionLetters, million} from '../million-letters/Film';
import {SignalBox, signal} from '../signal-box/Film';

// The final cut of each chapter (src/final.ts): the chapter played through its edit list, silent, with the cut
// soundtrack laid on top. FinalFilm joins the four into the whole video.
export const edls = buildEdls(film, contract, million, signal, cuts);

const cut = (Comp: React.FC<{silent?: boolean}>, e: Edl): React.FC => {
	const Cut: React.FC = () => {
		const f = useCurrentFrame();
		const m = mapFrame(e.v, f);
		const o = blackAt(e, f);
		return (
			<AbsoluteFill style={{background: '#000'}}>
				{/* shows chapter frame m at this frame */}
				<Sequence from={f - m}>
					<Comp silent />
				</Sequence>
				{o > 0 ? <AbsoluteFill style={{background: '#000', opacity: o}} /> : null}
				<Audio src={track(e.out)} />
			</AbsoluteFill>
		);
	};
	return Cut;
};

export const Final1 = cut(TrackLayerFlat, edls.ch1);
export const Final2 = cut(JevContract, edls.ch2);
export const Final3 = cut(MillionLetters, edls.ch3);
export const Final4 = cut(SignalBox, edls.ch4);
const PARTS = [
	{C: Final1, e: edls.ch1},
	{C: Final2, e: edls.ch2},
	{C: Final3, e: edls.ch3},
	{C: Final4, e: edls.ch4},
];
export const FILM_TOTAL = PARTS.reduce((a, p) => a + p.e.total, 0);
export const FinalFilm: React.FC = () => (
	<Series>
		{PARTS.map(({C, e}, i) => (
			<Series.Sequence key={i} durationInFrames={e.total}>
				<C />
			</Series.Sequence>
		))}
	</Series>
);
