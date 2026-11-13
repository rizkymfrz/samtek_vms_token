"use client";
import { HeaderStatus } from "@/components/layout/header-status";
import { useServerOnline } from "@/features/edge-status";
import { useDeviceList } from "../hooks/use-device-list";
import { cameraState } from "../lib/camera-state";

export const DeviceStatus = () => {
  const { data } = useDeviceList();
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
