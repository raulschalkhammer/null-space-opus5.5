# Chapter 4: The Signal Box, and the ending (plan)

Status: **built** (signed off 2026-09-25). The narration is recorded, and the chapter is rendered. "As built" at the end lists where the build differs from the plan.

Chapter 3 ended with the promise: the machine reads the million, and people read the letters where it matters. Its end card teases this chapter, with Jev as the signalman who decides which letters need a train.

**The idea:** a fast model that routes, plus a slow model that writes. Most letters get Jev's instant answer, and only the unsure ones ride the train. The surprise is in the arithmetic. However cheap Jev is, the system's cost is set by how many letters still take the train.

Chapter 4 is the **last chapter**. After the signal box, a closing section of about 45 s ties the whole video together and ends it.

Length: about 3:25 with 34 narration lines (S01 to S34). The whole video then runs about 12:50.

## Story (Veritasium shape)

1. **Setup.** Letters need answers written back. Jev can't write, and the trains can, slowly and expensively.
2. **The world.** A signal box at the junction. Every letter stops there first, and Jev sets the points: a short line for sure letters, a long line to the train for unsure ones.
3. **Puzzle and guess.** Jev is up to 444.6× cheaper than a chatbot (TypeSafe's own tests). If Jev sends one letter in five on to the train, how much cheaper is the whole system than the train alone? Countdown, **GUESS**.
4. **Reveal (hard cut).** About 5×, not 444×.
5. **Experiment.** 1,000 letters through the box, with a coin counter on each line. Nearly all the coins end up on the long line.
6. **Math, in the world.** It builds on the signal box's track diagram board.
7. **The lever.** Keep more letters off the train and the saving grows. But only letters Jev is truly sure about may stay off, which ties back to calibration.
8. **Partners.** System One decides, System Two writes.
9. **The catch, briefly.** A number that is honest on one kind of letter can drift on another, so check it on your own letters. This is folded in here, not saved for another chapter.
10. **Conclusion.** Back to the cold open's question (the same question asked twice, two answers). What each chapter showed, and the answer to chapter 1's closing question: can we trust that number? Final line, then closing credits.

## The math

Cost of one letter, where r is the share of letters Jev sends on to the train:

`c = c_Jev + r · c_train`

Compared with using the train for every letter:

`c / c_train = c_Jev / c_train + r = 1/444.6 + r`

| r (share sent to the train) | System cost vs train alone | Cheaper by |
|---|---|---|
| 1 in 5 (0.2) | 0.202 | **about 5×** |
| 1 in 10 | 0.102 | about 10× |
| 1 in 100 | 0.012 | about 80× |
| everything (1) | 1.002 | no saving |

Time works the same way with 193.6×: 1 in 5 gives about 4.9× faster.

**Takeaway:** 444 barely matters. What matters is r. This is exact arithmetic on TypeSafe's claimed ratio; r = 1 in 5 is illustrative.

## Draft narration

| ID | Line |
|---|---|
| S01 | Last time, Jev read a million letters, and sent the hard ones to people. |
| S02 | But most letters don't just need sorting. They need an answer, written back. |
| S03 | And Jev can't write. That's the whole point of it. |
| S04 | Our trains can. They lay down a reply one word at a time. But every word costs time, and money. |
| S05 | So picture a signal box at the junction. Every letter stops here first. |
| S06 | Inside, Jev reads it in one pass, and sets the points. |
| S07 | Letters it's sure about take the short line. Sorted, answered from a template, done. |
| S08 | The unsure ones take the long line, to a train that can read slowly, and write back. |
| S09 | Here's the puzzle. By TypeSafe's own tests, Jev is up to four hundred and forty-four times cheaper than a chatbot. |
| S10 | Say Jev sends one letter in five on to the train. How much cheaper is the whole system, than using the train for everything? Take a guess. |
| (pause) | countdown, about 3.5 s |
| S11 | Four hundred times? Not even close. About five. |
| S12 | Let's run a thousand letters through the box. |
| S13 | Eight hundred take the short line. Each one costs almost nothing. |
| S14 | Two hundred take the long line. And each of those costs a full train ride. |
| S15 | Now count the coins. Nearly all of them were spent on the long line. |
| S16 | Written as math: one letter costs Jev's price, plus the share that rides the train, times the train's price. |
| S17 | Divide by the train's price. Jev's part is one over four hundred and forty-four. Almost nothing. What's left is the share: one in five. |
| S18 | So the whole system costs about a fifth of the train. Five times cheaper. |
| S19 | The four hundred and forty-four barely matters. What matters is how many letters Jev keeps off the train. |
| S20 | Time works the same way. Fast answers for most letters, slow ones only where they're needed. |
| S21 | Send one in ten, and it's about ten times cheaper. One in a hundred, about eighty. |
| S22 | But only letters Jev is truly sure about should stay off the train. And sure only counts if the number is honest. |
| S23 | If Jev is overconfident, a hard letter takes the short line, and nobody writes the careful answer it needed. |
| S24 | So the two aren't rivals. One decides, fast. The other writes, carefully. |
| S25 | TypeSafe calls Jev a System One model. Fast. The trains are the slow System Two. |
| S26 | And the signal box sends each letter to the kind of thinking it needs. |
| S27 | But there's a catch. A number that's honest on one kind of letter can drift on another. So before you trust it, check it on your own letters. |
| | **Conclusion** |
| S28 | Let's go back to where we started. Ask a chatbot the same question twice, and you might get two different answers. |
| S29 | That's not a glitch. It's how they write: one word at a time, and every word is a small bet. |
| S30 | Jev makes a different bargain. It never writes. It answers a fixed question, in one pass, with a number. |
| S31 | And a number is something you can do math with. You can price it, draw a line, and decide who reads what. |
| S32 | But only if it's honest. Ninety-one percent has to mean right about ninety-one times in a hundred. |
| S33 | So the future probably isn't one machine that does everything. It's a signal box. Fast numbers where they're enough, careful words where they're needed, and people where it matters most. |
| S34 | The model that doesn't talk may end up deciding who should. |

- **Kokoro, voice af_heart at speed 0.94:** `story/signal-box-vo.json`, `public/audio/vo-signal/`, `fixtures/signal-box-vo.json`.
- **The rules on narration numbers:**
  - "444.6×" and "193.6×" are always tied to "TypeSafe's own tests".
  - The 1,000 letters and "one in five" are illustrative.
  - The "DRAFT · ILLUSTRATIVE NUMBERS" badge stays.

## Worlds and palettes

| Palette | Where | Colours |
|---|---|---|
| Night rail | the junction outside, the two trains, the short and long lines, the semaphore signals | the film's night blues; the trains' own colours |
| Signal box | the cabin interior: the lever frame, the track diagram board, Jev's lamp head | bottle green `#1F4A3A`, cream `#EDE3C8`, brass `#D9A64A`, warm lamp `#FFC46B` |
| Teal | concept stages: the guess, the r dial | chapter 3's `T` |
| Red | mistakes only: the overconfident letter on the wrong line (S23) | `#FF4D5E` |

Everything that stands for something must be recognisable:
- **The signal box** is a raised cabin with big windows, a nameboard ("JUNCTION"), and outside steps.
- **Inside:** a row of numbered levers and a track diagram board with lamps.
- **Semaphore signals** use arms, not coloured lights, so red stays free for mistakes.
- **Letters** are `LetterBig`, with an address, a stamp and a postmark.
- **Coins** are the chapter 3 `Coin` and `CoinStack`.
- **No hands:**
  - Jev's beam touches a lever, and the lever throws itself.
  - The points move on their own.
  - The train's speech tape does the writing.

## Pacing (the new rules in `CLAUDE.md`)

- **Fewer, longer shots.** About 23 shots at 8 to 12 s each. The camera moves slowly and continuously inside each one.
- **Cuts:**
  - Cross-fades or continuous camera moves between shots.
  - A hard cut only for a real reveal: "About five", and the overconfident letter in S23.
- **Framing:**
  - Every shot is wide enough that the viewer sees the whole object and where it is.
  - Close-ups stay medium (a whole lever frame, a whole letter), never a fragment.
  - No camera move reaches past the drawn world.

## Shot list

| # | Lines | Shot | Palette | In |
|---|---|---|---|---|
| 1 | – | Title: the junction at night, the signal box lit, both trains waiting. "The Signal Box" | night rail | – |
| 2 | S01–S02 | Wide: the harbor lighthouse far off. Letters travel along the rails toward the junction, each with its address, stamp and postmark. A slow push in | night rail | X |
| 3 | S03–S04 | The two trains by the junction. The Claude train's speech tape writes a reply, word by word, and a coin drops for each word. **"slow"**, **"€"** | night rail | X |
| 4 | S05 | Crane up to the signal box on its brick base, with the nameboard **"JUNCTION"**. The semaphore arms stand beside it | night rail | continuous |
| 5 | S06 | Inside, medium: Jev's lamp head over the lever frame. A letter slides onto the desk and one sweep of light reads it. The beam touches lever 1, and outside the points move | signal box | X |
| 6 | S07–S08 | Outside, high and wide: one letter takes the short line to a template stamp, **"sure"**. The next takes the long line to the waiting train, **"unsure"**. The track diagram board in the window lights both routes | night rail | X |
| 7 | S09 | Concept: two coins on the tile, one tiny (Jev) and one huge (the train). **"444.6×"** with the "TypeSafe's own tests" tag | teal | X |
| 8 | S10 + pause | Concept: five letters on the tile, one lit toward the train; **"?"**; 3-2-1, **"GUESS"** | teal | continuous |
| 9 | S11 | Reveal: **"about 5×"**, big | night rail | **H** |
| 10 | S12–S14 | The junction wide. A stream of 1,000 letters, 800 on the short line and 200 on the long line, each with its coin counter | night rail | X |
| 11 | S15 | The two coin piles side by side at the ends of the lines: a small heap against a tower | night rail | continuous |
| 12 | S16–S18 | Inside the box: the equation builds on the track diagram board, with braces **"Jev"**, **"share"** and **"train"**; `1/444.6 + 0.2 ≈ 0.2`. The r dial on the board settles at one fifth | signal box | X |
| 13 | S19–S21 | Concept: the r dial on the tile. It turns from 1 in 5 to 1 in 10 to 1 in 100, while a cost bar shrinks to 5×, 10× and 80× | teal | X |
| 14 | S22 | The junction: the gauge from chapter 3 on Jev's lamp. Only letters above the line take the short line | night rail | X |
| 15 | S23 | A hard letter, over-sure, takes the short line. It goes red, and a template reply that doesn't fit is stamped on it | night rail + red | **H** |
| 16 | S24–S26 | Wide at dawn: the signal box sets the points, the Claude train pulls out with the hard letters, and the short line hums. **"System One"** by the box, **"System Two"** by the train | night rail, first light | X |
| 17 | S27 | Pull back: a second town's lights on the horizon, with a new kind of letter arriving. Jev's gauge needle wavers, and a small brass test weight is hung on it (checking on your own letters). **"check"** | night rail | X |
| | | **Conclusion: callbacks, one per chapter, long shots joined by cross-fades** | | |
| 18 | S28–S29 | Chapter 1's two chat windows, same question and two answers, then the train laying its words as track with a die over each word | screen, then dusk rail | X |
| 19 | S30–S31 | Chapter 2's signal mast unfurling every flag at once, then chapter 3's brass scale settling at 0.9 | night, then amber | X |
| 20 | S32 | Chapter 3's grid of 100 cells: 91 lit. **"91 / 100"** | teal | X |
| 21 | S33 | The whole world at sunrise in one slow pull back. The harbor and the lighthouse, the city and the bank with its reviewers, and the junction with the signal box. Both trains pull out, and the letters flow down all three kinds of track | night turning to dawn | X |
| 22 | S34 | The lighthouse lamp dims to a steady glow over the junction. Title: **"The Model That Doesn't Talk"** | dawn | X |
| 23 | – | Closing credits (about 8 s): narration by Kokoro-82M; made with Remotion; "Jev's speed and price claims: TypeSafe's own tests"; "every other number is illustrative" | dawn | X |

## Decisions for you

1. **Two lines or three?** This plan has two: Jev's short line and the train's long line. Chapter 3's reviewer could return as a third platform for costly mistakes, but that adds a beat.
2. **The puzzle numbers:** 444.6× and "one letter in five", giving about 5×. Or pick a different r.
3. **The ending:**
   - It lives inside chapter 4 as its last section, so chapter 4's end card becomes the closing credits.
   - It could also be a short chapter 5 of its own.
   - The callbacks reuse pictures from chapters 1 to 3, so they stay recognisable.
4. **Length:** about 3:25 with 34 lines. It could be cut to about 2:50 by merging S20 and S21, dropping S02 or S25, and shortening the callbacks.
5. **The final line (S34):** "The model that doesn't talk may end up deciding who should." Or an alternative you prefer.

## As built

- **Where the code lives:**
  - `src/shorts/signal-box/`: `timeline.ts` (cues, one start frame per shot, sound cues), `parts.tsx` (the junction, the signal box inside and out, the carts, the semaphore, the reply booth) and `Film.tsx` (the shots).
  - Narration: `story/signal-box-vo.json`, `public/audio/vo-signal/` and `fixtures/signal-box-vo.json`.
  - Mix: `make-audio-paper.ts --film=signal`, which writes `signal-track.wav`.
- **Length:** 3:55 (5,652 frames). The pauses between lines add a little over the estimate, so the whole video is about 13:20.
- **Shots:**
  - The camera moves slowly and continuously inside each shot, over a world drawn wider than any frame.
  - Shots cross-fade; hard cuts only for the "≈ 5×" reveal and the red over-sure letter.
  - The vignette sits in screen space, so no camera move reaches an edge.
- **Where the build differs from the plan:**
  - S19 stays on the diagram board: the tiny Jev term dims and the share term lights up. The dial concept starts at S20, which keeps it to about 12 s.
  - The 1,000-letter run uses 30 carts, each standing for 33 letters. The counters land on 800 and 200.
  - The coin piles read "1%" and "99%": 800 × c_Jev against 200 × 444.6 c_Jev, which is 0.9% against 99.1%.
  - The catch uses blue letters from a new town and a small board reading "7 / 10" beside the gauge at 0.9. **"check"**
  - The callbacks are the real scenes from chapters 1 to 3, played at mapped times: `Twice` and `ChatWindows` from chapter 1, `PassScene` from chapter 2 and `AnswerScene` from chapter 3.
