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
  if (!camera.isEnabled) return "disabled";
  return servers.find((s) => s.id === camera.edgeServerId)?.online
    ? "live"
    : "server-offline";
};

export const STATE_LABEL: Record<StreamState, string> = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
};

export const applyState = (camera: CameraRecord): ApplyState =>
  camera.applyStatus ?? "pending";

export const APPLY_LABEL: Record<ApplyState, string> = {
  applied: "Applied",
  rejected: "Rejected",
  pending: "Pending",
};
