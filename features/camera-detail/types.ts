import type { CameraRecord } from "@/features/cameras";
import type { AnalyticParams } from "@/lib/api/analytic-params";
import type { Perimeters } from "@/lib/api/perimeters";
import type { SearchIndexConfig } from "@/lib/api/search-index";

export type StreamState =
  "live" | "disabled" | "server-offline" | "stream-offline";

export type CameraDetail = {
  id: string;
  edgeServerId: string;
  name: string;
  serverName: string;
  sourceMain: string;
  sourceSub: string | null;
  sourceThird: string | null;
  isRecordingEnabled: boolean;
  applyStatus: CameraRecord["applyStatus"];
  applyError: CameraRecord["applyError"];
  analyticId: string | null;
  isEnabled: boolean;
  isServerActive: boolean;
  isServerOnline: boolean;
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  analyticParams: AnalyticParams;
  perimeters: Perimeters;
  searchIndex: SearchIndexConfig | null | undefined;
};

export type Tool = "line" | "polygon" | null;
export type Selection = { kind: "area" | "line"; index: number } | null;
