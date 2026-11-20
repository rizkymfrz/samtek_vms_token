"use client";
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
};

export const useFullscreenElement = () =>
  useSyncExternalStore(
    subscribe,
    () =>
      document.fullscreenElement instanceof HTMLElement
        ? document.fullscreenElement
        : null,
    () => null,
  );
