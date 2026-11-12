import { isLiveSource } from "@/config/env";
import { isServerOnline } from "@/config/server-status";
import { createCentralClient, failureMessage } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { requireAccessToken } from "@/lib/auth/session";
import { buildMap } from "./map-source";
import {
  mapDeviceSchema,
  mapGroupSchema,
  mapServerSchema,
} from "../schemas/map";
import type {
  MapData,
  MapFailure,
  MapMarker,
  MapPlace,
  MapServer,
} from "../types";

export const getMap = async (): Promise<MapData> => {
  if (!isLiveSource) return buildMap();
  const client = createCentralClient(await requireAccessToken());
  const [groups, servers] = await Promise.all([
    fetchAllPages(client, "/v1/edge-server-groups", mapGroupSchema),
    fetchAllPages(client, "/v1/edge-servers", mapServerSchema),
  ]);
  const deviceLists = await Promise.allSettled(
    servers.map((server) =>
      fetchAllPages(
        client,
        `/v1/edge-servers/${server.id}/devices`,
        mapDeviceSchema,
      ),
    ),
  );
  const now = Date.now();
  const serverInfo: MapServer[] = servers.map((server) => ({
    id: server.id,
    name: server.name,
    isActive: server.isActive,
    online: isServerOnline(
      {
        isActive: server.isActive,
        lastSeenAt: server.lastSeenAt ? Date.parse(server.lastSeenAt) : null,
      },
      now,
    ),
    webrtcUrl: server.webrtcUrl,
    webrtcUrlLocal: server.webrtcUrlLocal,
  }));
  const markers: MapMarker[] = [];
  const unplaced: MapPlace[] = [];
  const failures: MapFailure[] = [];
  for (const group of groups) {
    if (group.latitude === null || group.longitude === null) {
      unplaced.push({
        type: "group",
        id: group.id,
        name: group.name,
        parentId: null,
        isActive: true,
      });
      continue;
    }
    markers.push({
      type: "group",
      id: group.id,
      name: group.name,
      latitude: group.latitude,
      longitude: group.longitude,
    });
  }
  servers.forEach((server, index) => {
    if (server.latitude === null || server.longitude === null) {
      unplaced.push({
        type: "server",
        id: server.id,
        name: server.name,
        parentId: server.groupId,
        isActive: server.isActive,
      });
    } else {
      markers.push({
        type: "server",
        id: server.id,
        name: server.name,
        groupId: server.groupId,
        isActive: server.isActive,
        latitude: server.latitude,
        longitude: server.longitude,
      });
    }
    const outcome = deviceLists[index];
    if (outcome.status === "rejected") {
      console.error(`[map devices server ${server.id}]`, outcome.reason);
      failures.push({
        serverName: server.name,
        message: failureMessage(outcome.reason),
      });
      return;
    }
    for (const device of outcome.value) {
      const own = device.latitude !== null && device.longitude !== null;
      const latitude = own ? device.latitude : server.latitude;
      const longitude = own ? device.longitude : server.longitude;
      if (latitude === null || longitude === null) {
        unplaced.push({
          type: "device",
          id: device.id,
          name: device.name,
          parentId: device.edgeServerId,
          isActive: device.isEnabled,
        });
        continue;
      }
      markers.push({
        type: "device",
        id: device.id,
        name: device.name,
        edgeServerId: device.edgeServerId,
        isEnabled: device.isEnabled,
        hasSubStream: device.sourceSub !== null,
        inherited: !own,
        latitude,
        longitude,
      });
    }
  });
  return { markers, unplaced, servers: serverInfo, failures, truncated: false };
};
