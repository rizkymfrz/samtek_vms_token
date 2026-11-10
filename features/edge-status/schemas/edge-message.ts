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
