import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import './fonts';
import {TrackLayer, tl} from './shorts/track-layer/TrackLayer';
import {FPS, HEIGHT, WIDTH} from './shorts/track-layer/timeline';
import {StyleBlueprint} from './styleframes/StyleBlueprint';
import {StylePaper} from './styleframes/StylePaper';
import {StyleRiso} from './styleframes/StyleRiso';
import {TrackLayerPaper, film} from './shorts/paper-track/Film';
import {TrackLayerFlat, film as flatFilm} from './shorts/flat-track/Film';
import {TrainSheetA, TrainSheetB, TrainSheetC} from './styleframes/TrainSheets';
import {ACT_FRAMES, SteamActing, SteamMoodsClaude, SteamMoodsGpt} from './styleframes/SteamMoods';
import {JevContract, contract} from './shorts/jev-contract/Film';
import {MillionLetters, million} from './shorts/million-letters/Film';
import {SignalBox, signal} from './shorts/signal-box/Film';

// Block rendering until every webfont is ready, so no frame renders with fallback fonts.
const fontsReady = delayRender('Loading fonts');
Promise.all(
	['400 40px "Gochi Hand"', '400 40px "Patrick Hand"', '400 40px "Caveat"', '700 40px "Caveat"', '600 40px "Fraunces"', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '400 40px KaTeX_Main', 'italic 400 40px KaTeX_Math', 'italic 400 40px Fraunces', '800 40px "Bricolage Grotesque"', '500 40px "Bricolage Grotesque"', '700 40px "Bricolage Grotesque"', '400 40px "IBM Plex Mono"', '600 40px "IBM Plex Mono"', 'italic 400 40px "IBM Plex Serif"', '700 40px Nunito', '800 40px Nunito', '900 40px Nunito'].map((f) =>
		document.fonts.load(f),
	),
).then(() => continueRender(fontsReady));

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="TrackLayerFlat" component={TrackLayerFlat} durationInFrames={flatFilm.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrackLayerPaper" component={TrackLayerPaper} durationInFrames={film.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrackLayer" component={TrackLayer} durationInFrames={tl.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrainA" component={TrainSheetA} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrainB" component={TrainSheetB} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrainC" component={TrainSheetC} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="SteamMoodsClaude" component={SteamMoodsClaude} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="SteamMoodsGpt" component={SteamMoodsGpt} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="JevContract" component={JevContract} durationInFrames={contract.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="MillionLetters" component={MillionLetters} durationInFrames={million.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="SignalBox" component={SignalBox} durationInFrames={signal.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="SteamActing" component={SteamActing} durationInFrames={ACT_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleA-Riso" component={StyleRiso} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleB-Blueprint" component={StyleBlueprint} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleC-Paper" component={StylePaper} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
	</>
);
