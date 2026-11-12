"use client";
import { useEffect, useState } from "react";
import {
  controlPlayback,
  type PlaybackSession,
  startClipPlayback,
  stopPlayback,
} from "@/features/edge-status";

const STATUS_MS = 3000;

const newSessionId = () =>
  `vms-clip-${Math.random().toString(16).slice(2, 12)}`;

export const useClipSession = (edgeId: string, eventId: string) => {
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const sessionId = newSessionId();
    let isStopped = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    startClipPlayback(edgeId, sessionId, eventId).then(
      (started) => {
        if (isStopped) return;
        setSession(started);
        poll = setInterval(() => {
          controlPlayback(edgeId, sessionId, "status").then(
            (next) => !isStopped && setSession(next),
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
  }, [edgeId, eventId]);
  return { session, error };
};
