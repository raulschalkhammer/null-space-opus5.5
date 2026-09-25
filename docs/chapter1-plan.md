# Chapter 1: Track Layer (shot list for the rework)

Status: **draft for sign-off.** Nothing here is built yet.

The narration (H01 to L14) and its timing stay exactly as they are. What changes is the picture: chapter 1 gets the chapter 3 rules (see `docs/chapter3-plan.md` and `CLAUDE.md`) and more shots than chapter 3 has. The approved pieces stay the centre of their scenes: the steam trains and their expressions, the forks with branch widths, the guess beat, Shannon's study, the marble machine and the 100 runs, the swamp. They get more angles, close-ups and cuts around them.

## Pacing: before and target

Measured with `data-scripts/pacing.py` on the cached render (`renders/ch1-TrackLayerFlat-cached.mp4`).

| | New look every | Longest hold | Nearly still | Hard cuts |
|---|---|---|---|---|
| Chapter 1 before (last handover) | 18.7 s | 50.7 s | 63% | 0 |
| Chapter 1 before (fresh render, this machine) | 20.1 s | 50.7 s | 62% | 0 |
| Chapter 3 (for comparison) | 4.3 s | about 20 s | 40% | |
| Kurzgesagt reference | 2.7 s | 18.5 s | 7% | 25 in 5:22 |
| **Chapter 1 target** | **3 s or less** | **about 8 s** | **under 20%** | |

Length stays 4:21 (6,272 frames). The plan has **96 shots** (chapter 3 has about 40), so a new picture every 2.7 s on average. Every shot also carries a slow camera drift on top of its ambient motion (smoke, fireflies, stars, water, lamp flicker).

## Palettes (one per world)

| Palette | Where | Colours |
|---|---|---|
| Screen | the chat windows of the cold open | ink navy `#0B1030`, window `#1B2260`, cyan and orange word highlights |
| Night | the city, the planet, the harbor and the lighthouse (the news, Jev, the close) | the film's night blues, yellow lamp |
| Dusk rail | the rail plain: the station, the forks, the guess corridor, the marble junction, the swamp | violet hills, the low orange sun, amber track |
| Study | Shannon's 1951 room | plum walls, one warm desk lamp, a green chalkboard |
| Teal | concept stages (one idea on a glowing tile) | chapter 3's `T` |
| Red | mistakes only: the thin branch that wins, "wrong", the bad link | `#FF4D5E` |

**Creative changes to approve:**
1. **New concept stages** (teal, 2 to 4 s each): "?" between two answers, the finished sentence that isn't there, a fork whose width is chance, the 80% branch, the countdown, and "4%". There are 6, and never two in a row.
2. **The news on-screen text becomes single words.** "SEPTEMBER 15, 2026 / TypeSafe AI" becomes a calendar leaf "15" and a nameplate "TypeSafe" on the lighthouse door.
3. **The claims show TypeSafe's exact published numbers**, "193.6×" and "444.6×", each with the "TypeSafe's own tests" tag. Today they're rounded.
4. **"usually caught" becomes "caught ✓"**, and L10's "Fluent, confident, and wrong" gets three quick word cuts (the last one red).
5. **L02 "can't see their destination"**: a close-up of the track running into fog.
6. **R02 "rare happens all the time"**: after the 100 runs, a zoom out to the night planet with thin branches lighting up across it.

## Cut types

- **H**: hard cut. Used on reveals and between close-ups.
- **M**: zoom or match cut between scales.
- **X**: cross-fade. Only at seven section changes: into the news, the title, the station, the guess, Shannon, Jev and the end card.

## Shot list

Times are seconds into the chapter. "Line" is the narration line the shot plays under.

### Cold open (0:00 to 0:29)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 1 | H01 | 0.0 | Close-up: one chat window; "Should I sign this contract?" appears and the reply streams in, word by word | screen | – |
| 2 | (pause) | 3.2 | Hard cut to a second window: the same question, and a different reply streams in | screen | H |
| 3 | H02 | 5.6 | Split panel: both windows side by side; a line links the two identical questions. **"same"** | screen | H |
| 4 | H02 | 7.8 | Extreme close-up on the first words: "Yes," against "I'd hold off". **"different"** | screen | H |
| 5 | H02 | 9.6 | Concept: two speech bubbles on the tile, one glowing "?" between them | teal | H |
| 6 | H03 | 11.8 | Pull out of the window into a lit apartment window in a night city; windows glow in every building | night | M |
| 7 | H03 | 14.2 | Pull back to the planet; question bubbles rise from it. "Should I sign this?" | night | M |
| 8 | H03 | 16.6 | Close-up on the planet's rim: "Is this rash normal?" | night | H |
| 9 | H03 | 18.6 | Close-up on the other side: "Is this email a scam?" | night | H |
| 10 | H04 | 20.8 | Split panel: ChatGPT and Claude windows, both streaming | screen | H |
| 11 | H04 | 23.2 | Extreme close-up: one word lands, and a die rolls above it | screen | H |
| 12 | H04 | 25.6 | Pull back: a row of words, a die over each. **"bet"** | screen | H |

### The news (0:29 to 1:01)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 13 | N01 | 29.1 | Harbor at night: the city on the left, the dark lighthouse on the cliff, a calendar leaf falls. **"15"** | night | X |
| 14 | N01 | 32.4 | Close-up: the lighthouse door and its nameplate. **"TypeSafe"** | night | H |
| 15 | N01 | 34.6 | Low angle: chat bubbles drift past the lighthouse, and it doesn't answer them | night | H |
| 16 | N02 | 36.4 | The lamp ignites; the letters **"JEV"** rise out of the water | night | H |
| 17 | N02 | 38.6 | Close-up: the beam projects **"0.91"** onto a cloud | night | H |
| 18 | N03 | 41.2 | Split panel: the train lays a sentence word by word on the left, the beam flashes once on the right. **"193.6×"** "faster" | night | H |
| 19 | N03 | 44.2 | Split panel: a tall coin tower beside the train, a single coin beside the lamp. **"444.6×"** "cheaper" | night | H |
| 20 | N03 | 47.2 | Close-up: a paper tag on the lighthouse rail: "TypeSafe's own tests" | night | H |
| 21 | N03 | 49.4 | Wide: coins rain into the harbor. **"$40,000,000"** | night | H |
| 22 | N04 | 53.8 | Split panel: the lighthouse against the train. **"?"** | night | H |
| 23 | N04 | 56.6 | Push in toward the train's glowing cab window. **"inside"** | night | M |
| 24 | N04 | 59.0 | The cab window fills the frame and whites out into the title | night | M |

### Title and the station (1:01 to 1:29)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 25 | – | 61.5 | Title card: "Track Layer", both trains crossing (as now) | dusk rail | X |
| 26 | L01 | 64.5 | The station at dusk: the post box with the letter slot | dusk rail | X |
| 27 | L01 | 66.6 | Close-up: an envelope drops into the post box and opens by itself; the email card rises with its full text | dusk rail | H |
| 28 | L01 | 69.4 | Close-up: "Is this email a scam?" underlined on the card | dusk rail | H |
| 29 | L02 | 72.0 | Concept: a finished sentence on a scroll on the tile, which then crumbles. **"whole?"** | teal | H |
| 30 | L02 | 75.0 | Station wide: the two trains roll in and their name tags pop. **"Claude"**, **"ChatGPT"** | dusk rail | H |
| 31 | L02 | 78.0 | Close-up: the Claude train's face, curious, looking ahead | dusk rail | H |
| 32 | L02 | 80.4 | Over the boiler: the track ahead runs into fog. No destination | dusk rail | H |
| 33 | L02 | 83.0 | Low angle at the rails: the train lays its first sleeper, a word ("Great") | dusk rail | H |
| 34 | L02 | 85.6 | Close-up on the wheels rolling over the new sleeper | dusk rail | H |
| 35 | L02 | 87.4 | The camera swings up into the ride-along view | dusk rail | M |

### Forks and the chain of chances (1:29 to 2:13)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 36 | L03 | 89.6 | Ride-along wide: the first junction fans out into branches | dusk rail | M |
| 37 | L03 | 92.4 | Top-down close-up: branch widths with their words. "Yes 22%", "This 17%", "Hi 7%" | dusk rail | H |
| 38 | L03 | 95.0 | Concept: a single fork on the tile, one wide branch and one thin one; each branch's width matches a bar beside it. **"70%"**, **"4%"** | teal | H |
| 39 | L03 | 97.2 | Ride-along: the train at the junction, waiting | dusk rail | H |
| 40 | L04 | 99.0 | Close-up: the points switch and the train takes one branch | dusk rail | H |
| 41 | L04 | 101.0 | Wide: the next junction appears out of the dark | dusk rail | H |
| 42 | L05 | 104.4 | Top-down: the amber ribbon narrows at every junction | dusk rail | H |
| 43 | L05 | 107.2 | Close-up: the gauge over the cab ticks down. **"0.31"**, **"0.22"** | dusk rail | H |
| 44 | L05 | 110.0 | Wide, low: the ribbon is now thin. **"×"** at each junction | dusk rail | H |
| 45 | L05 | 112.4 | Close-up: the gauge. **"0.027"** | dusk rail | H |

### The guess (1:55 to 2:13)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 46 | G01 | 115.2 | Concept: one branch on the tile. **"80%"** | teal | X |
| 47 | G01 | 118.0 | The guess corridor: twenty junctions in a row, each marked 80% | dusk rail | H |
| 48 | G01 | 120.8 | Close-up: the train facing the corridor | dusk rail | H |
| 49 | G01 | 122.6 | Close-up along the corridor to its end. **"20"** | dusk rail | H |
| 50 | pause | 123.8 | Concept: a 3-2-1 countdown. **"GUESS"** | teal | H |
| 51 | G02 | 127.3 | The corridor narrows junction by junction. The counter falls from **"44%"** to **"1.15%"** | dusk rail | H |
| 52 | G02 | 130.0 | Close-up at the thin end: `0.8²⁰ ≈ 0.0115` in the sky | dusk rail | H |

### The chain rule (2:13 to 2:23)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 53 | – | 133.2 | Pull back over the whole track; each junction's factor appears above it | dusk rail | M |
| 54 | L06 | 136.0 | In the sky above the track, `P(sentence) = ∏ P(wₜ │ w<ₜ)` builds, with braces labelled multiply and next word | dusk rail | H |
| 55 | L06 | 139.0 | Close-up: the train lays the next sleeper under the equation | dusk rail | H |

### Shannon (2:23 to 2:48)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 56 | SH01 | 142.5 | Shannon's study, wide: bookshelves, a window, the desk lamp. A calendar reads **"1951"** | study | X |
| 57 | SH01 | 145.2 | Close-up: Shannon, as a silhouette at the desk, under the lamp. **"Shannon"** | study | H |
| 58 | SH01 | 147.8 | Close-up: the chalkboard's letter-frequency bars, "E T A O I N" | study | H |
| 59 | SH01 | 150.4 | Close-up on the page: a passage with its letters hidden | study | H |
| 60 | SH01 | 153.0 | Letter tiles flip one at a time, "IS TH…", with the number of guesses under each | study | H |
| 61 | SH02 | 156.2 | Wide: the tiles "IS THIS EMAIL A SCAM"; the numbers are mostly 1s. **"predictable"** | study | H |
| 62 | SH02 | 159.0 | Close-up: a row of 1s under the tiles | study | H |
| 63 | SH02 | 161.2 | Match cut: a letter tile turns into a word sleeper on the rail | dusk rail | M |
| 64 | SH02 | 163.4 | Zoom out to the night planet, crossed by thousands of tiny tracks. **"billions"** | night | M |

### The marble junction (2:48 to 2:58)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 65 | L07 | 167.6 | The magnified junction after "looks": **"37×"** zoom, and the branches' widths | dusk rail | H |
| 66 | L07 | 170.0 | Close-up: the marble drops into the junction's chutes, and the dice roll | dusk rail | H |
| 67 | L07 | 172.4 | Extreme close-up: the thin branch. **"totally 4%"** | dusk rail | H |
| 68 | L08 | 174.6 | The points throw and the train takes the thin branch. **"Totally."** | dusk rail + red | H |

### A hundred runs (2:58 to 3:21)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 69 | R01 | 178.0 | Concept: **"4%"** on the tile, and it shrinks toward nothing. **"never?"** | teal | H |
| 70 | R01 | 180.6 | The marble machine, wide: five chutes, labelled bins | dusk rail | H |
| 71 | R01 | 183.2 | Close-up: the hopper filling with a hundred marbles. **"100 runs"** | dusk rail | H |
| 72 | run | 185.4 | Close-up: marbles bounce down the chutes | dusk rail | H |
| 73 | run | 187.8 | Close-up: the "totally" bin catches a marble. **"1"** | dusk rail | H |
| 74 | R02 | 190.4 | Wide: all the bins filled. **"4 / 100"** | dusk rail | H |
| 75 | R02 | 193.2 | Close-up: the four marbles in the thin bin, lit red | dusk rail + red | H |
| 76 | R02 | 195.4 | Zoom out: the machine becomes a dot on the night planet, where thin branches flash everywhere | night | M |
| 77 | R02 | 197.8 | Closer on the planet: a thin branch flashes somewhere every few frames. **"daily"** | night | H |

### Leaning into the swamp (3:21 to 3:50)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 78 | L09 | 200.0 | The magnified junction after "totally": **"933×"** zoom, and a pond ahead | dusk rail | H |
| 79 | L09 | 202.6 | Close-up on the branch gauge: "legit 72%" is the widest | dusk rail | H |
| 80 | L09 | 205.0 | Close-up: the train's face, confident, taking "legit" | dusk rail | H |
| 81 | L09 | 207.2 | Wide: the track bends down toward the swamp | dusk rail | H |
| 82 | L10 | 210.2 | The valley: the train slides down into the swamp | dusk rail | H |
| 83 | L10 | 212.8 | Close-up: the face, panicking, as steam bursts | dusk rail | H |
| 84 | L10 | 215.0 | Three quick word cuts over the sinking train: **"fluent"**, **"confident"**, **"wrong"** (red) | dusk rail + red | H |
| 85 | L10b | 218.6 | Wide: a ✓ over the swamp. **"caught"** | dusk rail | H |
| 86 | L10b | 221.6 | Pull back along the track; each sleeper carries its chance (38%, 81%, 72% …) | dusk rail | M |
| 87 | L10b | 224.6 | Close-up: the single 4% link glows red | dusk rail + red | H |
| 88 | L10b | 227.2 | Wide: the whole chain with its one bad link. **"chain"** | dusk rail | H |

### Jev (3:50 to 4:07)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 89 | L11 | 230.1 | The lighthouse on the cliff above the swamp: no track, no words | night | X |
| 90 | L11 | 233.0 | Close-up: the lamp. **"0 words"** | night | H |
| 91 | L12 | 235.4 | The beam sweeps the whole email card at once | night | H |
| 92 | L12 | 238.6 | Close-up: the beam splits into two wedges, **"SCAM"** and **"NOT SCAM"**, sized by certainty | night | H |
| 93 | L13 | 243.0 | **"0.91"** projected on a cloud; **"1 pass"** | night | H |

### Close and end card (4:07 to 4:21)

| # | Line | Time | Shot | Palette | In |
|---|---|---|---|---|---|
| 94 | L14 | 247.3 | Split panel: the train on the left **"writes"**, the lighthouse on the right **"decides"** | night | H |
| 95 | L14 | 251.4 | Close-up: 0.91 on the cloud. **"trust?"** | night | H |
| 96 | – | 256.8 | End card: next time, "The Mailroom" | dusk rail | X |

## Rules check

- **World and concept take turns.** There are 6 concept visits (5, 29, 38, 46, 50, 69), each 2 to 3.5 s. None follow each other directly: 46 and 50 have the corridor shots (47 to 49) between them.
- **Math lives in the world.** The chain rule builds in the sky over the track, and `0.8²⁰` at the thin end of the corridor.
- **Split panels for comparisons:** 3, 10, 18, 19, 22 and 94.
- **Scale changes:** window to city to planet (6, 7), cab window into the title (23, 24), tile to sleeper (63), sleeper to planet (64), machine to planet (76).
- **On-screen words** are single words or numbers. The only sentences are the chat replies in the cold open, the email card, the letters Shannon's subjects guess, and the words the train lays as track.
- **Numbers:** 193.6× and 444.6× carry "TypeSafe's own tests". Every other number is illustrative, and the badge stays.
