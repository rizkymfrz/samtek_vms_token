import { DEFAULT_LIMIT } from "./validate-search";
import type { SearchQuery } from "../types";

export const ALL = "all";
const HOUR_MS = 3_600_000;

export const RANGES = [
  { value: ALL, label: "All time", ms: null },
  { value: "1h", label: "Last hour", ms: HOUR_MS },
  { value: "24h", label: "Last 24 hours", ms: 24 * HOUR_MS },
  { value: "7d", label: "Last 7 days", ms: 7 * 24 * HOUR_MS },
  { value: "30d", label: "Last 30 days", ms: 30 * 24 * HOUR_MS },
];

export const LIMIT_ITEMS = [25, 50, 100, 250, 500, 1000].map((limit) => ({
  value: String(limit),
  label: `${limit} results`,
}));

export type Filters = {
  camera: string;
  range: string;
  limit: string;
  label: string;
};

export type Submitted = { q: string; filters: Filters; nonce: number };

export const DEFAULT_FILTERS: Filters = {
  camera: ALL,
  range: ALL,
  limit: String(DEFAULT_LIMIT),
  label: "",
};

export const toQuery = (
  { q, filters }: Submitted,
  now: number,
): SearchQuery => {
  const [edgeId, deviceId] =
    filters.camera === ALL ? [null, null] : filters.camera.split(":");
  const span = RANGES.find((range) => range.value === filters.range)?.ms;
  return {
    q,
    edgeId,
    deviceId,
    label: filters.label.trim() || null,
    since: span ? now - span : null,
    until: null,
    limit: Number(filters.limit),
  };
};
