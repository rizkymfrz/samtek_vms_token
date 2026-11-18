import { format } from "date-fns";
import type { CountingStats, StatsBucket } from "../types";

export type StatsMetric = "count" | "objects" | "stay";

export type StatsSummary = {
  total: number;
  objects: number;
  staySeconds: number;
  averageStaySeconds: number;
  peakIndex: number | null;
  peakActivity: number;
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const matches = (label: string | null, value: string) =>
  label === null || label === value;

export const labelsOf = (stats: CountingStats) =>
  [
    ...new Set([
      ...stats.counting.map((series) => series.label),
      ...stats.dwelling.map((series) => series.label),
    ]),
  ].sort();

const perBucket = (stats: CountingStats, label: string | null) => {
  const count = stats.buckets.map(() => 0);
  const objects = stats.buckets.map(() => 0);
  const stay = stats.buckets.map(() => 0);
  for (const series of stats.counting) {
    if (!matches(label, series.label)) continue;
    series.counts.forEach((value, index) => (count[index] += value));
  }
  for (const series of stats.dwelling) {
    if (!matches(label, series.label)) continue;
    series.objectsByBucket.forEach((value, index) => (objects[index] += value));
    series.stayByBucket.forEach((value, index) => (stay[index] += value));
  }
  return { count, objects, stay };
};

export const summarize = (
  stats: CountingStats,
  label: string | null,
): StatsSummary => {
  const { count, objects, stay } = perBucket(stats, label);
  const activity = count.map((value, index) => value + objects[index]);
  const peak = Math.max(0, ...activity);
  const total = sum(count);
  const staySeconds = sum(stay);
  const objectTotal = sum(objects);
  return {
    total,
    objects: objectTotal,
    staySeconds,
    averageStaySeconds: objectTotal > 0 ? staySeconds / objectTotal : 0,
    peakIndex: peak > 0 ? activity.indexOf(peak) : null,
    peakActivity: peak,
  };
};

export const clock = (totalSeconds: number) => {
  const seconds = Math.round(totalSeconds);
  const parts = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
};

const BUCKET_FORMAT: Record<StatsBucket, string> = {
  hour: "d MMM HH:mm",
  day: "d MMM",
  week: "d MMM",
  month: "MMM yyyy",
};

export const bucketLabel = (start: number, bucket: StatsBucket) =>
  format(new Date(start), BUCKET_FORMAT[bucket]);

export const peakLabel = (start: number, bucket: StatsBucket) =>
  bucket === "hour"
    ? `${format(new Date(start), "HH:mm")} – ${format(new Date(start + 3_600_000), "HH:mm")}`
    : bucketLabel(start, bucket);

export const chartRows = (
  stats: CountingStats,
  metric: StatsMetric,
  labels: string[],
) =>
  stats.buckets.map((start, index) => {
    const row: Record<string, number | string> = {
      at: bucketLabel(start, stats.bucket),
    };
    labels.forEach((label, labelIndex) => {
      const value =
        metric === "count"
          ? sum(
              stats.counting
                .filter((series) => series.label === label)
                .map((series) => series.counts[index] ?? 0),
            )
          : sum(
              stats.dwelling
                .filter((series) => series.label === label)
                .map(
                  (series) =>
                    (metric === "objects"
                      ? series.objectsByBucket
                      : series.stayByBucket)[index] ?? 0,
                ),
            );
      row[`s${labelIndex}`] =
        metric === "stay" ? Math.round((value / 60) * 10) / 10 : value;
    });
    return row;
  });
