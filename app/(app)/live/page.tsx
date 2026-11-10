import { connection } from "next/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticLabel } from "../_data/analytics-catalog"
import { buildLiveSource, HEARTBEAT_SECONDS } from "../_data/live-source"
import { LiveView } from "./view"

// ---- live/_data/build.ts

export type StreamState = "live" | "disabled" | "server-offline"
// What one camera tile needs, already resolved so the browser gets plain data.
export type Tile = {
  id: string
  deviceId: string
  name: string
  serverId: string
  serverName: string
  analytic: string | null
  isRecordingEnabled: boolean
  state: StreamState
  hasSubStream: boolean
}
export type ServerNode = { id: string; name: string; online: boolean }
export type LiveLayout = {
  id: string
  name: string
  description: string | null
  rows: number
  columns: number
  isDefault: boolean
  // One camera id (Device.id) per grid slot, row by row; null is an empty slot.
  slots: (string | null)[]
}
export type LiveData = { servers: ServerNode[]; tiles: Tile[]; layouts: LiveLayout[] }
const buildLive = (now = Date.now()): LiveData => {
  const { edgeServers, devices, layouts, layoutDevices } = buildLiveSource(now)
  const isOnline = (s: (typeof edgeServers)[number]) =>
    s.isActive && s.lastSeenAt !== null && now - s.lastSeenAt.getTime() < HEARTBEAT_SECONDS * 1000
  const server = new Map(edgeServers.map((s) => [s.id, s]))

  const tiles: Tile[] = devices.map((d) => {
    const s = server.get(d.edgeServerId)!
    return {
      id: d.id,
      deviceId: d.deviceId,
      name: d.name,
      serverId: s.id,
      serverName: s.name,
      analytic: d.analyticId ? analyticLabel(d.analyticId) : null,
      isRecordingEnabled: d.isRecordingEnabled,
      state: !d.isEnabled ? "disabled" : isOnline(s) ? "live" : "server-offline",
      hasSubStream: d.sourceSub !== null,
    }
  })

  return {
    servers: edgeServers.map((s) => ({ id: s.id, name: s.name, online: isOnline(s) })),
    tiles,
    layouts: layouts
      .map((layout) => {
        const slots: (string | null)[] = Array.from({ length: layout.rows * layout.columns }, () => null)
        for (const link of layoutDevices.filter((l) => l.layoutId === layout.id)) {
          if (link.position < slots.length) slots[link.position] = link.deviceRecordId
        }
        const { id, name, description, rows, columns, isDefault } = layout
        return { id, name, description, rows, columns, isDefault, slots }
      })
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
  }
}

// ---- live/_components/live-content.tsx

const LiveContent = async () => {
  // Online/offline depends on the current time, so build per request.
  await connection()
  return <LiveView data={buildLive()} />
}

// ---- live/page.tsx

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-96" />
          <div className="grid gap-2 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-video" />
            ))}
          </div>
        </div>
      }
    >
      <LiveContent />
    </Suspense>
  )
}

export default Page
