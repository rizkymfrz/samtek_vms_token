import { addDays, startOfDay } from "date-fns";
import type { RecordingRange } from "@/features/edge-status";

const MS_PER_MINUTE = 60_000;

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

export type TimeWindow = { start: number; end: number };

export const MIN_WINDOW_MS = 10_000;

const TICK_STEPS_MS = [
  1_000, 5_000, 10_000, 30_000, 60_000, 300_000, 600_000, 900_000, 1_800_000,
  3_600_000, 10_800_000,
];

const MAX_TICKS = 8;

export const clampWindow = (window: TimeWindow, day: TimeWindow) => {
  const length = Math.min(
    Math.max(window.end - window.start, MIN_WINDOW_MS),
    day.end - day.start,
  );
  const start = Math.min(Math.max(window.start, day.start), day.end - length);
  return { start, end: start + length };
};

export const zoomWindow = (
  window: TimeWindow,
  day: TimeWindow,
  factor: number,
  anchor: number,
) => {
  const length = window.end - window.start;
  const next = length * factor;
  const pivot = window.start + anchor * length;
  return clampWindow(
    { start: pivot - anchor * next, end: pivot + (1 - anchor) * next },
    day,
  );
};

export const panWindow = (
  window: TimeWindow,
  day: TimeWindow,
  deltaMs: number,
) =>
  clampWindow(
    { start: window.start + deltaMs, end: window.end + deltaMs },
    day,
  );

export const followWindow = (
  window: TimeWindow,
  day: TimeWindow,
  time: number,
) => {
  if (time >= window.start && time <= window.end) return window;
  const lead = window.start + (window.end - window.start) * 0.1;
  return panWindow(window, day, time - lead);
};

export const tickStep = (windowMs: number) =>
  TICK_STEPS_MS.find((step) => windowMs / step <= MAX_TICKS) ??
  TICK_STEPS_MS[TICK_STEPS_MS.length - 1];

export const ticksIn = (window: TimeWindow, dayStart: number, step: number) => {
  const first = dayStart + Math.ceil((window.start - dayStart) / step) * step;
  const ticks: number[] = [];
  for (let time = first; time <= window.end; time += step) ticks.push(time);
  return ticks;
};

export const clipRange = (range: RecordingRange, window: TimeWindow) => {
  const from = Math.max(range.from, window.start);
  const to = Math.min(range.to, window.end);
  if (to <= from) return null;
  const length = window.end - window.start;
  return {
    left: ((from - window.start) / length) * 100,
    width: ((to - from) / length) * 100,
  };
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
