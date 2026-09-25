# Chapter 3: A Million Letters (plan)

Chapter 2 showed one letter being read in one pass. Chapter 3 zooms out to a bank that gets a million letters a day, and asks a single question: how many of them should a human read?

- Storytelling follows Veritasium: a puzzle, you guess, two naive answers, then the math that settles it.
- The look follows the reference analysis below: a new picture for every line, and no still frames.

Target length is about 3:30. That is roughly 30 narration lines and about 70 distinct shots.

## What the reference does (first 5 minutes, measured)

| | Kurzgesagt, "A.I. Humanity's Final Invention?" | Our Ch 1 | Our Ch 2 |
|---|---|---|---|
| New look every | 2.7 s on average (median 2 s) | 18.7 s | 30.7 s |
| Longest hold | 18.5 s | 50.7 s | 47.2 s |
| Nearly still | 7% of the time | 63% | 82% |
| Hard cuts | 25 in 5:22 | 0 | 0 |

How it makes that variety (the techniques, not its characters or art):

1. **Two kinds of stage, taking turns.**
   - Rich environment scenes: a launch pad, a jungle, a city, a lab.
   - Dark "concept" stages: one object on a small glowing plinth in a void.
   - The rhythm is world, idea, world.
2. **Split panels.** Two or three vertical panels slide in to compare things side by side, and each panel moves on its own.
3. **Scale jumps.** Ground, then orbit, then a retro computer window with the whole planet inside it. A zoom carries the story, not a cut.
4. **Timelines and graphs are placed in the world.** A glowing line with years on it, or a curve drawn over a server hall, instead of a chart on a blank page.
5. **Extreme close-ups.** Hands knapping a stone or typing on a keyboard. One small human moment between the big pictures.
6. **One recurring character.** A small glowing AI blob returns across eras and holds the story together.
7. **Almost no text.** Labels are single words or years, and the few chat bubbles are the only sentences.
8. **Colour tells you the era.** Warm oranges for the prehistoric scenes, electric blues and purples once computers appear.

Rules we take into Chapter 3:

- **At least one new picture per narration line**, so about every 3 seconds.
- **Nothing is fully still.**
  - Every scene has ambient motion: parallax, drifting letters, window lights, the lighthouse beam.
  - Every scene has at least three depth layers.
- **Alternate world scenes with concept stages.**
- **Split panels whenever two things are compared.**
- **Match cuts between scales:** a letter becomes a window light, which becomes a dot on the planet.
- **Recurring characters carry the story:**
  - Jev, the lighthouse
  - the letter
  - the train, only as a cameo
  - a new human reviewer at a desk
- **Single words on screen.** Only the letters themselves carry sentences.

## Shot plan

Line ids are C3xx. Numbers marked (illustrative) are placeholders until a measured Jev run.

### 1. Zoom out (about 25 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C301 | "One letter. Read once, in a tenth of a second." | 1. Close on the letter from Ch 2 under the lamp. 2. Match cut: the letter shrinks into a lit window. |
| C302 | "But a bank doesn't get one letter." | 3. Pull back: a whole mailroom floor, then the bank building at night, and every window blinks as a letter is read. |
| C303 | "It gets thousands an hour. A million a day." | 4. Pull back further to an isometric city at night. Each blink is a decision. 5. Counter: "1,000,000". |
| C304 | "Every one of them needs a decision." | 6. Orbit shot: the planet at night with streams of light between cities. |

### 2. The puzzle (about 20 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C305 | "So here's the question. Of a million letters, how many should a person read?" | 7. Concept stage: one letter on a plinth, and a small person on a plinth beside it. 8. A dial from 0 to 1,000,000. |
| C306 | (pause for the guess, 3-2-1) | 9. Countdown ring over the dial, "GUESS". |

### 3. Two naive answers, in split panels (about 45 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C307 | "The safe answer: all of them." | 10. Left panel slides in: a queue of reviewers at desks, stretching away. |
| C308 | "At a few minutes each, that's thousands of people, reading all day, every day." | 11. The queue wraps around the city block, then the whole city. 12. A cost pile of coins grows beside it. Label: "all". |
| C309 | "The fast answer: none of them. Let the machine decide everything." | 13. Right panel slides in: the lighthouse sweeps letters into slots at full speed. Label: "none". |
| C310 | "Remember the promise from last time? At ninety-one percent, nine in a hundred are wrong." | 14. The 10×10 grid from Ch 2, with 9 cells turning red. |
| C311 | "Nine in a hundred, of a million, is ninety thousand mistakes. Every day." | 15. The grid tiles outward into a huge field of cells, with red ones scattered through it. 16. Red letters tumble out of a chute into a pile. "90,000". |

### 4. Every mistake has a price (about 30 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C312 | "Neither answer is right, because neither one counts the cost." | 17. The two panels slam together into one. Concept stage: a balance scale on a plinth. |
| C313 | "A person reading a letter costs something. Say two euros." | 18. The reviewer at the desk; extreme close-up of hands opening a letter. 19. A coin labelled "€2" drops onto the left pan. |
| C314 | "A mistake costs more. A fraud report filed under billing. A frozen card. An angry customer. Say twenty euros." | 20. Three quick vignettes, about 1.5 s each: a letter in the wrong slot, a card with a padlock, a steaming speech bubble. 21. "€20" drops onto the right pan. |

### 5. The math (about 45 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C315 | "Now take one letter, where Jev is p sure." | 22. Concept stage: the lighthouse with a gauge reading p. |
| C316 | "If we let Jev decide, the chance it's wrong is one minus p, and a mistake costs twenty." | 23. The equation builds term by term (KaTeX, colour-coded, with braces): `(1 − p)` "wrong" × `€20` "mistake". |
| C317 | "If we ask a person, it costs two. Every time." | 24. The right side appears: `€2` "review". The balance scale sits under the equation and tips as p changes. |
| C318 | "Ask a person only when a mistake would cost more than the review." | 25. `(1 − p) · 20 > 2`, then it simplifies: `p < 0.9`. |
| C319 | "Ninety percent. That line isn't a feeling. It falls out of two prices." | 26. The dashed line from the Ch 2 tubes rises to 0.9 and locks with a clank. "0.9". |

### 6. The line moves (about 25 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C320 | "Change the prices, and the line moves." | 27. A slider for mistake cost, on a concept stage. |
| C321 | "Sorting newsletters? A mistake costs almost nothing, so let the machine take nearly all of it." | 28. Slider low, the line drops to about 0.5. Split panel: an inbox of newsletters. |
| C322 | "Freezing someone's card? Now almost nothing gets through without a person." | 29. Slider high, the line climbs to 0.99. Split panel: a card and a worried customer. |

### 7. The answer (about 30 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C323 | "Back to our million letters. Here's how sure Jev is about each one." | 30. The grains from the Ch 2 tubes pour into one long dune: a histogram of confidence from 0 to 1, drawn to scale (illustrative). |
| C324 | "Everything above the line, Jev handles. Everything below goes to a person." | 31. The 0.9 line cuts the dune. Grains above it fly to slots, grains below fly to desks. |
| C325 | "About a hundred and seventy thousand letters. Not a million. Not zero." | 32. Counter "170,000" (illustrative). The reviewer queue from panel 10 shrinks to a few rows of desks. |

### 8. Why the promise matters (about 25 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C326 | "All of this only works if ninety percent really means ninety percent." | 33. The 10×10 grid again, with 90 lit. |
| C327 | "If Jev says ninety but is right only eighty times in a hundred, the math sends the wrong letters to the wrong place." | 34. The lighthouse beam flickers and 10 more cells go red. 35. Grains that crossed the line tumble back. "calibration". |

### 9. Close (about 20 s)

| Line | Narration (draft) | Shots |
|---|---|---|
| C328 | "So the machine reads the million." | 36. Reverse of the opening: orbit, then city, then the bank, then the mailroom (fast match cuts). |
| C329 | "And people read the letters where they matter." | 37. Close-up: the reviewer at the desk opens the hard letter from Ch 2 ("charged twice…"). |
| C330 | (end card) | 38. "A Million Letters", then a teaser for the next chapter. |

That is about 38 planned beats. With the ambient layers and the split-panel sub-shots it should measure close to one new look every 3 s.

## New visual pieces to build

1. **City at night (isometric).** Blinking windows driven by a seeded rng, plus a parallax sky. Reused for the zoom out and the close.
2. **Planet at night.** City lights and arcs between cities.
3. **Concept plinth.** A small glowing tile in a dark void, reused for the puzzle, the scale and the slider.
4. **Split-panel frame.** 2 or 3 panels that slide in, each with its own camera.
5. **Reviewer character.** An original human at a desk, with a hands close-up variant.
6. **Balance scale.** Two pans, coins, and tilt driven by p.
7. **Confidence dune.** A histogram made of grains, drawn to scale, with a movable line.
8. **Reused pieces.** Jev's lighthouse, the letter, the 10×10 grid and the Ch 2 tubes.

## Checks before building

- The prices (€2 and €20), the million a day and the 170,000 are illustrative. The rule "ask a person when p < 1 − review ÷ mistake" is exact.
- Each scene is reviewed in the Screening Room preview first. The final cut uses the scene-cached render.
