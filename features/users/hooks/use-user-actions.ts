"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
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
  createUser,
  deleteUser,
  updateUser,
} from "../services/user-api";
import type { UserRecord, UsersData } from "../types";

export const useUserActions = (isLive: boolean) => {
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<UsersData>(USERS_QUERY_KEY)?.users ?? [];
  const edit = (change: (users: UserRecord[]) => UserRecord[]) =>
    queryClient.setQueryData<UsersData>(
      USERS_QUERY_KEY,
      (current) => current && { ...current, users: change(current.users) },
    );
  const refresh = () =>
    isLive
      ? queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      : undefined;
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
        if (!draft.platformRoleId) return { warning: null };
        try {
          await assignPlatformRole(createdId, draft.platformRoleId);
        } catch (error) {
          return {
            warning: `User created, but the role was not assigned: ${messageOf(error)}`,
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
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isLive) await deleteUser(id);
      else edit((all) => all.filter((user) => user.id !== id));
    },
    onSuccess: refresh,
  });
  return {
    save,
    remove,
    saveError: save.error ? messageOf(save.error) : null,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
