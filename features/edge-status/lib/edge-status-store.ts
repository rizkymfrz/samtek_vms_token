import type { MqttClient } from "mqtt";
import type { z } from "zod";
import { EDGE_UP_TOPIC } from "@/config/mqtt";
import { EDGE_STATUS_TIMEOUT_MS } from "@/config/server-status";
import { connectMqtt } from "@/lib/mqtt/browser-client";
import { toDescriptors } from "./analytic-catalog";
import { ingestDetections } from "./detection-store";
import { appendSample, toSeries } from "./edge-series";
import { ulid } from "./ulid";
import {
  detectionBboxesSchema,
  type EdgeResultData,
  edgeResultSchema,
  edgeStateSchema,
  type EdgeStatusMessage,
  edgeStatusSchema,
  recordingStatusSchema,
} from "../schemas/edge-message";
import type {
  AnalyticDescriptor,
  EdgeEntry,
  EdgeRecording,
  EdgeSample,
  EdgeStatusState,
  RecordingDevice,
} from "../types";

const NO_CATALOG: AnalyticDescriptor[] = [];
const NO_RECORDING: EdgeRecording = { isAvailable: false, retentionDays: null };
const TICK_MS = 1000;
const COMMAND_TIMEOUT_MS = 5000;

const EMPTY: EdgeStatusState = {
  isConnected: false,
  error: null,
  entries: new Map(),
  online: new Set(),
  catalog: new Map(),
  recording: new Map(),
  recordingStatus: new Map(),
};

let state = EMPTY;
let isStarted = false;
let client: MqttClient | null = null;

const pending = new Map<
  string,
  {
    resolve: (data: EdgeResultData) => void;
    reject: (error: Error) => void;
    timer: number;
  }
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

const setRecording = (edgeId: string, next: EdgeRecording | null) => {
  if (next === null && !state.recording.has(edgeId)) return;
  const recording = new Map(state.recording);
  if (next === null) recording.delete(edgeId);
  else recording.set(edgeId, next);
  setState({ recording });
};

const toTime = (value: string | undefined) =>
  value === undefined ? null : Date.parse(value);

const setRecordingStatus = (
  edgeId: string,
  devices: z.infer<typeof recordingStatusSchema>["data"]["devices"] | null,
) => {
  if (devices === null && !state.recordingStatus.has(edgeId)) return;
  const recordingStatus = new Map(state.recordingStatus);
  if (devices === null) recordingStatus.delete(edgeId);
  else {
    recordingStatus.set(
      edgeId,
      new Map<string, RecordingDevice>(
        devices.map((device) => [
          device.device_id,
          {
            isEnabled: device.enabled,
            state: device.state,
            oldestAt: toTime(device.oldest_at),
            newestAt: toTime(device.newest_at),
            bytes: device.bytes ?? null,
          },
        ]),
      ),
    );
  }
  setState({ recordingStatus });
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
    if (result.data.data.ok) waiting.resolve(result.data.data);
    else {
      waiting.reject(
        new Error(result.data.data.error?.message ?? "The edge refused"),
      );
    }
    return;
  }
  const recordingStatus = recordingStatusSchema.safeParse(json);
  if (recordingStatus.success) {
    setRecordingStatus(topicEdge, recordingStatus.data.data.devices);
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
    const { online, analytics, recording } = announced.data.data;
    if (online && analytics) setCatalog(topicEdge, toDescriptors(analytics));
    if (online && recording) {
      setRecording(topicEdge, {
        isAvailable: recording.available,
        retentionDays: recording.retention_days ?? null,
      });
    }
    if (!online) {
      setCatalog(topicEdge, null);
      setRecording(topicEdge, null);
      setRecordingStatus(topicEdge, null);
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
  new Promise<EdgeResultData>((resolve, reject) => {
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

const NO_DEVICE: RecordingDevice | null = null;

export const getRecordingDevice = (edgeId: string, deviceId: string) =>
  state.recordingStatus.get(edgeId)?.get(deviceId) ?? NO_DEVICE;

export const getServerRecordingDevice = () => NO_DEVICE;

export const getEdgeRecording = (edgeId: string) =>
  state.recording.get(edgeId) ?? NO_RECORDING;

export const getServerEdgeRecording = () => NO_RECORDING;
export const getServerOnlineEdges = () => EMPTY.online;
