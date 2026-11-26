import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detailOf,
  statusOfPpe,
  toneOf,
  visibleObjects,
} from "../../features/edge-status/lib/detection-status.ts";

const base = {
  label: "person",
  confidence: 0.9,
  trackId: null,
  status: null,
  missingItems: null,
  isPpe: false,
  score: null,
  peopleCount: null,
  peopleLimit: null,
  staySeconds: null,
  maxStaySeconds: null,
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 1,
};

test("a crowd box shows the count against its limit", () => {
  assert.equal(detailOf({ ...base, peopleCount: 6, peopleLimit: 5 }), "6/5");
});

test("a dwell box shows the stay against its limit", () => {
  assert.equal(
    detailOf({ ...base, staySeconds: 12.4, maxStaySeconds: 30 }),
    "12s/30s",
  );
});

test("a stay of zero and no score show nothing", () => {
  assert.equal(detailOf({ ...base, staySeconds: 0 }), "");
});

test("a score is shown as a percent", () => {
  assert.equal(detailOf({ ...base, score: 0.834 }), "83%");
});

const colorOf = (status, analyticId) => toneOf({ ...base, status }, analyticId);

test("no status is blue, ok is green, warning and alert are red", () => {
  assert.equal(colorOf(null, "people_counting_dwelling"), "text-detect-blue");
  assert.equal(colorOf("unknown", "people_sleep_on_duty"), "text-detect-blue");
  assert.equal(colorOf("ok", "ppe_violation"), "text-detect-green");
  assert.equal(colorOf("warning", "phone_calling"), "text-detect-red");
  assert.equal(colorOf("alert", "people_crowd_monitoring"), "text-detect-red");
});

test("analytics that only report problems draw red without a status", () => {
  for (const id of [
    "fire_smoke",
    "cat_detection",
    "dust_spreading",
    "motion",
    "speed_violation",
  ]) {
    assert.equal(colorOf(null, id), "text-detect-red");
  }
  assert.equal(colorOf(null, undefined), "text-detect-blue");
});

test("ppe status follows what the worker is missing", () => {
  const missing = { ppe: { status: "violation", missing: ["helmet"] } };
  assert.equal(statusOfPpe(missing), "warning");
  assert.equal(
    statusOfPpe({ ppe: { status: "compliant", missing: [] } }),
    "ok",
  );
  assert.equal(
    statusOfPpe({ ppe: { status: "unknown", missing: [] } }),
    "unknown",
  );
  assert.equal(statusOfPpe({ missing_items: [] }), "ok");
  assert.equal(statusOfPpe({}), null);
});

test("on a ppe frame only the workers are drawn", () => {
  const worker = { ...base, isPpe: true };
  const helmet = { ...base, label: "Safety-Helmet" };
  assert.deepEqual(visibleObjects([worker, helmet], null), [worker]);
  assert.deepEqual(visibleObjects([helmet], "ppe_violation"), []);
  assert.deepEqual(visibleObjects([helmet], "motion"), [helmet]);
});
