import type { AlertRow } from "../types";

export const ALL = "all";
export const CUSTOM_RANGE = "custom";
const HOUR_MS = 3_600_000;
export const DEFAULT_HOURS = 168;

export const RANGES = [
  { value: "1", label: "Last hour", hours: 1 },
  { value: "6", label: "Last 6 hours", hours: 6 },
  { value: "24", label: "Last 24 hours", hours: 24 },
  { value: "48", label: "Last 48 hours", hours: 48 },
  { value: "168", label: "Last 7 days", hours: 168 },
  { value: "720", label: "Last 30 days", hours: 720 },
  { value: CUSTOM_RANGE, label: "Custom range", hours: null },
];

export type Filters = {
  query: string;
  range: string;
  from: string;
  to: string;
  risk: string;
  title: string;
  camera: string;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  range: String(DEFAULT_HOURS),
  from: "",
  to: "",
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

export const parseDateKey = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date: Date | undefined) => {
  if (!date) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const dayStart = (value: string, offsetDays = 0) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day + offsetDays).getTime();
};

const customWindow = (filters: Filters) => {
  if (filters.range !== CUSTOM_RANGE || !filters.from || !filters.to) {
    return null;
  }
  const since = dayStart(filters.from);
  const end = dayStart(filters.to, 1);
  return end > since ? { since, end } : null;
};

export const rangeKey = (filters: Filters) => {
  if (customWindow(filters)) return `custom:${filters.from}:${filters.to}`;
  const hours =
    RANGES.find((range) => range.value === filters.range)?.hours ??
    DEFAULT_HOURS;
  return `last:${hours}`;
};

export const alertWindow = (filters: Filters, now: number) => {
  const custom = customWindow(filters);
  if (custom) {
    return {
      since: custom.since,
      until: custom.end > now ? null : custom.end,
    };
  }
  const hours =
    RANGES.find((range) => range.value === filters.range)?.hours ??
    DEFAULT_HOURS;
  return { since: now - hours * HOUR_MS, until: null };
};

export const filterAlerts = (
  rows: AlertRow[],
  filters: Filters,
  now: number,
): AlertRow[] => {
  const { since, until } = alertWindow(filters, now);
  const needle = filters.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.at >= since &&
      (until === null || row.at < until) &&
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
