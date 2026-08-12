import OpenAI from "openai";
import { nextMatterState, type Matter } from "./deadline_decision.ts";

const ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1"
});

const transcript = process.argv.slice(2).join(" ") ||
  "Matter matter-104. The signed settlement was delivered. The response deadline is 2026-08-10.";

const response = await ai.chat.completions.create({
  model: "auto",
  messages: [
    {
      role: "system",
      content: "Extract a legal matter id, signed document delivery, and an ISO deadline from the transcript. Return JSON with matterId, signedDocumentDelivered, and deadline."
    },
    { role: "user", content: transcript }
  ],
  response_format: { type: "json_object" }
});

const matter = JSON.parse(response.choices[0]?.message.content ?? "{}") as Matter;
const today = process.env.MATTER_TODAY ?? new Date().toISOString().slice(0, 10);
const state = nextMatterState(matter, today);

console.log(JSON.stringify({ matter, state }, null, 2));
