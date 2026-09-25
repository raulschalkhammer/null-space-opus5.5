// The Screening Room: every chapter in a browser player, with its scene strip, frame stepping and a
// "this moment" line to paste into feedback. Built into one page by data-scripts/build-preview.mjs.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import '../fonts';
import {chapterList, type ChapterInfo} from '../chapters';
import {TrackLayerFlat, film} from '../shorts/flat-track/Film';
import {JevContract, contract} from '../shorts/jev-contract/Film';
import {MillionLetters, million} from '../shorts/million-letters/Film';
import {SignalBox, signal} from '../shorts/signal-box/Film';

declare const __BUILT_AT__: string;

// the soundtracks sit next to the page, in audio/
(window as unknown as {remotion_staticBase: string}).remotion_staticBase = '.';

const CHAPTERS = chapterList(film, contract, million, signal);
const COMPS: Record<string, React.FC> = {TrackLayerFlat, JevContract, MillionLetters, SignalBox};

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
// m:ss.ff at 24 fps
const tc = (frame: number) => {
	const s = Math.floor(frame / 24);
	return `${Math.floor(s / 60)}:${pad(s % 60)}.${pad(frame % 24)}`;
};
const sceneAt = (ch: ChapterInfo, frame: number) => ch.scenes.find((s) => frame >= s.start && frame < s.end) ?? ch.scenes[ch.scenes.length - 1];
const fromHash = () => {
	const id = location.hash.replace('#', '');
	return CHAPTERS.some((c) => c.id === id) ? id : 'ch1';
};

const App: React.FC = () => {
	const [chId, setChId] = useState(fromHash);
	const ch = CHAPTERS.find((c) => c.id === chId)!;
	const player = useRef<PlayerRef>(null);
	const [frame, setFrame] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [rate, setRate] = useState(1);
	const [loopId, setLoopId] = useState<string | null>(null);
	const [copied, setCopied] = useState('');

	useEffect(() => {
		const p = player.current;
		if (!p) return;
		const onFrame = (e: {detail: {frame: number}}) => setFrame(e.detail.frame);
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		p.addEventListener('frameupdate', onFrame);
		p.addEventListener('seeked', onFrame);
		p.addEventListener('play', onPlay);
		p.addEventListener('pause', onPause);
		return () => {
			p.removeEventListener('frameupdate', onFrame);
			p.removeEventListener('seeked', onFrame);
			p.removeEventListener('play', onPlay);
			p.removeEventListener('pause', onPause);
		};
	}, [chId]);

	const pick = (id: string) => {
		player.current?.pause();
		setChId(id);
		setFrame(0);
		setLoopId(null);
		history.replaceState(null, '', `#${id}`);
	};
	const seek = useCallback((f: number) => player.current?.seekTo(Math.max(0, Math.min(ch.total - 1, Math.round(f)))), [ch.total]);
	const scene = sceneAt(ch, frame);
	const loop = loopId ? ch.scenes.find((s) => s.id === loopId) : undefined;
	const stepScene = useCallback(
		(d: number) => {
			const i = ch.scenes.indexOf(sceneAt(ch, player.current?.getCurrentFrame() ?? 0));
			seek(ch.scenes[Math.max(0, Math.min(ch.scenes.length - 1, i + d))].start);
		},
		[ch, seek],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
			const f = player.current?.getCurrentFrame() ?? 0;
			if (e.key === ' ' || e.key === 'k') {
				e.preventDefault();
				player.current?.toggle();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				seek(f - (e.shiftKey ? 24 : 1));
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				seek(f + (e.shiftKey ? 24 : 1));
			} else if (e.key === '[') stepScene(-1);
			else if (e.key === ']') stepScene(1);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [seek, stepScene]);

	const moment = `Ch ${ch.n} · ${scene.name} · ${tc(frame)} · frame ${frame}`;
	const copy = () => {
		const done = () => {
			setCopied(moment);
			setTimeout(() => setCopied(''), 1800);
		};
		navigator.clipboard?.writeText(moment).then(done, () => {
			const el = document.getElementById('moment');
			if (el) window.getSelection()?.selectAllChildren(el);
		});
	};
	const Comp = COMPS[ch.comp];
	const inputProps = useMemo(() => ({}), []);

	return (
		<div className="app">
			<header className="top">
				<div className="brand">
					<span className="brand-mark" aria-hidden="true" />
					<span>Screening Room</span>
				</div>
				<nav className="tabs" aria-label="Chapters">
					{CHAPTERS.map((c) => (
						<button key={c.id} id={`tab-${c.id}`} className={c.id === chId ? 'tab on' : 'tab'} onClick={() => pick(c.id)}>
							<span className="tab-n">{c.n}</span>
							{c.title}
							<span className="tab-len">{tc(c.total).split('.')[0]}</span>
						</button>
					))}
				</nav>
			</header>
			<div className="stage">
				<Player
					key={chId}
					ref={player}
					component={Comp}
					inputProps={inputProps}
					durationInFrames={ch.total}
					compositionWidth={1920}
					compositionHeight={1080}
					fps={24}
					playbackRate={rate}
					clickToPlay
					doubleClickToFullscreen
					allowFullscreen
					loop={!!loop}
					inFrame={loop ? loop.start : undefined}
					outFrame={loop ? loop.end - 1 : undefined}
					acknowledgeRemotionLicense
					style={{width: '100%', aspectRatio: '16 / 9', display: 'block'}}
				/>
			</div>
			<section className="strip" aria-label="Scenes">
				<div className="lanes">
					{ch.scenes.map((s, i) => (
						<button key={s.id} id={`scene-${ch.id}-${s.id}`} className={`lane${s.id === scene.id ? ' on' : ''}${i % 2 ? ' alt' : ''}`} style={{flexGrow: s.end - s.start}} title={`${s.name} · ${tc(s.start)}`} onClick={() => seek(s.start)}>
							<span>{s.name}</span>
						</button>
					))}
					<div className="head" style={{left: `${(100 * frame) / ch.total}%`}} aria-hidden="true" />
				</div>
				<input id="scrub" className="scrub" type="range" min={0} max={ch.total - 1} value={frame} onChange={(e) => seek(Number(e.target.value))} aria-label="Position" />
			</section>
			<section className="bar">
				<div className="transport">
					<button id="prev-scene" className="btn" onClick={() => stepScene(-1)} aria-label="Previous scene">⏮</button>
					<button id="back-frame" className="btn" onClick={() => seek(frame - 1)} aria-label="Back one frame">−1f</button>
					<button id="play" className="btn play" onClick={() => player.current?.toggle()}>{playing ? 'Pause' : 'Play'}</button>
					<button id="fwd-frame" className="btn" onClick={() => seek(frame + 1)} aria-label="Forward one frame">+1f</button>
					<button id="next-scene" className="btn" onClick={() => stepScene(1)} aria-label="Next scene">⏭</button>
				</div>
				<div className="readout">
					<span className="tc">{tc(frame)}</span>
					<span className="sc">{scene.name}</span>
					<span className="fr">frame {frame}</span>
				</div>
				<div className="opts">
					<label className="opt" htmlFor="rate">
						Speed
						<select id="rate" value={rate} onChange={(e) => setRate(Number(e.target.value))}>
							{[0.25, 0.5, 1, 1.5, 2].map((r) => (
								<option key={r} value={r}>{r}×</option>
							))}
						</select>
					</label>
					<button id="loop" className={loop ? 'btn chip on' : 'btn chip'} onClick={() => setLoopId(loop ? null : scene.id)}>
						{loop ? `Looping ${loop.name}` : 'Loop scene'}
					</button>
				</div>
			</section>
			<section className="note">
				<div>
					<div className="note-label">This moment</div>
					<div id="moment" className="moment">{moment}</div>
				</div>
				<button id="copy" className="btn chip" onClick={copy}>{copied ? 'Copied' : 'Copy for feedback'}</button>
			</section>
			<footer className="foot">
				<span>Space play · ← → one frame · Shift ← → one second · [ ] scene · double-click fullscreen</span>
				<span>Built {__BUILT_AT__}</span>
			</footer>
		</div>
	);
};

createRoot(document.getElementById('root')!).render(<App />);
