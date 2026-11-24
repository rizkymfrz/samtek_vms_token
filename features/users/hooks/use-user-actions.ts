"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { invalidateUserData } from "@/lib/query/invalidate";
import { USERS_QUERY_KEY } from "./use-users";
import {
  type Draft,
  hasChanges,
  saveUserLocally,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-user";
import {
  assignPlatformRole,
  assignServerRole,
  createRole,
  createUser,
  deleteUser,
  updateUser,
} from "../services/user-api";
import type { RoleDraft, UserRecord, UsersData } from "../types";

export const useUserActions = (isLive: boolean) => {
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<UsersData>(USERS_QUERY_KEY)?.users ?? [];
  const edit = (change: (users: UserRecord[]) => UserRecord[]) =>
    queryClient.setQueryData<UsersData>(
      USERS_QUERY_KEY,
      (current) => current && { ...current, users: change(current.users) },
    );
  const refresh = () => (isLive ? invalidateUserData(queryClient) : undefined);
  const save = useMutation({
    mutationFn: async ({
      draft,
      id,
    }: {
      draft: Draft;
      id: string | null;
    }): Promise<{ warning: string | null }> => {
      if (!isLive) {
        edit((all) => saveUserLocally(all, draft, id));
        return { warning: null };
      }
      const original = read().find((user) => user.id === id);
      if (!original) {
        const createdId = await createUser(toCreatePayload(draft));
        if (!draft.serverId || !draft.serverRoleId) return { warning: null };
        try {
          await assignServerRole(draft.serverId, createdId, draft.serverRoleId);
        } catch (error) {
          return {
            warning: `User created, but the server role was not assigned: ${messageOf(error)}`,
          };
        }
        return { warning: null };
      }
      const patch = toUpdatePayload(draft, original);
      if (hasChanges(patch)) await updateUser(original.id, patch);
      if (draft.platformRoleId !== original.platformRoleId) {
        await assignPlatformRole(original.id, draft.platformRoleId);
      }
      return { warning: null };
    },
    onSettled: refresh,
  });
  const addRole = useMutation({
    mutationFn: async (draft: RoleDraft): Promise<string> => {
      if (isLive) return createRole(draft);
      const roles =
        queryClient.getQueryData<UsersData>(USERS_QUERY_KEY)?.roles ?? [];
      const id = String(Math.max(0, ...roles.map((r) => Number(r.id))) + 1);
      queryClient.setQueryData<UsersData>(
        USERS_QUERY_KEY,
        (current) =>
          current && {
            ...current,
            roles: [...current.roles, { id, name: draft.name }],
          },
      );
      return id;
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isLive) await deleteUser(id);
      else edit((all) => all.filter((user) => user.id !== id));
    },
    onSuccess: refresh,
  });
  return {
    save,
    addRole,
    remove,
    addRoleError: addRole.error ? messageOf(addRole.error) : null,
    saveError: save.error ? messageOf(save.error) : null,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
