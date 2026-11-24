import type { EdgeScanResult, EdgeScanState } from "@/features/edge-status";
import { type Draft, emptyDraft } from "./edit-camera";
import type { ServerOption } from "../types";

export const DEFAULT_PORTS = "80, 8080, 2020, 8899, 8000";
export const MAX_CREDENTIALS = 8;

const IPV4_HOST =
  /^(?:https?:\/\/)?(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}(?::\d+)?(?:\/|$)/;

const CIDR = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

export const defaultRange = (address: string | null) => {
  const match = address ? IPV4_HOST.exec(address) : null;
  return match && match.slice(1, 4).every((octet) => Number(octet) <= 255)
    ? `${match[1]}.${match[2]}.${match[3]}.0/24`
    : "";
};

export type ScanCredential = {
  credentialId: string;
  username: string;
  password: string;
};

export type ScanForm =
  | {
      ok: true;
      ipRange: string;
      ports: number[];
      credentials: ScanCredential[];
    }
  | { ok: false; message: string };

export const parseScanForm = (
  ipRange: string,
  ports: string,
  credentials: string,
): ScanForm => {
  const range = ipRange.trim();
  const match = CIDR.exec(range);
  if (
    !match ||
    match.slice(1, 5).some((octet) => Number(octet) > 255) ||
    Number(match[5]) > 32
  ) {
    return { ok: false, message: "Use a range like 192.168.1.0/24." };
  }
  const portList = ports
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (
    portList.length === 0 ||
    portList.some((port) => !Number.isInteger(port) || port < 1 || port > 65535)
  ) {
    return { ok: false, message: "Ports must be numbers from 1 to 65535." };
  }
  const lines = credentials
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > MAX_CREDENTIALS) {
    return {
      ok: false,
      message: `At most ${MAX_CREDENTIALS} logins can be tried.`,
    };
  }
  return {
    ok: true,
    ipRange: range,
    ports: [...new Set(portList)],
    credentials: lines.map((line, index) => {
      const colon = line.indexOf(":");
      return {
        credentialId: `c${index + 1}`,
        username: colon < 0 ? line : line.slice(0, colon),
        password: colon < 0 ? "" : line.slice(colon + 1),
      };
    }),
  };
};

export type ScanProgress = Pick<
  EdgeScanState,
  "scanned" | "total_hosts" | "found"
>;

export type ScanSession = {
  phase: "idle" | "starting" | "running" | "completed" | "cancelled" | "failed";
  scanId: string | null;
  progress: ScanProgress;
  results: EdgeScanResult[];
  error: string | null;
};

export const SCAN_IDLE: ScanSession = {
  phase: "idle",
  scanId: null,
  progress: { scanned: 0, total_hosts: 0, found: 0 },
  results: [],
  error: null,
};

export type ScanEvent =
  | { type: "start"; scanId: string }
  | { type: "refused"; message: string }
  | { type: "result"; data: EdgeScanResult }
  | { type: "state"; data: EdgeScanState }
  | { type: "local"; message: string }
  | { type: "reset" };

export const isScanning = (session: ScanSession) =>
  session.phase === "starting" || session.phase === "running";

export const resultKey = (result: EdgeScanResult) =>
  `${result.host}:${result.port}`;

export const reduceScan = (
  session: ScanSession,
  event: ScanEvent,
): ScanSession => {
  switch (event.type) {
    case "start":
      return { ...SCAN_IDLE, phase: "starting", scanId: event.scanId };
    case "reset":
      return SCAN_IDLE;
    case "refused":
      return isScanning(session)
        ? { ...session, phase: "failed", error: event.message }
        : session;
    case "local":
      return isScanning(session)
        ? { ...session, phase: "failed", error: event.message }
        : session;
    case "result": {
      if (event.data.scan_id !== session.scanId) return session;
      const key = resultKey(event.data);
      const others = session.results.filter((r) => resultKey(r) !== key);
      return { ...session, results: [...others, event.data] };
    }
    case "state": {
      const { scan_id, state, ...progress } = event.data;
      if (scan_id !== session.scanId || !isScanning(session)) return session;
      return {
        ...session,
        phase: state,
        progress: {
          scanned: progress.scanned,
          total_hosts: progress.total_hosts,
          found: progress.found,
        },
        error:
          state === "failed" ? "The scan failed on the edge server." : null,
      };
    }
  }
};

export const sortResults = (results: EdgeScanResult[]) =>
  [...results].sort((a, b) => {
    const left = a.host.split(".").map(Number);
    const right = b.host.split(".").map(Number);
    for (let i = 0; i < 4; i++) {
      if (left[i] !== right[i]) return (left[i] || 0) - (right[i] || 0);
    }
    return a.port - b.port;
  });

export const resultTitle = (result: EdgeScanResult) =>
  [result.manufacturer, result.model].filter(Boolean).join(" ") ||
  "Unknown ONVIF device";

const withLogin = (uri: string, login: ScanCredential | undefined) => {
  if (!login) return uri;
  try {
    const url = new URL(uri);
    url.username = login.username;
    url.password = login.password;
    return url.toString();
  } catch {
    return uri;
  }
};

export const draftFromResult = (
  result: EdgeScanResult,
  credentials: ScanCredential[],
  servers: ServerOption[],
  edgeServerId: string,
): Draft => {
  const login = credentials.find(
    (c) => c.credentialId === result.credential_id,
  );
  const streamUri = result.profiles?.find((p) => p.stream_uri)?.stream_uri;
  return {
    ...emptyDraft(servers),
    name: result.model ?? `${result.host}`,
    edgeServerId,
    sourceMain: withLogin(streamUri ?? `rtsp://${result.host}:554/`, login),
  };
};
