import { z } from "zod";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";

const SIZES = [1, 2, 3];

const gridSchema = z
  .object({ rows: z.number(), columns: z.number() })
  .catch({ rows: 2, columns: 2 })
  .transform((grid) =>
    grid.rows === grid.columns && SIZES.includes(grid.rows)
      ? grid
      : { rows: 2, columns: 2 },
  );

export type GridPreference = { rows: number; columns: number };

export const gridPreferenceStore = createPersistedStore<GridPreference>({
  key: "live:grid",
  version: 1,
  schema: gridSchema,
  initial: { rows: 2, columns: 2 },
});
