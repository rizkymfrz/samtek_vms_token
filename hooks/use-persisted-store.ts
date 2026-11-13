"use client";
import { useSyncExternalStore } from "react";
import type { PersistedStore } from "@/lib/storage/create-persisted-store";

export const usePersistedStore = <T>(store: PersistedStore<T>) =>
  useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
