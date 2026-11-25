import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ALARM_KIND_LABEL,
  alarmKindLabel,
  recognizerLabel,
} from "../config/display-labels.ts";

test("a known alarm kind uses the canonical label", () => {
  assert.equal(alarmKindLabel("ppe_missing", "PPE Violation"), "PPE violation");
  assert.equal(
    alarmKindLabel("fire_smoke_detected", "Fire Smoke Alarm"),
    "Fire and smoke alarm",
  );
});

test("an unknown kind falls back to the edge title", () => {
  assert.equal(
    alarmKindLabel("new_kind", "Brand New Alarm"),
    "Brand New Alarm",
  );
});

test("an unknown kind without a title is made readable", () => {
  assert.equal(alarmKindLabel("new_kind"), "New kind");
  assert.equal(alarmKindLabel(""), "");
});

test("recognizer ids have labels and a safe fallback", () => {
  assert.equal(recognizerLabel("face_recognition"), "Face recognition");
  assert.equal(recognizerLabel("custom_thing"), "Custom thing");
});

test("every label is sentence case", () => {
  for (const label of Object.values(ALARM_KIND_LABEL)) {
    assert.ok(!/ [A-Z][a-z]/.test(label), label);
  }
});
