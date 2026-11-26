import {
  CentralError,
  createCentralClient,
  failureMessage,
} from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { requireAccessToken } from "@/lib/auth/session";
import { roleSchema, serverOptionSchema, userSchema } from "../schemas/user";
import type { UserFailure, UsersData } from "../types";

export const getUsers = async (): Promise<UsersData> => {
  const client = createCentralClient(await requireAccessToken());
  const settle = <T>(source: string, request: Promise<T[]>) =>
    request.then(
      (items) => ({ items, failure: null }),
      (error: unknown): { items: T[]; failure: UserFailure } => {
        console.error(`[users ${source}]`, error);
        return {
          items: [],
          failure: { source, message: failureMessage(error) },
        };
      },
    );
  const [users, roles, servers] = await Promise.all([
    fetchAllPages(client, "/v1/users", userSchema),
    settle("Roles", fetchAllPages(client, "/v1/roles", roleSchema)),
    settle(
      "Edge servers",
      fetchAllPages(client, "/v1/edge-servers", serverOptionSchema),
    ),
  ]);
  const failures = [roles.failure, servers.failure].filter(
    (failure) => failure !== null,
  );
  return { users, roles: roles.items, servers: servers.items, failures };
};

export const getUsersIfAllowed = () =>
  getUsers().catch((error: unknown) => {
    if (error instanceof CentralError && error.status === 403) return null;
    throw error;
  });
