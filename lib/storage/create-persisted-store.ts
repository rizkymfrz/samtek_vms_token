import { z } from "zod";
import { kvGet, kvSet } from "./idb-kv";

const SAVE_DELAY_MS = 200;

export type PersistedSnapshot<T> = {
  status: "loading" | "ready";
  value: T;
};

export type PersistedStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PersistedSnapshot<T>;
  getServerSnapshot: () => PersistedSnapshot<T>;
  update: (change: (value: T) => T) => void;
};

export const createPersistedStore = <T>({
  key,
  version,
  schema,
  initial,
}: {
  key: string;
  version: number;
  schema: z.ZodType<T, unknown>;
  initial: T;
}): PersistedStore<T> => {
  const envelope = z.object({ v: z.literal(version), data: schema });
  const server: PersistedSnapshot<T> = {
    status: "loading",
    value: initial,
  };
  const listeners = new Set<() => void>();
  let snapshot = server;
  let isStarted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const save = () => {
    clearTimeout(timer);
    timer = undefined;
    kvSet(key, { v: version, data: snapshot.value }).catch((error: unknown) => {
      console.warn(`[storage] ${key}: could not save`, error);
    });
  };
  const load = async () => {
    let value = snapshot.value;
    try {
      const parsed = envelope.safeParse(await kvGet(key));
      if (parsed.success) value = parsed.data.data;
    } catch (error) {
      console.warn(`[storage] ${key}: could not load`, error);
    }
    snapshot = { status: "ready", value };
    emit();
  };
  const start = () => {
    if (isStarted) return;
    isStarted = true;
    window.addEventListener("pagehide", () => {
      if (timer !== undefined) save();
    });
    void load();
  };
  return {
    subscribe: (listener) => {
      start();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => server,
    update: (change) => {
      if (snapshot.status !== "ready") return;
      const value = change(snapshot.value);
      if (value === snapshot.value) return;
      snapshot = { status: "ready", value };
      emit();
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY_MS);
    },
  };
};
