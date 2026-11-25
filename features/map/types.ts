import type { Perimeters } from "@/lib/api/perimeters";

export type MapMarker =
  | {
      type: "group";
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    }
  | {
      type: "server";
      id: string;
      name: string;
      groupId: string | null;
      isActive: boolean;
      latitude: number;
      longitude: number;
    }
  | {
      type: "device";
      id: string;
      name: string;
      edgeServerId: string;
      isEnabled: boolean;
      hasSubStream: boolean;
      hasThirdStream: boolean;
      perimeters: Perimeters | null;
      analytic: string | null;
      analyticId?: string | null;
      inherited: boolean;
      latitude: number;
      longitude: number;
    };

export type MapPlace = {
  type: MapMarker["type"];
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  analytic?: string | null;
};

export type MapLocation = {
  type: MapMarker["type"];
  id: string;
  edgeServerId?: string;
  latitude: number | null;
  longitude: number | null;
};

export type MapServer = {
  id: string;
  name: string;
  isActive: boolean;
  online: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export type MapFailure = { serverName: string; message: string };

export type MapData = {
  markers: MapMarker[];
  unplaced: MapPlace[];
  servers: MapServer[];
  failures: MapFailure[];
  truncated: boolean;
};

export type DevicePosition = {
  latitude: number;
  longitude: number;
  fixedAt: number;
};

export type TrackTarget = { edgeServerId: string; deviceId: string };
