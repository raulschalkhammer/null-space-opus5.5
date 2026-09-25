# Handover: The Model That Doesn't Talk

Status as of 2026-09-25, branch `claude/hopeful-johnson-aiwzpx`. Read `CLAUDE.md` first for the rules and the working loop.

## Where the project is

| Chapter | Composition | Length | State |
|---|---|---|---|
| 1. Track Layer (how LLMs write word by word, as trains) | `TrackLayerFlat` | 4:21 | v7 approved direction. Cached (13 scenes). |
| 2. Jev's Contract (fixed questions, one pass, calibration) | `JevContract` | 2:33 | v2. Cached (8 scenes). |
| 3. A Million Letters (the cost rule p < 1 − review ÷ mistake) | `MillionLetters` | 2:30 | Latest. Cached (11 scenes). Last feedback done: no hands, a real letter, a p gauge, tags on the rope. |
| 4. The Signal Box, and the ending | `SignalBox` | 3:55 | Built from `docs/chapter4-plan.md`. Cached (11 scenes). The last chapter: a cascade (Jev routes, the train writes), then callbacks to chapters 1 to 3 and closing credits. |

- **Screening Room (live preview, all chapters with sound):** https://claude.ai/artifact/RKU1BjQ7BxhakvXAjCkkWd
- **Plans:**
  - `docs/chapter3-plan.md` and `docs/chapter4-plan.md` have the shot lists as built.
  - `docs/chapter1-plan.md` and `docs/chapter2-plan.md` are a rejected fast-cut rework, kept as a record.
  - `docs/jev-video-research.md` has the research notes.

### Open ideas and next steps
- **The final cut** (since 2026-09-26) is what the Screening Room plays and `render-cache` renders by default:
  - `src/final.ts` has the edit lists: no title or end cards, and no "Last time…" or "That's next time.". Chapter 1 opens on the planet, and chapter 4 ends on the title.
  - `src/shorts/final/Film.tsx` has `Final1` to `Final4` and `FinalFilm` (all four joined).
  - `data-scripts/make-final-audio.ts` cuts the soundtracks into `chN-final.wav` and measures the chapter 1 cut in `fixtures/final-cuts.json`. Run it after every re-mix.
  - `render-cache.ts chN --full` still renders a whole chapter.
- The narration voice is Resemble AI "Ethan" (`bee581c1`).
- **All four chapters are built.** The video runs about 13:20. Chapter 4 ends it with callbacks and closing credits.
- **Next:**
  - the user's review of chapter 4
  - then any polish, and joining the chapters into one film
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
  - `make-vo-resemble.py`: the narration, with the Resemble AI voice `bee581c1` (the key comes from `RESEMBLE_API_KEY` in the environment, never a file)
  - `make-vo.py`: the old Kokoro narration, no longer used
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

- **New narration:** the voice is Resemble AI voice `bee581c1` (since 2026-09-26; Kokoro before that).
  1. Edit `story/<chapter>-vo.json`.
  2. With `RESEMBLE_API_KEY` set in the environment, run `.venv/bin/python data-scripts/make-vo-resemble.py bee581c1 story/<file> public/audio/<dir> fixtures/<file>`. Add `--only=ID,ID` to redo single lines.
  3. Re-run the mix, then re-render: the timelines follow the new durations.
  - The folders: chapter 1 `vo-flat`, chapter 2 `vo-contract`, chapter 3 `vo-million`, chapter 4 `vo-signal`.
- **Renders:** `node --experimental-strip-types data-scripts/render-cache.ts ch1|ch2|ch3|ch4` writes `renders/<ch>-<Comp>-cached.mp4` plus a `-share.mp4`. The first run of each chapter renders every scene.
- **Preview:** run `node data-scripts/build-preview.mjs`, then republish `preview/index.html` to the Screening Room URL above.

## Running on your own computer (uses your subscription, not a cloud container)

Needs Node 22+, Python 3.10+ and git.

1. Clone the repo, then `git checkout claude/hopeful-johnson-aiwzpx`.
2. Run the setup from "Setting up a fresh container" above.

The scripts find Remotion's ffmpeg for your platform and its browser through `data-scripts/local.mjs`.
- On a laptop, Remotion downloads its own headless Chrome the first time. The container-only browser path is used only when it exists.
- Tested in the Linux container and on an Intel Mac (macOS, Node 25).
  - On macOS the bundled ffmpeg needs `DYLD_LIBRARY_PATH`, which `local.mjs` and `pacing.py` set.
  - A full chapter 1 render takes about 12 minutes there.
  - Don't run two renders at once: a second browser once stalled the first.
- Scripts use `node`/`python` paths as written, so on Windows use WSL or adjust `.venv/bin/python` to `.venv\Scripts\python`.
- The Screening Room's source is `src/preview/` (`main.tsx`, `page.html`). To check it locally, `.claude/launch.json` serves `preview/` on port 8765.

Then start Claude Code in the repo folder, signed in with your subscription:
- **Terminal:** `claude`
- **Desktop app:** open the folder.
- **From your phone:** run `claude remote-control` in the folder, and the session shows up in the Claude app.

CLAUDE.md loads automatically.

## Git and GitHub

The branch is on GitHub: `claude/hopeful-johnson-aiwzpx` (the Claude GitHub App is installed). A git bundle (`null-space.bundle`) was also handed over as a backup. To restore from it:

```
git bundle verify /path/to/null-space.bundle
git fetch /path/to/null-space.bundle claude/hopeful-johnson-aiwzpx
git checkout -B claude/hopeful-johnson-aiwzpx FETCH_HEAD
```

Commit and push to `claude/hopeful-johnson-aiwzpx` after each round of work.
