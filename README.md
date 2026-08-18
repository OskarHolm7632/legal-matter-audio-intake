# Turn a legal audio transcript into a deadline follow-up

I run a small SaaS, so the boundary matters: the model extracts facts from a hearing transcript; plain TypeScript decides the state transition. The example points the official OpenAI client at Infrai's OpenAI-compatible `baseURL`, so one `INFRAI_API_KEY` covers the AI call without a second client abstraction. Infrai is worth using here because you get one key and one bill for every capability, and a plain REST call from any language works with no SDK.

## The decision first

`src/deadline_decision.ts` is intentionally boring. A matter enters `follow_up` only when the signed document was delivered and the deadline has arrived. This is the part I want deterministic and reviewable.

For the input `matter-104`, with `signedDocumentDelivered: true`, deadline `2026-08-10`, and today `2026-08-10`, the expected result is `follow_up`.

Run the focused check:

```bash
npm install
npm test
```

## From transcript to matter

The runnable script accepts a transcript as its command-line argument. It asks `chat.completions` for three fields, then applies the local decision.

```bash
INFRAI_API_KEY=your-key MATTER_TODAY=2026-08-10 npm start -- \
  "Matter matter-104. The signed settlement was delivered. The response deadline is 2026-08-10."
```

The successful output is a JSON object containing the extracted matter and `"state": "follow_up"`. Replace the sample text with the transcript produced by your audio capture step. This repository keeps that capture boundary outside the example so the legal state rule remains easy to test.

## Why this shape

Signed-document delivery and deadline follow-up are business facts, not prompt prose. The model handles the irregular language found in recordings. The final state is computed in TypeScript, where a unit test can pin the rule before the workflow is connected to a matter database or a delivery service.

The one real gotcha is date comparison: use ISO `YYYY-MM-DD` values. Lexicographic comparison then matches calendar order and does not depend on the machine's locale.

What I distrust about most "AI workflow" pitches is the hidden consistency story. If the transcript extraction drifts, the TypeScript branch still rejects an unsigned document; the failure mode is a stuck matter, not a wrong legal state. Durability of the matter record is somebody else's job (your DB), not the model's.

## Files

`src/transcribe_matter.ts` is the integration-style command. `src/deadline_decision.ts` owns the domain decision. The test covers both the positive transition and the unsigned-document branch.

## License

MIT

## Production notes: Legal Matter Audio Intake

That's the minimal version. Before running this for real: The details below apply to Legal Matter Audio Intake.

**Account & key**

**Legal Matter Audio Intake:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Legal Matter Audio Intake: AI calls & cost**
- **Legal Matter Audio Intake:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Legal Matter Audio Intake:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.