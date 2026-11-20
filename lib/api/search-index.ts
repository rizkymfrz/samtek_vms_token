import { z } from "zod";

export const DEFAULT_SEARCH_INTERVAL = 5;
export const MIN_SEARCH_INTERVAL = 1;
export const MAX_SEARCH_INTERVAL = 3600;

export const searchIndexSchema = z.object({
  isEnabled: z.boolean(),
  labels: z.array(z.string()),
  intervalSeconds: z
    .number()
    .int()
    .min(MIN_SEARCH_INTERVAL)
    .max(MAX_SEARCH_INTERVAL),
});

export type SearchIndexConfig = z.output<typeof searchIndexSchema>;

export const OFF_SEARCH_INDEX: SearchIndexConfig = {
  isEnabled: false,
  labels: [],
  intervalSeconds: DEFAULT_SEARCH_INTERVAL,
};
