"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { SamtekDesktop } from "@/types/desktop";

const subscribe = () => () => {};

export const useDesktop = (): SamtekDesktop | null =>
  useSyncExternalStore(
    subscribe,
    () => window.samtekDesktop ?? null,
    () => null,
  );

export const useDesktopFullscreen = (desktop: SamtekDesktop | null) => {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    if (!desktop) return;
    desktop.isFullscreen().then(setFullscreen);
    return desktop.onFullscreenChange(setFullscreen);
  }, [desktop]);
  return fullscreen;
};
