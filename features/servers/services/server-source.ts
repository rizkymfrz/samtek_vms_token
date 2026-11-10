import { Pick } from "@/components/shared/pick";
import { createRandom } from "@/lib/random";
import { buildLiveSource } from "@/lib/mock/live-source";
import type { ServerRecord, ServerGroup, Discovered, Metrics } from "../types";

export const GROUPS: ServerGroup[] = [
  { id: "1", name: "Building A" },
  { id: "2", name: "Outdoor" },
  { id: "3", name: "Building B" },
];

export const buildServerSource = (now: number) => {
  const { edgeServers, devices } = buildLiveSource(now);
  const extra: Record<
    string,
    Pick<
      ServerRecord,
      "groupId" | "description" | "hostAddress" | "macAddress" | "vendor"
    >
  > = {
    "1": {
      groupId: "1",
      description: "Main building",
      hostAddress: "192.168.1.20:443",
      macAddress: "00:1A:2B:3C:4D:01",
      vendor: "SAMTEK Edge",
    },
    "2": {
      groupId: "2",
      description: "Parking and gate",
      hostAddress: "192.168.1.21:443",
      macAddress: "00:1A:2B:3C:4D:02",
      vendor: "SmartBox",
    },
    "3": {
      groupId: "3",
      description: "Warehouse",
      hostAddress: "192.168.1.22:443",
      macAddress: "00:1A:2B:3C:4D:03",
      vendor: "Hikvision",
    },
  };
  const servers: ServerRecord[] = edgeServers.map((s) => ({
    id: s.id,
    groupId: extra[s.id].groupId,
    name: s.name,
    code: s.code,
    description: extra[s.id].description,
    hostAddress: extra[s.id].hostAddress,
    localHostAddress: s.webrtcUrlLocal ? new URL(s.webrtcUrlLocal).host : null,
    webrtcUrl: s.webrtcUrl,
    webrtcUrlLocal: s.webrtcUrlLocal,
    macAddress: extra[s.id].macAddress,
    isActive: s.isActive,
    lastSeenAt: s.lastSeenAt ? s.lastSeenAt.getTime() : null,
    vendor: extra[s.id].vendor,
    cameraCount: devices.filter((d) => d.edgeServerId === s.id).length,
  }));
  const discovered: Discovered[] = [
    {
      id: "edge-7f3a",
      ip: "192.168.1.41",
      vendor: "SAMTEK Edge",
      registeredServerId: null,
    },
    {
      id: "edge-b20c",
      ip: "192.168.1.58",
      vendor: "SAMTEK Edge",
      registeredServerId: null,
    },
    {
      id: "smartbox-19de",
      ip: "192.168.1.63",
      vendor: "SmartBox",
      registeredServerId: null,
    },
    {
      id: "smartbox-2a11",
      ip: "192.168.1.21",
      vendor: "SmartBox",
      registeredServerId: "2",
    },
    {
      id: "nvr-0c52",
      ip: "192.168.1.22",
      vendor: "Hikvision",
      registeredServerId: "3",
    },
  ];
  return { servers, discovered };
};

const series = (
  seed: number,
  base: number,
  spread: number,
  end: number,
  min: number,
  max: number,
) => {
  const random = createRandom(seed);
  const points: number[] = [];
  let drift = 0;
  for (let minute = 0; minute < 60; minute++) {
    drift += (random() - 0.5) * spread * 0.35;
    drift *= 0.94;
    const wave = Math.sin((minute / 60) * Math.PI * 2 + seed) * spread * 0.45;
    points.push(Math.min(max, Math.max(min, base + drift + wave)));
  }
  const tail = 8;
  for (let i = 0; i < tail; i++) {
    const weight = (i + 1) / tail;
    const index = 60 - tail + i;
    points[index] = points[index] * (1 - weight) + end * weight;
  }
  return points.map((value) => Math.round(value * 10) / 10);
};

const PROFILES: Record<
  string,
  { temp: number; memory: number; cpu: number; storage: Metrics["storage"] }
> = {
  "1": {
    temp: 58,
    memory: 67,
    cpu: 44,
    storage: {
      recordings: 1.05,
      analytics: 0.21,
      system: 0.08,
      free: 0.66,
      retentionDays: 14,
    },
  },
  "2": {
    temp: 73,
    memory: 82,
    cpu: 61,
    storage: {
      recordings: 1.21,
      analytics: 0.3,
      system: 0.08,
      free: 0.41,
      retentionDays: 14,
    },
  },
  "3": {
    temp: 55,
    memory: 60,
    cpu: 38,
    storage: {
      recordings: 0.8,
      analytics: 0.14,
      system: 0.07,
      free: 0.99,
      retentionDays: 30,
    },
  },
};

const DEFAULT_PROFILE = PROFILES["1"];

export const buildMetrics = (serverId: string): Metrics => {
  const profile = PROFILES[serverId] ?? DEFAULT_PROFILE;
  const seed = Number(serverId.replace(/\D/g, "")) || 7;
  return {
    cpuTemp: series(seed * 11, profile.temp - 1, 7, profile.temp, 40, 90),
    memory: series(seed * 13, profile.memory, 3, profile.memory, 0, 100),
    cpu: series(seed * 17, profile.cpu, 16, profile.cpu, 0, 100),
    memoryTotalGb: 16,
    storage: profile.storage,
  };
};
