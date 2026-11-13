import { z } from "zod";

export const edgeAlarmSummarySchema = z.object({
  total: z.number(),
  risk_counts: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
  buckets: z.array(
    z.object({
      start: z.iso.datetime(),
      low: z.number(),
      medium: z.number(),
      high: z.number(),
    }),
  ),
  kinds: z.array(
    z.object({ kind: z.string(), analytic_id: z.string(), count: z.number() }),
  ),
  devices: z.array(
    z.object({
      device_id: z.string(),
      count: z.number(),
      counts: z.array(z.number()),
    }),
  ),
  previous: z.object({ total: z.number(), high: z.number() }),
});

export type EdgeAlarmSummary = z.output<typeof edgeAlarmSummarySchema>;
