import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import fixture from '../../../fixtures/track-layer.json';
import {FilterDefs, Grain} from '../../fx/Filters';
import {C} from '../../lib/palette';
import {buildTimeline, easeInOut, onTwos, progress, type TrackLayerFixture} from './timeline';
import {Sky, World} from './World';
import {Captions, DraftStamp, EmailNote, PassCounter, QuestionBubble, SpeechBubble} from './Overlays';
import {EndCard, MathCard, TitleCard} from './Cards';

export const tl = buildTimeline(fixture as TrackLayerFixture);

export const TrackLayer: React.FC = () => {
	const f = useCurrentFrame();
	const cam = tl.camera(f);
	const showWorld = f >= tl.EST_START && f < tl.MATH_START;
	const iris = easeInOut(progress(f, tl.EST_START, tl.EST_START + 24)) * 1200;
	const boilSeed = 1 + ((onTwos(f) / 2) % 6);
	const slide = 1 - easeInOut(progress(f, tl.MATH_START - 14, tl.MATH_START));
	return (
		<AbsoluteFill style={{background: C.skyTop}}>
			{f < tl.EST_START + 26 ? <TitleCard f={f} /> : null}
			{showWorld ? (
				<AbsoluteFill style={{clipPath: iris < 1199 ? `circle(${iris}px at 50% 50%)` : undefined}}>
					<svg width={1920} height={1080}>
						<FilterDefs seed={boilSeed} blur={cam.blur} />
						<g filter={cam.blur > 0.5 ? 'url(#whip)' : undefined}>
							<g filter="url(#boil)">
								<Sky cam={cam} frame={f} />
								<World tl={tl} f={f} cam={cam} />
							</g>
						</g>
					</svg>
					<SpeechBubble tl={tl} f={f} cam={cam} />
					<QuestionBubble tl={tl} f={f} cam={cam} />
					<EmailNote tl={tl} f={f} />
					<PassCounter tl={tl} f={f} />
					<Captions tl={tl} f={f} />
				</AbsoluteFill>
			) : null}
			{f >= tl.MATH_START - 14 && f < tl.END_START + 4 ? (
				<AbsoluteFill style={{transform: `translateX(${slide * 1920}px)`, opacity: 1 - progress(f, tl.END_START - 10, tl.END_START + 4)}}>
					<MathCard tl={tl} f={f} />
				</AbsoluteFill>
			) : null}
			{f >= tl.END_START - 10 ? (
				<AbsoluteFill style={{opacity: progress(f, tl.END_START - 10, tl.END_START + 4)}}>
					<EndCard tl={tl} f={f} />
				</AbsoluteFill>
			) : null}
			<Grain frame={f} />
			{f < tl.END_START ? <DraftStamp status={tl.fx.status} /> : null}
			<Audio src={staticFile('audio/track-layer.wav')} />
		</AbsoluteFill>
	);
};
