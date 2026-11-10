import { buildLiveSource, HEARTBEAT_SECONDS } from "@/app/(app)/_data/live-source"
import type { CameraData } from "../types"

export const buildCameras = (now = Date.now()): CameraData => {
  const { edgeServers, devices } = buildLiveSource(now)
  return {
    servers: edgeServers.map((s) => ({
      id: s.id,
      name: s.name,
      online: s.isActive && s.lastSeenAt !== null && now - s.lastSeenAt.getTime() < HEARTBEAT_SECONDS * 1000,
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
  }
}
