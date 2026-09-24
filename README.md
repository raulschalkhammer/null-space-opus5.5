# The Model That Doesn't Talk

An anthology of playful 2D animated shorts about Jev, TypeSafe AI's "System One" model, built in code with [Remotion](https://www.remotion.dev). The research and production plan is in [`docs/jev-video-research.md`](docs/jev-video-research.md).

## Short no. 1: Track Layer

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
