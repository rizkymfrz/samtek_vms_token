import { z } from "zod";

export const STATS_BUCKETS = ["hour", "day", "week", "month"] as const;
const counts = z.array(z.number().nonnegative());

export const edgeCountingStatsSchema = z.object({
  bucket: z.enum(STATS_BUCKETS),
  counting: z.object({
    buckets: z.array(z.object({ start: z.iso.datetime() })),
    series: z.array(
      z.object({
        perimeter_name: z.string(),
        direction: z.string(),
        object_label: z.string(),
        count: z.number().nonnegative(),
        counts,
      }),
    ),
  }),
  dwelling: z.object({
    series: z.array(
      z.object({
        perimeter_name: z.string(),
        object_label: z.string(),
        objects: z.number().nonnegative(),
        stay_seconds: z.number().nonnegative(),
        objects_by_bucket: counts,
        stay_seconds_by_bucket: counts,
      }),
    ),
  }),
});
