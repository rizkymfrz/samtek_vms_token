import { http } from "@/lib/axios/browser-client";
import type { MapData, MapLocation } from "../types";

export const fetchMap = async () => (await http.get<MapData>("/api/map")).data;

export const saveLocationRequest = async (location: MapLocation) => {
  await http.patch("/api/map/location", location);
};
