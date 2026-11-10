import type { ServerRecord } from "../types";

export const HEARTBEAT_SECONDS = 60;

export const isOnline = (server: ServerRecord, now: number) =>
  server.isActive &&
  server.lastSeenAt !== null &&
  now - server.lastSeenAt < HEARTBEAT_SECONDS * 1000;
