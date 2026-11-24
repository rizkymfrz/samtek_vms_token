import type { DetectionObject } from "../types";

export const STALE_MS = 1000;
export const KEEP_BEHIND_MS = 30_000;

export type BoxFrame = { ts: number; objects: readonly DetectionObject[] };
export type BoxState = { frames: readonly BoxFrame[]; status: string };

export type BoxMessage = {
  from: number;
  until: number;
  isReset: boolean;
  status: string | null;
  frames: readonly BoxFrame[];
};

export const hasUsableBoxes = (status: string) =>
  status === "ok" || status === "approximate";

export const EMPTY_BOXES: BoxState = { frames: [], status: "ok" };

export const applyBoxMessage = (
  state: BoxState,
  { from, until, isReset, status, frames }: BoxMessage,
): BoxState => {
  const kept = isReset
    ? []
    : state.frames.filter((frame) => frame.ts < from || frame.ts >= until);
  return {
    frames: [...kept, ...frames].sort((a, b) => a.ts - b.ts),
    status: status ?? state.status,
  };
};

export const pickBoxes = (
  state: BoxState,
  frameMs: number,
  staleMs = STALE_MS,
): readonly DetectionObject[] | null => {
  if (!hasUsableBoxes(state.status)) return null;
  let low = 0;
  let high = state.frames.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (state.frames[middle].ts <= frameMs) {
      found = middle;
      low = middle + 1;
    } else high = middle - 1;
  }
  if (found < 0) return null;
  const frame = state.frames[found];
  return frameMs - frame.ts > staleMs ? null : frame.objects;
};

export const trimBoxes = (
  state: BoxState,
  frameMs: number,
  keepMs = KEEP_BEHIND_MS,
): BoxState => {
  const cutoff = frameMs - keepMs;
  const first = state.frames.findIndex((frame) => frame.ts >= cutoff);
  const drop = first < 0 ? state.frames.length : first;
  const keepFrom = Math.max(0, drop - 1);
  return keepFrom === 0
    ? state
    : { ...state, frames: state.frames.slice(keepFrom) };
};
