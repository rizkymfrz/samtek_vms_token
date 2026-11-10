import { isServerOnline } from "@/config/server-status";
import { buildLiveSource } from "@/lib/mock/live-source";
import type { CameraData } from "../types";

export const buildCameras = (now = Date.now()): CameraData => {
  const { edgeServers, devices } = buildLiveSource(now);
  return {
    failures: [],
    servers: edgeServers.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      isActive: s.isActive,
      online: isServerOnline(
        { isActive: s.isActive, lastSeenAt: s.lastSeenAt?.getTime() ?? null },
        now,
      ),
    })),
    cameras: devices.map((d) => ({
      id: d.id,
      edgeServerId: d.edgeServerId,
      deviceId: d.deviceId,
      name: d.name,
      isEnabled: d.isEnabled,
      sourceMain: d.sourceMain,
      sourceSub: d.sourceSub,
      analyticId: d.analyticId,
      isRecordingEnabled: d.isRecordingEnabled,
    })),
  };
};
