import { analyticLabel } from "@/config/analytics-catalog";
import { isLiveSource } from "@/config/env";
import { isServerOnline } from "@/config/server-status";
import { createCentralClient, toCentralError } from "@/lib/api/central-client";
import { listCentralDevices } from "@/lib/api/central-devices";
import { fetchAllPages } from "@/lib/api/central-pages";
import { getCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildLive } from "./build-live";
import { toLayout } from "./layout-mapper";
import { summaryOf } from "../lib/edit-layout";
import { layoutDetailResponseSchema, layoutSchema } from "../schemas/layout";
import type { LiveData, LiveLayout, Tile } from "../types";

export const getLayout = async (id: string): Promise<LiveLayout> => {
  const token = await requireAccessToken();
  try {
    const { data } = await createCentralClient(token).get<unknown>(
      `/v1/layouts/${id}`,
    );
    return toLayout(layoutDetailResponseSchema.parse(data).data);
  } catch (error) {
    throw toCentralError(error);
  }
};

export const getLive = async (): Promise<LiveData> => {
  if (!isLiveSource) return buildLive();
  const token = await requireAccessToken();
  const now = Date.now();
  const servers = await getCentralServers(token);
  const [{ devices, failures }, layouts] = await Promise.all([
    listCentralDevices(token, servers),
    fetchAllPages(createCentralClient(token), "/v1/layouts", layoutSchema),
  ]);
  const online = new Map(
    servers.map((server) => [server.id, isServerOnline(server, now)]),
  );
  const serverById = new Map(servers.map((server) => [server.id, server]));
  const tiles: Tile[] = devices.map((device) => ({
    id: device.id,
    name: device.name,
    serverId: device.edgeServerId,
    serverName: serverById.get(device.edgeServerId)?.name ?? "Unknown",
    analytic: device.analyticId ? analyticLabel(device.analyticId) : null,
    analyticId: device.analyticId,
    isRecordingEnabled: device.isRecordingEnabled,
    state: !device.isEnabled
      ? "disabled"
      : online.get(device.edgeServerId)
        ? "live"
        : "server-offline",
    hasSubStream: device.sourceSub !== null,
    webrtcUrl: serverById.get(device.edgeServerId)?.webrtcUrl ?? null,
    webrtcUrlLocal: serverById.get(device.edgeServerId)?.webrtcUrlLocal ?? null,
  }));
  const summaries = layouts
    .map(summaryOf)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  const active = summaries[0] ? await getLayout(summaries[0].id) : null;
  return {
    servers: servers.map((server) => ({
      id: server.id,
      name: server.name,
      isActive: server.isActive,
      online: online.get(server.id) ?? false,
    })),
    tiles,
    layouts: summaries,
    details: active ? { [active.id]: active } : {},
    failures: failures.map(({ serverName: name, message }) => ({
      serverName: name,
      message,
    })),
  };
};
