import type { LiveLayout, LiveLayoutSummary } from "../types";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
  [5, 5],
  [6, 6],
];

export const countCameras = (layout: LiveLayout) =>
  layout.slots.filter(Boolean).length;

export const freeSlots = (layout: LiveLayout) =>
  layout.slots.length - countCameras(layout);

export const addCameras = (layout: LiveLayout, ids: string[]): LiveLayout => {
  const queue = ids.filter(
    (id, index) => !layout.slots.includes(id) && ids.indexOf(id) === index,
  );
  const slots = layout.slots.map((slot) => slot ?? queue.shift() ?? null);
  return { ...layout, slots };
};

export const removeCameras = (
  layout: LiveLayout,
  ids: string[],
): LiveLayout => {
  return {
    ...layout,
    slots: layout.slots.map((slot) =>
      slot && ids.includes(slot) ? null : slot,
    ),
  };
};

export const resizeLayout = (
  layout: LiveLayout,
  rows: number,
  columns: number,
): LiveLayout => {
  const size = rows * columns;
  const kept = Array.from(
    { length: size },
    (_, index) => layout.slots[index] ?? null,
  );
  const overflow = layout.slots
    .slice(size)
    .filter((slot): slot is string => slot !== null);
  const slots = kept.map((slot) => slot ?? overflow.shift() ?? null);
  return { ...layout, rows, columns, slots };
};

export const createLayout = (existing: LiveLayoutSummary[]): LiveLayout => {
  let number = existing.length + 1;
  while (existing.some((layout) => layout.name === `Layout ${number}`))
    number++;
  return {
    id: `new-${Date.now()}-${number}`,
    name: `Layout ${number}`,
    description: null,
    rows: 2,
    columns: 2,
    isDefault: false,
    slots: Array.from({ length: 4 }, () => null),
  };
};

export const summaryOf = ({
  id,
  name,
  description,
  rows,
  columns,
  isDefault,
}: LiveLayoutSummary): LiveLayoutSummary => ({
  id,
  name,
  description,
  rows,
  columns,
  isDefault,
});
