import { z } from "zod";
import {
  AUDIO_ID,
  CLOCK,
  MAX_COOLDOWN_SECONDS,
  MAX_DURATION_SECONDS,
  MAX_REPEAT_COUNT,
  MAX_RULE_SPEAKERS,
  SPEAKER_DAYS,
  type SpeakerRule,
  type SpeakerRuleInput,
} from "@/lib/api/speaker-rule";

export const DEFAULT_TIMEZONE = "Asia/Jakarta";

export type SpeakerRuleDraft = {
  isOn: boolean;
  speakerIds: string[];
  audioId: string;
  repeatCount: number;
  maxDurationSeconds: number;
  kinds: string[];
  labels: string[];
  cooldownSeconds: number;
  hasSchedule: boolean;
  timezone: string;
  days: string[];
  start: string;
  end: string;
};

export const OFF_SPEAKER_RULE: SpeakerRuleDraft = {
  isOn: false,
  speakerIds: [],
  audioId: "",
  repeatCount: 1,
  maxDurationSeconds: 15,
  kinds: [],
  labels: [],
  cooldownSeconds: 0,
  hasSchedule: false,
  timezone: DEFAULT_TIMEZONE,
  days: [...SPEAKER_DAYS],
  start: "18:00",
  end: "06:00",
};

export const toSpeakerRuleDraft = (
  rule: SpeakerRule | null | undefined,
): SpeakerRuleDraft =>
  rule
    ? {
        isOn: rule.isEnabled,
        speakerIds: rule.speakerIds,
        audioId: rule.audio.audioId,
        repeatCount: rule.audio.repeatCount,
        maxDurationSeconds: rule.audio.maxDurationSeconds,
        kinds: rule.trigger.kinds ?? [],
        labels: rule.trigger.labels ?? [],
        cooldownSeconds: rule.trigger.cooldownSeconds,
        hasSchedule: rule.schedule !== null,
        timezone: rule.schedule?.timezone ?? DEFAULT_TIMEZONE,
        days: rule.schedule?.days ?? [...SPEAKER_DAYS],
        start: rule.schedule?.start ?? OFF_SPEAKER_RULE.start,
        end: rule.schedule?.end ?? OFF_SPEAKER_RULE.end,
      }
    : OFF_SPEAKER_RULE;

const whole = (label: string, min: number, max: number) =>
  z
    .number(`Enter a whole number from ${min} to ${max}.`)
    .int(`${label} must be a whole number.`)
    .min(min, `${label} must be from ${min} to ${max}.`)
    .max(max, `${label} must be from ${min} to ${max}.`);

export const speakerRuleDraftSchema = z
  .object({
    isOn: z.boolean(),
    speakerIds: z.array(z.string()),
    audioId: z.string(),
    repeatCount: z.number(),
    maxDurationSeconds: z.number(),
    kinds: z.array(z.string()),
    labels: z.array(z.string()),
    cooldownSeconds: z.number(),
    hasSchedule: z.boolean(),
    timezone: z.string(),
    days: z.array(z.string()),
    start: z.string(),
    end: z.string(),
  })
  .superRefine((draft, context) => {
    if (!draft.isOn) return;
    const fail = (path: string, message: string) =>
      context.addIssue({ code: "custom", path: [path], message });
    if (draft.speakerIds.length === 0) {
      fail("speakerIds", "Choose at least one speaker.");
    } else if (draft.speakerIds.length > MAX_RULE_SPEAKERS) {
      fail("speakerIds", `Choose at most ${MAX_RULE_SPEAKERS} speakers.`);
    }
    if (!AUDIO_ID.test(draft.audioId)) fail("audioId", "Choose an audio file.");
    const checks = [
      ["repeatCount", whole("Repeat", 1, MAX_REPEAT_COUNT), draft.repeatCount],
      [
        "maxDurationSeconds",
        whole("Maximum duration", 1, MAX_DURATION_SECONDS),
        draft.maxDurationSeconds,
      ],
      [
        "cooldownSeconds",
        z
          .number("Enter a number from 0 to 86400.")
          .min(0, "Cooldown must be from 0 to 86400 seconds.")
          .max(
            MAX_COOLDOWN_SECONDS,
            "Cooldown must be from 0 to 86400 seconds.",
          ),
        draft.cooldownSeconds,
      ],
    ] as const;
    for (const [path, schema, value] of checks) {
      const result = schema.safeParse(value);
      if (!result.success) fail(path, result.error.issues[0].message);
    }
    if (draft.kinds.length === 0 && draft.labels.length === 0) {
      fail("kinds", "Choose at least one alarm type or label.");
    }
    if (!draft.hasSchedule) return;
    if (!draft.timezone.trim()) fail("timezone", "Time zone is required.");
    if (draft.days.length === 0) fail("days", "Choose at least one day.");
    if (!CLOCK.test(draft.start)) fail("start", "Use the HH:MM format.");
    if (!CLOCK.test(draft.end)) fail("end", "Use the HH:MM format.");
  });

export const toSpeakerRulePayload = (
  draft: SpeakerRuleDraft,
): SpeakerRuleInput => ({
  isEnabled: true,
  speakerIds: draft.speakerIds,
  audio: {
    audioId: draft.audioId,
    repeatCount: draft.repeatCount,
    maxDurationSeconds: draft.maxDurationSeconds,
  },
  trigger: {
    kinds: draft.kinds.length > 0 ? draft.kinds : undefined,
    labels: draft.labels.length > 0 ? draft.labels : undefined,
    cooldownSeconds: draft.cooldownSeconds,
  },
  schedule: draft.hasSchedule
    ? {
        timezone: draft.timezone.trim(),
        days: SPEAKER_DAYS.filter((day) => draft.days.includes(day)),
        start: draft.start,
        end: draft.end,
      }
    : null,
});
