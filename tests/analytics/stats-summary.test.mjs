import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chartRows,
  clock,
  labelsOf,
  summarize,
} from "../../features/analytics/lib/stats-summary.ts";

const stats = {
  bucket: "day",
  buckets: [Date.UTC(2026, 10, 17), Date.UTC(2026, 10, 18)],
  counting: [
    {
      perimeter: "A",
      direction: "Entry",
      label: "car",
      count: 3,
      counts: [1, 2],
    },
    {
      perimeter: "A",
      direction: "Exit",
      label: "car",
      count: 4,
      counts: [4, 0],
    },
    {
      perimeter: "A",
      direction: "Entry",
      label: "truck",
      count: 1,
      counts: [0, 1],
    },
  ],
  dwelling: [
    {
      perimeter: "Area 1",
      label: "car",
      objects: 4,
      staySeconds: 1000,
      objectsByBucket: [4, 0],
      stayByBucket: [600, 400],
    },
  ],
};

test("labels come from both counting and dwelling, sorted", () => {
  assert.deepEqual(labelsOf(stats), ["car", "truck"]);
});

test("a summary adds every direction and averages stay per object", () => {
  const all = summarize(stats, null);
  assert.equal(all.total, 8);
  assert.equal(all.objects, 4);
  assert.equal(all.averageStaySeconds, 250);
  assert.equal(all.peakIndex, 0);
  assert.equal(all.peakActivity, 9);
});

test("filtering by label leaves the other labels out", () => {
  assert.equal(summarize(stats, "truck").total, 1);
  assert.equal(summarize(stats, "truck").peakIndex, 1);
});

test("an empty range has no busiest bucket and a zero average", () => {
  const empty = { ...stats, counting: [], dwelling: [] };
  const summary = summarize(empty, null);
  assert.equal(summary.peakIndex, null);
  assert.equal(summary.averageStaySeconds, 0);
});

test("chart rows stack the labels and show stay in minutes", () => {
  const rows = chartRows(stats, "count", ["car", "truck"]);
  assert.deepEqual([rows[0].s0, rows[0].s1, rows[1].s0], [5, 0, 2]);
  assert.equal(chartRows(stats, "stay", ["car"])[0].s0, 10);
});

test("clock pads hours, minutes and seconds", () => {
  assert.equal(clock(755), "00:12:35");
  assert.equal(clock(3661), "01:01:01");
});
