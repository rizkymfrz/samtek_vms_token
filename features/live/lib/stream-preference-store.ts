import { z } from "zod";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";

const preferenceSchema = z.object({
  byDevice: z.record(
    z.string(),
    z.enum(["main", "sub", "third"]).catch("main"),
  ),
});

type StreamPreferences = z.output<typeof preferenceSchema>;

export const setStreamPreference = (
  state: StreamPreferences,
  deviceId: string,
  quality: "main" | "sub" | "third",
): StreamPreferences =>
  state.byDevice[deviceId] === quality
    ? state
    : { byDevice: { ...state.byDevice, [deviceId]: quality } };

export const streamPreferenceStore = createPersistedStore({
  key: "live:stream-quality",
  version: 1,
  schema: preferenceSchema,
  initial: { byDevice: {} } satisfies StreamPreferences,
});
