import type { DevicePosition } from "../types";

export const MATCH_CHUNK_SIZE = 100;
const MIN_STEP_METERS = 8;
const METERS_PER_DEGREE = 111_320;

type LivePosition = {
  latitude: number;
  longitude: number;
  fixedAt: number | null;
};

export const msUntilNextDay = (now: number) =>
  new Date(now).setHours(24, 0, 0, 0) - now;

export const startOfDay = (now: number) => new Date(now).setHours(0, 0, 0, 0);

const isNewer = (last: DevicePosition | undefined, live: LivePosition) =>
  last === undefined ||
  (live.fixedAt === null
    ? live.latitude !== last.latitude || live.longitude !== last.longitude
    : live.fixedAt > last.fixedAt);

export const trailOf = (
  history: readonly DevicePosition[],
  live: LivePosition | null,
): [number, number][] => {
  const line = history.map((point): [number, number] => [
    point.longitude,
    point.latitude,
  ]);
  if (live && isNewer(history.at(-1), live)) {
    line.push([live.longitude, live.latitude]);
  }
  return line;
};

export const appendFix = (
  history: DevicePosition[],
  live: LivePosition,
  now: number,
): DevicePosition[] =>
  isNewer(history.at(-1), live)
    ? [
        ...history,
        {
          latitude: live.latitude,
          longitude: live.longitude,
          fixedAt: live.fixedAt ?? now,
        },
      ]
    : history;

const metersBetween = (a: [number, number], b: [number, number]) => {
  const x = (b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180));
  const y = b[1] - a[1];
  return Math.hypot(x, y) * METERS_PER_DEGREE;
};

export const thinTrail = (line: [number, number][]) => {
  const first = line[0];
  if (!first) return line;
  const kept = [first];
  for (const point of line.slice(1, -1)) {
    const previous = kept[kept.length - 1];
    if (previous && metersBetween(previous, point) >= MIN_STEP_METERS) {
      kept.push(point);
    }
  }
  const last = line.at(-1);
  if (last && line.length > 1) kept.push(last);
  return kept;
};

export const chunkTrail = (line: [number, number][]) => {
  const chunks: [number, number][][] = [];
  for (let start = 0; start < line.length - 1; start += MATCH_CHUNK_SIZE - 1) {
    chunks.push(line.slice(start, start + MATCH_CHUNK_SIZE));
  }
  return chunks;
};
