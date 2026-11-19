"use client";
import { useCallback, useSyncExternalStore } from "react";
import {
  getPlaybackBoxes,
  getServerPlaybackBoxes,
  setPlaybackFrameTime,
  subscribePlaybackBoxes,
} from "../lib/playback-box-store";

export const usePlaybackBoxes = (sessionId: string | null) => {
  const subscribe = useCallback(
    (listener: () => void) =>
      sessionId ? subscribePlaybackBoxes(sessionId, listener) : () => {},
    [sessionId],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (sessionId ? getPlaybackBoxes(sessionId) : getServerPlaybackBoxes()),
    getServerPlaybackBoxes,
  );
  const onFrameTime = useCallback(
    (wallMs: number | null) => {
      if (sessionId) setPlaybackFrameTime(sessionId, wallMs);
    },
    [sessionId],
  );
  return { ...snapshot, onFrameTime };
};
