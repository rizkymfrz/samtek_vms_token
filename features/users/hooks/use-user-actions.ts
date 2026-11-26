"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { invalidateUserData } from "@/lib/query/invalidate";
import { USERS_QUERY_KEY } from "./use-users";
import {
  type Draft,
  hasChanges,
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
import type { RoleDraft, UsersData } from "../types";

export const useUserActions = () => {
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<UsersData>(USERS_QUERY_KEY)?.users ?? [];
  const refresh = () => invalidateUserData(queryClient);
  const save = useMutation({
    mutationFn: async ({
      draft,
      id,
    }: {
      draft: Draft;
      id: string | null;
    }): Promise<{ warning: string | null }> => {
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
    mutationFn: (draft: RoleDraft) => createRole(draft),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: deleteUser,
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
