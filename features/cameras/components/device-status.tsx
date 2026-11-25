"use client";
import { HeaderStatus } from "@/components/layout/header-status";
import { useDeviceFault, useServerOnline } from "@/features/edge-status";
import { useDeviceList } from "../hooks/use-device-list";
import { cameraState } from "../lib/camera-state";

export const DeviceStatus = () => {
  const { data } = useDeviceList();
  const serverOnline = useServerOnline();
  const fault = useDeviceFault();
  if (!data) return null;
  const servers = data.servers.map((server) => ({
    ...server,
    online: serverOnline(server, server.online),
  }));
  return (
    <HeaderStatus
      cameras={data.cameras.map((camera) => ({
        status:
          cameraState(
            { ...camera, fault: fault(camera.edgeServerId, camera.id) },
            servers,
          ) === "live"
            ? "online"
            : "offline",
      }))}
      servers={servers.map((server) => ({
        status: server.online ? "online" : "offline",
      }))}
    />
  );
};
