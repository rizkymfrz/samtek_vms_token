import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addCameras,
  pageCount,
  pageOf,
  placeCamera,
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

test("removal keeps the positions of the rest", () => {
  const added = addCameras(empty, ["a", "b", "c"]);
  assert.deepEqual(removeCameras(added, ["b"]).cameras, ["a", null, "c"]);
});

test("pages split cameras by the local grid size", () => {
  const ids = ["a", "b", "c", "d", "e"];
  assert.equal(pageCount(5, 4), 2);
  assert.equal(pageCount(0, 4), 1);
  assert.deepEqual(pageOf(ids, 1, 4), ["e"]);
});

test("placing on an empty slot keeps the position and leaves gaps", () => {
  const base = addCameras(empty, ["a", "b"]);
  assert.deepEqual(placeCamera(base, "x", 4).cameras, [
    "a",
    "b",
    null,
    null,
    "x",
  ]);
  assert.deepEqual(placeCamera(placeCamera(base, "x", 4), "a", 3).cameras, [
    null,
    "b",
    null,
    "a",
    "x",
  ]);
});

test("placing a new camera on a taken slot inserts it", () => {
  const base = addCameras(empty, ["a", "b", "c"]);
  assert.deepEqual(placeCamera(base, "x", 1).cameras, ["a", "x", "b", "c"]);
});

test("placing a camera already in the layout swaps it with the slot", () => {
  const base = addCameras(empty, ["a", "b", "c"]);
  assert.deepEqual(placeCamera(base, "a", 2).cameras, ["c", "b", "a"]);
});

test("adding fills gaps first and removing keeps the other positions", () => {
  const gapped = placeCamera(addCameras(empty, ["a"]), "x", 3);
  assert.deepEqual(addCameras(gapped, ["y"]).cameras, ["a", "y", null, "x"]);
  assert.deepEqual(removeCameras(gapped, ["x"]).cameras, ["a"]);
});
