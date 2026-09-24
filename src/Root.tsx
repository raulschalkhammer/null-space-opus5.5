import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/gochi-hand/400.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import 'katex/dist/katex.min.css';
import {TrackLayer, tl} from './shorts/track-layer/TrackLayer';
import {FPS, HEIGHT, WIDTH} from './shorts/track-layer/timeline';

// Block rendering until every webfont is ready, so no frame renders with fallback fonts.
const fontsReady = delayRender('Loading fonts');
Promise.all(
	['400 40px "Gochi Hand"', '400 40px "Patrick Hand"', '400 40px "Caveat"', '700 40px "Caveat"', '600 40px "Fraunces"', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '400 40px KaTeX_Main', 'italic 400 40px KaTeX_Math'].map((f) =>
		document.fonts.load(f),
	),
).then(() => continueRender(fontsReady));

export const RemotionRoot: React.FC = () => (
	<Composition id="TrackLayer" component={TrackLayer} durationInFrames={tl.total} fps={FPS} width={WIDTH} height={HEIGHT} />
);
