import type { Perimeters } from "@/lib/api/perimeters";
import type { DeviceState } from "@/lib/device-state";

export type StreamState = DeviceState;

export type Tile = {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  analytic: string | null;
  analyticId: string | null;
  perimeters: Perimeters | null;
  isRecordingEnabled: boolean;
  state: StreamState;
  isPartial?: boolean;
  hasSubStream: boolean;
  hasThirdStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export type ServerNode = {
  id: string;
  name: string;
  isActive: boolean;
  online: boolean;
};

export type LiveLayoutSummary = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
};

export type LiveLayout = LiveLayoutSummary & {
  cameras: string[];
};

type LiveFailure = { serverName: string; message: string };

export type LiveData = {
  servers: ServerNode[];
  tiles: Tile[];
  layouts: LiveLayoutSummary[];
  details: Record<string, LiveLayout>;
  failures: LiveFailure[];
};

export type StreamQuality = "sub" | "main" | "third";
