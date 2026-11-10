import { isLiveSource } from "@/config/env";
import { isServerOnline } from "@/config/server-status";
import { CentralError, createCentralClient } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { getCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildCameras } from "./build-cameras";
import { deviceSchema } from "../schemas/device";
import type { CameraData, CameraFailure, CameraRecord } from "../types";

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
  const failures: CameraFailure[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      cameras.push(...outcome.value);
      return;
    }
    const { id, name } = servers[index];
    console.error(`[cameras server ${id}]`, outcome.reason);
    failures.push({
      serverId: id,
      serverName: name,
      message:
        outcome.reason instanceof CentralError
          ? outcome.reason.message
          : "Unexpected error",
    });
  });
  return {
    servers: servers.map((server) => ({
      id: server.id,
      name: server.name,
      online: isServerOnline(server, now),
    })),
    cameras,
    failures,
  };
};
