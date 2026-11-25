import type { MqttClient } from "mqtt";
import type { z } from "zod";
import { EDGE_UP_TOPIC, mqttConfig } from "@/config/mqtt";
import { EDGE_STATUS_TIMEOUT_MS } from "@/config/server-status";
import type { DeviceFault } from "@/lib/device-state";
import { connectMqtt } from "@/lib/mqtt/browser-client";
import { toDescriptors } from "./analytic-catalog";
import { toDetectionObject } from "./detection-object";
import { ingestDetections } from "./detection-store";
import {
  publishEdgeEvent,
  publishEdgeReconnect,
  publishEdgeScan,
  publishEdgeTalk,
} from "./edge-event-bus";
import { appendSample, toSeries } from "./edge-series";
import { buildEnvelope } from "./envelope";
import { ingestPlaybackBoxes } from "./playback-box-store";
import {
  detectionBboxesSchema,
  type EdgeResultData,
  edgeResultSchema,
  edgeStateSchema,
  type EdgeStatusMessage,
  edgeStatusSchema,
  eventAlarmSchema,
  eventClipSchema,
  eventRecognitionSchema,
  playbackBboxesSchema,
  recordingStatusSchema,
} from "../schemas/edge-message";
import type {
  AnalyticDescriptor,
  BodywornState,
  EdgeEntry,
  EdgeRecording,
  EdgeSample,
  EdgeSearchIndex,
  EdgeStatusState,
  RecordingDevice,
} from "../types";

type BodywornInput = NonNullable<
  z.infer<typeof edgeStateSchema>["data"]["devices"]
>[number]["bodyworn"];

const NO_CATALOG: AnalyticDescriptor[] = [];
const NO_RECORDING: EdgeRecording = { isAvailable: false, retentionDays: null };
const TICK_MS = 1000;
const COMMAND_TIMEOUT_MS = 5000;
const CONNECT_WAIT_MS = 5000;

const EMPTY: EdgeStatusState = {
  isConnected: false,
  error: null,
  entries: new Map(),
  online: new Set(),
  faulty: new Map(),
  talk: new Map(),
  bodyworn: new Map(),
  catalog: new Map(),
  recording: new Map(),
  searchIndex: new Map(),
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

const sameMap = <V>(a: ReadonlyMap<string, V>, b: ReadonlyMap<string, V>) =>
  a.size === b.size && [...a].every(([id, value]) => b.get(id) === value);

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
  const faulty = next.faulty ?? state.faulty;
  state = {
    ...state,
    ...next,
    online: sameSet(online, state.online) ? state.online : online,
    faulty: sameMap(faulty, state.faulty) ? state.faulty : faulty,
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

const setSearchIndex = (edgeId: string, next: EdgeSearchIndex | null) => {
  if (next === null && !state.searchIndex.has(edgeId)) return;
  const searchIndex = new Map(state.searchIndex);
  if (next === null) searchIndex.delete(edgeId);
  else searchIndex.set(edgeId, next);
  setState({ searchIndex });
};

export const faultKey = (edgeId: string, deviceId: string) =>
  `${edgeId}:${deviceId}`;

const STREAM_REASONS: ReadonlySet<string> = new Set([
  "stream_offline",
  "stream_degraded",
]);

const faultOf = (device: {
  status: string;
  reason?: string;
}): DeviceFault | null => {
  if (device.status === "degraded") return "partial";
  if (device.status !== "error") return null;
  return device.reason === undefined || STREAM_REASONS.has(device.reason)
    ? "stream"
    : "device";
};

const setFaulty = (
  edgeId: string,
  devices: { device_id: string; status: string; reason?: string }[],
) => {
  const prefix = faultKey(edgeId, "");
  const faulty = new Map(
    [...state.faulty].filter(([key]) => !key.startsWith(prefix)),
  );
  for (const device of devices) {
    const fault = faultOf(device);
    if (fault) faulty.set(faultKey(edgeId, device.device_id), fault);
  }
  setState({ faulty });
};

const setTalk = (
  edgeId: string,
  devices: { device_id: string; talk?: { supported: boolean } }[] | null,
) => {
  const current = state.talk.get(edgeId);
  if (devices === null) {
    if (!current) return;
    const talk = new Map(state.talk);
    talk.delete(edgeId);
    setState({ talk });
    return;
  }
  const supported = new Set(
    devices.filter((d) => d.talk?.supported).map((d) => d.device_id),
  );
  if (current && sameSet(current, supported)) return;
  setState({ talk: new Map(state.talk).set(edgeId, supported) });
};

const sameBodyworn = (a: BodywornState, b: BodywornState) =>
  a.isOnline === b.isOnline &&
  a.network === b.network &&
  a.policeNumber === b.policeNumber &&
  a.name === b.name &&
  a.batteryPercent === b.batteryPercent &&
  a.position?.latitude === b.position?.latitude &&
  a.position?.longitude === b.position?.longitude &&
  a.position?.fixedAt === b.position?.fixedAt;

const setBodyworn = (
  edgeId: string,
  devices: { device_id: string; bodyworn?: BodywornInput }[] | null,
) => {
  const prefix = faultKey(edgeId, "");
  const next = new Map<string, BodywornState>();
  for (const device of devices ?? []) {
    const { bodyworn } = device;
    if (!bodyworn) continue;
    next.set(faultKey(edgeId, device.device_id), {
      isOnline: bodyworn.online ?? null,
      network: bodyworn.network ?? null,
      policeNumber: bodyworn.police_number ?? null,
      name: bodyworn.name ?? null,
      batteryPercent: bodyworn.battery_percent ?? null,
      position: bodyworn.position
        ? {
            latitude: bodyworn.position.latitude,
            longitude: bodyworn.position.longitude,
            fixedAt: toTime(bodyworn.position.fixed_at),
          }
        : null,
    });
  }
  const current = [...state.bodyworn].filter(([key]) => key.startsWith(prefix));
  if (
    current.length === next.size &&
    current.every(([key, value]) => {
      const other = next.get(key);
      return other !== undefined && sameBodyworn(value, other);
    })
  ) {
    return;
  }
  const bodyworn = new Map(
    [...state.bodyworn].filter(([key]) => !key.startsWith(prefix)),
  );
  for (const [key, value] of next) bodyworn.set(key, value);
  setState({ bodyworn });
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
  if (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    typeof json.type === "string" &&
    json.type.startsWith("talk.")
  ) {
    publishEdgeTalk(topicEdge, json);
    return;
  }
  if (
    typeof json === "object" &&
    json !== null &&
    "type" in json &&
    typeof json.type === "string" &&
    json.type.startsWith("device.scan_")
  ) {
    publishEdgeScan(topicEdge, json);
    return;
  }
  const result = edgeResultSchema.safeParse(json);
  if (result.success) {
    const waiting = pending.get(result.data.reply_to);
    if (!waiting) return;
    pending.delete(result.data.reply_to);
    clearTimeout(waiting.timer);
    if (result.data.data.ok) waiting.resolve(result.data.data);
    else {
      waiting.reject(
        Object.assign(
          new Error(result.data.data.error?.message ?? "The edge refused"),
          { code: result.data.data.error?.code },
        ),
      );
    }
    return;
  }
  const alarm = eventAlarmSchema.safeParse(json);
  if (alarm.success) {
    publishEdgeEvent(alarm.data.id, {
      kind: "alarm",
      edgeId: topicEdge,
      data: alarm.data.data,
    });
    return;
  }
  const clip = eventClipSchema.safeParse(json);
  if (clip.success) {
    publishEdgeEvent(clip.data.id, {
      kind: "clip",
      edgeId: topicEdge,
      data: clip.data.data,
    });
    return;
  }
  const recognition = eventRecognitionSchema.safeParse(json);
  if (recognition.success) {
    publishEdgeEvent(recognition.data.id, {
      kind: "recognition",
      edgeId: topicEdge,
      data: recognition.data.data,
    });
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
    ingestDetections(topicEdge, deviceId, objects.map(toDetectionObject));
    return;
  }
  const playbackBoxes = playbackBboxesSchema.safeParse(json);
  if (playbackBoxes.success) {
    ingestPlaybackBoxes(playbackBoxes.data.data);
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
    const { online, analytics, recording, devices, search_index } =
      announced.data.data;
    setFaulty(topicEdge, online ? (devices ?? []) : []);
    setTalk(topicEdge, online ? (devices ?? []) : null);
    setBodyworn(topicEdge, devices ?? null);
    if (online && analytics) setCatalog(topicEdge, toDescriptors(analytics));
    if (online && recording) {
      setRecording(topicEdge, {
        isAvailable: recording.available,
        retentionDays: recording.retention_days ?? null,
      });
    }
    if (online) {
      setSearchIndex(
        topicEdge,
        search_index
          ? {
              isAvailable: search_index.available,
              retentionDays: search_index.retention_days ?? null,
              devices: new Map(
                (devices ?? []).flatMap((device) =>
                  device.search_index
                    ? [
                        [
                          device.device_id,
                          {
                            status: device.search_index.status,
                            detail: device.search_index.detail ?? null,
                          },
                        ] as const,
                      ]
                    : [],
                ),
              ),
            }
          : null,
      );
    }
    if (!online) {
      setSearchIndex(topicEdge, null);
      setCatalog(topicEdge, null);
      setRecording(topicEdge, null);
      setRecordingStatus(topicEdge, null);
      if (state.entries.has(topicEdge)) dropEdge(topicEdge);
    }
    return;
  }
  if (typeof json === "object" && json !== null && "type" in json) {
    const type = String(json.type);
    if (type === "edge.status" || type.startsWith("event.")) {
      warnOnce(topic, `${type} does not match the contract`);
    }
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
  let hasConnected = false;
  client.on("connect", () => {
    client?.subscribe(EDGE_UP_TOPIC, { qos: 1 });
    setState({ isConnected: true, error: null });
    if (hasConnected) publishEdgeReconnect();
    hasConnected = true;
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

const whenConnected = () =>
  new Promise<void>((resolve, reject) => {
    if (state.isConnected) {
      resolve();
      return;
    }
    if (!mqttConfig) {
      reject(new Error("Not connected to the MQTT broker"));
      return;
    }
    const done = (error?: Error) => {
      listeners.delete(onChange);
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    const onChange = () => {
      if (state.isConnected) done();
    };
    const timer = window.setTimeout(
      () => done(new Error("Not connected to the MQTT broker")),
      CONNECT_WAIT_MS,
    );
    listeners.add(onChange);
  });

export const sendEdgeCommand = async (
  topic: string,
  type: string,
  data: Record<string, unknown> = {},
) => {
  await whenConnected();
  return new Promise<EdgeResultData>((resolve, reject) => {
    if (!client) {
      reject(new Error("Not connected to the MQTT broker"));
      return;
    }
    const message = buildEnvelope(type, data);
    const { id } = message;
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("The edge did not answer"));
    }, COMMAND_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    client.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
      if (!error) return;
      pending.delete(id);
      clearTimeout(timer);
      reject(error);
    });
  });
};

export const sendEdgeAudio = (
  topic: string,
  type: string,
  data: Record<string, unknown>,
) => {
  if (!client || !state.isConnected) return;
  client.publish(topic, JSON.stringify(buildEnvelope(type, data)), { qos: 0 });
};

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
export const getFaultyDevices = () => state.faulty;
export const getTalkDevices = () => state.talk;
export const getBodyworn = () => state.bodyworn;
export const getServerBodyworn = () => EMPTY.bodyworn;
export const getServerTalkDevices = () => EMPTY.talk;

export const getEdgeCatalog = (edgeId: string) =>
  state.catalog.get(edgeId) ?? NO_CATALOG;

const NO_DEVICE: RecordingDevice | null = null;

export const getRecordingDevice = (edgeId: string, deviceId: string) =>
  state.recordingStatus.get(edgeId)?.get(deviceId) ?? NO_DEVICE;

export const getServerRecordingDevice = () => NO_DEVICE;

export const getEdgeRecording = (edgeId: string) =>
  state.recording.get(edgeId) ?? NO_RECORDING;

export const getServerEdgeRecording = () => NO_RECORDING;
const NO_SEARCH_INDEX: EdgeSearchIndex | null = null;

export const getEdgeSearchIndex = (edgeId: string) =>
  state.searchIndex.get(edgeId) ?? NO_SEARCH_INDEX;

export const getServerEdgeSearchIndex = () => NO_SEARCH_INDEX;
export const getServerOnlineEdges = () => EMPTY.online;
export const getServerFaultyDevices = () => EMPTY.faulty;
