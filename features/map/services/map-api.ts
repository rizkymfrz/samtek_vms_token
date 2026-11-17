import { http } from "@/lib/axios/browser-client";
import { TRAIL_WINDOW_MS } from "../lib/trail";
import type {
  DevicePosition,
  MapData,
  MapLocation,
  TrackTarget,
} from "../types";

export const fetchMap = async () => (await http.get<MapData>("/api/map")).data;

export const saveLocationRequest = async (location: MapLocation) => {
  await http.patch("/api/map/location", location);
};

export const fetchDevicePositions = async ({
  edgeServerId,
  deviceId,
}: TrackTarget) =>
  (
    await http.get<DevicePosition[]>(
      `/api/edge-servers/${edgeServerId}/devices/${deviceId}/positions`,
      {
        params: { from: new Date(Date.now() - TRAIL_WINDOW_MS).toISOString() },
      },
    )
  ).data;
