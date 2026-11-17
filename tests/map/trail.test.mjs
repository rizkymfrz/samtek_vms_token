import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appendFix,
  chunkTrail,
  startOfDay,
  thinTrail,
  trailOf,
} from "../../features/map/lib/trail.ts";

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

test("a live fix is appended to the history once", () => {
  const live = { latitude: -6.22, longitude: 106.82, fixedAt: 3000 };
  const next = appendFix(history, live, 9999);
  assert.equal(next.length, 3);
  assert.equal(next.at(-1).fixedAt, 3000);
  assert.equal(appendFix(next, live, 9999).length, 3);
});

test("a fix without a time takes the current time", () => {
  const live = { latitude: -6.3, longitude: 106.9, fixedAt: null };
  assert.equal(appendFix(history, live, 5000).at(-1).fixedAt, 5000);
});

test("start of day is local midnight", () => {
  const noon = new Date(2026, 10, 17, 12, 30).getTime();
  assert.equal(startOfDay(noon), new Date(2026, 10, 17).getTime());
});

test("thinning drops points closer than a few meters but keeps the ends", () => {
  const line = [
    [106.8, -6.2],
    [106.800001, -6.2],
    [106.8001, -6.2],
    [106.800101, -6.2],
  ];
  assert.deepEqual(thinTrail(line), [line[0], line[2], line[3]]);
});

test("chunks overlap by one point so the line stays joined", () => {
  const line = Array.from({ length: 150 }, (_, i) => [106.8 + i * 0.001, -6.2]);
  const chunks = chunkTrail(line);
  assert.equal(chunks.length, 2);
  assert.deepEqual(chunks[0].at(-1), chunks[1][0]);
});
