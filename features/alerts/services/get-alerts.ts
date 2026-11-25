import { isLiveSource } from "@/config/env";
import { listCentralDevices } from "@/lib/api/central-devices";
import { type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
import { getCentralServers, getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildAlerts } from "@/lib/mock/alerts-source";
import { toRow } from "../lib/alarm-row";
import { DEFAULT_HOURS } from "../lib/filter-alerts";
import {
  type EdgeAlarm,
  edgeAlarmsResponseSchema,
} from "../schemas/edge-alarm";
import type { AlertsData, AlertsQuery } from "../types";

const relayOf = (edge: EdgeTarget) => ({
  webrtcUrl: edge.webrtcUrl,
  webrtcUrlLocal: edge.webrtcUrlLocal,
});

const EDGE_PAGE_LIMIT = 1000;

export const listEdgeAlarms = async (edge: EdgeTarget, query: AlertsQuery) => {
  const alarms = new Map<string, EdgeAlarm>();
  let until = query.until;
  for (;;) {
    const response = await fetchPage(edge, query.since, until);
    const known = alarms.size;
    for (const alarm of response.alarms) alarms.set(alarm.event_id, alarm);
    const last = response.alarms.at(-1);
    if (
      !last ||
      response.alarms.length < EDGE_PAGE_LIMIT ||
      alarms.size === known
    ) {
      return { alarms: [...alarms.values()] };
    }
    until = Date.parse(last.occurred_at) + 1;
  }
};

const fetchPage = (edge: EdgeTarget, since: number, until: number | null) =>
  getFromEdge(edge, "/v1/alarms", edgeAlarmsResponseSchema, {
    since: new Date(since).toISOString(),
    limit: EDGE_PAGE_LIMIT,
    ...(until !== null && { until: new Date(until).toISOString() }),
  });

export const getAlerts = async (query?: AlertsQuery): Promise<AlertsData> => {
  const now = Date.now();
  const window = query ?? {
    since: now - DEFAULT_HOURS * 3_600_000,
    until: null,
  };
  if (!isLiveSource) return buildAlerts(now, window);
  const token = await requireAccessToken();
  const [edges, servers] = await Promise.all([
    getEdgeServers(token),
    getCentralServers(token),
  ]);
  const [{ results, failures }, { devices }] = await Promise.all([
    queryEdges(edges, (edge) => listEdgeAlarms(edge, window)),
    listCentralDevices(token, servers),
  ]);
  const cameraNames = new Map(
    devices.map((device) => [device.id, device.name]),
  );
  const rows = results
    .flatMap(({ edge, data }) =>
      data.alarms.map((alarm) =>
        toRow(edge.id, relayOf(edge), alarm, cameraNames),
      ),
    )
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now,
    rows,
    titles: [...new Set(rows.map((row) => row.title))].sort(),
    cameras: [...new Set(rows.map((row) => row.camera))].sort(),
    cameraNames: Object.fromEntries(cameraNames),
    relays: Object.fromEntries(edges.map((edge) => [edge.id, relayOf(edge)])),
    failures,
  };
};
