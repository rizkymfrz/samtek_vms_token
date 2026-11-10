export const HEARTBEAT_SECONDS = 60;

export const isServerOnline = (
  server: { isActive: boolean; lastSeenAt: number | null },
  now: number,
) =>
  server.isActive &&
  server.lastSeenAt !== null &&
  now - server.lastSeenAt < HEARTBEAT_SECONDS * 1000;

export const EDGE_STATUS_TIMEOUT_MS = 5000;
