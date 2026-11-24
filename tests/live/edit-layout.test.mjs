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
  cameras: [],
};

test("adding keeps order and ignores duplicates, with no size limit", () => {
  const ids = Array.from({ length: 50 }, (_, i) => `c${i}`);
  const next = addCameras(addCameras(empty, ["a", "b", "a"]), [...ids, "b"]);
  assert.deepEqual(next.cameras.slice(0, 3), ["a", "b", "c0"]);
  assert.equal(next.cameras.length, 52);
});

test("removal keeps the order of the rest", () => {
  const added = addCameras(empty, ["a", "b", "c"]);
  assert.deepEqual(removeCameras(added, ["b"]).cameras, ["a", "c"]);
});

test("pages split cameras by the local grid size", () => {
  const ids = ["a", "b", "c", "d", "e"];
  assert.equal(pageCount(5, 4), 2);
  assert.equal(pageCount(0, 4), 1);
  assert.deepEqual(pageOf(ids, 1, 4), ["e"]);
});
