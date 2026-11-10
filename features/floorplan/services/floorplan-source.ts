import { buildAlerts } from "@/app/(app)/_data/alerts-source";
import { analyticLabel } from "@/app/(app)/_data/analytics-catalog";
import {
  buildLiveSource,
  HEARTBEAT_SECONDS,
} from "@/app/(app)/_data/live-source";
import type {
  Floorplan,
  FloorplanDevice,
  PlanCamera,
  PlanRoom,
} from "../types";

const FLOORPLANS: Floorplan[] = [
  {
    id: "1",
    name: "Main Building",
    building: "Main Building",
    level: "Floor 1",
    width: 1000,
    height: 600,
  },
  {
    id: "2",
    name: "Main Building",
    building: "Main Building",
    level: "Floor 2",
    width: 1000,
    height: 600,
  },
  {
    id: "3",
    name: "Parking & gate",
    building: "Outdoor",
    level: "Ground",
    width: 1000,
    height: 500,
  },
  {
    id: "4",
    name: "Warehouse",
    building: "Warehouse",
    level: "Ground",
    width: 1000,
    height: 640,
  },
];

export const ROOMS: Record<string, PlanRoom[]> = {
  "1": [
    { x: 40, y: 40, w: 360, h: 250, label: "Lobby" },
    { x: 400, y: 40, w: 240, h: 170, label: "Reception" },
    { x: 400, y: 210, w: 240, h: 80, label: "Server room" },
    { x: 640, y: 40, w: 320, h: 250, label: "Meeting rooms" },
    { x: 40, y: 290, w: 920, h: 90, label: "Main hallway" },
    { x: 40, y: 380, w: 420, h: 180, label: "Cafeteria" },
    { x: 460, y: 380, w: 500, h: 180, label: "Offices" },
  ],
  "2": [
    { x: 40, y: 40, w: 600, h: 300, label: "Call center" },
    { x: 640, y: 40, w: 320, h: 300, label: "Training room" },
    { x: 40, y: 340, w: 920, h: 80, label: "Corridor" },
    { x: 40, y: 420, w: 460, h: 140, label: "Management" },
    { x: 500, y: 420, w: 460, h: 140, label: "Storage" },
  ],
  "3": [
    { x: 40, y: 40, w: 520, h: 260, label: "Parking lot A" },
    { x: 560, y: 40, w: 400, h: 260, label: "Parking lot B" },
    { x: 40, y: 300, w: 300, h: 160, label: "Gate house" },
    { x: 340, y: 300, w: 380, h: 160, label: "Main gate" },
    { x: 720, y: 300, w: 240, h: 160, label: "Back alley" },
  ],
  "4": [
    { x: 40, y: 40, w: 560, h: 300, label: "Storage" },
    { x: 600, y: 40, w: 360, h: 300, label: "Assembly line" },
    { x: 40, y: 340, w: 420, h: 260, label: "Loading dock" },
    { x: 460, y: 340, w: 500, h: 260, label: "Warehouse gate" },
  ],
};

const pin = (
  id: string,
  floorplanId: string,
  deviceRecordId: string,
  x: number,
  y: number,
  rotation: number,
  fov = 90,
): FloorplanDevice => ({
  id,
  floorplanId,
  deviceRecordId,
  x,
  y,
  rotation,
  fov,
});

const INITIAL_PLACEMENTS: FloorplanDevice[] = [
  pin("1", "1", "1", 0.18, 0.2, 135),
  pin("2", "1", "2", 0.36, 0.42, 90, 60),
  pin("3", "1", "3", 0.52, 0.22, 180),
  pin("4", "1", "4", 0.5, 0.52, 90, 120),
  pin("5", "2", "5", 0.3, 0.3, 135, 120),
  pin("6", "3", "6", 0.28, 0.35, 180),
  pin("7", "3", "7", 0.55, 0.78, 0, 60),
  pin("8", "3", "8", 0.5, 0.62, 90),
  pin("9", "4", "10", 0.76, 0.84, 315),
  pin("10", "4", "11", 0.25, 0.7, 45, 120),
];

export const buildFloorplanSource = (
  now: number,
): {
  plans: Floorplan[];
  placements: FloorplanDevice[];
  cameras: PlanCamera[];
} => {
  const { edgeServers, devices } = buildLiveSource(now);
  const server = new Map(edgeServers.map((s) => [s.id, s]));
  const dayAgo = now - 24 * 3_600_000;
  const alerts = new Map<string, number>();
  for (const row of buildAlerts(now).rows) {
    if (row.at > dayAgo)
      alerts.set(row.camera, (alerts.get(row.camera) ?? 0) + 1);
  }
  const cameras: PlanCamera[] = devices.map((d) => {
    const s = server.get(d.edgeServerId)!;
    const reachable =
      s.isActive &&
      s.lastSeenAt !== null &&
      now - s.lastSeenAt.getTime() < HEARTBEAT_SECONDS * 1000;
    return {
      id: d.id,
      deviceId: d.deviceId,
      name: d.name,
      serverName: s.name,
      analytic: d.analyticId ? analyticLabel(d.analyticId) : null,
      state: !d.isEnabled ? "disabled" : reachable ? "live" : "server-offline",
      alerts: alerts.get(d.name) ?? 0,
    };
  });
  return { plans: FLOORPLANS, placements: INITIAL_PLACEMENTS, cameras };
};
