import type { CountingStats, CountingStatsQuery, StatsBucket } from "../types";

const HOUR_MS = 3_600_000;

const STEP_MS: Record<Exclude<StatsBucket, "month">, number> = {
  hour: HOUR_MS,
  day: 24 * HOUR_MS,
  week: 7 * 24 * HOUR_MS,
};

const LABELS = ["person", "car"];
const MAX_BUCKETS = 500;

const next = (start: number, bucket: StatsBucket) => {
  if (bucket !== "month") return start + STEP_MS[bucket];
  const date = new Date(start);
  return date.setUTCMonth(date.getUTCMonth() + 1);
};

const wave = (index: number, seed: number) => (index * 7 + seed * 5) % 9;

export const buildCountingStats = (
  now: number,
  query: CountingStatsQuery,
): CountingStats => {
  const buckets: number[] = [];
  const until = query.until ?? now;
  const origin = query.utcOffsetMinutes * 60_000;
  const step = STEP_MS[query.bucket === "month" ? "day" : query.bucket];
  let start = Math.floor((query.since + origin) / step) * step - origin;
  while (start < until && buckets.length < MAX_BUCKETS) {
    buckets.push(start);
    start = next(start, query.bucket);
  }
  return {
    bucket: query.bucket,
    buckets,
    counting: LABELS.map((label, seed) => {
      const counts = buckets.map((_, index) => wave(index, seed + 1));
      return {
        perimeter: "Line A",
        direction: "Entry",
        label,
        count: counts.reduce((a, b) => a + b, 0),
        counts,
      };
    }),
    dwelling: LABELS.map((label, seed) => {
      const objectsByBucket = buckets.map((_, index) => wave(index, seed) % 4);
      return {
        perimeter: "Area 1",
        label,
        objects: objectsByBucket.reduce((a, b) => a + b, 0),
        staySeconds: objectsByBucket.reduce((a, b) => a + b * 420, 0),
        objectsByBucket,
        stayByBucket: objectsByBucket.map((value) => value * 420),
      };
    }),
  };
};
