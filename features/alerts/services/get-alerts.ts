import { isLiveSource } from "@/config/env";
import { type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildAlerts } from "@/lib/mock/alerts-source";
import { formatDate, formatTime, titleCase } from "../lib/format-alert";
import {
  type EdgeAlarm,
  edgeAlarmsResponseSchema,
} from "../schemas/edge-alarm";
import type { AlertRow, AlertsData } from "../types";

const WINDOW_HOURS = 48;
const EDGE_PAGE_LIMIT = 1000;

const toRow = (edge: EdgeTarget, alarm: EdgeAlarm): AlertRow => {
  const occurredAt = new Date(alarm.occurred_at);
  return {
    id: `${edge.id}:${alarm.event_id}`,
    at: occurredAt.getTime(),
    time: formatTime(occurredAt),
    date: formatDate(occurredAt),
    title: alarm.title,
    description: alarm.description,
    risk: alarm.risk_level,
    camera: alarm.device_id,
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

export const getAlerts = async (): Promise<AlertsData> => {
  if (!isLiveSource) return buildAlerts();
  const now = Date.now();
  const since = new Date(now - WINDOW_HOURS * 3_600_000).toISOString();
  const edges = await getEdgeServers(await requireAccessToken());
  const { results, failures } = await queryEdges(edges, (edge) =>
    getFromEdge(edge, "/v1/alarms", edgeAlarmsResponseSchema, {
      since,
      limit: EDGE_PAGE_LIMIT,
    }),
  );
  const rows = results
    .flatMap(({ edge, data }) => data.alarms.map((alarm) => toRow(edge, alarm)))
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now,
    rows,
    titles: [...new Set(rows.map((row) => row.title))].sort(),
    cameras: [...new Set(rows.map((row) => row.camera))].sort(),
    failures,
  };
};
