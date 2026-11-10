import { z } from "zod";
import { createCentralClient, failureMessage } from "./central-client";
import { fetchAllPages } from "./central-pages";
import type { CentralServer } from "./edge-registry";

export const deviceSchema = z.object({
  id: z.coerce.string(),
  edgeServerId: z.coerce.string(),
  deviceId: z.string(),
  name: z.string(),
  isEnabled: z.boolean(),
  sourceMain: z.string(),
  sourceSub: z.string().nullable(),
  analyticId: z.string().nullable(),
  isRecordingEnabled: z.boolean(),
});

export type CentralDevice = z.output<typeof deviceSchema>;

export type DeviceFailure = {
  serverId: string;
  serverName: string;
  message: string;
};

export const listCentralDevices = async (
  token: string,
  servers: CentralServer[],
) => {
  const client = createCentralClient(token);
  const settled = await Promise.allSettled(
    servers.map((server) =>
      fetchAllPages(
        client,
        `/v1/edge-servers/${server.id}/devices`,
        deviceSchema,
      ),
    ),
  );
  const devices: CentralDevice[] = [];
  const failures: DeviceFailure[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      devices.push(...outcome.value);
      return;
    }
    const { id, name } = servers[index];
    console.error(`[devices server ${id}]`, outcome.reason);
    failures.push({
      serverId: id,
      serverName: name,
      message: failureMessage(outcome.reason),
    });
  });
  return { devices, failures };
};
