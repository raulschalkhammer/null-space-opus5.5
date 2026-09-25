# Chapter 2: Jev's Contract (shot list for the rework)

Status: **draft for sign-off.** Nothing here is built yet.

The narration (C01 to C11) and its timing stay exactly as they are. What changes is the picture: chapter 2 gets the chapter 3 rules (see `docs/chapter3-plan.md` and `CLAUDE.md`) and more shots than chapter 3 has.

## Pacing: before and target

Measured with `data-scripts/pacing.py` on the cached render (`renders/ch2-JevContract-cached.mp4`).

| | New look every | Longest hold | Nearly still | Hard cuts |
|---|---|---|---|---|
| Chapter 2 before (last handover) | 30.7 s | 47.2 s | 82% | 0 |
| Chapter 2 before (fresh render, this machine) | 30.7 s | 47.2 s | 81% | 0 |
| Chapter 3 (for comparison) | 4.3 s | about 20 s | 40% | |
| Kurzgesagt reference | 2.7 s | 18.5 s | 7% | 25 in 5:22 |
| **Chapter 2 target** | **3 s or less** | **about 8 s** | **under 20%** | |

Length stays 2:33 (3,677 frames). The plan has **55 shots** (chapter 3 has about 40), so a new picture every 2.7 s on average. Chapter 3's 40 shots measured 4.3 s, because close-ups in the same palette often don't count as a "new look". So the plan cuts more often than the target, and alternates palettes and scales so each cut reads as new.

To keep "nearly still" down, every shot has a slow camera drift (a push, pan or parallax) on top of its ambient motion (gulls, water, lamp flicker, drifting specks).

## Palettes (one per world)

| Palette | Where | Colours |
|---|---|---|
| Night | the harbor, the pier and the signal mast, the lighthouse, the trains | the film's night blues, yellow lamp |
| Amber | the mailroom, the brass slot wall, the grain tubes, the reviewer | chapter 3's `A`: brick `#4A2C3B`, wood `#8A5A3C`, brass `#D9A64A`, lamp `#FFC46B` |
| Teal | concept stages (one idea on a glowing tile) | chapter 3's `T`: void `#05121A`, tile `#154652`, glow `#2EE6C5` |
| Red | mistakes only: the wrong slot, a bluff | `#FF4D5E` |

**Creative changes to approve:**
1. **The mailroom turns amber.** In chapter 2 it's blue brick today, but in chapter 3 the same mailroom (with Jev's lamp head) is amber. Using chapter 3's `Mailroom` makes it one world across both chapters.
2. **The grain tubes move into the mailroom**, under Jev's lamp head, as brass-and-glass tubes. Today they stand on a generic night hillside. The tubes, the pour and the 60 line work exactly as before.
3. **The reviewer from chapter 3 appears in C10** as "the person" the letter goes to. Today that's a plain silhouette.
4. **The cruise letter becomes a real letter** (`LetterBig`: address, stamp, postmark), with the email text on the sheet inside.

## Cut types

- **H**: hard cut. Used on reveals and between close-ups.
- **M**: zoom or match cut between scales.
- **X**: cross-fade. Only at five section changes: title to open, into the contract, the mailroom, the promise and the end card.

## Shot list

Times are seconds into the chapter. "Line" is the narration line the shot plays under.

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 1 | – | 0.0 | Title card: the harbor at night, both trains on the pier, "Jev's Contract" (as now) | night | – |
| 2 | C01 | 3.5 | Harbor wide: the Claude train on the pier, its speech tape spilling words. **"write"** | night | X |
| 3 | C01 | 6.0 | Close-up: the speech tape curls out of the cab, word after word; "write" gets struck through | night | H |
| 4 | C01 | 8.2 | Concept: a speech bubble full of lines on the tile shrinks and collapses into one glowing number. **"0.91"** | teal | H |
| 5 | C01 | 10.6 | Close-up: the lighthouse lamp ignites, and 0.91 is projected onto a cloud. **"?"** | night | H |
| 6 | C02 | 14.2 | Split panel: on the left a long paragraph scrolls on a paper roll, on the right a single card reads 0.91. **"smarter?"** | night | H |
| 7 | C02 | 17.6 | Match cut: the paragraph's words turn into sleepers under the train; pull back as it lays them | night | M |
| 8 | C02 | 20.2 | Close-up: a die tumbles above each new sleeper; the count ticks up. **"14 bets"** | night | H |
| 9 | C02 | 22.8 | Wide: the dice hang over the whole track; the lighthouse sits dark in the distance. **"1"** by the lamp | night | H |
| 10 | C03 | 25.6 | Concept: a blank contract sheet on the tile; a wax seal stamps it. **"contract"** | teal | X |
| 11 | C03 | 28.4 | Harbor at dusk: the empty pier, a bare mast, gulls. A letter-boat waits offshore and can't land yet | night | H |
| 12 | C03 | 31.0 | Low angle: a crane lowers the "scam?" yardarm; the yes/no flags hang rolled and tied | night | H |
| 13 | C03 | 33.6 | Close-up: the yardarm seats on the mast with a clank and sparks | night | H |
| 14 | C03 | 35.8 | Wide: the "team?" yardarm swings in with billing, fraud and lost card | night | H |
| 15 | C03 | 38.6 | Close-up: the urgency halyard from 0 to 1; the signal ball runs up and down it once. **"urgent?"** | night | H |
| 16 | C03 | 41.2 | Pull back to the whole mast against the sky | night | M |
| 17 | C03 | 43.2 | Close-up: a padlock snaps shut on the mast foot. **"FIXED"** | night | H |
| 18 | C04 | 46.2 | Amber mailroom wide: the brass wall of three slots, Jev's lamp head hanging above | amber | X |
| 19 | C04 | 49.0 | Close-up: the cruise letter (address, stamp, postmark) slides out of the chute | amber | H |
| 20 | C04 | 51.4 | Close-up under the lamp: the letter opens and a band of light reads the whole sheet in one sweep (full email text) | amber | H |
| 21 | C04 | 53.6 | Close-up: the letter drops into "fraud" with a clack; two more letters are sorted fast | amber | H |
| 22 | C05 | 57.0 | Low angle along the floor rail: the Claude train rolls into the mailroom, happy | amber | H |
| 23 | C05 | 59.6 | Close-up: the train's face, determined; the speech tape reads "Miscellaneous-ish" as a plank builds itself beside it | amber | H |
| 24 | C05 | 62.2 | Wide: the plank reaches the wall and there is no room. It clatters to the floor; the train panics | amber | H |
| 25 | C05 | 64.6 | Split panel: on the left a letter in the wrong slot with a red ✕, **"possible"**; on the right the board on the floor, **"impossible"** | amber + red | H |
| 26 | C05 | 67.0 | Close-up: the train, sad, backs out of frame | amber | H |
| 27 | C06 | 70.0 | Harbor at night: the beam sweeps a letter on the pier once | night | H |
| 28 | C06 | 72.6 | Low angle on the mast: all three signals unfurl at the same instant, with light running from the letter. **"1 pass"** | night | H |
| 29 | C06 | 75.2 | Three-way split: close-ups of scam, team and urgency, each moving at once. **"91%"**, **"83%"**, **"0.7"** | night | H |
| 30 | C06 | 78.0 | Split panel: the train lays words one after another on the left, and the mast flies everything at once on the right. **"20"** and **"1"** | night | H |
| 31 | C07 | 81.2 | Mast wide; the equation builds in the sky above the yardarms: `P(answers) =` | night | H |
| 32 | C07 | 84.0 | Close-up on the yardarms: `∏ P(aᵢ │ letter)` finishes, with a brace and a label under each term (questions, letter) | night | H |
| 33 | C07 | 87.0 | Split panel: the rail and its chain rule `∏ P(wₜ │ w<ₜ)` on the left, the mast and its `∏` on the right. Both `∏` glow. **"same"** | night | H |
| 34 | C07 | 90.0 | Close-up on the rail: words queue behind each other. **"wait"** | night | H |
| 35 | C07 | 92.4 | Close-up on the mast: all flags up at once; "wait" is struck through | night | H |
| 36 | C08 | 95.8 | Amber mailroom: a second letter slides from the chute and stops under the lamp | amber | H |
| 37 | C08 | 98.0 | Close-up: the hard letter opens; its words light up one by one as read ("My card was charged twice, and now I can't find it.") | amber | H |
| 38 | C08 | 101.6 | Close-up: Jev's lamp swings between the three slots, unsure | amber | H |
| 39 | C08 + pause | 104.0 | Concept: three doors on the tile with "?", a 3-2-1 countdown, **"GUESS"** | teal | H |
| 40 | C09 | 108.4 | Close-up: Jev's lamp head, a hundred grains of light glowing in its glass. **"100"** | amber | H |
| 41 | C09 | 111.0 | Wide: three brass-and-glass tubes under the lamp; every grain pours into one tube. **"sure"** | amber | H |
| 42 | C09 | 113.6 | Close-up: the full tube, grains settling. **"100"** | amber | H |
| 43 | C09 | 115.8 | Wide: the tubes drain and refill evenly, 33, 33, 34. **"unsure"** | amber | H |
| 44 | C09 | 118.2 | Close-up: the lamp pours three streams at once for this letter | amber | H |
| 45 | C09 | 121.0 | Wide, low: **"47"**, **"28"**, **"25"** on the tubes | amber | H |
| 46 | C10 | 124.8 | Tubes side-on: a brass line slides across at 60. **"60"** | amber | H |
| 47 | C10 | 127.6 | Close-up: the gap between the top of fraud (47) and the 60 line. **"bluff"**, struck through | amber | H |
| 48 | C10 | 130.0 | A bell rings; the letter slides down a chute | amber | H |
| 49 | C10 | 132.0 | The reviewer from chapter 3 at a desk; the letter lands in front of them. **"person"** | amber | H |
| 50 | C11 | 135.5 | Harbor wide: the lighthouse projects 0.91 | night | X |
| 51 | C11 | 138.0 | Close-up: the lamp. **"promise"** | night | H |
| 52 | C11 | 140.4 | Concept: 100 cells on the tile fill up, 91 of them orange. **"91 / 100?"** | teal | H |
| 53 | C11 | 143.0 | Close-up: the lamp flickers. **"calibration"** | night | H |
| 54 | C11 | 145.2 | Pull back over the harbor; the two trains wait on the pier | night | M |
| 55 | – | 148.2 | End card: next time, "What 0.91 Promises" | night | X |

Shots 3, 13, 20, 23, 42 and 47 are close-ups with no hands: objects move by themselves (the tape, the plank, the envelope, the grains).

## Rules check

- **World and concept take turns.** There are four concept visits (4, 10, 39, 52), each 2.5 to 4.5 s, and each has a world shot on both sides.
- **Math lives in the world.** The equation builds in the night sky over the mast, and the chain rule appears over the rail in a split panel.
- **Split panels for comparisons:** shots 6, 25, 29, 30 and 33.
- **Scale changes:** 7 (paragraph to track), 16 (padlock to mast), 54 (lamp to harbor).
- **On-screen words** are single words or numbers. The only sentences are the letters Jev reads (the cruise email, the hard letter) and the train's speech tape.
- **Numbers:** 0.91, 83%, 0.7, 47/28/25 and the 60 line are illustrative, and the "DRAFT · ILLUSTRATIVE NUMBERS" badge stays.
