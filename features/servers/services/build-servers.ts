import { buildMetrics, buildServerSource, GROUPS } from "./server-source";
import type { ServersData } from "../types";

export const buildServers = (now = Date.now()): ServersData => {
  const { servers, discovered } = buildServerSource(now);
  return {
    now,
    servers,
    groups: GROUPS,
    discovered,
    metrics: Object.fromEntries(servers.map((s) => [s.id, buildMetrics(s.id)])),
  };
};
