import { connection } from "next/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { buildLiveSource, HEARTBEAT_SECONDS } from "../_data/live-source"
import { CamerasView } from "./view"

// ---- cameras/_data/build.ts

// A camera as the profile database stores it (the Device model; see docs/database-schema.md).
// BigInt ids are strings here.
export type CameraRecord = {
  id: string
  edgeServerId: string
  // The edge-side id; analytics tables store it as device_id.
  deviceId: string
  name: string
  isEnabled: boolean
  sourceMain: string
  sourceSub: string | null
  // One analytic per camera; null means the camera only streams.
  analyticId: string | null
  isRecordingEnabled: boolean
}
export type ServerOption = { id: string; name: string; online: boolean }
export type CameraData = { servers: ServerOption[]; cameras: CameraRecord[] }
const buildCameras = (now = Date.now()): CameraData => {
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

// ---- cameras/_components/cameras-content.tsx

const CamerasContent = async () => {
  // Whether an edge server is reachable depends on the current time, so build per request.
  await connection()
  return <CamerasView data={buildCameras()} />
}

// ---- cameras/page.tsx

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-full max-w-3xl" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <CamerasContent />
    </Suspense>
  )
}

export default Page
