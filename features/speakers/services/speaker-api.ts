import { http } from "@/lib/axios/browser-client";
import type { toCreatePayload, toUpdatePayload } from "../lib/edit-speaker";

type CreatePayload = ReturnType<typeof toCreatePayload>;
type UpdatePayload = ReturnType<typeof toUpdatePayload>;

export type SpeakerCall = {
  speakerId: string | null;
  status: string;
  reason: string | null;
  durationMs: number;
};

const path = (serverId: string, id?: string) =>
  `/api/edge-servers/${serverId}/speakers${id ? `/${id}` : ""}`;

export const createSpeaker = async (
  serverId: string,
  payload: CreatePayload,
) => {
  await http.post(path(serverId), payload);
};

export const updateSpeaker = async (
  serverId: string,
  id: string,
  payload: UpdatePayload,
) => {
  await http.patch(path(serverId, id), payload);
};

export const deleteSpeaker = async (serverId: string, id: string) => {
  await http.delete(path(serverId, id));
};

export const testSpeaker = async (serverId: string, id: string) =>
  (
    await http.post<{ calls: SpeakerCall[] }>(
      `${path(serverId, id)}/test-calls`,
      undefined,
      { timeout: 70_000 },
    )
  ).data.calls;
