import { isLiveSource } from "@/config/env";
import {
  CentralError,
  createCentralClient,
  failureMessage,
} from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { requireAccessToken } from "@/lib/auth/session";
import { buildUsers } from "./build-users";
import { roleSchema, userSchema } from "../schemas/user";
import type { UserFailure, UsersData } from "../types";

export const getUsers = async (): Promise<UsersData> => {
  if (!isLiveSource) return buildUsers();
  const client = createCentralClient(await requireAccessToken());
  const [users, roles] = await Promise.all([
    fetchAllPages(client, "/v1/users", userSchema),
    fetchAllPages(client, "/v1/roles", roleSchema).catch((error: unknown) => {
      console.error("[users roles]", error);
      return error;
    }),
  ]);
  const failures: UserFailure[] = Array.isArray(roles)
    ? []
    : [{ source: "Roles", message: failureMessage(roles) }];
  return { users, roles: Array.isArray(roles) ? roles : [], failures };
};

export const getUsersIfAllowed = () =>
  getUsers().catch((error: unknown) => {
    if (error instanceof CentralError && error.status === 403) return null;
    throw error;
  });
