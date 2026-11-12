import { analyticLabel } from "@/config/analytics-catalog";
import { isLiveSource } from "@/config/env";
import { isServerOnline } from "@/config/server-status";
import { listEdgeAlarms } from "@/features/alerts/services/get-alerts";
import {
  createCentralClient,
  failureMessage,
  toCentralError,
} from "@/lib/api/central-client";
import { listCentralDevices } from "@/lib/api/central-devices";
import { fetchAllPages } from "@/lib/api/central-pages";
import { getCentralServers, getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildFloorplan } from "./build-floorplan";
import { placementId } from "../lib/edit-placements";
import {
  floorplanDetailResponseSchema,
  floorplanSchema,
  planGroupSchema,
} from "../schemas/floorplan";
import type {
  Floorplan,
  FloorplanData,
  FloorplanDevice,
  PlanCamera,
} from "../types";

const labelOf = (
  plan: { name: string; parentId: string | null },
  byId: Map<string, { name: string; parentId: string | null }>,
) => {
  const names = [plan.name];
  const seen = new Set<string>();
  for (
    let parent = plan.parentId ? byId.get(plan.parentId) : undefined;
    parent && !seen.has(parent.name);
    parent = parent.parentId ? byId.get(parent.parentId) : undefined
  ) {
    seen.add(parent.name);
    names.unshift(parent.name);
  }
  return names.join(" · ");
};

const DAY_MS = 24 * 3_600_000;

const countAlarms = async (token: string, now: number) => {
  const edges = await getEdgeServers(token);
  const { results } = await queryEdges(edges, (edge) =>
    listEdgeAlarms(edge, { since: now - DAY_MS, until: null }),
  );
  const counts = new Map<string, number>();
  for (const { data } of results) {
    for (const alarm of data.alarms) {
      counts.set(alarm.device_id, (counts.get(alarm.device_id) ?? 0) + 1);
    }
  }
  return counts;
};

export const getFloorplan = async (): Promise<FloorplanData> => {
  if (!isLiveSource) return buildFloorplan();
  const token = await requireAccessToken();
  const client = createCentralClient(token);
  const now = Date.now();
  const servers = await getCentralServers(token);
  const [{ devices, failures }, rawPlans, groups, alarmCounts] =
    await Promise.all([
      listCentralDevices(token, servers),
      fetchAllPages(client, "/v1/floorplans", floorplanSchema),
      fetchAllPages(client, "/v1/edge-server-groups", planGroupSchema),
      countAlarms(token, now),
    ]);
  const byId = new Map(rawPlans.map((plan) => [plan.id, plan]));
  const plans: Floorplan[] = rawPlans
    .map((plan) => ({ ...plan, label: labelOf(plan, byId) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const details = await Promise.allSettled(
    plans.map((plan) =>
      client.get<unknown>(`/v1/floorplans/${plan.id}`).then(
        ({ data }) => floorplanDetailResponseSchema.parse(data).data,
        (error: unknown) => {
          throw toCentralError(error);
        },
      ),
    ),
  );
  const placements: FloorplanDevice[] = [];
  const planFailures = failures.map(({ serverName, message }) => ({
    serverName,
    message,
  }));
  details.forEach((outcome, index) => {
    if (outcome.status === "rejected") {
      console.error(`[floorplan ${plans[index].id}]`, outcome.reason);
      planFailures.push({
        serverName: plans[index].label,
        message: failureMessage(outcome.reason),
      });
      return;
    }
    for (const { device, ...rest } of outcome.value.devices) {
      if (!device) continue;
      placements.push({
        id: placementId(plans[index].id, device.id),
        floorplanId: plans[index].id,
        deviceRecordId: device.id,
        ...rest,
      });
    }
  });
  const serverById = new Map(servers.map((server) => [server.id, server]));
  const cameras: PlanCamera[] = devices.map((device) => {
    const server = serverById.get(device.edgeServerId);
    return {
      id: device.id,
      name: device.name,
      serverId: device.edgeServerId,
      serverName: server?.name ?? "Unknown",
      groupId: server?.groupId ?? null,
      hasSubStream: device.sourceSub !== null,
      webrtcUrl: server?.webrtcUrl ?? null,
      webrtcUrlLocal: server?.webrtcUrlLocal ?? null,
      analytic: device.analyticId ? analyticLabel(device.analyticId) : null,
      state: !device.isEnabled
        ? "disabled"
        : server && isServerOnline(server, now)
          ? "live"
          : "server-offline",
      alerts: alarmCounts.get(device.id) ?? 0,
    };
  });
  return {
    plans,
    placements,
    cameras,
    groups,
    servers: servers.map((server) => ({
      id: server.id,
      isActive: server.isActive,
      online: isServerOnline(server, now),
    })),
    rooms: {},
    failures: planFailures,
  };
};
