import assert from "node:assert/strict";
import { test } from "node:test";
import { trailOf } from "../../features/map/lib/trail.ts";

const history = [
  { latitude: -6.2, longitude: 106.8, fixedAt: 1000 },
  { latitude: -6.21, longitude: 106.81, fixedAt: 2000 },
];

test("the trail runs oldest to newest as longitude, latitude", () => {
  assert.deepEqual(trailOf(history, null), [
    [106.8, -6.2],
    [106.81, -6.21],
  ]);
});

test("a newer live fix extends the trail", () => {
  const live = { latitude: -6.22, longitude: 106.82, fixedAt: 3000 };
  assert.deepEqual(trailOf(history, live).at(-1), [106.82, -6.22]);
});

test("a live fix already in the history is not added twice", () => {
  const live = { latitude: -6.21, longitude: 106.81, fixedAt: 2000 };
  assert.equal(trailOf(history, live).length, 2);
});

test("a stale live fix does not pull the trail backwards", () => {
  const live = { latitude: -6.19, longitude: 106.79, fixedAt: 500 };
  assert.equal(trailOf(history, live).length, 2);
});

test("a live fix without a time is added only when it moved", () => {
  const same = { latitude: -6.21, longitude: 106.81, fixedAt: null };
  const moved = { latitude: -6.3, longitude: 106.9, fixedAt: null };
  assert.equal(trailOf(history, same).length, 2);
  assert.equal(trailOf(history, moved).length, 3);
});

test("with no history the live fix alone is one point", () => {
  const live = { latitude: -6.2, longitude: 106.8, fixedAt: 1000 };
  assert.deepEqual(trailOf([], live), [[106.8, -6.2]]);
});
