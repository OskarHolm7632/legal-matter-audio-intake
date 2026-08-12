import test from "node:test";
import assert from "node:assert/strict";
import { nextMatterState } from "./deadline_decision.ts";

test("signed delivery at a reached deadline enters follow-up", () => {
  const state = nextMatterState({
    matterId: "matter-104",
    signedDocumentDelivered: true,
    deadline: "2026-08-10"
  }, "2026-08-10");

  assert.equal(state, "follow_up");
});

test("an unsigned document stays in intake", () => {
  const state = nextMatterState({
    matterId: "matter-105",
    signedDocumentDelivered: false,
    deadline: "2026-08-10"
  }, "2026-08-11");

  assert.equal(state, "intake");
});
