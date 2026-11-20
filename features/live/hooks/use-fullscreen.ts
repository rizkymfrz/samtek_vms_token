"use client";
import { type RefObject, useCallback, useEffect, useState } from "react";

export const useFullscreen = (target: RefObject<HTMLElement | null>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () =>
      setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [target]);
  const toggle = useCallback(() => {
    if (document.fullscreenElement === target.current) {
      void document.exitFullscreen();
    } else {
      void target.current?.requestFullscreen?.().catch(() => undefined);
    }
  }, [target]);
  return { isFullscreen, toggle };
};
