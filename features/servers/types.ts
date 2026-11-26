export type ServerRecord = {
  id: string;
  groupId: string | null;
  name: string;
  description: string | null;
  hostAddress: string | null;
  localHostAddress: string | null;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  macAddress: string | null;
  isActive: boolean;
  lastSeenAt: number | null;
  cameraCount: number;
};

export type ServerGroup = { id: string; name: string };

export type Metrics = {
  cpuTemp: number[];
  memory: number[];
  cpu: number[];
  memoryTotalGb: number;
  storage: {
    recordings: number;
    analytics: number;
    system: number;
    free: number;
    retentionDays: number | null;
  };
};

export type ServerFailure = { serverName: string; message: string };

export type ServersData = {
  now: number;
  failures: ServerFailure[];
  servers: ServerRecord[];
  groups: ServerGroup[];
};
