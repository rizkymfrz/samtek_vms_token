import assert from "node:assert/strict";
import { test } from "node:test";
import { streamName } from "../../features/live/lib/relay-url.ts";
import { setStreamPreference } from "../../features/live/lib/stream-preference-store.ts";
import {
  availableQualities,
  resolveQuality,
} from "../../features/live/lib/stream-quality.ts";

const all = { hasSubStream: true, hasThirdStream: true };
const mainOnly = { hasSubStream: false, hasThirdStream: false };

test("only the streams a camera has are offered", () => {
  assert.deepEqual(availableQualities(all), ["main", "sub", "third"]);
  assert.deepEqual(availableQualities(mainOnly), ["main"]);
});

test("a per-camera choice beats the global quality", () => {
  assert.equal(resolveQuality("third", "sub", all), "third");
  assert.equal(resolveQuality("main", "sub", all), "main");
});

test("without a choice the global quality applies", () => {
  assert.equal(resolveQuality(undefined, "sub", all), "sub");
});

test("an unavailable choice falls back to the global quality, then main", () => {
  assert.equal(
    resolveQuality("third", "sub", {
      hasSubStream: true,
      hasThirdStream: false,
    }),
    "sub",
  );
  assert.equal(resolveQuality("third", "sub", mainOnly), "main");
});

test("stream names follow the resolved quality", () => {
  assert.equal(streamName("7", "third", false), "dev7_third");
  assert.equal(streamName("7", "sub", true), "dev7_sub");
  assert.equal(streamName("7", "sub", false), "dev7_main");
});

test("saving a choice keeps other cameras and ignores no-ops", () => {
  const state = { byDevice: { 1: "sub" } };
  const next = setStreamPreference(state, "2", "third");
  assert.deepEqual(next.byDevice, { 1: "sub", 2: "third" });
  assert.equal(setStreamPreference(next, "2", "third"), next);
});
