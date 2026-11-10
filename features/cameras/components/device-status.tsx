"use client";
import { useQuery } from "@tanstack/react-query";
import { HeaderStatus } from "@/components/layout/header-status";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { useServerOnline } from "@/features/edge-status";
import { CAMERAS_QUERY_KEY } from "../hooks/use-cameras";
import { cameraState } from "../lib/camera-state";
import { fetchCameras } from "../services/fetch-cameras";

export const DeviceStatus = () => {
  const { data } = useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    staleTime: LIVE_STALE_TIME_MS,
    refetchInterval: LIVE_STALE_TIME_MS,
  });
  const serverOnline = useServerOnline();
  if (!data) return null;
  const servers = data.servers.map((server) => ({
    ...server,
    online: serverOnline(server, server.online),
  }));
  return (
    <HeaderStatus
      cameras={data.cameras.map((camera) => ({
        status: cameraState(camera, servers) === "live" ? "online" : "offline",
      }))}
      servers={servers.map((server) => ({
        status: server.online ? "online" : "offline",
      }))}
    />
  );
};
