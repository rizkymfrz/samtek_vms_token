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

const paramSpecSchema = z.object({
  type: z.enum(["boolean", "integer", "number", "string", "array"]).optional(),
  enum: z.array(z.string()).optional(),
  items: z.object({ enum: z.array(z.string()).optional() }).optional(),
  format: z.string().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  default: z.unknown().optional(),
});

const announcedAnalyticSchema = z.object({
  id: z.string(),
  name: z.string(),
  params_schema: z
    .object({ properties: z.record(z.string(), paramSpecSchema).optional() })
    .optional(),
});

export type AnnouncedAnalytic = z.infer<typeof announcedAnalyticSchema>;

export const edgeStateSchema = z.object({
  type: z.literal("edge.state"),
  data: z.object({
    edge_id: z.string(),
    online: z.boolean(),
    analytics: z.array(announcedAnalyticSchema).optional().catch(undefined),
    recording: z
      .object({
        available: z.boolean(),
        retention_days: z.number().int().positive().optional(),
      })
      .optional()
      .catch(undefined),
  }),
});

export const recordingStatusSchema = z.object({
  type: z.literal("recording.status"),
  data: z.object({
    edge_id: z.string(),
    devices: z.array(
      z.object({
        device_id: z.string(),
        enabled: z.boolean(),
        state: z.enum(["off", "idle", "recording", "stalled"]),
        oldest_at: z.iso.datetime().optional(),
        newest_at: z.iso.datetime().optional(),
        bytes: bytes.optional(),
      }),
    ),
  }),
});

export const recordingResultSchema = z.object({
  device_id: z.string(),
  stream: z.enum(["main", "sub", "third"]),
  segment_seconds: z.number().int().positive(),
  ranges: z.array(z.object({ from: z.iso.datetime(), to: z.iso.datetime() })),
});

export type EdgeStatusMessage = z.infer<typeof edgeStatusSchema>["data"];

export const edgeResultSchema = z.object({
  type: z.literal("result"),
  reply_to: z.string(),
  data: z.object({
    ok: z.boolean(),
    error: z.object({ code: z.string(), message: z.string() }).optional(),
    recording: z.unknown().optional(),
    playback: z.unknown().optional(),
  }),
});

export const playbackResultSchema = z.object({
  session_id: z.string(),
  app: z.string().min(1),
  stream: z.string().min(1),
  state: z.enum(["playing", "paused", "ended"]),
  position: z.iso.datetime(),
  speed: z.number().positive(),
});

export type EdgeResultData = z.infer<typeof edgeResultSchema>["data"];

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
