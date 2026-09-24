// Replace the illustrative wheel odds in fixtures/track-layer.json with REAL next-token
// distributions from a small open model running locally via Transformers.js.
//
// Needs Hugging Face access (not available in the cloud container this repo was built in), so it
// has not been run yet. Setup and run on your machine:
//   npm i -D @huggingface/transformers
//   node data-scripts/llm-next-token.mjs
//
// The story needs one "unlucky" draw: the script decodes greedily, except at step UNLUCKY_STEP where
// it deliberately takes the most likely token under 10% (what ordinary sampling does now and then).
// That choice is recorded in the fixture note so the film stays honest about it.
import {readFileSync, writeFileSync} from 'node:fs';
import {AutoModelForCausalLM, AutoTokenizer, Tensor} from '@huggingface/transformers';

const MODEL = process.env.MODEL ?? 'HuggingFaceTB/SmolLM2-135M-Instruct';
const STEPS = 9;
const UNLUCKY_STEP = 6;
const TOP_K = 5;

const path = new URL('../fixtures/track-layer.json', import.meta.url);
const fixture = JSON.parse(readFileSync(path, 'utf8'));

const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
const model = await AutoModelForCausalLM.from_pretrained(MODEL, {dtype: 'fp32'});

const messages = [{role: 'user', content: `${fixture.email}\n\n${fixture.question}`}];
let ids = tokenizer.apply_chat_template(messages, {add_generation_prompt: true, tokenize: true, return_tensor: false});

const softmax = (logits) => {
	let max = -Infinity;
	for (const v of logits) max = Math.max(max, v);
	const exps = logits.map((v) => Math.exp(v - max));
	const sum = exps.reduce((a, b) => a + b, 0);
	return exps.map((v) => v / sum);
};

const steps = [];
for (let step = 0; step < STEPS; step++) {
	const input_ids = new Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]);
	const attention_mask = new Tensor('int64', BigInt64Array.from(ids.map(() => 1n)), [1, ids.length]);
	const {logits} = await model({input_ids, attention_mask});
	const vocab = logits.dims[2];
	const last = Array.from(logits.data.slice((ids.length - 1) * vocab, ids.length * vocab));
	const probs = softmax(last);
	const ranked = probs.map((p, id) => ({id, p})).sort((a, b) => b.p - a.p);
	let pick = ranked[0];
	if (step === UNLUCKY_STEP) pick = ranked.slice(1, 50).find((r) => r.p < 0.1) ?? pick;
	const shown = ranked.slice(0, TOP_K);
	if (!shown.some((r) => r.id === pick.id)) shown.push(pick);
	const decode = (id) => tokenizer.decode([id], {skip_special_tokens: false});
	steps.push({
		chosen: decode(pick.id),
		options: shown.map((r) => ({t: decode(r.id), p: Number(r.p.toFixed(4))})),
	});
	console.log(`step ${step}: ${JSON.stringify(decode(pick.id))} p=${pick.p.toFixed(3)}`);
	ids = [...ids, pick.id];
}

fixture.steps = steps;
fixture.status = fixture.jev.status === 'measured' ? 'measured' : 'partial';
fixture.note = `Wheel odds measured with ${MODEL} via Transformers.js (greedy decoding; step ${UNLUCKY_STEP} deliberately takes the most likely token under 10%). Jev answer: ${fixture.jev.status}.`;
writeFileSync(path, `${JSON.stringify(fixture, null, '\t')}\n`);
console.log('updated fixtures/track-layer.json; re-render with npm run render:track-layer');
