import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query";

const DEVICE_KEYS: QueryKey[] = [
  QUERY_KEYS.cameras,
  QUERY_KEYS.servers,
  QUERY_KEYS.live,
  QUERY_KEYS.layout,
  QUERY_KEYS.map,
  QUERY_KEYS.floorplan,
];

const SERVER_KEYS: QueryKey[] = [
  ...DEVICE_KEYS,
  QUERY_KEYS.faces,
  QUERY_KEYS.users,
  QUERY_KEYS.ticketServers,
];

const USER_KEYS: QueryKey[] = [
  QUERY_KEYS.users,
  QUERY_KEYS.currentUser,
  QUERY_KEYS.servers,
];

const invalidateAll = async (client: QueryClient, keys: QueryKey[]) => {
  await Promise.all(
    keys.map((queryKey) => client.invalidateQueries({ queryKey })),
  );
};

export const invalidateDeviceData = (client: QueryClient) =>
  invalidateAll(client, DEVICE_KEYS);

export const invalidateServerData = (client: QueryClient) =>
  invalidateAll(client, SERVER_KEYS);

export const invalidateUserData = (client: QueryClient) =>
  invalidateAll(client, USER_KEYS);
