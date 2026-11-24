import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addCameras,
  pageCount,
  pageOf,
  removeCameras,
} from "../../features/live/lib/edit-layout.ts";

const empty = {
  id: "1",
  name: "L",
  description: null,
  isDefault: false,
  rows: 1,
  columns: 6,
  slots: Array(6).fill(null),
};

test("adding past the stored grid grows it instead of refusing", () => {
  const ids = Array.from({ length: 8 }, (_, i) => `c${i}`);
  const next = addCameras(empty, ids);
  assert.equal(next.rows, 2);
  assert.equal(next.slots.length, 12);
  assert.deepEqual(next.slots.slice(0, 8), ids);
  assert.equal(next.slots[8], null);
});

test("duplicates are ignored and removal compacts the order", () => {
  const added = addCameras(empty, ["a", "b", "a", "c"]);
  assert.deepEqual(added.slots.slice(0, 3), ["a", "b", "c"]);
  const removed = removeCameras(added, ["b"]);
  assert.deepEqual(removed.slots.slice(0, 3), ["a", "c", null]);
  assert.equal(removed.rows, 1);
});

test("pages split cameras by the local grid size", () => {
  const ids = ["a", "b", "c", "d", "e"];
  assert.equal(pageCount(5, 4), 2);
  assert.equal(pageCount(0, 4), 1);
  assert.deepEqual(pageOf(ids, 1, 4), ["e"]);
});
