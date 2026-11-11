import type { AnalyticParams } from "@/lib/api/analytic-params";
import type { Perimeters } from "@/lib/api/perimeters";

export type StreamState = "live" | "disabled" | "server-offline";

export type CameraDetail = {
  id: string;
  edgeServerId: string;
  name: string;
  serverName: string;
  sourceMain: string;
  sourceSub: string | null;
  isRecordingEnabled: boolean;
  analyticId: string | null;
  isEnabled: boolean;
  isServerActive: boolean;
  isServerOnline: boolean;
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  analyticParams: AnalyticParams;
  perimeters: Perimeters;
};

export type Tool = "line" | "polygon" | null;
export type Selection = { kind: "area" | "line"; index: number } | null;
