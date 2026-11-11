"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  controlPlayback,
  type PlaybackSession,
  type RecordingStream,
  startPlayback,
  stopPlayback,
} from "@/features/edge-status";

const STATUS_MS = 5000;
const TICK_MS = 1000;
const newSessionId = () => `vms-${Math.random().toString(16).slice(2, 12)}`;

export const usePlaybackSession = (
  edgeId: string,
  deviceId: string,
  stream: RecordingStream,
) => {
  const [sessionId] = useState(newSessionId);
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [now, setNow] = useState(0);
  const hasStarted = useRef(false);
  const isPlaying = session?.state === "playing";
  const run = useCallback(async (command: Promise<PlaybackSession>) => {
    setIsBusy(true);
    setError(null);
    try {
      const next = await command;
      setSession(next);
      return next;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Playback failed");
      return null;
    } finally {
      setIsBusy(false);
    }
  }, []);
  const seek = useCallback(
    async (at: Date) => {
      if (!hasStarted.current) {
        hasStarted.current = true;
        await run(startPlayback(edgeId, sessionId, deviceId, stream, at, 1));
        return;
      }
      const moved = await run(
        controlPlayback(edgeId, sessionId, "seek", { at }),
      );
      if (moved?.state === "paused") {
        await run(controlPlayback(edgeId, sessionId, "resume"));
      }
    },
    [edgeId, sessionId, deviceId, stream, run],
  );
  const pause = useCallback(
    () => run(controlPlayback(edgeId, sessionId, "pause")),
    [edgeId, sessionId, run],
  );
  const resume = useCallback(
    () => run(controlPlayback(edgeId, sessionId, "resume")),
    [edgeId, sessionId, run],
  );
  const changeSpeed = useCallback(
    (speed: number) =>
      run(controlPlayback(edgeId, sessionId, "speed", { speed })),
    [edgeId, sessionId, run],
  );
  const stop = useCallback(async () => {
    if (!hasStarted.current) return;
    hasStarted.current = false;
    setSession(null);
    setError(null);
    try {
      await stopPlayback(edgeId, sessionId);
    } catch (failure) {
      console.warn("[playback] stop failed:", failure);
    }
  }, [edgeId, sessionId]);
  useEffect(() => {
    if (!isPlaying) return;
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    const poll = setInterval(() => {
      controlPlayback(edgeId, sessionId, "status").then(setSession, () => {
        hasStarted.current = false;
        setSession(null);
        setError("The playback session ended");
      });
    }, STATUS_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [isPlaying, edgeId, sessionId]);
  useEffect(
    () => () => {
      if (!hasStarted.current) return;
      stopPlayback(edgeId, sessionId).catch((failure: unknown) =>
        console.warn("[playback] stop failed:", failure),
      );
    },
    [edgeId, sessionId],
  );
  const position = session
    ? isPlaying
      ? session.position +
        (Math.max(now, session.receivedAt) - session.receivedAt) * session.speed
      : session.position
    : null;
  return {
    session,
    position,
    error,
    isBusy,
    seek,
    pause,
    resume,
    changeSpeed,
    stop,
  };
};
