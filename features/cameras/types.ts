import type { DeviceFault, DeviceState } from "@/lib/device-state";
type ApplyError = {
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
  sourceThird: string | null;
  analyticId: string | null;
  isRecordingEnabled: boolean;
  applyStatus: "applied" | "rejected" | null;
  applyError: ApplyError | null;
  fault?: DeviceFault | null;
};

export type ServerOption = {
  id: string;
  name: string;
  isActive: boolean;
  online: boolean;
  hostAddress: string | null;
};

type CameraFailure = {
  serverId: string;
  serverName: string;
  message: string;
};

export type CameraData = {
  servers: ServerOption[];
  cameras: CameraRecord[];
  failures: CameraFailure[];
};

export type StreamState = DeviceState;

export type ApplyState = "applied" | "rejected" | "pending";
