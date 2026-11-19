import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyBoxMessage,
  EMPTY_BOXES,
  pickBoxes,
  reasonLabel,
  trimBoxes,
} from "../../features/edge-status/lib/playback-boxes.ts";

const object = (label) => ({ label });
const frame = (ts, ...labels) => ({ ts, objects: labels.map(object) });

const message = (overrides) => ({
  from: 0,
  until: 10_000,
  isReset: false,
  status: null,
  frames: [],
  ...overrides,
});

test("the first message fills the state", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({
      isReset: true,
      status: "ok",
      frames: [frame(2000, "a"), frame(1000, "b")],
    }),
  );
  assert.deepEqual(
    state.frames.map((f) => f.ts),
    [1000, 2000],
  );
});

test("a reset drops everything stored", () => {
  const stored = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(1000, "old"), frame(50_000, "far")] }),
  );
  const state = applyBoxMessage(
    stored,
    message({ isReset: true, from: 90_000, until: 100_000, frames: [] }),
  );
  assert.equal(state.frames.length, 0);
});

test("without reset only the window is replaced", () => {
  const stored = applyBoxMessage(
    EMPTY_BOXES,
    message({
      until: 30_000,
      frames: [frame(1000, "keep"), frame(12_000, "gone"), frame(31_000, "x")],
    }),
  );
  const state = applyBoxMessage(
    stored,
    message({
      from: 10_000,
      until: 20_000,
      frames: [frame(15_000, "new")],
    }),
  );
  assert.deepEqual(
    state.frames.map((f) => f.objects[0].label),
    ["keep", "new", "x"],
  );
});

test("the window is half open: from is replaced, until is kept", () => {
  const stored = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(10_000, "a"), frame(20_000, "b")] }),
  );
  const state = applyBoxMessage(
    stored,
    message({ from: 10_000, until: 20_000, frames: [] }),
  );
  assert.deepEqual(
    state.frames.map((f) => f.ts),
    [20_000],
  );
});

test("the nearest frame at or before the shown time is picked", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(1000, "a"), frame(1400, "b"), frame(1900, "c")] }),
  );
  assert.equal(pickBoxes(state, 1400)?.[0].label, "b");
  assert.equal(pickBoxes(state, 1399)?.[0].label, "a");
  assert.equal(pickBoxes(state, 1600)?.[0].label, "b");
});

test("nothing is picked before the first frame", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(1000, "a")] }),
  );
  assert.equal(pickBoxes(state, 999), null);
  assert.equal(pickBoxes(EMPTY_BOXES, 5000), null);
});

test("an empty frame clears the previous box", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(1000, "a"), frame(1400)] }),
  );
  assert.deepEqual(pickBoxes(state, 1500), []);
});

test("the stale guard refuses a frame too far behind", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ frames: [frame(1000, "a")] }),
  );
  assert.ok(pickBoxes(state, 2000));
  assert.equal(pickBoxes(state, 2001), null);
  assert.ok(pickBoxes(state, 2400, 1500));
  assert.equal(pickBoxes(state, 2600, 1500), null);
});

test("a status other than ok hides the boxes until a new one arrives", () => {
  const ok = applyBoxMessage(
    EMPTY_BOXES,
    message({ status: "ok", frames: [frame(1000, "a")] }),
  );
  const blocked = applyBoxMessage(
    ok,
    message({ from: 20_000, until: 30_000, status: "not_analysed" }),
  );
  assert.equal(pickBoxes(blocked, 1000), null);
  const kept = applyBoxMessage(
    blocked,
    message({ from: 30_000, until: 40_000 }),
  );
  assert.equal(kept.status, "not_analysed");
  const back = applyBoxMessage(
    kept,
    message({ from: 50_000, until: 60_000, status: "ok" }),
  );
  assert.ok(pickBoxes(back, 1000));
});

test("an approximate status still shows boxes", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ status: "approximate", frames: [frame(1000, "a")] }),
  );
  assert.ok(pickBoxes(state, 1000));
});

test("an unknown status is treated as no boxes", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({ status: "mystery", frames: [frame(1000, "a")] }),
  );
  assert.equal(pickBoxes(state, 1000), null);
  assert.equal(typeof reasonLabel("mystery"), "string");
});

test("old frames are trimmed but the covering frame stays", () => {
  const state = applyBoxMessage(
    EMPTY_BOXES,
    message({
      until: 100_000,
      frames: [frame(1000, "a"), frame(5000, "b"), frame(40_000, "c")],
    }),
  );
  const trimmed = trimBoxes(state, 45_000, 30_000);
  assert.deepEqual(
    trimmed.frames.map((f) => f.ts),
    [5000, 40_000],
  );
  assert.equal(pickBoxes(trimmed, 45_000, 99_999)?.[0].label, "c");
  assert.equal(trimBoxes(state, 20_000, 30_000), state);
});
