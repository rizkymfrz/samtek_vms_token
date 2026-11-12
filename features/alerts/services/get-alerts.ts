import { isLiveSource } from "@/config/env";
import { listCentralDevices } from "@/lib/api/central-devices";
import { EdgeError, type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
import { getCentralServers, getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildAlerts } from "@/lib/mock/alerts-source";
import { DEFAULT_HOURS } from "../lib/filter-alerts";
import { formatDate, formatTime, titleCase } from "../lib/format-alert";
import {
  type EdgeAlarm,
  edgeAlarmsResponseSchema,
} from "../schemas/edge-alarm";
import type { AlertRow, AlertsData, AlertsQuery } from "../types";

const EDGE_PAGE_LIMIT = 1000;
const MAX_EDGE_PAGES = 10;

const clipDurationMs = (alarm: EdgeAlarm) => {
  const seconds = alarm.clip_window_seconds || alarm.clip_duration_seconds;
  return seconds && seconds > 0 ? seconds * 1000 : null;
};

const toRow = (
  edge: EdgeTarget,
  alarm: EdgeAlarm,
  cameraNames: Map<string, string>,
): AlertRow => {
  const occurredAt = new Date(alarm.occurred_at);
  return {
    id: `${edge.id}:${alarm.event_id}`,
    at: occurredAt.getTime(),
    time: formatTime(occurredAt),
    date: formatDate(occurredAt),
    title: alarm.title,
    description: alarm.description,
    risk: alarm.risk_level,
    camera: cameraNames.get(alarm.device_id) ?? alarm.device_id,
    analytic: titleCase(alarm.analytic_id),
    object: titleCase(alarm.object?.label ?? "unknown"),
    score: alarm.object?.confidence ?? 0,
    perimeter: alarm.perimeter
      ? `${alarm.perimeter.name} (${alarm.perimeter.shape})`
      : "None",
    trackId: alarm.object?.track_id ?? 0,
    frame: "—",
    imagePath: alarm.image_path ?? "",
    imageUrl: alarm.image_path
      ? `/api/edge/${edge.id}/alarms/${alarm.event_id}/image`
      : null,
    clip: alarm.clip_path
      ? {
          edgeId: edge.id,
          eventId: alarm.event_id,
          startAt:
            alarm.clip_offset_seconds === undefined
              ? null
              : occurredAt.getTime() -
                alarm.clip_offset_seconds * 1000 +
                (alarm.clip_window_seconds
                  ? (alarm.clip_window_start_seconds ?? 0) * 1000
                  : 0),
          durationMs: clipDurationMs(alarm),
          relay: {
            webrtcUrl: edge.webrtcUrl,
            webrtcUrlLocal: edge.webrtcUrlLocal,
          },
        }
      : null,
    details: Object.entries(alarm.detail).map(([key, value]) => ({
      label: titleCase(key),
      value: Array.isArray(value) ? value.join(", ") : String(value),
    })),
  };
};

const listEdgeAlarms = async (edge: EdgeTarget, query: AlertsQuery) => {
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
      data.alarms.map((alarm) => toRow(edge, alarm, cameraNames)),
    )
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now,
    rows,
    isTruncated: results.some(({ data }) => data.isTruncated),
    titles: [...new Set(rows.map((row) => row.title))].sort(),
    cameras: [...new Set(rows.map((row) => row.camera))].sort(),
    failures,
  };
};
