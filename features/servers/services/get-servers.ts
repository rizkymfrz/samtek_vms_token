import { isLiveSource } from "@/config/env";
import { createCentralClient } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { listCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildServers } from "./build-servers";
import { serverGroupSchema } from "../schemas/server";
import type { ServerFailure, ServersData } from "../types";

export const getServers = async (): Promise<ServersData> => {
  if (!isLiveSource) return buildServers();
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
    failures.push({ serverName: "Groups", message: "Could not be loaded" });
  }
  return {
    now,
    failures,
    servers: servers.map(({ deviceCount, ...server }) => ({
      ...server,
      vendor: null,
      cameraCount: deviceCount,
    })),
    groups: groups ?? [],
    discovered: [],
    metrics: {},
  };
};
