import { createCentralClient } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { listCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { serverGroupSchema } from "../schemas/server";
import type { ServerFailure, ServersData } from "../types";

export const getServers = async (): Promise<ServersData> => {
  const token = await requireAccessToken();
  const client = createCentralClient(token);
  const now = Date.now();
  const [servers, groups] = await Promise.all([
    listCentralServers(token),
    fetchAllPages(client, "/v1/edge-server-groups", serverGroupSchema).catch(
      (error) => {
        console.error("[servers groups]", error);
        return null;
      },
    ),
  ]);
  const failures: ServerFailure[] = [];
  if (!groups) {
    failures.push({ serverName: "Groups", message: "Failed to load" });
  }
  return {
    now,
    failures,
    servers: servers.map(({ deviceCount, ...server }) => ({
      ...server,
      cameraCount: deviceCount,
    })),
    groups: groups ?? [],
  };
};
