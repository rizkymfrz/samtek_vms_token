import { z } from "zod";

export const serverGroupSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
});

export const serverIdResponseSchema = z.object({
  data: z.object({ id: z.coerce.string() }),
});

export const createServerInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  webrtcUrl: z.string().optional(),
  hostAddress: z.string().optional(),
  localHostAddress: z.string().optional(),
  webrtcUrlLocal: z.string().optional(),
  macAddress: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateServerInputSchema = z.strictObject({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  webrtcUrl: z.string().nullable().optional(),
  hostAddress: z.string().nullable().optional(),
  localHostAddress: z.string().nullable().optional(),
  webrtcUrlLocal: z.string().nullable().optional(),
  macAddress: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
