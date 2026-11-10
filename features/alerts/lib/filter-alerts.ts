import type { AlertRow } from "../types";

export const ALL = "all";

export const RANGES = [
  { value: "1", label: "Last hour", hours: 1 },
  { value: "6", label: "Last 6 hours", hours: 6 },
  { value: "24", label: "Last 24 hours", hours: 24 },
  { value: "48", label: "Last 48 hours", hours: 48 },
];

export type Filters = {
  query: string;
  range: string;
  risk: string;
  title: string;
  camera: string;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  range: "48",
  risk: ALL,
  title: ALL,
  camera: ALL,
};

export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" ||
  filters.range !== DEFAULT_FILTERS.range ||
  filters.risk !== ALL ||
  filters.title !== ALL ||
  filters.camera !== ALL;

export const filterAlerts = (
  rows: AlertRow[],
  filters: Filters,
  now: number,
): AlertRow[] => {
  const hours =
    RANGES.find((range) => range.value === filters.range)?.hours ?? 48;
  const since = now - hours * 3_600_000;
  const needle = filters.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.at > since &&
      (filters.risk === ALL || row.risk === filters.risk) &&
      (filters.title === ALL || row.title === filters.title) &&
      (filters.camera === ALL || row.camera === filters.camera) &&
      (!needle ||
        `${row.title} ${row.description} ${row.camera} ${row.id} ${row.object}`
          .toLowerCase()
          .includes(needle)),
  );
};

export const countByCamera = (
  rows: AlertRow[],
  filters: Filters,
  now: number,
) => {
  const counts = new Map<string, number>();
  for (const row of filterAlerts(rows, { ...filters, camera: ALL }, now)) {
    counts.set(row.camera, (counts.get(row.camera) ?? 0) + 1);
  }
  return [...counts]
    .map(([camera, count]) => ({ camera, count }))
    .sort((a, b) => b.count - a.count || a.camera.localeCompare(b.camera));
};
