import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/gochi-hand/400.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/fraunces/400-italic.css';
import '@fontsource/bricolage-grotesque/500.css';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/bricolage-grotesque/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-serif/400-italic.css';
import 'katex/dist/katex.min.css';
import {TrackLayer, tl} from './shorts/track-layer/TrackLayer';
import {FPS, HEIGHT, WIDTH} from './shorts/track-layer/timeline';
import {StyleBlueprint} from './styleframes/StyleBlueprint';
import {StylePaper} from './styleframes/StylePaper';
import {StyleRiso} from './styleframes/StyleRiso';
import {TrackLayerPaper, film} from './shorts/paper-track/Film';

// Block rendering until every webfont is ready, so no frame renders with fallback fonts.
const fontsReady = delayRender('Loading fonts');
Promise.all(
	['400 40px "Gochi Hand"', '400 40px "Patrick Hand"', '400 40px "Caveat"', '700 40px "Caveat"', '600 40px "Fraunces"', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '400 40px KaTeX_Main', 'italic 400 40px KaTeX_Math', 'italic 400 40px Fraunces', '800 40px "Bricolage Grotesque"', '500 40px "Bricolage Grotesque"', '700 40px "Bricolage Grotesque"', '400 40px "IBM Plex Mono"', '600 40px "IBM Plex Mono"', 'italic 400 40px "IBM Plex Serif"'].map((f) =>
		document.fonts.load(f),
	),
).then(() => continueRender(fontsReady));

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="TrackLayerPaper" component={TrackLayerPaper} durationInFrames={film.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="TrackLayer" component={TrackLayer} durationInFrames={tl.total} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleA-Riso" component={StyleRiso} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleB-Blueprint" component={StyleBlueprint} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Composition id="StyleC-Paper" component={StylePaper} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
	</>
);
