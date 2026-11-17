import { http } from "@/lib/axios/browser-client";
import type { toCreatePayload, toUpdatePayload } from "../lib/edit-user";
import type { PermissionOption, RoleDraft } from "../types";

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

export const createRole = async (draft: RoleDraft) =>
  (
    await http.post<{ id: string }>("/api/roles", {
      name: draft.name,
      description: draft.description || undefined,
      permissions: draft.permissions,
    })
  ).data.id;

export const fetchPermissions = async () =>
  (await http.get<PermissionOption[]>("/api/permissions")).data;

export const assignServerRole = async (
  serverId: string,
  userId: string,
  roleId: string,
) => {
  await http.put(`/api/edge-servers/${serverId}/users/${userId}`, { roleId });
};
