import { http } from "@/lib/axios/browser-client";
import type { toCreatePayload, toUpdatePayload } from "../lib/edit-user";

type CreatePayload = ReturnType<typeof toCreatePayload>;
type UpdatePayload = ReturnType<typeof toUpdatePayload>;

export const createUser = async (payload: CreatePayload) =>
  (await http.post<{ id: string }>("/api/users", payload)).data.id;

export const updateUser = async (id: string, payload: UpdatePayload) => {
  await http.patch(`/api/users/${id}`, payload);
};

export const deleteUser = async (id: string) => {
  await http.delete(`/api/users/${id}`);
};

export const assignPlatformRole = async (id: string, roleId: string | null) => {
  await http.put(`/api/users/${id}/platform-role`, { roleId });
};
