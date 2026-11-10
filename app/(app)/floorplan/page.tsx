import { connection } from "next/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { buildAlerts } from "../_data/alerts-source"
import { analyticLabel } from "../_data/analytics-catalog"
import { buildLiveSource, HEARTBEAT_SECONDS } from "../_data/live-source"
import { FloorplanView } from "./view"

// ---- floorplan/_data/types.ts

// PROPOSED models: the profile database has no floor plans yet (only `Layout` for Live View).
// These shapes are written down in docs/database-schema.md so the backend can agree to them.
// BigInt ids are strings here, like everywhere else.

export type Floorplan = {
  id: string
  name: string
  // Free text for now ("Main Building"); could become a relation to EdgeServerGroup later.
  building: string
  level: string
  // Size of the plan image in its own units; only the proportions matter.
  width: number
  height: number
}
// A camera pinned on a plan. A camera can be on at most one plan (unique deviceRecordId).
export type FloorplanDevice = {
  id: string
  floorplanId: string
  // Points at Device.id, not Device.deviceId.
  deviceRecordId: string
  // Position on the plan as a share of its width / height, 0 to 1.
  x: number
  y: number
  // Direction the camera faces, in degrees: 0 is up, 90 is right.
  rotation: number
  // Width of the field of view, in degrees.
  fov: number
}
// Display only: a room drawn on the sample plan. Stands in for the uploaded plan image.
export type PlanRoom = { x: number; y: number; w: number; h: number; label: string }
// A camera as the floor plan needs it, already resolved so the browser gets plain data.
export type PlanCamera = {
  id: string
  deviceId: string
  name: string
  serverName: string
  analytic: string | null
  state: "live" | "disabled" | "server-offline"
  // Alerts raised by this camera in the last 24 hours.
  alerts: number
}

// ---- floorplan/_data/mock.ts

// Dummy data until the backend is wired up. Cameras and servers are the same ones Live View,
// Cameras and Servers use, so the pages agree.

const FLOORPLANS: Floorplan[] = [
  { id: "1", name: "Main Building", building: "Main Building", level: "Floor 1", width: 1000, height: 600 },
  { id: "2", name: "Main Building", building: "Main Building", level: "Floor 2", width: 1000, height: 600 },
  { id: "3", name: "Parking & gate", building: "Outdoor", level: "Ground", width: 1000, height: 500 },
  { id: "4", name: "Warehouse", building: "Warehouse", level: "Ground", width: 1000, height: 640 },
]
// Stand-in for the uploaded plan image: rooms drawn in plan units.
const ROOMS: Record<string, PlanRoom[]> = {
  "1": [
    { x: 40, y: 40, w: 360, h: 250, label: "Lobby" },
    { x: 400, y: 40, w: 240, h: 170, label: "Reception" },
    { x: 400, y: 210, w: 240, h: 80, label: "Server room" },
    { x: 640, y: 40, w: 320, h: 250, label: "Meeting rooms" },
    { x: 40, y: 290, w: 920, h: 90, label: "Main hallway" },
    { x: 40, y: 380, w: 420, h: 180, label: "Cafeteria" },
    { x: 460, y: 380, w: 500, h: 180, label: "Offices" },
  ],
  "2": [
    { x: 40, y: 40, w: 600, h: 300, label: "Call center" },
    { x: 640, y: 40, w: 320, h: 300, label: "Training room" },
    { x: 40, y: 340, w: 920, h: 80, label: "Corridor" },
    { x: 40, y: 420, w: 460, h: 140, label: "Management" },
    { x: 500, y: 420, w: 460, h: 140, label: "Storage" },
  ],
  "3": [
    { x: 40, y: 40, w: 520, h: 260, label: "Parking lot A" },
    { x: 560, y: 40, w: 400, h: 260, label: "Parking lot B" },
    { x: 40, y: 300, w: 300, h: 160, label: "Gate house" },
    { x: 340, y: 300, w: 380, h: 160, label: "Main gate" },
    { x: 720, y: 300, w: 240, h: 160, label: "Back alley" },
  ],
  "4": [
    { x: 40, y: 40, w: 560, h: 300, label: "Storage" },
    { x: 600, y: 40, w: 360, h: 300, label: "Assembly line" },
    { x: 40, y: 340, w: 420, h: 260, label: "Loading dock" },
    { x: 460, y: 340, w: 500, h: 260, label: "Warehouse gate" },
  ],
}
const pin = (id: string, floorplanId: string, deviceRecordId: string, x: number, y: number, rotation: number, fov = 90): FloorplanDevice => ({
  id,
  floorplanId,
  deviceRecordId,
  x,
  y,
  rotation,
  fov,
})
// Which cameras are already on a plan. Back Alley, Warehouse Roof and Assembly Line are not placed yet.
const INITIAL_PLACEMENTS: FloorplanDevice[] = [
  pin("1", "1", "1", 0.18, 0.2, 135),
  pin("2", "1", "2", 0.36, 0.42, 90, 60),
  pin("3", "1", "3", 0.52, 0.22, 180),
  pin("4", "1", "4", 0.5, 0.52, 90, 120),
  pin("5", "2", "5", 0.3, 0.3, 135, 120),
  pin("6", "3", "6", 0.28, 0.35, 180),
  pin("7", "3", "7", 0.55, 0.78, 0, 60),
  pin("8", "3", "8", 0.5, 0.62, 90),
  pin("9", "4", "10", 0.76, 0.84, 315),
  pin("10", "4", "11", 0.25, 0.7, 45, 120),
]
const buildFloorplanSource = (now: number): { plans: Floorplan[]; placements: FloorplanDevice[]; cameras: PlanCamera[] } => {
  const { edgeServers, devices } = buildLiveSource(now)
  const server = new Map(edgeServers.map((s) => [s.id, s]))

  // Alerts per camera in the last 24 hours, matched by camera name (the same cameras the Alerts page lists).
  const dayAgo = now - 24 * 3_600_000
  const alerts = new Map<string, number>()
  for (const row of buildAlerts(now).rows) {
    if (row.at > dayAgo) alerts.set(row.camera, (alerts.get(row.camera) ?? 0) + 1)
  }

  const cameras: PlanCamera[] = devices.map((d) => {
    const s = server.get(d.edgeServerId)!
    const reachable = s.isActive && s.lastSeenAt !== null && now - s.lastSeenAt.getTime() < HEARTBEAT_SECONDS * 1000
    return {
      id: d.id,
      deviceId: d.deviceId,
      name: d.name,
      serverName: s.name,
      analytic: d.analyticId ? analyticLabel(d.analyticId) : null,
      state: !d.isEnabled ? "disabled" : reachable ? "live" : "server-offline",
      alerts: alerts.get(d.name) ?? 0,
    }
  })
  return { plans: FLOORPLANS, placements: INITIAL_PLACEMENTS, cameras }
}

// ---- floorplan/_data/build.ts

export type FloorplanData = {
  plans: Floorplan[]
  placements: FloorplanDevice[]
  cameras: PlanCamera[]
  rooms: Record<string, PlanRoom[]>
}
const buildFloorplan = (now = Date.now()): FloorplanData => {
  return { ...buildFloorplanSource(now), rooms: ROOMS }
}

// ---- floorplan/_components/floorplan-content.tsx

const FloorplanContent = async () => {
  // Camera status and the 24h alert counts depend on the current time, so build per request.
  await connection()
  return <FloorplanView data={buildFloorplan()} />
}

// ---- floorplan/page.tsx

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <FloorplanContent />
    </Suspense>
  )
}

export default Page
