import { cameraState } from "./camera-state";
import type { CameraRecord, ServerOption } from "../types";

export const ALL = "all";

export type Filters = {
  query: string;
  status: string;
  analytic: string;
  recording: string;
  server: string;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  status: ALL,
  analytic: ALL,
  recording: ALL,
  server: ALL,
};

export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" ||
  filters.status !== ALL ||
  filters.analytic !== ALL ||
  filters.recording !== ALL ||
  filters.server !== ALL;

export const filterCameras = (
  cameras: CameraRecord[],
  servers: ServerOption[],
  filters: Filters,
  analyticName: (id: string | null) => string,
): CameraRecord[] => {
  const needle = filters.query.trim().toLowerCase();
  const serverName = new Map(servers.map((s) => [s.id, s.name]));
  return cameras.filter(
    (camera) =>
      (filters.status === ALL ||
        cameraState(camera, servers) === filters.status) &&
      (filters.analytic === ALL ||
        (filters.analytic === "none"
          ? camera.analyticId === null
          : camera.analyticId === filters.analytic)) &&
      (filters.recording === ALL ||
        (filters.recording === "on") === camera.isRecordingEnabled) &&
      (filters.server === ALL || camera.edgeServerId === filters.server) &&
      (!needle ||
        `${camera.name} ${camera.id} ${serverName.get(camera.edgeServerId) ?? ""} ${analyticName(camera.analyticId)}`
          .toLowerCase()
          .includes(needle)),
  );
};
