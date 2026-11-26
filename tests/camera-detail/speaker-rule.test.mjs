import assert from "node:assert/strict";
import { test } from "node:test";
import {
  OFF_SPEAKER_RULE,
  speakerRuleDraftSchema,
  toSpeakerRuleDraft,
  toSpeakerRulePayload,
} from "../../features/camera-detail/lib/edit-speaker-rule.ts";

const AUDIO = "01JB8Z3X9K4Q7M2T5V6W8Y0A7B";
const on = {
  ...OFF_SPEAKER_RULE,
  isOn: true,
  speakerIds: ["7"],
  audioId: AUDIO,
  kinds: ["area_dwell"],
};

const issues = (draft) => {
  const result = speakerRuleDraftSchema.safeParse(draft);
  return result.success
    ? []
    : result.error.issues.map((i) => `${i.path[0]}: ${i.message}`);
};

test("a rule that is off is never validated", () => {
  assert.deepEqual(issues(OFF_SPEAKER_RULE), []);
});

test("a rule needs a speaker, an audio file and a trigger", () => {
  assert.deepEqual(issues(on), []);
  assert.deepEqual(issues({ ...on, speakerIds: [] }), [
    "speakerIds: Choose at least one speaker.",
  ]);
  assert.deepEqual(issues({ ...on, audioId: "" }), [
    "audioId: Choose an audio file.",
  ]);
  assert.deepEqual(issues({ ...on, kinds: [], labels: [] }), [
    "kinds: Choose at least one alarm type or label.",
  ]);
  assert.deepEqual(issues({ ...on, kinds: [], labels: ["person"] }), []);
});

test("repeat, duration and cooldown stay in range", () => {
  assert.equal(issues({ ...on, repeatCount: 0 }).length, 1);
  assert.equal(issues({ ...on, repeatCount: 11 }).length, 1);
  assert.equal(issues({ ...on, maxDurationSeconds: 601 }).length, 1);
  assert.equal(issues({ ...on, cooldownSeconds: -1 }).length, 1);
  assert.equal(issues({ ...on, repeatCount: Number.NaN }).length, 1);
});

test("a schedule needs days, a time zone and HH:MM times", () => {
  const scheduled = { ...on, hasSchedule: true };
  assert.deepEqual(issues(scheduled), []);
  assert.deepEqual(issues({ ...scheduled, days: [] }), [
    "days: Choose at least one day.",
  ]);
  assert.deepEqual(issues({ ...scheduled, start: "25:00", timezone: " " }), [
    "timezone: Time zone is required.",
    "start: Use the HH:MM format.",
  ]);
  assert.deepEqual(issues({ ...on, hasSchedule: false, days: [] }), []);
});

test("the payload leaves out an empty trigger list and a schedule that is off", () => {
  assert.deepEqual(toSpeakerRulePayload({ ...on, labels: [] }), {
    isEnabled: true,
    speakerIds: ["7"],
    audio: { audioId: AUDIO, repeatCount: 1, maxDurationSeconds: 15 },
    trigger: { kinds: ["area_dwell"], labels: undefined, cooldownSeconds: 0 },
    schedule: null,
  });
});

test("a schedule is sent with its days in week order", () => {
  const payload = toSpeakerRulePayload({
    ...on,
    hasSchedule: true,
    days: ["sun", "mon"],
  });
  assert.deepEqual(payload.schedule, {
    timezone: "Asia/Jakarta",
    days: ["mon", "sun"],
    start: "18:00",
    end: "06:00",
  });
});

test("a stored rule becomes a draft and back", () => {
  const rule = {
    isEnabled: true,
    speakerIds: ["7", "9"],
    audio: { audioId: AUDIO, repeatCount: 2, maxDurationSeconds: 30 },
    trigger: { kinds: null, labels: ["person"], cooldownSeconds: 60 },
    schedule: {
      timezone: "Asia/Jakarta",
      days: ["mon", "tue"],
      start: "20:00",
      end: "05:00",
    },
  };
  const draft = toSpeakerRuleDraft(rule);
  assert.equal(draft.isOn, true);
  assert.deepEqual(draft.kinds, []);
  assert.deepEqual(toSpeakerRulePayload(draft), {
    isEnabled: true,
    speakerIds: ["7", "9"],
    audio: { audioId: AUDIO, repeatCount: 2, maxDurationSeconds: 30 },
    trigger: { kinds: undefined, labels: ["person"], cooldownSeconds: 60 },
    schedule: rule.schedule,
  });
  assert.deepEqual(toSpeakerRuleDraft(null), OFF_SPEAKER_RULE);
});
