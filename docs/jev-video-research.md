# Jev Explainer Video: Research, Toolchain and Asset Plan

Working title: **"The Model That Doesn't Talk"**
Goal: an educational video on Jev (TypeSafe AI's "System One" model): how it works, the mathematics behind it, how it differs from conventional LLMs, and a practical demo showing what those differences mean in use. Built with JavaScript/TypeScript, playful in tone, serious about the math.

Research date: 24 Sep 2026. Jev launched 15 Sep 2026, so the facts below are young and moving. Note on sources: the primary TypeSafe pages (typesafe.ai, docs.typesafe.ai) were not reachable from the research environment, so facts come from search snippets of those pages plus secondary coverage. **Verify every on-screen claim against the official docs before recording.** Several "Jev guide" sites in search results are SEO aggregators; don't treat them as authoritative.

---

## 1. What Jev is (the facts the script can lean on)

| Topic | What is reported | Source quality |
|---|---|---|
| Company | TypeSafe AI, San Francisco, founded 2024 by Diogo Almeida (ex-OpenAI: RLHF, InstructGPT, ChatGPT, GPT-4), Erik Gafni, Sasha Sheng. $40M seed led by DCVC. | Wikipedia, launch coverage |
| Category | "System One model" (named after Kahneman's fast, intuitive System 1). Returns **typed decisions with probabilities**, never free text. | TypeSafe blog |
| Architecture | **Non-autoregressive.** "A new architecture and parallel sampler that reads the state once and produces every answer in the same forward pass." Internals are not published. | TypeSafe blog via MarkTechPost |
| Request shape | `POST https://api.typesafe.ai/v1/systemone` with `model`, a `state` (string, JSON object or array of text) and a map of **named, typed questions**. Answers come back under the same keys. | TypeSafe API docs |
| Primitives | **Noul** (yes/no probability in [0,1]), **Choice** (1 of up to 255 options, full distribution + confidence), **Score** (2 to 10 ordered, concretely-defined levels; returns a probability-weighted position that can fall between levels, + confidence). | Docs, community reference gist |
| Question independence | Questions run in parallel and in isolation against the same state. Answer A is never context for question B. | Docs |
| Training | **RLCD** (Reinforcement Learning for Calibrated Decisions): reward comes from verifiable ground truth scored with proper scoring rules (e.g. Brier score), not human preference. Reportedly trained on synthetic data. | TypeSafe blog, interviews |
| Speed / price | 70 to 500 ms end-to-end. $0.042 per 1M input tokens, output free. Vendor claims "up to 100x faster and 100x cheaper" than LLMs on suitable tasks. | TypeSafe, MarkTechPost |
| Access | Waitlist reportedly removed 21 Sep 2026; sign up at console.typesafe.ai (reports mention $5 free credit). Also served via Cloudflare Workers AI (`typesafe/jev`), Vercel AI Gateway, LiteLLM pass-through, Pydantic AI. | Multiple, verify |
| Independent results | Mixed but interesting: roughly level with mid-price LLMs, behind frontier models on harder suites; confidence tends to hedge when wrong; one suite reports median ECE 0.071. TypeSafe has published no reliability plot, Brier score or ECE of its own. | dev.to independent tests, benchmark repos |
| Main critique | Alex Molas, "Jev can't be calibrated": calibration is a property of model **plus data distribution**. Jev gives every customer the same probability for the same input, so it can't be calibrated for everyone. Treat outputs as scores and recalibrate on your own labels. | alexmolas.com, HN discussion |

**Undisclosed (say so on screen, don't invent):** the exact architecture, the confidence formula for Choice/Score, model size, and RLCD details beyond "proper scoring rules on verifiable decisions".

---

## 2. The mathematics to teach (story beats, each with a visual idea)

### 2.1 How a conventional LLM decides: autoregression
$$p(y \mid x) = \prod_{t=1}^{T} p(y_t \mid y_{<t}, x)$$
- One forward pass **per output token**, sequential. Latency ≈ TTFT + T · t_token.
- To get "probability the answer is *yes*" you'd need to sum over every string that means yes: $P(\text{yes}) = \sum_{y \in \mathcal{Y}_{\text{yes}}} p(y \mid x)$. Intractable; in practice people ask the model to *say* "I'm 90% sure", which is just more tokens, not a measured probability.
- Known result worth citing: RLHF post-training tends to **hurt** calibration (GPT-4 Technical Report shows the pre-trained model was well calibrated and the post-trained one less so).
- Visual: a typewriter/conveyor belt. Each token pops out with a live bar chart of its next-token distribution (real numbers from a tiny local model, see §4.3). A cost meter and stopwatch tick with every token.

### 2.2 How Jev decides: one pass, typed answer spaces
$$p(a_1,\dots,a_k \mid s) = \prod_{i=1}^{k} p(a_i \mid s, q_i), \qquad a_i \in \mathcal{A}_i \text{ (finite, declared up front)}$$
- The answer space is fixed by the schema, so **schema hallucination is impossible by construction** (semantic mistakes are still possible).
- The product form is the "questions are isolated" rule written as math. Latency is roughly flat in k (vendor claim), versus linear in output length for an LLM.
- Visual: a camera flash. The state is photographed once, and k dials swing to their values simultaneously.

### 2.3 The three primitives as geometry
- **Noul** = Bernoulli: a single number $p \in [0,1]$. Visual: a see-saw or a coin with weighted sides.
- **Choice** = categorical distribution, a point on the probability simplex $\Delta^{n-1} = \{p \in \mathbb{R}^n_{\ge 0} : \sum_k p_k = 1\}$. For 3 options the simplex is a **triangle**: every possible answer distribution is a dot inside it. The corners are certainty; the centroid is total ignorance. This is the best "aha" visual in the video.
  - Playful aside (clearly labelled as speculation): the 255-option cap is suspiciously the largest value of one byte.
- **Score** = ordinal: levels $1..L$ with probabilities $p_\ell$; the returned position behaves like an expectation $\mathbb{E}[\ell] = \sum_\ell \ell\, p_\ell$, which is why it can land *between* levels. Visual: a marble on a ramp with labelled notches, settling at 2.6.
- **Confidence (concentration):** not disclosed. You can illustrate the *idea* with two standard measures and say "Jev's exact formula isn't public": normalized entropy $1 - H(p)/\log n$ and the top-2 margin $p_{(1)} - p_{(2)}$.

### 2.4 Calibration: what the probabilities promise
- Definition: $P(Y = \hat{y} \mid \hat{p} = p) = p$. "Of all the times it said 80%, it was right 80% of the time."
- Analogy: the weather forecaster. It rained on ~70% of the days they said 70%.
- **Reliability diagram**: bin predictions by confidence, plot accuracy vs confidence; perfect calibration is the diagonal.
- **Expected Calibration Error**: $\mathrm{ECE} = \sum_{m=1}^{M} \frac{|B_m|}{n}\,\big|\mathrm{acc}(B_m) - \mathrm{conf}(B_m)\big|$
- Visual: marbles (predictions) dropping into 10 bins, stacking into bars that either hug the diagonal or don't.

### 2.5 Proper scoring rules: why "honest" is the optimal strategy (the mathematical heart)
- Brier score (binary): $\mathrm{BS} = \frac{1}{N}\sum_i (p_i - y_i)^2$; multi-class: $\frac{1}{N}\sum_i \sum_k (p_{ik} - y_{ik})^2$.
- The derivation to animate: if the true chance is $q$ and you report $p$,
  $$\mathbb{E}\big[(p - Y)^2\big] = q(1-p)^2 + (1-q)p^2 = (p - q)^2 + q(1-q)$$
  A parabola in $p$ with its minimum exactly at $p = q$. The floor $q(1-q)$ is **irreducible uncertainty**: no model beats it. Lying in either direction costs you $(p-q)^2$. That is what "proper" means.
- Log score does the same: $\mathbb{E}[-\log] = -q\log p - (1-q)\log(1-p)$, derivative zero at $p = q$.
- Murphy decomposition (for the math-hungry segment): $\mathrm{BS} = \text{reliability} - \text{resolution} + \text{uncertainty}$. Calibration alone isn't enough; a model that always says the base rate is calibrated but useless (zero resolution).

### 2.6 RLHF vs RLCD
- RLHF (what Almeida helped build): $\max_\pi \; \mathbb{E}_{y\sim\pi}[r_\phi(x,y)] - \beta\,\mathrm{KL}(\pi \,\|\, \pi_{\text{ref}})$, where $r_\phi$ is a learned model of *human preference*. Optimizes "sounds right to a person".
- RLCD (as described): reward $= -\text{Brier}(p, y)$ or another proper score against verifiable ground truth. Optimizes "is right, with an honest number attached". Label everything past this as vendor description.
- Visual: two dogs being trained. One gets a treat when the judge smiles; the other gets a treat proportional to how well its stated odds matched reality.

### 2.7 Decision theory for the practical demo: when to let the machine act
- Automate if expected cost of acting < cost of escalating to a human:
  $$(1 - p)\,C_{\text{error}} < C_{\text{human}} \;\Rightarrow\; p > \tau^* = 1 - \frac{C_{\text{human}}}{C_{\text{error}}}$$
  E.g. a misroute costs $20, a human triage costs $2, so τ* = 0.9. This only works if $p$ is calibrated, which ties the whole video together.
- **Risk-coverage curve**: sweep τ; plot fraction automated (coverage) vs error rate among automated items (risk).

### 2.8 Honest caveats segment (builds credibility)
- Calibration is dataset-relative (Molas). Fix: recalibrate on your own labelled sample with Platt scaling $\sigma(a\,z + b)$, temperature scaling $\mathrm{softmax}(z/T)$ or isotonic regression, using $z = \log p$ (or logit for Noul).
- Semantic errors remain possible; it cannot write text; multi-step reasoning needs decomposition into several calls; benchmark picture is mixed.

---

## 3. Proposed structure (about 12 minutes)

| # | Segment | Beat | Key visual |
|---|---|---|---|
| 0 | Cold open (0:45) | "Is this email a scam?" asked to a chatty LLM (tokens ticking, cost meter spinning) vs Jev (one flash, `0.94`). | Split-screen race |
| 1 | How LLMs decide (1:30) | Autoregressive product, real next-token bars, why "90% sure" is just text. | Typewriter + live histograms |
| 2 | Jev's contract (1:30) | State + typed questions → distributions. JSON request/response animated line by line. | Code-diff animation |
| 3 | Three shapes of an answer (2:00) | Noul, Choice on the simplex triangle, Score as expectation. | See-saw, triangle, marble ramp |
| 4 | Calibration (1:30) | Weather forecaster, reliability diagram, ECE. | Marbles filling bins |
| 5 | Proper scoring & RLCD (2:00) | Brier parabola derivation; RLHF vs RLCD. | Parabola with floor, two dogs |
| 6 | Practical demo (2:00) | Support-ticket router on real data with a confidence gate, τ* from costs, risk-coverage curve, cost/latency vs an LLM. | Dashboard with slider sweep |
| 7 | Caveats + outro (0:45) | Dataset-relative calibration, recalibration, "System 1 + System 2". | Recalibration curve bends onto diagonal |

---

## 4. Toolchain (JavaScript / TypeScript)

### 4.1 Animation engine: pick one

**Recommended: [Motion Canvas](https://motioncanvas.io)** (MIT, free forever)
- Built for exactly this genre: TypeScript generator functions (`yield* all(...)`), signals, a live editor with a timeline and audio waveform so you can sync beats to voiceover.
- Native `<Latex>` node (MathJax) with **tweening between equations**, which is perfect for the Brier derivation.
- `<Code>` node with animated diffs, ideal for the JSON request/response segment.
- Renders via its FFmpeg exporter (`@motion-canvas/ffmpeg`) or image sequences.
- Caveat: release cadence is slow; lock versions early.

**Alternative: [Remotion](https://www.remotion.dev)** (React, free for individuals and orgs of 3 people or fewer; company license beyond that, about $25/creator seat/month)
- Choose it if the team prefers React/JSX, wants server-side batch rendering, `@remotion/three` for 3D, `@remotion/lottie`, or built-in captioning (`@remotion/captions`, `@remotion/install-whisper-cpp`).
- Math via KaTeX/MathJax React components; equation morphing needs more manual work than Motion Canvas.

(Revideo, the Motion Canvas fork, is now tied to a commercial product's roadmap, so it's not recommended as the base.)

### 4.2 Libraries inside the scenes

| Need | Library | License | Notes |
|---|---|---|---|
| Math typesetting | MathJax (built into Motion Canvas `<Latex>`) or [KaTeX](https://katex.org) | Apache-2.0 / MIT | KaTeX is faster for static labels. |
| Hand-drawn, playful strokes | [Rough.js](https://roughjs.com) | MIT | Use `rough.generator()` + `generator.toPaths(drawable)` to get SVG path strings, then feed them to Motion Canvas `<Path data=...>`. Sketchy boxes around crisp math is the signature look. |
| Scales, axes, curves, histograms | [d3-scale, d3-shape, d3-array](https://d3js.org) | ISC | Use as math helpers only (no DOM): `scaleLinear`, `line`, `curveCatmullRom`, `bin`. |
| Physics for marbles/sand | [Matter.js](https://brm.io/matter-js/) or [planck.js](https://piqnt.com/planck.js/) | MIT | **Simulate offline and bake positions to JSON**, then play back deterministically so renders are reproducible. |
| Easing / extra tweening | Motion Canvas built-ins; or [GSAP](https://gsap.com) with Remotion | GSAP is free incl. all plugins since 2025 | GSAP's MorphSVG is handy for shape morphs in Remotion. |
| 3D (optional) | [three.js](https://threejs.org) / react-three-fiber | MIT | Only if you want a 3D simplex (4 options = tetrahedron). The 2D triangle is usually enough. |
| Seeded randomness | [seedrandom](https://github.com/davidbau/seedrandom) | MIT | Deterministic "random" marbles across re-renders. |
| Stats (ECE, Brier, isotonic) | Write it yourself (under 100 lines) or [simple-statistics](https://simple-statistics.github.io) | ISC | Writing it yourself keeps the on-screen formula and code identical. |

### 4.3 Real data, so every number on screen is genuine

Architecture: **data scripts (Node) → JSON fixtures → scenes.** Never call APIs during rendering; the render must be reproducible and API keys must stay out of the scene code.

| Script | Tool | Output |
|---|---|---|
| `llm-next-token.mjs` | [Transformers.js](https://huggingface.co/docs/transformers.js) (`@huggingface/transformers`, Apache-2.0) with a tiny model (e.g. SmolLM2-135M) | Real top-k next-token distributions for the typewriter segment. Runs locally, free. |
| `jev-run.mjs` | Jev REST API (`fetch`) | Noul / Choice / Score answers on the demo dataset. |
| `llm-baseline.mjs` | Claude API (e.g. Claude Haiku 4.5) or any LLM | Same tickets, answer + verbalized confidence, measured latency and token cost, for the race. |
| `metrics.mjs` | Your own code | Accuracy, Brier, ECE, reliability bins, risk-coverage curve, recalibrated curve. |

**Demo dataset:** [Banking77](https://huggingface.co/datasets/PolyAI/banking77) (CC BY 4.0; 13k customer-support messages, 77 intents). Group the 77 intents into ~6 "departments" for a readable Choice question, and hold out labels to measure calibration. Cost check: 1,000 tickets × ~200 tokens = 200k tokens ≈ **$0.008** on Jev. Credit the dataset on screen.

Other ready-made comparisons to cite or reproduce: the `jev-aita` repo (770 Reddit AITA verdicts, Brier/latency/cost vs Sonnet and small LLMs) and `jev-benchmark` (agent tool-call risk classification).

### 4.4 Voice, captions, sound

| Need | Option | License / cost |
|---|---|---|
| Narration (best) | Record yourself: any USB mic + [Audacity](https://www.audacityteam.org) (noise reduction, compressor, loudness normalize to −16 LUFS) | Free |
| Narration (synthetic) | [kokoro-js](https://www.npmjs.com/package/kokoro-js) (Kokoro-82M, runs in Node/browser) | Apache-2.0 weights, free. [HeadTTS](https://github.com/met4citizen/HeadTTS) adds word timestamps for syncing. |
| Captions / word timings | whisper.cpp (via `@remotion/install-whisper-cpp`) or Transformers.js Whisper | MIT, free |
| Sound effects (procedural) | [ZzFX](https://github.com/KilledByAPixel/ZzFX) (tiny JS sfx generator, MIT) or jsfxr | Free. Marble clicks, pops, "flash" |
| Sonification | [Tone.js](https://tonejs.github.io) (MIT) | Make the LLM a metronome tick per token and Jev a single chord. Also a pitch that rises with probability. |
| Sound effects (recorded) | [Kenney audio packs](https://kenney.nl/assets/category:Audio) (CC0), [Freesound](https://freesound.org) filtered to CC0 | Free |
| Music | [Pixabay Music](https://pixabay.com/music/) (free, no attribution), YouTube Audio Library, [Incompetech](https://incompetech.com) (CC BY, credit required) | Free |

### 4.5 Visual assets (free)

| Asset | Source | License |
|---|---|---|
| Fonts | Google Fonts: **Bricolage Grotesque** or **Space Grotesk** (headings), **JetBrains Mono** (code/JSON), **Caveat** (hand-written annotations) | SIL OFL |
| Icons | [Lucide](https://lucide.dev), [Phosphor](https://phosphoricons.com), [Tabler](https://tabler.io/icons) | ISC / MIT |
| Characters | [Open Peeps](https://www.openpeeps.com) (hand-drawn people, great with Rough.js style) | CC0 |
| Illustrations | [unDraw](https://undraw.co) (recolorable) | unDraw license (free, no attribution) |
| Probability props | [Kenney Board Game pack](https://kenney.nl/assets) (dice, cards, chips, marbles) | CC0 |
| Emoji reactions | [OpenMoji](https://openmoji.org) | CC BY-SA 4.0 (attribution + share-alike, check fit) |
| Lottie micro-animations | [LottieFiles](https://lottiefiles.com) free animations | Lottie Simple License; check each file. Easiest in Remotion. |
| Color palette | Build your own tokens; check contrast with [Coolors](https://coolors.co) | n/a |

Brand caution: refer to TypeSafe and Jev by name factually, but don't use their logo or mimic their branding unless they publish a press kit that allows it. Keep the video visibly independent.

### 4.6 Build and finishing

- Node 20+, pnpm or npm, Vite (Motion Canvas's dev server), TypeScript.
- **FFmpeg** for encoding (1080p60 or 4K30, H.264 high profile, CRF ~18) and for muxing narration + music.
- Optional: [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) (free) for final assembly and audio ducking if you prefer a GUI for the last 5%. [OBS](https://obsproject.com) if you want a real screen recording of a live API call.

---

## 5. Connections / accounts you need

| Service | Why | Required? |
|---|---|---|
| **TypeSafe console** (console.typesafe.ai) | Jev API key for the real demo data. Budget is pennies. | Yes |
| Cloudflare Workers AI (`typesafe/jev`) or Vercel AI Gateway | Alternative route to Jev if the console route is awkward. | Optional |
| **An LLM API** (Anthropic Claude API, or OpenAI if you want token logprobs) | Baseline for the speed/cost/confidence comparison. | Recommended |
| Hugging Face | Download Banking77 and the small model for Transformers.js (public, no account needed). | Yes (free) |
| GitHub (this repo) | Source, fixtures, renders tracked by version. | Yes |

Keep keys in `.env` (git-ignored); only the data scripts read them.

---

## 6. The "unique feel": a design direction

- **Core metaphor: probability as physical stuff.** Marbles, sand and weights. Distributions are *piles*, calibration is *whether the piles line up*, a proper score is *a bowl the marble rolls to the bottom of*.
- **Two characters, not two logos.** The LLM is a chatty typewriter that can't stop talking ("Great question! Let me think…"). Jev is a quiet, twitchy reflex creature that answers with a single blink and a number. Kahneman's System 1 / System 2 gives the frame; end by showing they work best together.
- **Look:** warm paper background, Rough.js sketch strokes for anything conceptual, perfectly crisp LaTeX and code for anything exact. That contrast ("sketchy intuition, precise math") *is* the thesis of the video.
- **Sound as information:** tokens tick, decisions chime, probability has pitch.
- **Honesty moments:** a recurring stamp "vendor claim" vs "measured by us" on numbers. It's playful and builds trust.

---

## 7. Suggested repo layout (when we start building)

```
/data-scripts     Node scripts that call Jev / LLM / Transformers.js and write fixtures
/fixtures         JSON outputs (committed, no keys)
/src/scenes       One Motion Canvas scene per segment (00-cold-open.tsx ...)
/src/components   Simplex, ReliabilityDiagram, MarbleBins, RoughBox, TokenTypewriter
/src/lib          metrics.ts (Brier, ECE, isotonic), rough-paths.ts, palette.ts
/audio            narration, sfx, music (with LICENSES.md listing every asset + license)
/renders          output (git-ignored)
```

---

## 8. Sources

- [Introducing System One Models & Jev (TypeSafe blog)](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe docs: Introduction](https://docs.typesafe.ai/introduction) and [API reference](https://docs.typesafe.ai/api)
- [Jev (AI model), Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))
- [MarkTechPost: TypeSafe AI releases Jev](https://www.marktechpost.com/2026/09/19/typesafe-ai-releases-jev/)
- [Community reference on Jev primitives (gist)](https://gist.github.com/pjburnhill/adf8d28efcad9df037bfdece178ef965)
- [MindStudio: RLCD vs RLHF](https://www.mindstudio.ai/blog/typesafe-jev-rlcd-vs-rlhf)
- [Alex Molas: Jev can't be calibrated](https://www.alexmolas.com/2026/09/23/jev-cant-be-calibrated.html) and [HN discussion](https://news.ycombinator.com/item?id=49816899)
- [Jev after eight days of independent tests (DEV)](https://dev.to/gde/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1kln)
- [jev-aita benchmark](https://github.com/dchristopoulos/jev-aita), [jev-benchmark](https://github.com/themsquared/jev-benchmark)
- [Cloudflare Workers AI: typesafe/jev](https://developers.cloudflare.com/ai/models/typesafe/jev/), [LiteLLM pass-through](https://docs.litellm.ai/docs/pass_through/typesafe), [Pydantic AI](https://pydantic.dev/docs/ai/models/typesafe/)
- [Remotion license & pricing](https://www.remotion.dev/docs/license/pricing), [Remotion vs Motion Canvas vs Revideo 2026](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- [GSAP is now free (CSS-Tricks)](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)
- [kokoro-js on npm](https://www.npmjs.com/package/kokoro-js), [HeadTTS](https://github.com/met4citizen/HeadTTS)
