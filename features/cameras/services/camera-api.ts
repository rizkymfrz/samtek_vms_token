import axios from "axios";
import type { CameraRecord } from "../types";

type CreatePayload = {
  deviceId: string;
  name: string;
  isEnabled: boolean;
  sourceMain: string;
  sourceSub?: string;
  analyticId?: string;
  isRecordingEnabled: boolean;
};

type UpdatePayload = {
  name?: string;
  isEnabled?: boolean;
  sourceMain?: string;
  sourceSub?: string | null;
  analyticId?: string | null;
  isRecordingEnabled?: boolean;
};

export const createCamera = async (serverId: string, payload: CreatePayload) =>
  (
    await axios.post<CameraRecord>(
      `/api/edge-servers/${serverId}/devices`,
      payload,
    )
  ).data;

export const updateCamera = async (
  camera: CameraRecord,
  payload: UpdatePayload,
) =>
  (
    await axios.patch<CameraRecord>(
      `/api/edge-servers/${camera.edgeServerId}/devices/${camera.id}`,
      payload,
    )
  ).data;

export const deleteCamera = async (camera: CameraRecord) => {
  await axios.delete(
    `/api/edge-servers/${camera.edgeServerId}/devices/${camera.id}`,
  );
};
