import { http } from "@/lib/axios/browser-client";
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

const POSITIONS_PAGE = 5000;
const POSITIONS_MAX_PAGES = 20;

export const fetchDevicePositions = async (
  { edgeServerId, deviceId }: TrackTarget,
  dayStart: number,
) => {
  const positions: DevicePosition[] = [];
  let from = dayStart;
  for (let page = 0; page < POSITIONS_MAX_PAGES; page++) {
    const { data } = await http.get<DevicePosition[]>(
      `/api/edge-servers/${edgeServerId}/devices/${deviceId}/positions`,
      {
        params: { from: new Date(from).toISOString(), limit: POSITIONS_PAGE },
      },
    );
    positions.push(...data);
    const last = data.at(-1);
    if (data.length < POSITIONS_PAGE || !last) break;
    from = last.fixedAt + 1;
  }
  return positions;
};

export const fetchMatchedChunk = async (points: [number, number][]) =>
  (await http.post<{ line: [number, number][] }>("/api/map/match", { points }))
    .data.line;
