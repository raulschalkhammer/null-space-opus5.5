# Handover: The Model That Doesn't Talk

Status as of 2026-09-25, branch `claude/hopeful-johnson-aiwzpx`. Read `CLAUDE.md` first for the rules and the working loop.

## Where the project is

| Chapter | Composition | Length | State |
|---|---|---|---|
| 1. Track Layer (how LLMs write word by word, as trains) | `TrackLayerFlat` | 4:21 | v7 approved direction. Not yet in the scene cache. |
| 2. Jev's Contract (fixed questions, one pass, calibration) | `JevContract` | 2:33 | v2. Cached (8 scenes). |
| 3. A Million Letters (the cost rule p < 1 − review ÷ mistake) | `MillionLetters` | 2:30 | Latest. Cached (11 scenes). Last feedback done: no hands, a real letter, a p gauge, tags on the rope. |
| 4. The Signal Box | not started | | The chapter 3 end card teases it: Jev as the signalman deciding which messages need an LLM "train". |

- **Screening Room (live preview, all chapters with sound):** https://claude.ai/artifact/RKU1BjQ7BxhakvXAjCkkWd
- **Plans:** `docs/chapter3-plan.md` has chapter 3's shot list with palettes and cut types, plus the Kurzgesagt pacing analysis. `docs/jev-video-research.md` has the research notes.

### Open ideas and next steps
- **Chapter 4, The Signal Box:**
  - plan it the same way (puzzle, guess, experiment, math), with world and concept alternating
  - write a shot list and get the user's sign-off before building
- **Chapter 1** has not been rendered through the cache yet. Its first cached run takes as long as a full render (about 12 min).
- **Chapter 3's longest hold** is the balance-scale math shot (about 20 s). Extra cuts there would tighten the pacing (currently a new look every 4.3 s, 40% still).
- **Numbers are placeholders** until there's a measured Jev run. Some facts could only be checked through secondary sources, because typesafe.ai is blocked from the container.

## File map

- `src/Root.tsx` registers every composition. `src/fonts.ts` holds the webfont and KaTeX CSS imports.
- `src/chapters.ts` lists the chapters and their scene frame ranges. The preview's scene strip and the render cache both use it; add new chapters here.
- **Shared visuals:**
  - `src/flat/kit.tsx`: palette `K`, gradients, `FlatLighthouse`
  - `src/flat/world.tsx`: mountains, clouds, city
  - `src/flat/harbor.tsx`: `Harbor`, `Letter`
  - `src/flat/math.tsx`: `Equation`
  - `src/flat/type.tsx`: `Callout`, `Projected`
  - `src/flat/audio.ts`: `track()`
- **Characters:** `src/characters/steam.tsx` (the expressive steam trains, with moods and a speech tape) and `src/characters/trains.tsx` (liveries).
- **Chapter 1:** `src/shorts/flat-track/` (film, station, table, curiosity scenes, news, intro), built on the timeline in `src/shorts/paper-track/timeline.ts`.
- **Chapter 2:** `src/shorts/jev-contract/` (`timeline.ts`, `Film.tsx`).
- **Chapter 3:** `src/shorts/million-letters/`:
  - `timeline.ts`: cues, sfx, music, the `MILLION` numbers
  - `parts.tsx`: palettes A (amber) and T (teal), plus `Stage`, `Mailroom`, `Reviewer`, `Customer`, `Balance`, `RopeLine`, `Gauge`, `LetterBig`, `EnvelopeOpen`, `Panel`, `Grid10`
  - `Zoom.tsx`: desk, bank, city and planet
  - `Film.tsx`: the scenes
- **Narration:** the scripts are in `story/*-vo.json`. The per-line WAVs are in `public/audio/vo-flat/`, `vo-contract/` and `vo-million/` (tracked in git). Their durations are in `fixtures/*-vo.json`, and the timelines are driven by those durations.
- **Tools in `data-scripts/`:**
  - `make-vo.py`: Kokoro TTS
  - `make-audio-paper.ts`: the mix, run with `--film=flat2`, `--film=contract` or `--film=million`
  - `render-cache.ts`: per-scene cached renders, with `png.ts`
  - `build-preview.mjs`: the Screening Room
  - `frames.mjs` and `contact-sheet.py`: review stills
  - `pacing.py`: shot-rhythm measurement
  - `stills.mjs`: older still renderer
- **Git-ignored and regenerated:** `renders/`, `preview/`, `public/audio/*.wav` (the mixed tracks).

## Setting up a fresh container

```
npm ci
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx==0.6.1 soundfile pillow numpy
# Kokoro model files (only needed for new narration):
mkdir -p models
curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
# the mixed soundtracks (git-ignored):
for f in flat2 contract million; do node --experimental-strip-types data-scripts/make-audio-paper.ts --film=$f; done
npx tsc --noEmit
```

- **New narration:** the voice is af_heart at speed 0.94.
  1. Edit `story/<chapter>-vo.json`.
  2. Run `.venv/bin/python data-scripts/make-vo.py models/kokoro-v1.0.onnx models/voices-v1.0.bin story/<file> public/audio/<dir> fixtures/<file>`.
  3. Re-run the mix.
- **Renders:** `node --experimental-strip-types data-scripts/render-cache.ts ch1|ch2|ch3` writes `renders/<ch>-<Comp>-cached.mp4` plus a `-share.mp4`. The first run of each chapter renders every scene.
- **Preview:** run `node data-scripts/build-preview.mjs`, then republish `preview/index.html` to the Screening Room URL above.

## Git and GitHub

Pushing from the original session always failed with 403, because the Claude GitHub App isn't installed on `raulschalkhammer/null-space-opus5.5`. Its commits were handed over as a git bundle (`null-space.bundle`). If the user uploads it, restore it with:

```
git bundle verify /path/to/null-space.bundle
git fetch /path/to/null-space.bundle claude/hopeful-johnson-aiwzpx
git checkout -B claude/hopeful-johnson-aiwzpx FETCH_HEAD
```

If the GitHub App has been installed since, push the branch right away so the work lives on GitHub: `git push -u origin claude/hopeful-johnson-aiwzpx`.
