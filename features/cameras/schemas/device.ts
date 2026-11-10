import { z } from "zod";

export const deviceSchema = z.object({
  id: z.coerce.string(),
  edgeServerId: z.coerce.string(),
  deviceId: z.string(),
  name: z.string(),
  isEnabled: z.boolean(),
  sourceMain: z.string(),
  sourceSub: z.string().nullable(),
  analyticId: z.string().nullable(),
  isRecordingEnabled: z.boolean(),
});

export const deviceResponseSchema = z.object({ data: deviceSchema });

export const createDeviceInputSchema = z.object({
  deviceId: z.string(),
  name: z.string(),
  isEnabled: z.boolean().optional(),
  sourceMain: z.string(),
  sourceSub: z.string().optional(),
  analyticId: z.string().optional(),
  isRecordingEnabled: z.boolean().optional(),
});

export const updateDeviceInputSchema = z.object({
  name: z.string().optional(),
  isEnabled: z.boolean().optional(),
  sourceMain: z.string().optional(),
  sourceSub: z.string().nullable().optional(),
  analyticId: z.string().nullable().optional(),
  isRecordingEnabled: z.boolean().optional(),
});
