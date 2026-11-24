import { z } from "zod";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";
import { GRID_PRESETS } from "./edit-layout";

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

export const createGridPreferenceStore = (key: string) =>
  createPersistedStore<GridPreference>({
    key,
    version: 1,
    schema: gridSchema,
    initial: { rows: 2, columns: 2 },
  });

export const gridPreferenceStore = createGridPreferenceStore("live:grid");

export const gridValue = (rows: number, columns: number) =>
  `${rows}x${columns}`;

export const gridItems = (rows: number, columns: number) => {
  const sizes = GRID_PRESETS.some(([r, c]) => r === rows && c === columns)
    ? GRID_PRESETS
    : [...GRID_PRESETS, [rows, columns]];
  return sizes.map(([r, c]) => ({
    value: gridValue(r, c),
    label: `${r}×${c}`,
  }));
};
