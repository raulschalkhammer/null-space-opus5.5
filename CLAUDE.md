# The Model That Doesn't Talk: working rules

An educational video (10 to 15 minutes, in chapters) about Jev, TypeSafe AI's "System One" model:
- how it works and the math behind it
- how it differs from LLMs
- a practical application

It's built in Remotion (React, 24 fps, 1920×1080) in a flat-vector style, with Kokoro narration. Read `docs/HANDOVER.md` first for the current state, the setup and the next steps.

## The user's standing rules (hard constraints)

- **No em-dashes** in anything you write: chat replies, narration, code comments, docs, commit messages.
- **On-screen text is single high-impact words or numbers**, never sentences. The only exceptions are the example inputs the AI reads (a letter, an email, a chat reply), which keep their full text.
- **No subtitles.**
- **No hands or fingers.** They can't be drawn convincingly in this style. Show reading or handling through objects instead: an envelope that opens by itself, words that light up as they're read, a reviewer character at a desk.
- **Every character is original.** The recurring cast:
  - the two steam trains (`src/characters/steam.tsx`)
  - Jev as the lighthouse, and as the lamp head in the mailroom
  - the reviewer and the customer (`src/shorts/million-letters/parts.tsx`)
  - Never draw or imitate characters from Kurzgesagt or anyone else.
- **Anything that stands for something must be recognisable.** A letter has an address, a stamp and a postmark (`LetterBig`); p is a gauge. If a viewer couldn't name the object, redesign it.
- **Story like Veritasium, looks like Kurzgesagt:**
  - **Story:** a puzzle, then the viewer guesses (a countdown with "GUESS"), then the experiment, then the math.
  - **Let shots breathe.** Ambient motion (parallax, drifting particles, blinking lights) is good, but there's no quota of new pictures per line.
  - **A palette per world**, and world scenes take turns with short concept stages (one idea on a glowing tile).
  - **Also:** split panels for comparisons and zooms between scales. Use a hard cut only for a real reveal.
  - **No pacing target.** The old aim (a new look every 2.7 s, measured with `data-scripts/pacing.py`) was dropped on 2026-09-25. A rework of chapters 1 and 2 built to it was rejected and reverted, for three reasons:
    - Constant hard cuts between shots are annoying.
    - Tight close-ups hide what the picture is about.
    - Zooming and panning left half the screen empty.
  - **Keep the whole picture readable.** The viewer should always see enough of the scene to understand it: no extreme close-ups that lose the object, and no camera move that shows empty space past the edge of the drawing.
- **Math typography:** use `Equation` in `src/flat/math.tsx`. That's KaTeX with colour-coded terms, built one at a time, with a curly brace and a one-word label under each term. No boxes. Put the equation inside the world where you can (over the brass scale, for example).
- **Numbers:**
  - Jev's published claims are up to 193.6× faster and 444.6× cheaper. Always say "TypeSafe's own tests".
  - Every other number is illustrative until a measured Jev run exists, and the chapters show a "DRAFT · ILLUSTRATIVE NUMBERS" badge.
  - Don't invent facts. When you can't verify something, say so.

## How to work (the loop)

1. **Edit, then typecheck:** `npx tsc --noEmit`.
2. **Look before you render.** Render stills, not video:
   ```
   node data-scripts/frames.mjs MillionLetters /tmp/x --every=36 --scale=0.25
   python data-scripts/contact-sheet.py /tmp/x /tmp/sheet
   ```
   Read the sheets and fix overlaps, text sitting on busy backgrounds, and anything unreadable. Re-check the fixed shots with specific frames (`node data-scripts/frames.mjs MillionLetters /tmp/y 1635 2220`).
3. **Render with the scene cache.** `node --experimental-strip-types data-scripts/render-cache.ts ch3` re-renders only the scenes whose pictures changed. The flags are `--check`, `--force=scene,scene`, `--all` and `--adopt`.
4. **Update the Screening Room.** Run `node data-scripts/build-preview.mjs`, then republish `preview/index.html` to the existing artifact with the Artifact tool:
   - include the audio files when they're new: `files: {"audio/<track>.mp3": "preview/audio/<track>.mp3"}`
   - from a new conversation, `read` the artifact first, then publish with `url` so the link stays the same
5. **Send the share copy** with SendUserFile: `renders/<chapter>-cached-share.mp4`.
6. **Commit** with clear messages and push to `claude/hopeful-johnson-aiwzpx`.

- **Keep the user posted:** a short status line while long jobs run.
- **Be exact about what you checked.** Say whether you looked at stills or watched motion; you can't hear audio.
- **Ask before larger creative changes.** Small fixes you just make.

## Environment gotchas (cloud container; on a laptop see docs/HANDOVER.md)

- **Chromium:** set `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` for `npx remotion render`, otherwise Remotion tries to download Chrome and gets a 403. The repo scripts already default to this path.
- **ffmpeg:** use Remotion's copy, `node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg` (and ffprobe), with `LD_LIBRARY_PATH` set to that folder. It's a minimal build:
  - no `select`, `fps` or `hstack` filters, and no `null` or `rawvideo` outputs
  - use `-r` and `-s` output options instead
  - it does have libx264, aac, libmp3lame and the concat demuxer
- **Blocked by the network:** YouTube, typesafe.ai and many news sites. WebSearch works. For video references, ask the user to upload the file.
- **Don't let Prettier reformat whole files.** A formatter pass once produced a 1,300-line diff in `steam.tsx`.
