import { addDays, startOfDay } from "date-fns";
import type { RecordingRange } from "@/features/edge-status";

const MS_PER_MINUTE = 60_000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export const dayBounds = (day: Date) => {
  const from = startOfDay(day);
  return { from, to: addDays(from, 1) };
};

export const extendToNewest = (
  ranges: RecordingRange[],
  newestAt: number | null,
  dayEnd: number,
) => {
  const last = ranges.at(-1);
  if (!last || newestAt === null || newestAt >= dayEnd) return ranges;
  if (newestAt <= last.to) return ranges;
  return [...ranges.slice(0, -1), { from: last.from, to: newestAt }];
};

export const toBars = (ranges: RecordingRange[], dayStart: number) =>
  ranges.map((range) => ({
    startMinute: (range.from - dayStart) / MS_PER_MINUTE,
    endMinute: (range.to - dayStart) / MS_PER_MINUTE,
  }));

export const recordedSeconds = (ranges: RecordingRange[]) =>
  Math.round(
    ranges.reduce((sum, range) => sum + (range.to - range.from), 0) / 1000,
  );

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return minutes > 0 ? `${minutes}m` : `${seconds}s`;
};

export const formatBytes = (bytes: number) => {
  const gb = bytes / 1e9;
  return gb >= 1000
    ? `${(gb / 1000).toFixed(1)} TB`
    : gb >= 1
      ? `${gb.toFixed(1)} GB`
      : `${Math.round(bytes / 1e6)} MB`;
};

const SPEEDS = [0.25, 0.5, 1, 2, 4, 8];

export const stepSpeed = (speed: number, direction: 1 | -1) => {
  const index = SPEEDS.findIndex((value) => value >= speed);
  const next = Math.min(
    SPEEDS.length - 1,
    Math.max(0, (index === -1 ? SPEEDS.length - 1 : index) + direction),
  );
  return SPEEDS[next];
};

export const snapToRange = (ranges: RecordingRange[], time: number) => {
  const inside = ranges.find((range) => time >= range.from && time < range.to);
  if (inside) return time;
  return ranges.find((range) => range.from > time)?.from ?? null;
};

export const nextRangeStart = (ranges: RecordingRange[], time: number) =>
  ranges.find((range) => range.from > time)?.from ?? null;

export const previousRangeStart = (ranges: RecordingRange[], time: number) =>
  ranges.findLast((range) => range.from < time - MS_PER_MINUTE)?.from ?? null;
