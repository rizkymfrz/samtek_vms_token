import {
  CentralError,
  createCentralClient,
  failureMessage,
} from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { getCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { speakerSchema } from "../schemas/speaker";
import type { SpeakerFailure, SpeakerRecord, SpeakersData } from "../types";

export const getSpeakers = async (): Promise<SpeakersData> => {
  const token = await requireAccessToken();
  const client = createCentralClient(token);
  const servers = await getCentralServers(token);
  const settled = await Promise.allSettled(
    servers.map((server) =>
      fetchAllPages(
        client,
        `/v1/edge-servers/${server.id}/speakers`,
        speakerSchema,
      ),
    ),
  );
  const speakers: SpeakerRecord[] = [];
  const failures: SpeakerFailure[] = [];
  let denied = 0;
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      speakers.push(...outcome.value);
      return;
    }
    if (
      outcome.reason instanceof CentralError &&
      outcome.reason.status === 403
    ) {
      denied++;
    }
    const { id, name } = servers[index];
    console.error(`[speakers server ${id}]`, outcome.reason);
    failures.push({ source: name, message: failureMessage(outcome.reason) });
  });
  if (servers.length > 0 && denied === servers.length) {
    throw new CentralError("Forbidden", 403, "FORBIDDEN");
  }
  return {
    speakers,
    servers: servers.map(({ id, name }) => ({ id, name })),
    failures,
  };
};

export const getSpeakersIfAllowed = () =>
  getSpeakers().catch((error: unknown) => {
    if (error instanceof CentralError && error.status === 403) return null;
    throw error;
  });
