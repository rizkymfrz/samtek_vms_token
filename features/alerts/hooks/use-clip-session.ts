"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  controlPlayback,
  type PlaybackSession,
  startClipPlayback,
  stopPlayback,
} from "@/features/edge-status";

const STATUS_MS = 3000;
const PUBLISH_MS = 200;
const FRAME_GAP_MS = 1000;
const DRIFT_MS = 4000;

const newSessionId = () =>
  `vms-clip-${Math.random().toString(16).slice(2, 12)}`;

export const useClipSession = (
  edgeId: string,
  eventId: string,
  clipStartAt: number | null,
) => {
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [clock, setClock] = useState(0);
  const clockRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const speedRef = useRef(1);
  const isFrozenRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startAtRef = useRef(clipStartAt);
  useEffect(() => {
    startAtRef.current = clipStartAt;
  }, [clipStartAt]);
  const speed = session?.speed ?? 1;
  const isPaused = session?.state === "paused";
  useEffect(() => {
    isFrozenRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  const resetClock = useCallback((ms: number) => {
    clockRef.current = ms;
    lastFrameRef.current = null;
    setClock(ms);
  }, []);
  const onFrame = useCallback((at: number) => {
    const last = lastFrameRef.current;
    lastFrameRef.current = at;
    if (isFrozenRef.current || last === null || at - last > FRAME_GAP_MS)
      return;
    clockRef.current += (at - last) * speedRef.current;
    setClock(Math.floor(clockRef.current / PUBLISH_MS) * PUBLISH_MS);
  }, []);
  const send = useCallback(
    async (
      action: "pause" | "resume" | "speed" | "seek",
      extra: { speed?: number; at?: Date } = {},
    ) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return null;
      setIsBusy(true);
      try {
        const next = await controlPlayback(edgeId, sessionId, action, extra);
        setSession(next);
        return next;
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Control failed");
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [edgeId],
  );
  const seekTo = useCallback(
    async (offsetMs: number) => {
      if (startedAt === null) return;
      const at = new Date(startedAt + Math.max(0, offsetMs));
      let moved = await send("seek", { at });
      if (moved?.state === "paused") moved = await send("resume");
      if (moved) resetClock(Math.max(0, moved.position - startedAt));
    },
    [send, startedAt, resetClock],
  );
  const replay = useCallback(() => {
    setSession(null);
    setStartedAt(null);
    setError(null);
    setRound((value) => value + 1);
  }, []);
  const isEnded = session?.state === "ended";
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    if (!isEnded || startedAt === null || !sessionId) return;
    let isStale = false;
    (async () => {
      resetClock(0);
      try {
        let next = await controlPlayback(edgeId, sessionId, "seek", {
          at: new Date(startedAt),
        });
        if (next.state === "paused")
          next = await controlPlayback(edgeId, sessionId, "resume");
        if (isStale) return;
        if (next.state === "ended") replay();
        else setSession(next);
      } catch {
        if (!isStale) replay();
      }
    })();
    return () => {
      isStale = true;
    };
  }, [isEnded, startedAt, edgeId, replay, resetClock]);
  useEffect(() => {
    const sessionId = newSessionId();
    sessionIdRef.current = sessionId;
    let isStopped = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    startClipPlayback(edgeId, sessionId, eventId).then(
      (started) => {
        if (isStopped) return;
        setSession(started);
        const origin = startAtRef.current ?? started.position;
        startedAtRef.current = origin;
        setStartedAt(origin);
        resetClock(0);
        poll = setInterval(() => {
          controlPlayback(edgeId, sessionId, "status").then(
            (next) => {
              if (isStopped) return;
              setSession(next);
              const origin = startedAtRef.current;
              const last = lastFrameRef.current;
              if (
                next.state === "playing" &&
                origin !== null &&
                last !== null &&
                performance.now() - last < FRAME_GAP_MS &&
                Math.abs(next.position - origin - clockRef.current) > DRIFT_MS
              )
                resetClock(Math.max(0, next.position - origin));
            },
            () => {
              clearInterval(poll);
              if (!isStopped) setError("The clip session ended");
            },
          );
        }, STATUS_MS);
      },
      (failure: unknown) => {
        if (!isStopped)
          setError(failure instanceof Error ? failure.message : "Clip failed");
      },
    );
    return () => {
      isStopped = true;
      clearInterval(poll);
      stopPlayback(edgeId, sessionId).catch((failure: unknown) =>
        console.warn("[clip] stop failed:", failure),
      );
    };
  }, [edgeId, eventId, round, resetClock]);
  return {
    session,
    elapsed: session ? clock : null,
    onFrame,
    seekTo,
    seekBy: (deltaMs: number) => seekTo(clock + deltaMs),
    error,
    isBusy,
    pause: async () => {
      isFrozenRef.current = true;
      if (!(await send("pause"))) isFrozenRef.current = false;
    },
    resume: async () => {
      const next = await send("resume");
      if (next) isFrozenRef.current = false;
    },
    changeSpeed: (speed: number) => send("speed", { speed }),
  };
};
