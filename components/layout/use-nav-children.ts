"use client";
import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type { NavChildren } from "@/config/navigation";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { CAMERAS_QUERY_KEY } from "@/features/cameras/hooks/use-cameras";
import { fetchCameras } from "@/features/cameras/services/fetch-cameras";
import { FLOORPLAN_QUERY_KEY } from "@/features/floorplan/hooks/use-floorplan";
import { fetchFloorplan } from "@/features/floorplan/services/floorplan-api";
import { SERVERS_QUERY_KEY } from "@/features/servers/hooks/use-servers";
import { fetchServers } from "@/features/servers/services/fetch-servers";

const subscribe = () => () => {};

type NavChild = { id: string; title: string; href: string };

export const useNavChildren = () => {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const servers = useQuery({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: fetchServers,
    staleTime: LIVE_STALE_TIME_MS,
  });
  const cameras = useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    staleTime: LIVE_STALE_TIME_MS,
  });
  const floorplan = useQuery({
    queryKey: FLOORPLAN_QUERY_KEY,
    queryFn: fetchFloorplan,
    staleTime: LIVE_STALE_TIME_MS,
  });
  return {
    servers: (hydrated ? (servers.data?.servers ?? []) : []).map(
      ({ id, name }) => ({
        id,
        title: name,
        href: `/servers?id=${id}`,
      }),
    ),
    cameras: (hydrated ? (cameras.data?.cameras ?? []) : []).map(
      ({ id, name }) => ({
        id,
        title: name,
        href: `/cameras/${id}`,
      }),
    ),
    floorplan: (hydrated ? (floorplan.data?.plans ?? []) : []).map(
      ({ id, name }) => ({
        id,
        title: name,
        href: `/floorplan?id=${id}`,
      }),
    ),
  } satisfies Record<NavChildren, NavChild[]>;
};
