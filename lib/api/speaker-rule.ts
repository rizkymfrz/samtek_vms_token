import { z } from "zod";

export const SPEAKER_DAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export const MAX_RULE_SPEAKERS = 10;
export const MAX_REPEAT_COUNT = 10;
export const MAX_DURATION_SECONDS = 600;
export const MAX_COOLDOWN_SECONDS = 86_400;
export const MAX_TRIGGER_ITEMS = 32;
export const CLOCK = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
export const AUDIO_ID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

const scheduleSchema = z.object({
  timezone: z.string().min(1).max(64),
  days: z.array(z.enum(SPEAKER_DAYS)).min(1),
  start: z.string().regex(CLOCK),
  end: z.string().regex(CLOCK),
});

export const speakerRuleSchema = z.object({
  isEnabled: z.boolean(),
  speakerIds: z.array(z.coerce.string()),
  audio: z.object({
    audioId: z.string(),
    repeatCount: z.number().int(),
    maxDurationSeconds: z.number().int(),
  }),
  trigger: z.object({
    kinds: z.array(z.string()).nullable().default(null),
    labels: z.array(z.string()).nullable().default(null),
    cooldownSeconds: z.number(),
  }),
  schedule: scheduleSchema.nullable().default(null),
});

export type SpeakerRule = z.output<typeof speakerRuleSchema>;

const triggerList = z.array(z.string().trim().min(1).max(64)).min(1);

export const speakerRuleInputSchema = z.strictObject({
  isEnabled: z.boolean(),
  speakerIds: z
    .array(z.string().regex(/^[0-9]+$/))
    .min(1)
    .max(MAX_RULE_SPEAKERS),
  audio: z.strictObject({
    audioId: z.string().regex(AUDIO_ID),
    repeatCount: z.number().int().min(1).max(MAX_REPEAT_COUNT),
    maxDurationSeconds: z.number().int().min(1).max(MAX_DURATION_SECONDS),
  }),
  trigger: z.strictObject({
    kinds: triggerList.max(MAX_TRIGGER_ITEMS).optional(),
    labels: triggerList.max(MAX_TRIGGER_ITEMS).optional(),
    cooldownSeconds: z.number().min(0).max(MAX_COOLDOWN_SECONDS),
  }),
  schedule: scheduleSchema.nullable(),
});

export type SpeakerRuleInput = z.output<typeof speakerRuleInputSchema>;
