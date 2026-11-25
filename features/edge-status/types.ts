import type { ParamValue } from "@/lib/api/analytic-params";
import type { DeviceFault } from "@/lib/device-state";

export type EdgeSample = {
  receivedAt: number;
  uptimeSeconds: number;
  cpuPercent: number | null;
  temperatureC: number | null;
  memory: { usedBytes: number; totalBytes: number } | null;
  storage: {
    totalBytes: number;
    freeBytes: number;
    recordingsBytes: number | null;
    analyticsBytes: number | null;
    retentionDays: number | null;
  } | null;
};

export type EdgeSeries = {
  cpu: number[];
  temperature: number[];
  memory: number[];
};

export type EdgeEntry = { sample: EdgeSample; series: EdgeSeries };

export type EdgeRecording = {
  isAvailable: boolean;
  retentionDays: number | null;
};

export type SearchIndexStatus = {
  status: "disabled" | "starting" | "active" | "unavailable";
  detail: string | null;
};

export type EdgeSearchIndex = {
  isAvailable: boolean;
  retentionDays: number | null;
  devices: ReadonlyMap<string, SearchIndexStatus>;
};

export type BodywornState = {
  isOnline: boolean | null;
  network: string | null;
  policeNumber: string | null;
  name: string | null;
  batteryPercent: number | null;
  position: {
    latitude: number;
    longitude: number;
    fixedAt: number | null;
  } | null;
};

type RecordingState = "off" | "idle" | "recording" | "stalled";

export type RecordingDevice = {
  isEnabled: boolean;
  state: RecordingState;
  oldestAt: number | null;
  newestAt: number | null;
  bytes: number | null;
};

export type PlaybackSession = {
  sessionId: string;
  app: string;
  stream: string;
  state: "playing" | "paused" | "ended";
  position: number;
  speed: number;
  hasBoxes: boolean;
  receivedAt: number;
};

export type RecordingRange = { from: number; to: number };
export type RecordingStream = "main" | "sub" | "third";

export type EdgeStatusState = {
  isConnected: boolean;
  error: string | null;
  entries: ReadonlyMap<string, EdgeEntry>;
  online: ReadonlySet<string>;
  faulty: ReadonlyMap<string, DeviceFault>;
  talk: ReadonlyMap<string, ReadonlySet<string>>;
  bodyworn: ReadonlyMap<string, BodywornState>;
  catalog: ReadonlyMap<string, AnalyticDescriptor[]>;
  recording: ReadonlyMap<string, EdgeRecording>;
  searchIndex: ReadonlyMap<string, EdgeSearchIndex>;
  recordingStatus: ReadonlyMap<string, ReadonlyMap<string, RecordingDevice>>;
};

export type DetectionStatus = "unknown" | "ok" | "warning" | "alert";

export type DetectionObject = {
  label: string;
  confidence: number;
  trackId: number | null;
  status: DetectionStatus | null;
  missingItems: string[] | null;
  isPpe: boolean;
  score: number | null;
  peopleCount: number | null;
  peopleLimit: number | null;
  staySeconds: number | null;
  maxStaySeconds: number | null;
  keypoints: [number, number, number][] | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type ParamKind =
  | "boolean"
  | "integer"
  | "number"
  | "text"
  | "choice"
  | "list"
  | "range"
  | "time"
  | "date"
  | "datetime";

export type ParamSpec = {
  key: string;
  kind: ParamKind;
  options: string[];
  min: number | null;
  max: number | null;
  fallback: ParamValue | null;
};

export type AnalyticDescriptor = {
  id: string;
  name: string;
  supportsSearchIndex: boolean;
  params: ParamSpec[];
};

export type PtzPreset = { token: string; name: string };
