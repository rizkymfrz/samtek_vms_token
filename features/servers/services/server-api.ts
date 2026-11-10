import { http } from "@/lib/axios/browser-client";
import type { toCreatePayload, toUpdatePayload } from "../lib/edit-server";

type CreatePayload = ReturnType<typeof toCreatePayload>;
type UpdatePayload = ReturnType<typeof toUpdatePayload>;

export const createServer = async (payload: CreatePayload) =>
  (await http.post<{ id: string }>("/api/edge-servers", payload)).data.id;

export const updateServer = async (id: string, payload: UpdatePayload) =>
  (await http.patch<{ id: string }>(`/api/edge-servers/${id}`, payload)).data
    .id;

export const deleteServer = async (id: string) => {
  await http.delete(`/api/edge-servers/${id}`);
};
