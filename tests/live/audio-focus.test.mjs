import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAudioFocus,
  releaseAudio,
  setAudioActive,
  setAudioAvailable,
} from "../../features/live/lib/audio-focus.ts";

test("everything is muted by default", () => {
  assert.equal(getAudioFocus().activeId, null);
});

test("only one camera can have the speaker on", () => {
  setAudioAvailable("a", true);
  setAudioAvailable("b", true);
  setAudioActive("a", true);
  assert.equal(getAudioFocus().activeId, "a");
  setAudioActive("b", true);
  assert.equal(getAudioFocus().activeId, "b");
  setAudioActive("a", false);
  assert.equal(getAudioFocus().activeId, "b");
  setAudioActive("b", false);
  assert.equal(getAudioFocus().activeId, null);
});

test("a reconnect keeps the speaker choice, leaving the screen drops it", () => {
  setAudioActive("a", true);
  setAudioAvailable("a", false);
  assert.equal(getAudioFocus().activeId, "a");
  setAudioAvailable("a", true);
  assert.equal(getAudioFocus().activeId, "a");
  releaseAudio("a");
  assert.equal(getAudioFocus().activeId, null);
  assert.ok(!getAudioFocus().available.has("a"));
  assert.ok(getAudioFocus().available.has("b"));
});
