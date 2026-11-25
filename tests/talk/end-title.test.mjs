import assert from "node:assert/strict";
import { test } from "node:test";
import { endText, endTitle } from "../../features/talk/lib/talk-session.ts";

test("a talk that never started is titled as a failure to start", () => {
  for (const reason of ["failed", "rejected", "timeout"]) {
    assert.equal(endTitle(reason), "Failed to start talk");
  }
});

test("a talk that stopped midway is titled as ended", () => {
  for (const reason of [
    "replaced",
    "idle",
    "device_removed",
    "edge_offline",
    "connection_lost",
  ]) {
    assert.equal(endTitle(reason), "Talk ended");
  }
});

test("end text names the camera and the edge server", () => {
  assert.equal(endText("failed", null), "The camera could not be reached.");
  assert.equal(
    endText("rejected", "Busy."),
    "The edge server refused to start talk. Busy.",
  );
});
