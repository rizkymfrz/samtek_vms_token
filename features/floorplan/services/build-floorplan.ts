import type { FloorplanData } from "../types";
import { buildFloorplanSource, ROOMS } from "./floorplan-source";

export const buildFloorplan = (now = Date.now()): FloorplanData => {
  return { ...buildFloorplanSource(now), rooms: ROOMS };
};
