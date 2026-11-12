import { analyticLabel } from "@/config/analytics-catalog";
import { isServerOnline } from "@/config/server-status";
import { buildAlerts } from "@/lib/mock/alerts-source";
import { buildLiveSource } from "@/lib/mock/live-source";
import type {
  Floorplan,
  FloorplanDevice,
  PlanCamera,
  PlanGroup,
  PlanRoom,
  PlanServer,
} from "../types";

const plan = (
  id: string,
  name: string,
  label: string,
  parentId: string | null = null,
): Floorplan => ({
  id,
  groupId: "1",
  parentId,
  name,
  label,
  hasImage: false,
  updatedAt: null,
});

const FLOORPLANS: Floorplan[] = [
  plan("1", "Floor 1", "Main Building · Floor 1", "5"),
  plan("2", "Floor 2", "Main Building · Floor 2", "5"),
  plan("3", "Parking & gate", "Parking & gate"),
  plan("4", "Warehouse", "Warehouse"),
  plan("5", "Main Building", "Main Building"),
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
  fieldOfView = 90,
): FloorplanDevice => ({
  id,
  floorplanId,
  deviceRecordId,
  x,
  y,
  rotation,
  fieldOfView,
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
  groups: PlanGroup[];
  servers: PlanServer[];
} => {
  const { edgeServers, devices } = buildLiveSource(now);
  const server = new Map(edgeServers.map((s) => [s.id, s]));
  const dayAgo = now - 24 * 3_600_000;
  const alerts = new Map<string, number>();
  for (const row of buildAlerts(now).rows) {
    if (row.at > dayAgo)
      alerts.set(row.camera, (alerts.get(row.camera) ?? 0) + 1);
  }
  const reachableOf = (s: (typeof edgeServers)[number]) =>
    isServerOnline(
      { isActive: s.isActive, lastSeenAt: s.lastSeenAt?.getTime() ?? null },
      now,
    );
  const cameras: PlanCamera[] = devices.map((d) => {
    const s = server.get(d.edgeServerId)!;
    const reachable = reachableOf(s);
    return {
      id: d.id,
      name: d.name,
      serverId: s.id,
      serverName: s.name,
      groupId: "1",
      hasSubStream: d.sourceSub !== null,
      webrtcUrl: s.webrtcUrl,
      webrtcUrlLocal: s.webrtcUrlLocal,
      analytic: d.analyticId ? analyticLabel(d.analyticId) : null,
      state: !d.isEnabled ? "disabled" : reachable ? "live" : "server-offline",
      alerts: alerts.get(d.name) ?? 0,
    };
  });
  const groups: PlanGroup[] = [
    { id: "1", parentId: null, name: "Head office" },
  ];
  return {
    plans: FLOORPLANS,
    placements: INITIAL_PLACEMENTS,
    cameras,
    groups,
    servers: edgeServers.map((s) => ({
      id: s.id,
      isActive: s.isActive,
      online: reachableOf(s),
    })),
  };
};
