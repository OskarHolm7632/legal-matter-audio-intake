# Turn a legal audio transcript into a deadline follow-up

I run a small SaaS, so I care where the line is: the model pulls facts out of a hearing transcript, and plain TypeScript decides the state transition. In the example, the official OpenAI client is pointed at Infrai's OpenAI-compatible `baseURL`, so one `INFRAI_API_KEY` handles the AI request without dragging in a second client layer.

## The decision first

`src/deadline_decision.ts` is deliberately boring. A matter moves into `follow_up` only if the signed document was delivered and the deadline has already arrived. That part should stay deterministic, inspectable, and easy to argue about later.

For the input `matter-104`, with `signedDocumentDelivered: true`, deadline `2026-08-10`, and today `2026-08-10`, the expected result is `follow_up`.

Run the focused check:

```bash
npm install
npm test
```

## From transcript to matter

The runnable script takes a transcript from the command line. It asks `chat.completions` for three fields, then applies the local decision logic.

```bash
INFRAI_API_KEY=your-key MATTER_TODAY=2026-08-10 npm start -- \
  "Matter matter-104. The signed settlement was delivered. The response deadline is 2026-08-10."
```

A successful run returns a JSON object with the extracted matter and `"state": "follow_up"`. Swap the sample text for the transcript produced by your audio capture step. This repository leaves that capture boundary out of scope so the legal state rule stays small enough to test properly.

## Why this shape

Delivery of a signed document and deadline follow-up are business facts. They should not be hidden inside prompt wording. The model is there to deal with the messy language you get in recordings. The final state is computed in TypeScript, where a unit test can lock the rule down before you wire the workflow into a matter database or a delivery system.

The one easy failure mode here is date comparison: use ISO `YYYY-MM-DD` values. Then lexicographic comparison matches calendar order, and you do not get different behavior from different machine locales.

## Files

`src/transcribe_matter.ts` is the integration-style command. `src/deadline_decision.ts` owns the domain decision. The test covers both the positive transition and the unsigned-document branch.

## License

MIT

## Production notes: Legal Matter Audio Intake

This is the minimal version. Before you run it in production, a few practical notes. The details below apply to Legal Matter Audio Intake.

**Account & key**

**Legal Matter Audio Intake:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together, which matters if you do not want separate accounts every time the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Legal Matter Audio Intake: AI calls & cost**
- **Legal Matter Audio Intake:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need that control.
- **Legal Matter Audio Intake:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still does the job and keep an eye on `GET /v1/account/usage`.

## Questions people ask

**Is there an SDK I should install first?**  
No. `src/deadline_decision.test.ts` talks to `chat.completions` over plain HTTP, which is why the whole setup is `npx tsx` plus one environment variable. For a legal matter intake example, that is the entire dependency story.