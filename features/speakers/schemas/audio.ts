import { z } from "zod";

export const AUDIO_MAX_BYTES = 5 * 1024 * 1024;
export const AUDIO_NAME_MAX = 128;
export const AUDIO_ID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

const edgeAudioSchema = z.object({
  audio_id: z.string(),
  name: z.string(),
  format: z.string(),
  bytes: z.number().int().nonnegative(),
});

export const edgeAudiosResponseSchema = z.object({
  audios: z.array(edgeAudioSchema),
});

export const edgeAudioCreatedSchema = z.object({ audio: edgeAudioSchema });

export const audioFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .max(AUDIO_NAME_MAX)
    .refine((value) =>
      [...value].every((char) => {
        const code = char.charCodeAt(0);
        return code > 31 && code !== 127;
      }),
    ),
});

const edgeCallSchema = z.object({
  call_id: z.string(),
  occurred_at: z.string(),
  source: z.string(),
  device_id: z.string().nullish(),
  speaker_id: z.string().nullish(),
  event_id: z.string().nullish(),
  kind: z.string().nullish(),
  label: z.string().nullish(),
  status: z.string(),
  reason: z.string().nullish(),
  duration_ms: z.number(),
});

export const edgeCallsResponseSchema = z.object({
  calls: z.array(edgeCallSchema),
});
