export type StreamState = "live" | "disabled" | "server-offline";

export type Tile = {
  id: string;
  deviceId: string;
  name: string;
  serverId: string;
  serverName: string;
  analytic: string | null;
  isRecordingEnabled: boolean;
  state: StreamState;
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export type ServerNode = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  online: boolean;
};

export type LiveLayoutSummary = {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  columns: number;
  isDefault: boolean;
};

export type LiveLayout = LiveLayoutSummary & {
  slots: (string | null)[];
};

export type LiveFailure = { serverName: string; message: string };

export type LiveData = {
  servers: ServerNode[];
  tiles: Tile[];
  layouts: LiveLayoutSummary[];
  details: Record<string, LiveLayout>;
  failures: LiveFailure[];
};

export type StreamQuality = "sub" | "main";
