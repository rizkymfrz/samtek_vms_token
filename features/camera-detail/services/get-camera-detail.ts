import { isServerOnline } from "@/config/server-status";
import { listCentralDevices } from "@/lib/api/central-devices";
import { getCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { emptyPerimeters } from "../lib/edit-perimeters";
import type { CameraDetail } from "../types";

type Device = {
  id: string;
  edgeServerId: string;
  name: string;
  isEnabled: boolean;
  sourceMain: string;
  sourceSub: string | null;
  sourceThird: string | null;
  isRecordingEnabled: boolean;
  applyStatus: CameraDetail["applyStatus"];
  applyError: CameraDetail["applyError"];
  analyticId: string | null;
  analyticParams?: CameraDetail["analyticParams"] | null;
  perimeters?: CameraDetail["perimeters"] | null;
  searchIndex?: CameraDetail["searchIndex"];
  speakerRule?: CameraDetail["speakerRule"];
};

type Server = {
  name: string;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
  isActive: boolean;
};

const toDetail = (
  device: Device,
  server: Server,
  isOnline: boolean,
): CameraDetail => ({
  id: device.id,
  edgeServerId: device.edgeServerId,
  name: device.name,
  serverName: server.name,
  sourceMain: device.sourceMain,
  sourceSub: device.sourceSub,
  sourceThird: device.sourceThird,
  isRecordingEnabled: device.isRecordingEnabled,
  applyStatus: device.applyStatus,
  applyError: device.applyError,
  analyticId: device.analyticId,
  isEnabled: device.isEnabled,
  isServerActive: server.isActive,
  isServerOnline: isOnline,
  hasSubStream: device.sourceSub !== null,
  webrtcUrl: server.webrtcUrl,
  webrtcUrlLocal: server.webrtcUrlLocal,
  analyticParams: device.analyticParams ?? {},
  perimeters: device.perimeters ?? emptyPerimeters(),
  searchIndex: device.searchIndex,
  speakerRule: device.speakerRule,
});

export const getCameraDetail = async (
  id: string,
): Promise<CameraDetail | null> => {
  const now = Date.now();
  const token = await requireAccessToken();
  const servers = await getCentralServers(token);
  const { devices } = await listCentralDevices(token, servers);
  const device = devices.find((d) => d.id === id);
  const server = servers.find((s) => s.id === device?.edgeServerId);
  if (!device || !server) return null;
  return toDetail(device, server, isServerOnline(server, now));
};
