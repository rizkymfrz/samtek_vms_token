import { z } from "zod";
import { createGridPreferenceStore } from "@/features/live";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";

const selectionSchema = z.object({ cameras: z.array(z.string().nullable()) });

export const playbackSelectionStore = createPersistedStore({
  key: "playback:layout",
  version: 1,
  schema: selectionSchema,
  initial: { cameras: [] } satisfies z.output<typeof selectionSchema>,
});

export const playbackGridStore = createGridPreferenceStore("playback:grid");
