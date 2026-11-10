"use client"
import { MinusIcon, PlusIcon, SearchIcon, ServerOffIcon, Trash2Icon, VideoIcon, VideoOffIcon } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { Pick } from "@/components/shared/pick"
import { SidePanel } from "@/components/layout/side-panel"
import { StatusDot } from "@/components/shared/status-dot"
import type { Floorplan, FloorplanData, FloorplanDevice, PlanCamera, PlanRoom } from "./page"

// ---- floorplan/_data/edit.ts

export const DEFAULT_FOV = 90
export const FOV_OPTIONS = [60, 90, 120, 180]
// Keep markers a little inside the plan so they never sit on its border.
const MIN = 0.02
const MAX = 0.98
export const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value))
// 0..359, wrapping around (-10 becomes 350, 370 becomes 10).
export const normalizeAngle = (degrees: number) => ((Math.round(degrees) % 360) + 360) % 360
// Where a new camera lands: the middle of the plan, or the first free spot around it, so
// several cameras added in a row do not pile up on one point.
const CANDIDATES: [number, number][] = [
  [0.5, 0.5],
  [0.4, 0.5],
  [0.6, 0.5],
  [0.5, 0.4],
  [0.5, 0.6],
  [0.3, 0.4],
  [0.7, 0.4],
  [0.3, 0.6],
  [0.7, 0.6],
  [0.2, 0.5],
  [0.8, 0.5],
]
const SPACING = 0.06
export const placeCamera = (placements: FloorplanDevice[], floorplanId: string, deviceRecordId: string): FloorplanDevice[] => {
  if (placements.some((p) => p.deviceRecordId === deviceRecordId)) return placements
  const here = placements.filter((p) => p.floorplanId === floorplanId)
  const free = CANDIDATES.find(([x, y]) => here.every((p) => Math.hypot(p.x - x, p.y - y) >= SPACING)) ?? CANDIDATES[0]
  const id = `new-${Date.now()}-${deviceRecordId}`
  return [...placements, { id, floorplanId, deviceRecordId, x: free[0], y: free[1], rotation: 0, fov: DEFAULT_FOV }]
}
const update = (placements: FloorplanDevice[], id: string, patch: Partial<FloorplanDevice>) =>
  placements.map((p) => (p.id === id ? { ...p, ...patch } : p))
export const moveCamera = (placements: FloorplanDevice[], id: string, x: number, y: number) =>
  update(placements, id, { x: clamp(x), y: clamp(y) })
export const rotateCamera = (placements: FloorplanDevice[], id: string, degrees: number) =>
  update(placements, id, { rotation: normalizeAngle(degrees) })
export const setFov = (placements: FloorplanDevice[], id: string, fov: number) => update(placements, id, { fov })
export const removeCamera = (placements: FloorplanDevice[], id: string) => placements.filter((p) => p.id !== id)
// The wedge a camera sees, as an SVG path in plan units. Angles run clockwise from "up".
export const coneGeometry = (cx: number, cy: number, rotation: number, fov: number, range: number): string => {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    return [cx + range * Math.sin(radians), cy - range * Math.cos(radians)].map((n) => Math.round(n * 100) / 100)
  }
  const [x1, y1] = point(rotation - fov / 2)
  const [x2, y2] = point(rotation + fov / 2)
  if (fov >= 360) return `M ${cx} ${cy} m ${-range} 0 a ${range} ${range} 0 1 0 ${range * 2} 0 a ${range} ${range} 0 1 0 ${-range * 2} 0 Z`
  return `M ${cx} ${cy} L ${x1} ${y1} A ${range} ${range} 0 ${fov > 180 ? 1 : 0} 1 ${x2} ${y2} Z`
}
// Pointer position -> plan position, as shares of the plan's box.
export const pointToPlan = (clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }) => {
  if (box.width === 0 || box.height === 0) return { x: 0.5, y: 0.5 }
  return { x: clamp((clientX - box.left) / box.width), y: clamp((clientY - box.top) / box.height) }
}

// ---- floorplan/_components/camera-marker.tsx

const ICON = { live: VideoIcon, disabled: VideoOffIcon, "server-offline": ServerOffIcon }
const STEP = 0.01
const BIG_STEP = 0.05
// A press that moves less than this many pixels is a click, not the start of a drag.
const DRAG_THRESHOLD = 3
// One camera pinned on the plan. Drag it with the pointer, or move it with the arrow keys
// (hold Shift for bigger steps).
export const CameraMarker = ({
  camera,
  x,
  y,
  selected,
  onSelect,
  onMove,
  planBox,
}: {
  camera: PlanCamera
  x: number
  y: number
  selected: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
  // Called while dragging, to turn a pointer position into a plan position.
  planBox: (clientX: number, clientY: number) => { x: number; y: number }
}) => {
  const Icon = ICON[camera.state]
  const drag = React.useRef<{ startX: number; startY: number; moved: boolean } | null>(null)

  return (
    <button
      type="button"
      aria-label={`${camera.name}, ${camera.state === "live" ? "live" : camera.state === "disabled" ? "disabled" : "server offline"}${camera.alerts ? `, ${camera.alerts} alerts` : ""}`}
      aria-pressed={selected}
      title={camera.name}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      className={cn(
        "absolute z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        camera.state === "live" ? "text-chart-2" : "text-muted-foreground",
        selected ? "z-20 border-primary ring-2 ring-primary" : "hover:border-ring"
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { startX: event.clientX, startY: event.clientY, moved: false }
        onSelect()
      }}
      onPointerMove={(event) => {
        const state = drag.current
        if (!state) return
        if (!state.moved && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < DRAG_THRESHOLD) return
        state.moved = true
        const next = planBox(event.clientX, event.clientY)
        onMove(next.x, next.y)
      }}
      onPointerUp={(event) => {
        drag.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? BIG_STEP : STEP
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }
        const move = delta[event.key]
        if (!move) return
        event.preventDefault()
        onMove(x + move[0], y + move[1])
      }}
    >
      <Icon className="size-4" />
      {camera.alerts > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 min-w-4 px-1 tabular-nums">
          {camera.alerts}
        </Badge>
      )}
    </button>
  )
}

// ---- floorplan/_components/floorplan-panel.tsx

const STATE_LABEL = { live: "Live", disabled: "Disabled", "server-offline": "Server offline" } as const
const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-xs last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right font-medium">{children}</span>
    </div>
  )
}
const IconAction = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => {
  return (
    <Button variant="ghost" size="icon-xs" aria-label={label} title={label} onClick={onClick}>
      {children}
    </Button>
  )
}
// The side panel of the floor plan page: choose the plan, tune the selected camera, and add or remove cameras.
export const FloorplanPanel = ({
  plans,
  planId,
  onPlan,
  here,
  elsewhere,
  unplaced,
  cameras,
  selected,
  query,
  onQuery,
  onSelect,
  onAdd,
  onRemove,
  onRotate,
  onFov,
}: {
  plans: Floorplan[]
  planId: string
  onPlan: (id: string) => void
  // Pins on this plan, cameras pinned on other plans (with the plan's name), and cameras not pinned anywhere.
  here: FloorplanDevice[]
  elsewhere: { camera: PlanCamera; planName: string }[]
  unplaced: PlanCamera[]
  cameras: Map<string, PlanCamera>
  selected: FloorplanDevice | null
  query: string
  onQuery: (query: string) => void
  onSelect: (id: string) => void
  onAdd: (deviceRecordId: string) => void
  onRemove: (id: string) => void
  onRotate: (id: string, degrees: number) => void
  onFov: (id: string, fov: number) => void
}) => {
  const planItems = plans.map((p) => ({ value: p.id, label: `${p.building} · ${p.level}` }))
  const fovItems = FOV_OPTIONS.map((fov) => ({ value: String(fov), label: `${fov}°` }))
  const selectedCamera = selected ? cameras.get(selected.deviceRecordId) : undefined
  const needle = query.trim().toLowerCase()
  const matches = (camera: PlanCamera) => !needle || `${camera.name} ${camera.analytic ?? ""} ${camera.serverName}`.toLowerCase().includes(needle)

  const hereShown = here.filter((p) => cameras.get(p.deviceRecordId) && matches(cameras.get(p.deviceRecordId)!))
  const unplacedShown = unplaced.filter(matches)
  const elsewhereShown = elsewhere.filter((item) => matches(item.camera))

  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Floor plan</span>
        <Pick label="Floor plan" items={planItems} value={planId} onChange={onPlan} className="w-full" />
      </section>

      {selected && selectedCamera && (
        <section className="flex flex-col gap-2 border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">{selectedCamera.name}</span>
            <IconAction label={`Remove ${selectedCamera.name} from this plan`} onClick={() => onRemove(selected.id)}>
              <Trash2Icon />
            </IconAction>
          </div>
          <Detail label="Status">
            <StatusDot status={selectedCamera.state === "live" ? "live" : "offline"} />
            {STATE_LABEL[selectedCamera.state]}
          </Detail>
          <Detail label="Edge server">{selectedCamera.serverName}</Detail>
          <Detail label="Analytic">{selectedCamera.analytic ?? "None"}</Detail>
          <Detail label="Alerts (24h)">{selectedCamera.alerts}</Detail>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Direction</span>
              <span className="font-medium tabular-nums">{selected.rotation}°</span>
            </div>
            <Slider
              aria-label="Direction"
              min={0}
              max={359}
              step={1}
              value={[selected.rotation]}
              onValueChange={(value) => onRotate(selected.id, Array.isArray(value) ? value[0] : value)}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Field of view</span>
            <Pick label="Field of view" items={fovItems} value={String(selected.fov)} onChange={(fov) => onFov(selected.id, Number(fov))} className="w-full" />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Cameras</span>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search cameras..." aria-label="Search cameras" className="pl-8" />
        </div>

        <List title="On this plan" count={hereShown.length} empty="No cameras on this plan yet.">
          {hereShown.map((placement) => {
            const camera = cameras.get(placement.deviceRecordId)!
            return (
              <li key={placement.id} className="flex items-center gap-2 py-1">
                <StatusDot status={camera.state === "live" ? "live" : "offline"} />
                <button
                  type="button"
                  aria-pressed={selected?.id === placement.id}
                  onClick={() => onSelect(placement.id)}
                  className="flex min-w-0 flex-1 flex-col text-left outline-none hover:underline focus-visible:underline"
                >
                  <span className={selected?.id === placement.id ? "truncate text-xs font-medium" : "truncate text-xs"}>{camera.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{camera.analytic ?? "No analytic"}</span>
                </button>
                {camera.alerts > 0 && (
                  <Badge variant="destructive" className="tabular-nums">
                    {camera.alerts}
                  </Badge>
                )}
                <IconAction label={`Remove ${camera.name} from this plan`} onClick={() => onRemove(placement.id)}>
                  <MinusIcon />
                </IconAction>
              </li>
            )
          })}
        </List>

        <List title="Not placed" count={unplacedShown.length} empty="Every camera is on a plan.">
          {unplacedShown.map((camera) => (
            <li key={camera.id} className="flex items-center gap-2 py-1">
              <StatusDot status={camera.state === "live" ? "live" : "offline"} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs">{camera.name}</span>
                <span className="truncate text-xs text-muted-foreground">{camera.serverName}</span>
              </span>
              <IconAction label={`Add ${camera.name} to this plan`} onClick={() => onAdd(camera.id)}>
                <PlusIcon />
              </IconAction>
            </li>
          ))}
        </List>

        {elsewhereShown.length > 0 && (
          <List title="On other plans" count={elsewhereShown.length} empty="">
            {elsewhereShown.map(({ camera, planName }) => (
              <li key={camera.id} className="flex items-center gap-2 py-1 text-muted-foreground">
                <StatusDot status={camera.state === "live" ? "live" : "offline"} />
                <span className="min-w-0 flex-1 truncate text-xs">{camera.name}</span>
                <span className="truncate text-xs">{planName}</span>
              </li>
            ))}
          </List>
        )}
      </section>
    </div>
  )
}
const List = ({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b py-2 text-xs">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground tabular-nums">{count}</span>
      </div>
      {count === 0 ? <p className="py-2 text-xs text-muted-foreground">{empty}</p> : <ul className="flex flex-col">{children}</ul>}
    </div>
  )
}

// ---- floorplan/_components/plan-canvas.tsx

// How far a camera "sees" on the drawing, as a share of the plan's width.
const RANGE = 0.12
// The plan itself: the rooms, the coverage wedges, and the camera markers on top. The drawing
// keeps the plan's proportions and is as large as the space allows.
export const PlanCanvas = ({
  plan,
  rooms,
  placements,
  cameras,
  selectedId,
  onSelect,
  onMove,
}: {
  plan: Floorplan
  rooms: PlanRoom[]
  placements: FloorplanDevice[]
  cameras: Map<string, PlanCamera>
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
}) => {
  const box = React.useRef<HTMLDivElement>(null)
  const toPlan = (clientX: number, clientY: number) => {
    const rect = box.current?.getBoundingClientRect()
    return pointToPlan(clientX, clientY, rect ?? { left: 0, top: 0, width: 0, height: 0 })
  }

  return (
    // A size container, so the drawing below can be "as wide as fits, without being taller than fits".
    <div className="relative min-h-96 flex-1 border bg-sidebar lg:min-h-0" style={{ containerType: "size" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={box}
          className="relative"
          style={{ width: `min(100cqw, calc(100cqh * ${plan.width / plan.height}))`, aspectRatio: `${plan.width} / ${plan.height}` }}
          onPointerDown={(event) => event.target === event.currentTarget && onSelect(null)}
        >
          <svg viewBox={`0 0 ${plan.width} ${plan.height}`} className="absolute inset-0 size-full" role="img" aria-label={`${plan.name}, ${plan.level}`} onPointerDown={() => onSelect(null)}>
            <rect width={plan.width} height={plan.height} className="fill-background" />
            {rooms.map((room) => (
              <g key={room.label}>
                <rect x={room.x} y={room.y} width={room.w} height={room.h} strokeWidth={2} className="fill-card stroke-border" />
                <text x={room.x + 14} y={room.y + 28} fontSize={16} className="fill-muted-foreground">
                  {room.label}
                </text>
              </g>
            ))}
            {placements.map((p) => {
              const camera = cameras.get(p.deviceRecordId)
              if (!camera) return null
              const selected = p.id === selectedId
              return (
                <path
                  key={p.id}
                  d={coneGeometry(p.x * plan.width, p.y * plan.height, p.rotation, p.fov, plan.width * RANGE)}
                  strokeWidth={1.5}
                  fillOpacity={selected ? 0.35 : 0.18}
                  strokeOpacity={selected ? 0.9 : 0.5}
                  className={cn("pointer-events-none", camera.state === "live" ? "fill-chart-2 stroke-chart-2" : "fill-muted-foreground stroke-muted-foreground")}
                />
              )
            })}
          </svg>
          {placements.map((p) => {
            const camera = cameras.get(p.deviceRecordId)
            if (!camera) return null
            return (
              <CameraMarker
                key={p.id}
                camera={camera}
                x={p.x}
                y={p.y}
                selected={p.id === selectedId}
                planBox={toPlan}
                onSelect={() => onSelect(p.id)}
                onMove={(x, y) => onMove(p.id, x, y)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---- floorplan/_components/floorplan-view.tsx

export const FloorplanView = ({ data }: { data: FloorplanData }) => {
  // Edits live in the browser for now; they will be saved to the backend once there is one.
  const [placements, setPlacements] = React.useState(data.placements)
  const [planId, setPlanId] = React.useState(data.plans[0]?.id ?? "")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")

  const plan = data.plans.find((p) => p.id === planId) ?? data.plans[0]
  const cameras = React.useMemo(() => new Map(data.cameras.map((c) => [c.id, c])), [data.cameras])
  if (!plan) return <p className="p-8 text-center text-xs text-muted-foreground">No floor plans yet.</p>

  const here = placements.filter((p) => p.floorplanId === plan.id)
  const placedIds = new Set(placements.map((p) => p.deviceRecordId))
  const planName = new Map(data.plans.map((p) => [p.id, `${p.level}`]))
  const elsewhere = placements
    .filter((p) => p.floorplanId !== plan.id && cameras.get(p.deviceRecordId))
    .map((p) => ({ camera: cameras.get(p.deviceRecordId)!, planName: `${data.plans.find((x) => x.id === p.floorplanId)?.building ?? ""} · ${planName.get(p.floorplanId) ?? ""}` }))
  const unplaced = data.cameras.filter((c) => !placedIds.has(c.id))
  const selected = here.find((p) => p.id === selectedId) ?? null

  return (
    <PageShell>
      <SidePanel>
        <FloorplanPanel
          plans={data.plans}
          planId={plan.id}
          onPlan={(id) => {
            setPlanId(id)
            setSelectedId(null)
          }}
          here={here}
          elsewhere={elsewhere}
          unplaced={unplaced}
          cameras={cameras}
          selected={selected}
          query={query}
          onQuery={setQuery}
          onSelect={setSelectedId}
          onAdd={(deviceRecordId) => {
            const next = placeCamera(placements, plan.id, deviceRecordId)
            setPlacements(next)
            // The new pin is the last one; select it so it can be tuned straight away.
            setSelectedId(next[next.length - 1].id)
          }}
          onRemove={(id) => {
            setPlacements((all) => removeCamera(all, id))
            if (selectedId === id) setSelectedId(null)
          }}
          onRotate={(id, degrees) => setPlacements((all) => rotateCamera(all, id, degrees))}
          onFov={(id, fov) => setPlacements((all) => setFov(all, id, fov))}
        />
      </SidePanel>

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        <PlanCanvas
          key={plan.id}
          plan={plan}
          rooms={data.rooms[plan.id] ?? []}
          placements={here}
          cameras={cameras}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          onMove={(id, x, y) => setPlacements((all) => moveCamera(all, id, x, y))}
        />
      </div>
    </PageShell>
  )
}
