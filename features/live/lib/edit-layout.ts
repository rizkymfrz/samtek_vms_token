import type { LiveLayout, LiveLayoutSummary } from "../types";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [1, 1],
  [2, 2],
  [3, 3],
];

export const addCameras = (layout: LiveLayout, ids: string[]): LiveLayout => ({
  ...layout,
  cameras: [...new Set([...layout.cameras, ...ids])],
});

export const removeCameras = (
  layout: LiveLayout,
  ids: string[],
): LiveLayout => ({
  ...layout,
  cameras: layout.cameras.filter((id) => !ids.includes(id)),
});

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
    isDefault: false,
    cameras: [],
  };
};

export const summaryOf = ({
  id,
  name,
  description,
  isDefault,
}: LiveLayoutSummary): LiveLayoutSummary => ({
  id,
  name,
  description,
  isDefault,
});
