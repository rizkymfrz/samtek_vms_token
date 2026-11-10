export type CameraRecord = {
  id: string;
  edgeServerId: string;
  deviceId: string;
  name: string;
  isEnabled: boolean;
  sourceMain: string;
  sourceSub: string | null;
  analyticId: string | null;
  isRecordingEnabled: boolean;
};

export type ServerOption = { id: string; name: string; online: boolean };

export type CameraFailure = {
  serverId: string;
  serverName: string;
  message: string;
};

export type CameraData = {
  servers: ServerOption[];
  cameras: CameraRecord[];
  failures: CameraFailure[];
};

export type StreamState = "live" | "disabled" | "server-offline";
