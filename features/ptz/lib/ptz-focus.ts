import { useSyncExternalStore } from "react";

export type PtzCamera = { edgeId: string; deviceId: string; name: string };

let active: PtzCamera | null = null;

const listeners = new Set<() => void>();

export const setPtzCamera = (camera: PtzCamera | null) => {
  active = camera;
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const usePtzCamera = () =>
  useSyncExternalStore(
    subscribe,
    () => active,
    () => null,
  );
