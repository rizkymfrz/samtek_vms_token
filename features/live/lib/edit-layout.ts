import type { LiveLayout, LiveLayoutSummary } from "../types";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [1, 1],
  [2, 2],
  [3, 3],
];

const trimmed = (cameras: (string | null)[]) => {
  const end = cameras.findLastIndex((id) => id !== null);
  return cameras.slice(0, end + 1);
};

export const slotsOf = (
  links: { position: number; id: string | null }[],
): (string | null)[] => {
  const cameras: (string | null)[] = [];
  for (const { position, id } of links)
    if (id !== null && position >= 1) cameras[position - 1] = id;
  return Array.from(cameras, (id) => id ?? null);
};

export const addCameras = <T extends { cameras: (string | null)[] }>(
  layout: T,
  ids: string[],
): T => {
  const cameras = [...layout.cameras];
  for (const id of ids) {
    if (cameras.includes(id)) continue;
    const gap = cameras.indexOf(null);
    if (gap === -1) cameras.push(id);
    else cameras[gap] = id;
  }
  return { ...layout, cameras };
};

export const removeCameras = <T extends { cameras: (string | null)[] }>(
  layout: T,
  ids: string[],
): T => ({
  ...layout,
  cameras: trimmed(
    layout.cameras.map((id) => (id !== null && ids.includes(id) ? null : id)),
  ),
});

export const placeCamera = <T extends { cameras: (string | null)[] }>(
  layout: T,
  id: string,
  at: number,
): T => {
  const cameras = Array.from(
    { length: Math.max(layout.cameras.length, at + 1) },
    (_, index) => layout.cameras[index] ?? null,
  );
  const from = cameras.indexOf(id);
  if (from !== -1) {
    [cameras[from], cameras[at]] = [cameras[at], cameras[from]];
  } else if (cameras[at] === null) {
    cameras[at] = id;
  } else {
    cameras.splice(at, 0, id);
  }
  return { ...layout, cameras: trimmed(cameras) };
};

export const pageOf = <T>(ids: T[], page: number, pageSize: number) =>
  ids.slice(page * pageSize, (page + 1) * pageSize);

export const pageCount = (cameras: number, pageSize: number) =>
  Math.max(1, Math.ceil(cameras / pageSize));

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
