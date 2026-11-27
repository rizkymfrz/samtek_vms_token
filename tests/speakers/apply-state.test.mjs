import assert from "node:assert/strict";
import { test } from "node:test";
import { applyState } from "../../features/speakers/lib/apply-state.ts";

test("a speaker without a reported result is pending", () => {
  assert.equal(applyState({ applyStatus: null }), "pending");
  assert.equal(applyState({ applyStatus: "rejected" }), "rejected");
});
