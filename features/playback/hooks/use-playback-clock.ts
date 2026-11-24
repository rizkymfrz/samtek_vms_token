"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 1000;

type Anchor = {
  at: number | null;
  wall: number;
  isPlaying: boolean;
  speed: number;
};

export type ClockReading = {
  position: number | null;
  isPlaying: boolean;
  speed: number;
};

export type ClockCommand =
  | { type: "seek"; at: number; speed: number }
  | { type: "pause" }
  | { type: "resume"; position: number | null; speed: number }
  | { type: "speed"; speed: number }
  | { type: "stop" };

type Listener = (command: ClockCommand) => void;

const IDLE: Anchor = { at: null, wall: 0, isPlaying: false, speed: 1 };

const positionOf = (anchor: Anchor, now: number) =>
  anchor.at === null
    ? null
    : anchor.isPlaying
      ? anchor.at + (Math.max(now, anchor.wall) - anchor.wall) * anchor.speed
      : anchor.at;

export const usePlaybackClock = () => {
  const anchor = useRef(IDLE);
  const listeners = useRef(new Set<Listener>());
  const [view, setView] = useState(IDLE);
  const [now, setNow] = useState(0);
  const apply = useCallback((next: Anchor, command?: ClockCommand) => {
    anchor.current = next;
    setView(next);
    if (!command) return;
    for (const listener of listeners.current) listener(command);
  }, []);
  const read = useCallback((): ClockReading => {
    const { isPlaying, speed } = anchor.current;
    return {
      position: positionOf(anchor.current, Date.now()),
      isPlaying,
      speed,
    };
  }, []);
  const seek = useCallback(
    (at: number) => {
      const { speed } = anchor.current;
      apply(
        { at, wall: Date.now(), isPlaying: true, speed },
        {
          type: "seek",
          at,
          speed,
        },
      );
    },
    [apply],
  );
  const pause = useCallback(() => {
    const { position, speed } = read();
    if (position === null) return;
    apply(
      { at: position, wall: Date.now(), isPlaying: false, speed },
      { type: "pause" },
    );
  }, [apply, read]);
  const resume = useCallback(() => {
    const { position, speed } = read();
    if (position === null) return;
    apply(
      { at: position, wall: Date.now(), isPlaying: true, speed },
      { type: "resume", position, speed },
    );
  }, [apply, read]);
  const setSpeed = useCallback(
    (speed: number) => {
      const { position, isPlaying } = read();
      if (position === null) return;
      apply(
        { at: position, wall: Date.now(), isPlaying, speed },
        { type: "speed", speed },
      );
    },
    [apply, read],
  );
  const reset = useCallback(() => {
    const { speed } = anchor.current;
    apply({ ...IDLE, speed }, { type: "stop" });
  }, [apply]);
  const adopt = useCallback(
    ({ position, isPlaying, speed }: ClockReading) =>
      apply({ at: position, wall: Date.now(), isPlaying, speed }),
    [apply],
  );
  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const { isPlaying } = view;
  useEffect(() => {
    if (!isPlaying) return;
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(tick);
  }, [isPlaying]);
  return {
    position: positionOf(view, now),
    isPlaying,
    speed: view.speed,
    read,
    seek,
    pause,
    resume,
    setSpeed,
    reset,
    adopt,
    subscribe,
  };
};

export type PlaybackClock = ReturnType<typeof usePlaybackClock>;
