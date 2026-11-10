import { z } from "zod";

export const layoutSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  description: z.string().nullable(),
  rows: z.number().int(),
  columns: z.number().int(),
  isDefault: z.boolean(),
});

export const layoutDetailSchema = layoutSchema.extend({
  devices: z.array(
    z.object({
      position: z.number().int(),
      device: z.object({ id: z.coerce.string() }).nullable(),
    }),
  ),
});

export const layoutResponseSchema = z.object({ data: layoutSchema });

export const layoutDetailResponseSchema = z.object({
  data: layoutDetailSchema,
});

export const createLayoutInputSchema = z.object({
  name: z.string(),
  rows: z.number().int(),
  columns: z.number().int(),
  isDefault: z.boolean().optional(),
});

export const updateLayoutInputSchema = z.strictObject({
  name: z.string().optional(),
  rows: z.number().int().optional(),
  columns: z.number().int().optional(),
});

export const replaceSlotsInputSchema = z.strictObject({
  devices: z.array(
    z.object({ position: z.number().int(), deviceRecordId: z.string() }),
  ),
});
