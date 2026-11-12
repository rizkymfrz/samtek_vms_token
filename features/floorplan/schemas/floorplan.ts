import { z } from "zod";

export const floorplanSchema = z.object({
  id: z.coerce.string(),
  groupId: z.coerce.string(),
  parentId: z.coerce.string().nullable(),
  name: z.string(),
  hasImage: z.boolean(),
  updatedAt: z.string().nullable(),
});

export const floorplanDetailResponseSchema = z.object({
  data: floorplanSchema.extend({
    devices: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        rotation: z.number().int(),
        fieldOfView: z.number().int(),
        device: z.object({ id: z.coerce.string() }).nullable(),
      }),
    ),
  }),
});

export const floorplanResponseSchema = z.object({ data: floorplanSchema });

export const planGroupSchema = z.object({
  id: z.coerce.string(),
  parentId: z.coerce.string().nullable(),
  name: z.string(),
});

export const createFloorplanInputSchema = z.object({
  name: z.string().min(1).max(100),
  groupId: z.string().regex(/^[0-9]+$/),
  parentId: z
    .string()
    .regex(/^[0-9]+$/)
    .optional(),
});

export const replacePlacementsInputSchema = z.strictObject({
  devices: z.array(
    z.object({
      deviceRecordId: z.string().regex(/^[0-9]+$/),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      rotation: z.number().int().min(0).max(359),
      fieldOfView: z.number().int().min(1).max(360),
    }),
  ),
});
