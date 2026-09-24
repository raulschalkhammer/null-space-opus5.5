# The Model That Doesn't Talk

An anthology of playful 2D animated shorts about Jev, TypeSafe AI's "System One" model, built in code with [Remotion](https://www.remotion.dev). The research and production plan is in [`docs/jev-video-research.md`](docs/jev-video-research.md).

## Short no. 1: Track Layer (flat-vector cut, narrated): current

About 2:54. Opens cold on a planet of people asking chatbots questions, ChatGPT and Claude answering one word (one bet) at a time, and the news that TypeSafe released Jev; then two expressive steam engines, inspired by ChatGPT and Claude, meet at the station, and we ride with one as it lays its answer as track where probability is width, derails, and a fairness beat notes that real models usually catch this email while the mechanism is real. Jev's lighthouse answers with pennants as wide as its odds.

```
python data-scripts/make-vo.py kokoro-v1.0.onnx voices-v1.0.bin story/track-layer-flat-vo.json public/audio/vo-flat fixtures/track-layer-flat-vo.json
node --experimental-strip-types data-scripts/make-audio-paper.ts --film=flat2
npx remotion render src/index.ts TrackLayerFlat renders/01-track-layer-flat-v5.mp4
```

Narration: `story/track-layer-flat-vo.json`. Cold open: `src/shorts/flat-track/Intro.tsx`; timeline: `src/shorts/flat-track/timeline.ts`.

Code: `src/shorts/flat-track/` and `src/flat/kit.tsx` (reuses the geometry and timeline from `src/shorts/paper-track/`).

## Short no. 1: Track Layer (paper cut, narrated)

The current version. A narrated paper-diorama short (about 108 s) where probability is literally the width of the track: forks split it, a brass marble picks a branch with chance equal to its width, the track under Gab thins as the chain rule multiplies, and Jev's lighthouse answers with signal pennants as wide as its probabilities.

```
python data-scripts/make-vo.py kokoro-v1.0.onnx voices-v1.0.bin   # narration (Kokoro-82M via kokoro-onnx)
node --experimental-strip-types data-scripts/make-audio-paper.ts  # mix narration + SFX + score
npx remotion render src/index.ts TrackLayerPaper renders/01-track-layer-paper.mp4
```

Code: `src/shorts/paper-track/` (timeline, tabletop forks, side-view diorama, cards) and `src/paper/kit.tsx` (palette, cut-paper filters, props). Narration script: `story/track-layer-vo.json`.

## Short no. 1: Track Layer (first cartoon cut)

Gab, a chatty typewriter-train, builds its answer one word at a time by spinning a wheel of next-word odds and laying each word as a piece of track. One unlucky spin later it talks itself into a swamp. Jev read the email once and has been holding its typed answer the whole time. A chalkboard card then names the math: $p(y\mid x)=\prod_t p(y_t\mid y_{<t},x)$.

```
npm install
npm run studio               # scrub the film in Remotion Studio
npm run render:track-layer   # synthesize audio + render renders/01-track-layer.mp4
```

In a container with a preinstalled Chromium, point Remotion at it: `REMOTION_BROWSER=/path/to/headless_shell`.

### Where things live

| Path | What |
|---|---|
| `fixtures/track-layer.json` | All numbers shown on screen (wheel odds, Jev's answer). Currently **illustrative placeholders**; the film shows a DRAFT stamp until `status` is `measured`. |
| `src/shorts/track-layer/timeline.ts` | Single source of truth for timing, train physics, camera and sound cues. |
| `src/shorts/track-layer/World.tsx` | Landscape, track, wheel, swamp, Jev's hill. |
| `src/characters/` | Gab and Jev cutout rigs (plain SVG + React). |
| `src/fx/` | Rough.js helpers, line boil, grain, chalk filters. |
| `data-scripts/make-audio.ts` | Synthesizes every sound effect and the leitmotifs from the timeline (no samples). |
| `data-scripts/llm-next-token.mjs` | Replaces the wheel odds with real next-token probabilities from a small local model (needs Hugging Face access; not yet run). |
| `data-scripts/stills.mjs` | Renders review stills: `node data-scripts/stills.mjs 120 300 900`. |

### Making the numbers real

1. `npm i -D @huggingface/transformers && node data-scripts/llm-next-token.mjs` fills in measured wheel odds.
2. Call Jev with the email as `state` and a Noul question ("Is this email a scam?"), then put the returned probability in `fixtures/track-layer.json` under `jev.p` with `"status": "measured"`.
3. Re-render. Timing, wheel slices, track bends and the soundtrack all follow the fixture automatically.
