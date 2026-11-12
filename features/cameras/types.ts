export type ApplyError = {
  code: string;
  field: string | null;
  message: string;
};

export type CameraRecord = {
  id: string;
  edgeServerId: string;
  name: string;
  isEnabled: boolean;
  sourceMain: string;
  sourceSub: string | null;
  analyticId: string | null;
  isRecordingEnabled: boolean;
  applyStatus: "applied" | "rejected" | null;
  applyError: ApplyError | null;
};

export type ServerOption = {
  id: string;
  name: string;
  isActive: boolean;
  online: boolean;
};

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
export type ApplyState = "applied" | "rejected" | "pending";
