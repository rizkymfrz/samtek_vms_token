import type { AlertRow, AlertsData } from "../types";

export const mergeAlerts = (
  previous: AlertsData,
  incoming: AlertsData,
  since: number,
): AlertsData => {
  const byId = new Map<string, AlertRow>();
  for (const row of [...previous.rows, ...incoming.rows]) {
    byId.set(row.id, row);
  }
  const rows = [...byId.values()]
    .filter((row) => row.at >= since)
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now: incoming.now,
    rows,
    isTruncated: previous.isTruncated || incoming.isTruncated,
    titles: [...new Set(rows.map((row) => row.title))].sort(),
    cameras: [...new Set(rows.map((row) => row.camera))].sort(),
    failures: incoming.failures,
  };
};
