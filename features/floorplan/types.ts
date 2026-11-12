export type Floorplan = {
  id: string;
  groupId: string;
  parentId: string | null;
  name: string;
  label: string;
  hasImage: boolean;
  updatedAt: string | null;
};

export type FloorplanDevice = {
  id: string;
  floorplanId: string;
  deviceRecordId: string;
  x: number;
  y: number;
  rotation: number;
  fieldOfView: number;
};

export type PlanRoom = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
};

export type PlanCamera = {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  groupId: string | null;
  analytic: string | null;
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  state: "live" | "disabled" | "server-offline";
  alerts: number;
};

export type PlanGroup = {
  id: string;
  parentId: string | null;
  name: string;
};

export type PlanServer = {
  id: string;
  isActive: boolean;
  online: boolean;
};

export type PlanFailure = { serverName: string; message: string };

export type FloorplanData = {
  plans: Floorplan[];
  placements: FloorplanDevice[];
  cameras: PlanCamera[];
  groups: PlanGroup[];
  servers: PlanServer[];
  rooms: Record<string, PlanRoom[]>;
  failures: PlanFailure[];
};
