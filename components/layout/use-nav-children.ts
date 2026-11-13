"use client";
import { useQuery } from "@tanstack/react-query";
import type { NavChildren } from "@/config/navigation";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { CAMERAS_QUERY_KEY } from "@/features/cameras/hooks/use-cameras";
import { fetchCameras } from "@/features/cameras/services/fetch-cameras";
import { FLOORPLAN_QUERY_KEY } from "@/features/floorplan/hooks/use-floorplan";
import { fetchFloorplan } from "@/features/floorplan/services/floorplan-api";
import { SERVERS_QUERY_KEY } from "@/features/servers/hooks/use-servers";
import { fetchServers } from "@/features/servers/services/fetch-servers";

export type NavChild = { id: string; title: string; href: string };

export const useNavChildren = (isLive: boolean) => {
  const staleTime = isLive ? LIVE_STALE_TIME_MS : Number.POSITIVE_INFINITY;
  const servers = useQuery({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: fetchServers,
    staleTime,
  });
  const cameras = useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    staleTime,
  });
  const floorplan = useQuery({
    queryKey: FLOORPLAN_QUERY_KEY,
    queryFn: fetchFloorplan,
    staleTime,
  });
  return {
    servers: (servers.data?.servers ?? []).map(({ id, name }) => ({
      id,
      title: name,
      href: `/servers?id=${id}`,
    })),
    cameras: (cameras.data?.cameras ?? []).map(({ id, name }) => ({
      id,
      title: name,
      href: `/cameras/${id}`,
    })),
    floorplan: (floorplan.data?.plans ?? []).map(({ id, name }) => ({
      id,
      title: name,
      href: `/floorplan?id=${id}`,
    })),
  } satisfies Record<NavChildren, NavChild[]>;
};
