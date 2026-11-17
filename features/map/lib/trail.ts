import type { DevicePosition } from "../types";

export const TRAIL_WINDOW_MS = 60 * 60 * 1000;
export const TRAIL_REFRESH_MS = 10_000;

type LivePosition = {
  latitude: number;
  longitude: number;
  fixedAt: number | null;
};

export const trailOf = (
  history: readonly DevicePosition[],
  live: LivePosition | null,
): [number, number][] => {
  const line = history.map((point): [number, number] => [
    point.longitude,
    point.latitude,
  ]);
  const last = history.at(-1);
  const isNewer =
    live !== null &&
    (last === undefined ||
      (live.fixedAt === null
        ? live.latitude !== last.latitude || live.longitude !== last.longitude
        : live.fixedAt > last.fixedAt));
  if (live && isNewer) line.push([live.longitude, live.latitude]);
  return line;
};
