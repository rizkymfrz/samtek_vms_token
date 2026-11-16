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
  if (!servers.find((s) => s.id === camera.edgeServerId)?.online) {
    return "server-offline";
  }
  return camera.isFaulty ? "stream-offline" : "live";
};

export const STATE_LABEL: Record<StreamState, string> = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
  "stream-offline": "Stream offline",
};

export const applyState = (camera: CameraRecord): ApplyState =>
  camera.applyStatus ?? "pending";

export const APPLY_LABEL: Record<ApplyState, string> = {
  applied: "Applied",
  rejected: "Rejected",
  pending: "Pending",
};
