export type Floorplan = {
  id: string;
  name: string;
  building: string;
  level: string;
  width: number;
  height: number;
};

export type FloorplanDevice = {
  id: string;
  floorplanId: string;
  deviceRecordId: string;
  x: number;
  y: number;
  rotation: number;
  fov: number;
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
  serverName: string;
  analytic: string | null;
  state: "live" | "disabled" | "server-offline";
  alerts: number;
};

export type FloorplanData = {
  plans: Floorplan[];
  placements: FloorplanDevice[];
  cameras: PlanCamera[];
  rooms: Record<string, PlanRoom[]>;
};
