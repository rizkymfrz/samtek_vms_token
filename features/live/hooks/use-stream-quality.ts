"use client";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import {
  setStreamPreference,
  streamPreferenceStore,
} from "../lib/stream-preference-store";
import { resolveQuality } from "../lib/stream-quality";
import type { StreamQuality } from "../types";

export const useStreamQuality = (
  id: string,
  streams: { hasSubStream: boolean; hasThirdStream: boolean },
  fallback: StreamQuality,
) => {
  const { status, value } = usePersistedStore(streamPreferenceStore);
  const picked = resolveQuality(value.byDevice[id], fallback, streams);
  const pick = (next: StreamQuality) =>
    streamPreferenceStore.update((state) =>
      setStreamPreference(state, id, next),
    );
  return { status, picked, pick };
};
