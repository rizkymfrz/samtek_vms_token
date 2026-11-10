import type { MqttClient } from "mqtt";
import { EDGE_UP_TOPIC } from "@/config/mqtt";
import { EDGE_STATUS_TIMEOUT_MS } from "@/config/server-status";
import { connectMqtt } from "@/lib/mqtt/browser-client";
import { appendSample, toSeries } from "./edge-series";
import {
  edgeStateSchema,
  type EdgeStatusMessage,
  edgeStatusSchema,
} from "../schemas/edge-message";
import type { EdgeEntry, EdgeSample, EdgeStatusState } from "../types";

const TICK_MS = 1000;

const EMPTY: EdgeStatusState = {
  isConnected: false,
  error: null,
  entries: new Map(),
  online: new Set(),
};

let state = EMPTY;
let isStarted = false;
let client: MqttClient | null = null;

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

const receive = (topic: string, payload: Uint8Array) => {
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(payload));
  } catch {
    warnOnce(topic, "payload is not JSON");
    return;
  }
  const topicEdge = topic.split("/")[2];
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
  const gone = edgeStateSchema.safeParse(json);
  if (gone.success) {
    if (!gone.data.data.online && state.entries.has(topicEdge)) {
      dropEdge(topicEdge);
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

export const subscribeEdgeStatus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getEdgeStatus = () => state;
export const getServerEdgeStatus = () => EMPTY;
export const getOnlineEdges = () => state.online;
export const getServerOnlineEdges = () => EMPTY.online;
