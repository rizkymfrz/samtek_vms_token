import { edgeAlarmsResponseSchema, toAlertRow } from "@/features/alerts";
import { listCentralDevices } from "@/lib/api/central-devices";
import { type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
import { getCentralServers, getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildDashboard } from "./build-dashboard";
import { withOther } from "../lib/aggregate";
import { clock, delta, HOUR, titleCase } from "../lib/format";
import { RECENT_ALARMS } from "../lib/recent-alarms";
import {
  type EdgeAlarmSummary,
  edgeAlarmSummarySchema,
} from "../schemas/edge-alarm-summary";
import type { BarItem } from "../types";

const relayOf = (edge: EdgeTarget) => ({
  webrtcUrl: edge.webrtcUrl,
  webrtcUrlLocal: edge.webrtcUrlLocal,
});

const HOURS = 24;
const HEATMAP_CAMERAS = 12;
const KIND_ITEMS = 5;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const queryEdge = (edge: EdgeTarget, since: string, until: string) =>
  Promise.all([
    getFromEdge(edge, "/v1/alarms/summary", edgeAlarmSummarySchema, {
      since,
      until,
      bucket_minutes: 60,
    }),
    getFromEdge(edge, "/v1/alarms", edgeAlarmsResponseSchema, {
      since,
      until,
      limit: RECENT_ALARMS,
    }),
  ]);

export const getLiveDashboard = async (now = Date.now()) => {
  const hourStarts = Array.from(
    { length: HOURS },
    (_, index) => Math.floor(now / HOUR) * HOUR - (HOURS - 1 - index) * HOUR,
  );
  const since = new Date(hourStarts[0]).toISOString();
  const until = new Date(now).toISOString();
  const token = await requireAccessToken();
  const [edges, servers] = await Promise.all([
    getEdgeServers(token),
    getCentralServers(token),
  ]);
  const [{ results, failures }, { devices }] = await Promise.all([
    queryEdges(edges, (edge) => queryEdge(edge, since, until)),
    listCentralDevices(token, servers),
  ]);
  if (results.length === 0 && failures.length > 0) {
    throw new Error(
      failures.map((f) => `${f.edgeName}: ${f.message}`).join("; "),
    );
  }
  const deviceName = new Map(devices.map((d) => [d.id, d.name]));
  const summaries: EdgeAlarmSummary[] = results.map(({ data }) => data[0]);
  const bucketIndex = new Map(hourStarts.map((start, i) => [start, i]));
  const timeline = hourStarts.map((start) => ({
    label: clock.format(start),
    medium: 0,
    high: 0,
  }));
  const cameraHours = new Map<string, number[]>();
  const kindCounts = new Map<string, number>();
  const risk = { medium: 0, high: 0 };
  let all = 0;
  let previous = { total: 0, high: 0 };
  for (const summary of summaries) {
    summary.buckets.forEach((bucket) => {
      const index = bucketIndex.get(Date.parse(bucket.start));
      if (index === undefined) return;
      timeline[index].medium += bucket.medium;
      timeline[index].high += bucket.high;
    });
    risk.medium += summary.risk_counts.medium;
    risk.high += summary.risk_counts.high;
    all += summary.total;
    previous = {
      total: previous.total + summary.previous.total,
      high: previous.high + summary.previous.high,
    };
    for (const kind of summary.kinds) {
      kindCounts.set(kind.kind, (kindCounts.get(kind.kind) ?? 0) + kind.count);
    }
    for (const device of summary.devices) {
      const hours = cameraHours.get(device.device_id) ?? Array(HOURS).fill(0);
      summary.buckets.forEach((bucket, i) => {
        const index = bucketIndex.get(Date.parse(bucket.start));
        if (index !== undefined) hours[index] += device.counts[i] ?? 0;
      });
      cameraHours.set(device.device_id, hours);
    }
  }
  const alarmsByKind: BarItem[] = withOther(
    [...kindCounts.entries()]
      .map(([kind, value]) => ({ label: titleCase(kind), value }))
      .sort((a, b) => b.value - a.value),
    KIND_ITEMS,
    "types",
  );
  const heatmap = [...cameraHours.entries()]
    .sort((a, b) => sum(b[1]) - sum(a[1]))
    .slice(0, HEATMAP_CAMERAS)
    .map(([id, hours]) => ({ device: deviceName.get(id) ?? id, hours }));
  const relays = Object.fromEntries(
    edges.map((edge) => [edge.id, relayOf(edge)]),
  );
  const recentAlarms = results
    .flatMap(({ edge, data }) =>
      data[1].alarms
        .filter((alarm) => alarm.risk_level !== "low")
        .map((alarm) => toAlertRow(edge.id, relayOf(edge), alarm, deviceName)),
    )
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id))
    .slice(0, RECENT_ALARMS);
  const empty = buildDashboard([], now);
  return {
    ...empty,
    kpis: {
      ...empty.kpis,
      alarms: { value: all, change: delta(all, previous.total) },
      severe: { value: risk.high, change: delta(risk.high, previous.high) },
    },
    deviceNames: Object.fromEntries(deviceName),
    timeline,
    riskTotals: [
      { level: "medium" as const, count: risk.medium },
      { level: "high" as const, count: risk.high },
    ],
    alarmsByKind,
    heatmap,
    recentAlarms,
    relays,
  };
};
