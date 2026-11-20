import { z } from "zod";

export const edgeSearchResponseSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      track_key: z.string(),
      device_id: z.string(),
      label: z.string(),
      seen_at: z.iso.datetime(),
      similarity: z.number(),
      confidence: z.number().optional(),
      crop_path: z.string().optional(),
      object: z.object({
        label: z.string(),
        confidence: z.number(),
        bbox: z.object({
          x1: z.number(),
          y1: z.number(),
          x2: z.number(),
          y2: z.number(),
        }),
      }),
    }),
  ),
});
