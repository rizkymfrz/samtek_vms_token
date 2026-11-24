import type { LiveLayout, LiveLayoutSummary } from "../types";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [1, 1],
  [2, 2],
  [3, 3],
];

export const STORAGE_COLUMNS = 6;

export const cameraIdsOf = (layout: LiveLayout) =>
  layout.slots.filter((slot): slot is string => slot !== null);

const withCameras = (layout: LiveLayout, ids: string[]): LiveLayout => {
  const rows = Math.max(1, Math.ceil(ids.length / STORAGE_COLUMNS));
  const slots = Array.from(
    { length: rows * STORAGE_COLUMNS },
    (_, index) => ids[index] ?? null,
  );
  return { ...layout, rows, columns: STORAGE_COLUMNS, slots };
};

export const addCameras = (layout: LiveLayout, ids: string[]): LiveLayout => {
  const current = cameraIdsOf(layout);
  const added = ids.filter(
    (id, index) => !current.includes(id) && ids.indexOf(id) === index,
  );
  return withCameras(layout, [...current, ...added]);
};

export const removeCameras = (layout: LiveLayout, ids: string[]): LiveLayout =>
  withCameras(
    layout,
    cameraIdsOf(layout).filter((id) => !ids.includes(id)),
  );

export const pageCount = (cameras: number, pageSize: number) =>
  Math.max(1, Math.ceil(cameras / pageSize));

export const pageOf = (ids: string[], page: number, pageSize: number) =>
  ids.slice(page * pageSize, (page + 1) * pageSize);

export const createLayout = (existing: LiveLayoutSummary[]): LiveLayout => {
  let number = existing.length + 1;
  while (existing.some((layout) => layout.name === `Layout ${number}`))
    number++;
  return {
    id: `new-${Date.now()}-${number}`,
    name: `Layout ${number}`,
    description: null,
    rows: 1,
    columns: STORAGE_COLUMNS,
    isDefault: false,
    slots: Array.from({ length: STORAGE_COLUMNS }, () => null),
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
