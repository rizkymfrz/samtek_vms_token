import { z } from "zod";

const bytes = z.number().int().nonnegative();

export const edgeStatusSchema = z.object({
  type: z.literal("edge.status"),
  data: z.object({
    edge_id: z.string(),
    uptime_seconds: bytes,
    cpu: z
      .object({
        usage_percent: z.number().min(0).max(100),
        temperature_c: z.number().optional(),
      })
      .optional(),
    memory: z.object({ used_bytes: bytes, total_bytes: bytes }).optional(),
    storage: z
      .object({
        total_bytes: bytes,
        free_bytes: bytes,
        recordings_bytes: bytes.optional(),
        analytics_bytes: bytes.optional(),
        recordings_retention_days: z.number().int().nonnegative().optional(),
      })
      .optional(),
  }),
});

export const edgeStateSchema = z.object({
  type: z.literal("edge.state"),
  data: z.object({ edge_id: z.string(), online: z.boolean() }),
});

export type EdgeStatusMessage = z.infer<typeof edgeStatusSchema>["data"];

export const edgeResultSchema = z.object({
  type: z.literal("result"),
  reply_to: z.string(),
  data: z.object({
    ok: z.boolean(),
    error: z.object({ code: z.string(), message: z.string() }).optional(),
  }),
});

const ratio = z.number().min(0).max(1);

export const detectionBboxesSchema = z.object({
  type: z.literal("detection.bboxes"),
  data: z.object({
    device_id: z.string(),
    frame_ts: z.string(),
    objects: z.array(
      z.object({
        label: z.string().min(1),
        confidence: z.number().min(0).max(1),
        track_id: z.number().int().nonnegative().optional(),
        bbox: z.object({ x1: ratio, y1: ratio, x2: ratio, y2: ratio }),
      }),
    ),
  }),
});
