import { z } from "zod";

const featureSchema = z.object({
  feature: z.string(),
  total: z.number().nullable(),
  used: z.number(),
  analytics: z.array(z.string()),
});

export const licenseSchema = z.object({
  trusted: z.boolean(),
  reason: z.string(),
  limited: z.boolean(),
  term: z.enum(["perpetual", "fixed"]).nullable().catch(null),
  licenseVersion: z.number().nullable(),
  lastAttestationAt: z.string().nullable(),
  offlineUntil: z.string().nullable(),
  features: z.array(featureSchema),
  heldDevices: z.array(
    z.object({ deviceId: z.coerce.string(), reason: z.string() }),
  ),
  reportedAt: z.string(),
});

export const licenseResponseSchema = z.object({
  data: licenseSchema.nullable(),
});
