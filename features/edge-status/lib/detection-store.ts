import type { DetectionObject } from "../types";

const STALE_MS = 1500;
const NONE: readonly DetectionObject[] = [];
const frames = new Map<string, readonly DetectionObject[]>();
const timers = new Map<string, number>();
const listeners = new Map<string, Set<() => void>>();
const keyOf = (edgeId: string, deviceId: string) => `${edgeId}/${deviceId}`;

const emit = (key: string) => {
  for (const listener of listeners.get(key) ?? []) listener();
};

export const ingestDetections = (
  edgeId: string,
  deviceId: string,
  objects: readonly DetectionObject[],
) => {
  const key = keyOf(edgeId, deviceId);
  if (!listeners.has(key)) return;
  clearTimeout(timers.get(key));
  frames.set(key, objects);
  timers.set(
    key,
    window.setTimeout(() => {
      frames.delete(key);
      timers.delete(key);
      emit(key);
    }, STALE_MS),
  );
  emit(key);
};

export const subscribeDetections = (
  edgeId: string,
  deviceId: string,
  listener: () => void,
) => {
  const key = keyOf(edgeId, deviceId);
  const set = listeners.get(key) ?? new Set();
  set.add(listener);
  listeners.set(key, set);
  return () => {
    set.delete(listener);
    if (set.size > 0) return;
    listeners.delete(key);
    clearTimeout(timers.get(key));
    timers.delete(key);
    frames.delete(key);
  };
};

export const getDetections = (edgeId: string, deviceId: string) =>
  frames.get(keyOf(edgeId, deviceId)) ?? NONE;

export const getServerDetections = () => NONE;
