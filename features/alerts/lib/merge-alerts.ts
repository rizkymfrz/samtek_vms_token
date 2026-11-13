import type { AlertClip, AlertRow, AlertsData } from "../types";

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
    cameraNames: { ...previous.cameraNames, ...incoming.cameraNames },
    relays: { ...previous.relays, ...incoming.relays },
    failures: incoming.failures,
  };
};

export const addAlert = (previous: AlertsData, row: AlertRow): AlertsData =>
  mergeAlerts(previous, { ...previous, rows: [row] }, 0);

export const setAlertClip = (
  previous: AlertsData,
  rowId: string,
  clip: AlertClip,
): AlertsData => ({
  ...previous,
  rows: previous.rows.map((row) => (row.id === rowId ? { ...row, clip } : row)),
});
