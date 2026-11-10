export type EdgeServer = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  lastSeenAt: Date | null;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export type Device = {
  id: string;
  edgeServerId: string;
  deviceId: string;
  name: string;
  isEnabled: boolean;
  sourceMain: string;
  sourceSub: string | null;
  analyticId: string | null;
  isRecordingEnabled: boolean;
};

export type Layout = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  rows: number;
  columns: number;
  isDefault: boolean;
};

export type LayoutDevice = {
  id: string;
  layoutId: string;
  deviceRecordId: string;
  position: number;
};

export const buildLiveSource = (now: number) => {
  const ago = (seconds: number) => new Date(now - seconds * 1000);
  const edgeServers: EdgeServer[] = [
    {
      id: "1",
      name: "Main Building",
      code: "edge-main",
      isActive: true,
      lastSeenAt: ago(8),
      webrtcUrl: "https://main.example.com/webrtc",
      webrtcUrlLocal: "http://192.168.1.10:8889",
    },
    {
      id: "2",
      name: "Parking",
      code: "edge-parking",
      isActive: true,
      lastSeenAt: ago(21),
      webrtcUrl: "https://parking.example.com/webrtc",
      webrtcUrlLocal: "http://192.168.1.11:8889",
    },
    {
      id: "3",
      name: "Warehouse",
      code: "edge-warehouse",
      isActive: true,
      lastSeenAt: ago(4 * 3600),
      webrtcUrl: "https://warehouse.example.com/webrtc",
      webrtcUrlLocal: null,
    },
  ];
  const camera = (
    id: string,
    edgeServerId: string,
    name: string,
    analyticId: string | null,
    options: { isEnabled?: boolean; isRecordingEnabled?: boolean } = {},
  ): Device => ({
    id,
    edgeServerId,
    deviceId: `cam-${id.padStart(3, "0")}`,
    name,
    isEnabled: options.isEnabled ?? true,
    sourceMain: `rtsp://10.0.${edgeServerId}.${id}/stream1`,
    sourceSub: `rtsp://10.0.${edgeServerId}.${id}/stream2`,
    analyticId,
    isRecordingEnabled: options.isRecordingEnabled ?? true,
  });
  const devices: Device[] = [
    camera("1", "1", "Lobby Entrance", "people_counting_dwelling"),
    camera("2", "1", "Lobby Turnstile", "face_recognition"),
    camera("3", "1", "Reception Desk", "face_visitor_attendance"),
    camera("4", "1", "Main Hallway", "people_crowd_monitoring"),
    camera("5", "1", "Call Center", "phone_calling", {
      isRecordingEnabled: false,
    }),
    camera("6", "2", "Parking Lot A", "license_plate_recognition"),
    camera("7", "2", "Boom Gate", "vehicle_license_plate_recognition"),
    camera("8", "2", "Main Gate", "vehicle_counting_dwelling"),
    camera("9", "2", "Back Alley", "motion", { isEnabled: false }),
    camera("10", "3", "Warehouse Gate", "ppe_violation"),
    camera("11", "3", "Loading Dock", "ppe_violation_advance"),
    camera("12", "3", "Warehouse Roof", "fire_smoke"),
    camera("13", "3", "Assembly Line", null),
  ];
  const layouts: Layout[] = [
    {
      id: "1",
      userId: "1",
      name: "Lobby",
      description: "Entrance and reception",
      rows: 2,
      columns: 2,
      isDefault: true,
    },
    {
      id: "2",
      userId: "1",
      name: "Parking & gate",
      description: null,
      rows: 2,
      columns: 3,
      isDefault: false,
    },
    {
      id: "3",
      userId: "1",
      name: "Warehouse",
      description: "Server may be offline",
      rows: 2,
      columns: 2,
      isDefault: false,
    },
    {
      id: "4",
      userId: "1",
      name: "All cameras",
      description: null,
      rows: 4,
      columns: 4,
      isDefault: false,
    },
  ];
  const slots: Record<string, string[]> = {
    "1": ["1", "2", "3", "4"],
    "2": ["6", "7", "8", "9", "5"],
    "3": ["10", "11", "12", "13"],
    "4": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
  };
  const layoutDevices: LayoutDevice[] = layouts.flatMap((layout) =>
    slots[layout.id].map((deviceRecordId, position) => ({
      id: `${layout.id}-${position}`,
      layoutId: layout.id,
      deviceRecordId,
      position,
    })),
  );
  return { edgeServers, devices, layouts, layoutDevices };
};
