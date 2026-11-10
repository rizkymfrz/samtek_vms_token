import { isLiveSource } from "@/config/env";
import { isServerOnline } from "@/config/server-status";
import { listCentralDevices } from "@/lib/api/central-devices";
import { getCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildCameras } from "./build-cameras";
import type { CameraData } from "../types";

export const getCameras = async (): Promise<CameraData> => {
  if (!isLiveSource) return buildCameras();
  const token = await requireAccessToken();
  const now = Date.now();
  const servers = await getCentralServers(token);
  const { devices, failures } = await listCentralDevices(token, servers);
  return {
    servers: servers.map((server) => ({
      id: server.id,
      code: server.code,
      name: server.name,
      isActive: server.isActive,
      online: isServerOnline(server, now),
    })),
    cameras: devices,
    failures,
  };
};
