import type { MqttClient } from "mqtt";
import { EDGE_UP_TOPIC } from "@/config/mqtt";
import { EDGE_STATUS_TIMEOUT_MS } from "@/config/server-status";
import { connectMqtt } from "@/lib/mqtt/browser-client";
import { toDescriptors } from "./analytic-catalog";
import { ingestDetections } from "./detection-store";
import { appendSample, toSeries } from "./edge-series";
import { ulid } from "./ulid";
import {
  detectionBboxesSchema,
  edgeResultSchema,
  edgeStateSchema,
  type EdgeStatusMessage,
  edgeStatusSchema,
} from "../schemas/edge-message";
import type {
  AnalyticDescriptor,
  EdgeEntry,
  EdgeSample,
  EdgeStatusState,
} from "../types";

const NO_CATALOG: AnalyticDescriptor[] = [];
const TICK_MS = 1000;
const COMMAND_TIMEOUT_MS = 5000;

const EMPTY: EdgeStatusState = {
  isConnected: false,
  error: null,
  entries: new Map(),
  online: new Set(),
  catalog: new Map(),
};

let state = EMPTY;
let isStarted = false;
let client: MqttClient | null = null;

const pending = new Map<
  string,
  { resolve: () => void; reject: (error: Error) => void; timer: number }
>();

const histories = new Map<string, EdgeSample[]>();
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

const onlineSet = (
  entries: ReadonlyMap<string, EdgeEntry>,
  isConnected: boolean,
  now: number,
) =>
  new Set(
    isConnected
      ? [...entries]
          .filter(
            ([, entry]) =>
              now - entry.sample.receivedAt < EDGE_STATUS_TIMEOUT_MS,
          )
          .map(([id]) => id)
      : [],
  );

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) =>
  a.size === b.size && [...a].every((id) => b.has(id));

const toSample = (data: EdgeStatusMessage, now: number): EdgeSample => ({
  receivedAt: now,
  uptimeSeconds: data.uptime_seconds,
  cpuPercent: data.cpu?.usage_percent ?? null,
  temperatureC: data.cpu?.temperature_c ?? null,
  memory: data.memory
    ? { usedBytes: data.memory.used_bytes, totalBytes: data.memory.total_bytes }
    : null,
  storage: data.storage
    ? {
        totalBytes: data.storage.total_bytes,
        freeBytes: data.storage.free_bytes,
        recordingsBytes: data.storage.recordings_bytes ?? null,
        analyticsBytes: data.storage.analytics_bytes ?? null,
        retentionDays: data.storage.recordings_retention_days ?? null,
      }
    : null,
});

const setState = (next: Partial<EdgeStatusState>) => {
  const online = next.online ?? state.online;
  state = {
    ...state,
    ...next,
    online: sameSet(online, state.online) ? state.online : online,
  };
  emit();
};

const warned = new Set<string>();

const warnOnce = (topic: string, reason: string) => {
  const key = `${topic}:${reason}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[edge-status] ${topic}: ${reason}`);
};

const dropEdge = (edgeId: string) => {
  const entries = new Map(state.entries);
  entries.delete(edgeId);
  histories.delete(edgeId);
  setState({
    entries,
    online: onlineSet(entries, state.isConnected, Date.now()),
  });
};

const setCatalog = (edgeId: string, next: AnalyticDescriptor[] | null) => {
  if (next === null && !state.catalog.has(edgeId)) return;
  const catalog = new Map(state.catalog);
  if (next === null) catalog.delete(edgeId);
  else catalog.set(edgeId, next);
  setState({ catalog });
};

const receive = (topic: string, payload: Uint8Array) => {
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(payload));
  } catch {
    warnOnce(topic, "payload is not JSON");
    return;
  }
  const topicEdge = topic.split("/")[2];
  const result = edgeResultSchema.safeParse(json);
  if (result.success) {
    const waiting = pending.get(result.data.reply_to);
    if (!waiting) return;
    pending.delete(result.data.reply_to);
    clearTimeout(waiting.timer);
    if (result.data.data.ok) waiting.resolve();
    else {
      waiting.reject(
        new Error(result.data.data.error?.message ?? "The edge refused"),
      );
    }
    return;
  }
  const detection = detectionBboxesSchema.safeParse(json);
  if (detection.success) {
    const { device_id: deviceId, objects } = detection.data.data;
    ingestDetections(
      topicEdge,
      deviceId,
      objects.map((o) => ({
        label: o.label,
        confidence: o.confidence,
        trackId: o.track_id ?? null,
        ...o.bbox,
      })),
    );
    return;
  }
  const status = edgeStatusSchema.safeParse(json);
  if (status.success && status.data.data.edge_id === topicEdge) {
    const sample = toSample(status.data.data, Date.now());
    const history = appendSample(histories.get(topicEdge) ?? [], sample);
    histories.set(topicEdge, history);
    const entries = new Map(state.entries);
    entries.set(topicEdge, { sample, series: toSeries(history) });
    setState({
      entries,
      online: onlineSet(entries, state.isConnected, sample.receivedAt),
    });
    return;
  }
  const announced = edgeStateSchema.safeParse(json);
  if (announced.success) {
    const { online, analytics } = announced.data.data;
    if (online && analytics) setCatalog(topicEdge, toDescriptors(analytics));
    if (!online) {
      setCatalog(topicEdge, null);
      if (state.entries.has(topicEdge)) dropEdge(topicEdge);
    }
    return;
  }
  if (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    json.type === "edge.status"
  ) {
    warnOnce(topic, "edge.status does not match the contract");
  }
};

const tick = () => {
  const online = onlineSet(state.entries, state.isConnected, Date.now());
  if (!sameSet(online, state.online)) setState({ online });
};

export const startEdgeStatus = () => {
  if (isStarted) return;
  client = connectMqtt();
  if (!client) return;
  isStarted = true;
  client.on("connect", () => {
    client?.subscribe(EDGE_UP_TOPIC, { qos: 0 });
    setState({ isConnected: true, error: null });
  });
  client.on("close", () => {
    setState({ isConnected: false, online: new Set() });
  });
  client.on("error", (error) => {
    console.error("[edge-status] broker error:", error.message);
    setState({ error: error.message });
  });
  client.on("message", receive);
  setInterval(tick, TICK_MS);
};

export const sendEdgeCommand = (
  topic: string,
  type: string,
  data: Record<string, unknown> = {},
) =>
  new Promise<void>((resolve, reject) => {
    if (!client || !state.isConnected) {
      reject(new Error("Not connected to the MQTT broker"));
      return;
    }
    const id = ulid();
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("The edge did not answer"));
    }, COMMAND_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    const message = { v: 1, type, id, ts: new Date().toISOString(), data };
    client.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
      if (!error) return;
      pending.delete(id);
      clearTimeout(timer);
      reject(error);
    });
  });

export const subscribeEdgeStatus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getEdgeStatus = () => state;
export const getServerEdgeStatus = () => EMPTY;
export const getServerEdgeCatalog = () => NO_CATALOG;
export const getOnlineEdges = () => state.online;

export const getEdgeCatalog = (edgeId: string) =>
  state.catalog.get(edgeId) ?? NO_CATALOG;

export const getServerOnlineEdges = () => EMPTY.online;
