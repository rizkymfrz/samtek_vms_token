import { isLiveSource } from "@/config/env";
import { listCentralDevices } from "@/lib/api/central-devices";
import { EdgeError, type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
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
const MAX_EDGE_PAGES = 10;

export const listEdgeAlarms = async (edge: EdgeTarget, query: AlertsQuery) => {
  const alarms = new Map<string, EdgeAlarm>();
  let until = query.until;
  let beforeEventId: string | undefined;
  for (let page = 0; page < MAX_EDGE_PAGES; page++) {
    let response: Awaited<ReturnType<typeof fetchPage>>;
    try {
      response = await fetchPage(edge, query.since, until, beforeEventId);
    } catch (error) {
      const last = [...alarms.values()].at(-1);
      if (error instanceof EdgeError && error.status === 404 && last) {
        until = Date.parse(last.occurred_at) + 1;
        beforeEventId = undefined;
        continue;
      }
      throw error;
    }
    for (const alarm of response.alarms) alarms.set(alarm.event_id, alarm);
    if (response.alarms.length < EDGE_PAGE_LIMIT) {
      return { alarms: [...alarms.values()], isTruncated: false };
    }
    beforeEventId = response.alarms.at(-1)?.event_id;
  }
  return { alarms: [...alarms.values()], isTruncated: true };
};

const fetchPage = (
  edge: EdgeTarget,
  since: number,
  until: number | null,
  beforeEventId: string | undefined,
) =>
  getFromEdge(edge, "/v1/alarms", edgeAlarmsResponseSchema, {
    since: new Date(since).toISOString(),
    limit: EDGE_PAGE_LIMIT,
    ...(until !== null && { until: new Date(until).toISOString() }),
    ...(beforeEventId && { before_event_id: beforeEventId }),
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
    isTruncated: results.some(({ data }) => data.isTruncated),
    titles: [...new Set(rows.map((row) => row.title))].sort(),
    cameras: [...new Set(rows.map((row) => row.camera))].sort(),
    cameraNames: Object.fromEntries(cameraNames),
    relays: Object.fromEntries(edges.map((edge) => [edge.id, relayOf(edge)])),
    failures,
  };
};
