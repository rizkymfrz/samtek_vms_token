import assert from "node:assert/strict";
import { test } from "node:test";
import {
  audioFileProblem,
  formatBytes,
} from "../../features/speakers/lib/audio-files.ts";
import { statusOf } from "../../features/speakers/lib/calls.ts";

const file = (name, size) => ({ name, size });

test("only a WAV or MP3 file up to 5 MB is accepted", () => {
  assert.equal(audioFileProblem(null), "Choose an audio file.");
  assert.equal(audioFileProblem(file("a.wav", 10)), null);
  assert.equal(audioFileProblem(file("A.MP3", 10)), null);
  assert.equal(audioFileProblem(file("a.ogg", 10)), "Use a WAV or MP3 file.");
  assert.equal(audioFileProblem(file("a.mp3", 0)), "The file is empty.");
  assert.equal(
    audioFileProblem(file("a.mp3", 5 * 1024 * 1024 + 1)),
    "The file is larger than 5 MB.",
  );
});

test("sizes read as KB below one MB", () => {
  assert.equal(formatBytes(128044), "125 KB");
  assert.equal(formatBytes(2 * 1024 * 1024), "2.0 MB");
});

test("a play status has a label, and an unknown one is humanized", () => {
  assert.equal(statusOf("success").label, "Played");
  assert.equal(statusOf("skipped_schedule").label, "Outside schedule");
  assert.equal(statusOf("brand_new").label, "brand new");
});
