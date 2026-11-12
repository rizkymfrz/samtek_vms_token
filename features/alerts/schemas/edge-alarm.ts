import { z } from "zod";

export const edgeAlarmsResponseSchema = z.object({
  alarms: z.array(
    z.object({
      event_id: z.string(),
      device_id: z.string(),
      occurred_at: z.iso.datetime(),
      title: z.string(),
      description: z.string().default(""),
      risk_level: z.enum(["low", "medium", "high"]),
      analytic_id: z.string(),
      object: z
        .object({
          label: z.string(),
          confidence: z.number(),
          track_id: z.number().optional(),
        })
        .optional(),
      perimeter: z.object({ shape: z.string(), name: z.string() }).optional(),
      detail: z
        .record(
          z.string(),
          z.union([z.string(), z.number(), z.array(z.string())]),
        )
        .default({}),
      image_path: z.string().optional(),
      clip_path: z.string().optional(),
      clip_offset_seconds: z.number().optional(),
      clip_duration_seconds: z.number().optional(),
      clip_window_start_seconds: z.number().optional(),
      clip_window_seconds: z.number().optional(),
    }),
  ),
});

export type EdgeAlarm = z.output<
  typeof edgeAlarmsResponseSchema
>["alarms"][number];
