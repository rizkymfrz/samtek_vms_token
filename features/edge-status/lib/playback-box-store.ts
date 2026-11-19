import type { z } from "zod";
import { toDetectionObject } from "./detection-object";
import {
  applyBoxMessage,
  type BoxState,
  EMPTY_BOXES,
  hasUsableBoxes,
  pickBoxes,
  trimBoxes,
} from "./playback-boxes";
import type { playbackBboxesSchema } from "../schemas/edge-message";
import type { DetectionObject } from "../types";

const NO_TIME_MS = 3000;
const NONE: readonly DetectionObject[] = [];

export type PlaybackBoxSnapshot = {
  isTimed: boolean;
  reason: string | null;
  objects: readonly DetectionObject[];
};

const IDLE: PlaybackBoxSnapshot = {
  isTimed: false,
  reason: null,
  objects: NONE,
};

type Entry = {
  boxes: BoxState;
  frameMs: number | null;
  isTimed: boolean;
  clientReason: string | null;
  firstFrameAt: number | null;
  hasSeenTime: boolean;
  snapshot: PlaybackBoxSnapshot;
};

const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

const emit = (sessionId: string) => {
  for (const listener of listeners.get(sessionId) ?? []) listener();
};

const derive = (entry: Entry): PlaybackBoxSnapshot => {
  const reason =
    entry.clientReason ??
    (hasUsableBoxes(entry.boxes.status) ? null : entry.boxes.status);
  const objects =
    reason || entry.frameMs === null
      ? NONE
      : (pickBoxes(entry.boxes, entry.frameMs) ?? NONE);
  const { snapshot } = entry;
  return snapshot.objects === objects &&
    snapshot.reason === reason &&
    snapshot.isTimed === entry.isTimed
    ? snapshot
    : { isTimed: entry.isTimed, reason, objects };
};

const refresh = (sessionId: string, entry: Entry) => {
  const next = derive(entry);
  if (next === entry.snapshot) return;
  entry.snapshot = next;
  emit(sessionId);
};

export const openPlaybackBoxes = (sessionId: string) => {
  entries.set(sessionId, {
    boxes: EMPTY_BOXES,
    frameMs: null,
    isTimed: false,
    clientReason: null,
    firstFrameAt: null,
    hasSeenTime: false,
    snapshot: IDLE,
  });
  emit(sessionId);
};

export const closePlaybackBoxes = (sessionId: string) => {
  if (!entries.delete(sessionId)) return;
  emit(sessionId);
};

export const settlePlaybackBoxes = (
  sessionId: string,
  outcome: "timed" | "declined" | "unsupported",
) => {
  const entry = entries.get(sessionId);
  if (!entry) return;
  entry.isTimed = outcome === "timed";
  entry.clientReason = outcome === "timed" ? null : outcome;
  refresh(sessionId, entry);
};

export const ingestPlaybackBoxes = (
  data: z.infer<typeof playbackBboxesSchema>["data"],
) => {
  const entry = entries.get(data.session_id);
  if (!entry) return;
  entry.boxes = applyBoxMessage(entry.boxes, {
    from: Date.parse(data.from),
    until: Date.parse(data.until),
    isReset: data.reset === true,
    status: data.status ?? null,
    frames: data.frames.map((frame) => ({
      ts: Date.parse(frame.frame_ts),
      objects: frame.objects.map(toDetectionObject),
    })),
  });
  refresh(data.session_id, entry);
};

export const setPlaybackFrameTime = (
  sessionId: string,
  wallMs: number | null,
) => {
  const entry = entries.get(sessionId);
  if (!entry) return;
  const now = performance.now();
  entry.firstFrameAt ??= now;
  if (wallMs !== null) {
    entry.hasSeenTime = true;
    entry.boxes = trimBoxes(entry.boxes, wallMs);
  } else if (
    entry.isTimed &&
    !entry.hasSeenTime &&
    entry.clientReason === null &&
    now - entry.firstFrameAt > NO_TIME_MS
  ) {
    entry.clientReason = "no_time";
  }
  entry.frameMs = wallMs;
  refresh(sessionId, entry);
};

export const resetPlaybackFrame = (sessionId: string) => {
  const entry = entries.get(sessionId);
  if (!entry || entry.frameMs === null) return;
  entry.frameMs = null;
  refresh(sessionId, entry);
};

export const subscribePlaybackBoxes = (
  sessionId: string,
  listener: () => void,
) => {
  const set = listeners.get(sessionId) ?? new Set();
  set.add(listener);
  listeners.set(sessionId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(sessionId);
  };
};

export const getPlaybackBoxes = (sessionId: string) =>
  entries.get(sessionId)?.snapshot ?? IDLE;

export const getServerPlaybackBoxes = () => IDLE;
