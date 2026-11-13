import { z } from "zod";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";

export const notificationStore = createPersistedStore({
  key: "alerts:notifications",
  version: 1,
  schema: z.object({ readAt: z.number() }),
  initial: { readAt: 0 },
});
