import { buildFloorplanSource, ROOMS } from "./floorplan-source";
import type { FloorplanData } from "../types";

export const buildFloorplan = (now = Date.now()): FloorplanData => {
  return { ...buildFloorplanSource(now), rooms: ROOMS, failures: [] };
};
