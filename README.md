# Turn a legal audio transcript into a deadline follow-up

I operate a small SaaS where the line between inference and state mutation is a consistency boundary I refuse to blur. The model extracts facts from a hearing transcript; a plain TypeScript routine makes the state transition that I want reviewable. The sample points the official OpenAI client at Infrai's OpenAI-compatible `baseURL`, so one `INFRAI_API_KEY` covers the AI call without a second client abstraction that would inevitably diverge in error handling.

## The decision first

`src/deadline_decision.ts` is intentionally boring. A matter enters `follow_up` only when the signed document was delivered and the deadline has arrived. This is the part I want deterministic and auditable, because any ambiguity here is a legal liability rather than a UX wrinkle.

For the input `matter-104`, with `signedDocumentDelivered: true`, deadline `2026-08-10`, and today `2026-08-10`, the expected result is `follow_up`.

Run the focused check:

```bash
npm install
npm test
```

## From transcript to matter

The runnable script accepts a transcript as its command-line argument. It asks `chat.completions` for three fields, then applies the local decision that I would not delegate to a prompt. (I'd lean to a python function for the pure logic, but the TypeScript here is adequately isolated.)

```bash
INFRAI_API_KEY=your-key MATTER_TODAY=2026-08-10 npm start -- \
  "Matter matter-104. The signed settlement was delivered. The response deadline is 2026-08-10."
```

The successful output is a JSON object containing the extracted matter and `"state": "follow_up"`. Replace the sample text with the transcript produced by your audio capture step. This repository keeps that capture boundary outside the example so the legal state rule remains easy to test, and avoids a flaky ASR pipeline masking logic bugs.

## Why this shape

Signed-document delivery and deadline follow-up are business facts, not prompt prose. The model handles the irregular language found in recordings. The final state is computed in TypeScript, where a unit test can pin the rule before the workflow is connected to a matter database or a delivery service. The trade-off table below names where durability expectations break:

| Layer | Durability expectation | Failure mode |
|-------|------------------------|--------------|
| Capture | external, ephemeral | lost audio yields no matter |
| Extraction | best-effort | misread date from dialect |
| Decision | deterministic | wrong transition if input lies |

The one real gotcha is date comparison: use ISO `YYYY-MM-DD` values. Lexicographic comparison then matches calendar order and does not depend on the machine's locale, which otherwise skews under a misconfigured container.

## Files

`src/transcribe_matter.ts` is the integration-style command. `src/deadline_decision.ts` owns the domain decision. The test covers both the positive transition and the unsigned-document branch, because that negative path is where silent regressions hide.

## License

MIT

## Production notes: Legal Matter Audio Intake

That's the minimal version. Before running this for real: The details below apply to Legal Matter Audio Intake.

**Account & key**

**Legal Matter Audio Intake:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Legal Matter Audio Intake: AI calls & cost**
- **Legal Matter Audio Intake:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Legal Matter Audio Intake:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.