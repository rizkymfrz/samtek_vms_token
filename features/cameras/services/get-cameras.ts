import { isLiveSource } from "@/config/env";
import { createCentralClient } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { getCentralServers, isServerOnline } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildCameras } from "./build-cameras";
import { deviceSchema } from "../schemas/device";
import type { CameraData, CameraRecord } from "../types";

export const getCameras = async (): Promise<CameraData> => {
  if (!isLiveSource) return buildCameras();
  const token = await requireAccessToken();
  const client = createCentralClient(token);
  const now = Date.now();
  const servers = await getCentralServers(token);
  const settled = await Promise.allSettled(
    servers.map((server) =>
      fetchAllPages(
        client,
        `/v1/edge-servers/${server.id}/devices`,
        deviceSchema,
      ),
    ),
  );
  const cameras: CameraRecord[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      cameras.push(...outcome.value);
      return;
    }
    console.error(`[cameras server ${servers[index].id}]`, outcome.reason);
  });
  return {
    servers: servers.map((server) => ({
      id: server.id,
      name: server.name,
      online: isServerOnline(server, now),
    })),
    cameras,
  };
};
