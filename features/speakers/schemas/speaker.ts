import { z } from "zod";

export const speakerSchema = z.object({
  id: z.coerce.string(),
  edgeServerId: z.coerce.string(),
  name: z.string(),
  isEnabled: z.boolean(),
  host: z.string(),
  port: z.number().int(),
  username: z.string().nullable(),
  hasPassword: z.boolean(),
  timeoutSeconds: z.number(),
  volume: z.number().int(),
  applyStatus: z.enum(["applied", "rejected"]).nullable().catch(null),
  applyError: z
    .object({
      code: z.string(),
      field: z.string().nullable(),
      message: z.string(),
    })
    .nullable()
    .catch(null),
  createdAt: z.iso.datetime(),
});

const ipv4 = z
  .string()
  .regex(/^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/);

const speakerFields = {
  name: z.string().min(1).max(100),
  host: ipv4,
  port: z.number().int().min(1).max(65535),
  timeoutSeconds: z.number().min(0.1).max(60),
  volume: z.number().int().min(0).max(100),
  isEnabled: z.boolean(),
};

export const createSpeakerInputSchema = z.strictObject({
  ...speakerFields,
  username: z.string().min(1).max(100).optional(),
  password: z.string().min(1).max(255).optional(),
});

export const updateSpeakerInputSchema = z.strictObject({
  name: speakerFields.name.optional(),
  host: speakerFields.host.optional(),
  port: speakerFields.port.optional(),
  timeoutSeconds: speakerFields.timeoutSeconds.optional(),
  volume: speakerFields.volume.optional(),
  isEnabled: speakerFields.isEnabled.optional(),
  username: z.string().min(1).max(100).nullable().optional(),
  password: z.string().min(1).max(255).nullable().optional(),
});

export const speakerResponseSchema = z.object({ data: speakerSchema });

export const speakerTestResponseSchema = z.object({
  data: z.object({
    calls: z.array(
      z.object({
        speakerId: z.string().nullable(),
        status: z.string(),
        reason: z.string().nullable(),
        durationMs: z.number(),
      }),
    ),
  }),
});
