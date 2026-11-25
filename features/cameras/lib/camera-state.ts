import { DEVICE_STATE_LABEL, deviceStateOf } from "@/lib/device-state";
import type {
  ApplyState,
  CameraRecord,
  ServerOption,
  StreamState,
} from "../types";

export const cameraState = (
  camera: CameraRecord,
  servers: ServerOption[],
): StreamState => {
  const server = servers.find((s) => s.id === camera.edgeServerId);
  return deviceStateOf({
    isEnabled: camera.isEnabled,
    isServerActive: server?.isActive ?? true,
    isServerOnline: server?.online ?? false,
    fault: camera.fault,
  });
};

export const STATE_LABEL = DEVICE_STATE_LABEL;

export const applyState = (camera: CameraRecord): ApplyState =>
  camera.applyStatus ?? "pending";

export const APPLY_LABEL: Record<ApplyState, string> = {
  applied: "Applied",
  rejected: "Rejected",
  pending: "Pending",
};
