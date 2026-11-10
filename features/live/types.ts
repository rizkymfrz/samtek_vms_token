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
};

export type ServerNode = { id: string; name: string; online: boolean };

export type LiveLayout = {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  columns: number;
  isDefault: boolean;
  slots: (string | null)[];
};

export type LiveData = {
  servers: ServerNode[];
  tiles: Tile[];
  layouts: LiveLayout[];
};

export type StreamQuality = "sub" | "main";
