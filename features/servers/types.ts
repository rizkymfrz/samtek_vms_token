export type ServerRecord = {
  id: string;
  groupId: string | null;
  name: string;
  code: string;
  description: string | null;
  hostAddress: string | null;
  localHostAddress: string | null;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  macAddress: string | null;
  mqttPublishTopic: string;
  mqttSubscribeTopic: string;
  isActive: boolean;
  lastSeenAt: number | null;
  vendor: string | null;
  cameraCount: number;
};

export type ServerGroup = { id: string; name: string };

export type Discovered = {
  id: string;
  ip: string;
  vendor: string;
  registeredServerId: string | null;
};

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

export type LogLine = {
  id: number;
  at: number;
  level: "INFO" | "WARN" | "DEBUG";
  message: string;
};

export type ServerFailure = { serverName: string; message: string };

export type ServersData = {
  now: number;
  failures: ServerFailure[];
  servers: ServerRecord[];
  groups: ServerGroup[];
  discovered: Discovered[];
  metrics: Record<string, Metrics>;
};
