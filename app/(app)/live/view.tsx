"use client"
import { ChevronDownIcon, ListMinusIcon, ListPlusIcon, MaximizeIcon, MinusIcon, PlusIcon, SearchIcon, ServerOffIcon, Trash2Icon, VideoIcon, VideoOffIcon } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PageShell } from "../_components/page-shell"
import { Pick } from "../_components/pick"
import { SidePanel } from "../_components/side-panel"
import { StatusDot } from "../_components/status-dot"
import type { LiveData, LiveLayout, ServerNode, StreamState, Tile } from "./page"

// ---- live/_data/edit.ts

// Pure helpers for editing a layout in the browser. Every function returns a new layout.

// Grid sizes offered in the picker, as [rows, columns].
export const GRID_PRESETS: [rows: number, columns: number][] = [
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
  [5, 5],
  [6, 6],
]
export const countCameras = (layout: LiveLayout) => layout.slots.filter(Boolean).length
export const freeSlots = (layout: LiveLayout) => layout.slots.length - countCameras(layout)
// Put cameras into the first empty slots, in the order given. Cameras already in the
// layout are skipped, and any that do not fit are left out.
export const addCameras = (layout: LiveLayout, ids: string[]): LiveLayout => {
  const queue = ids.filter((id, index) => !layout.slots.includes(id) && ids.indexOf(id) === index)
  const slots = layout.slots.map((slot) => slot ?? queue.shift() ?? null)
  return { ...layout, slots }
}
export const removeCameras = (layout: LiveLayout, ids: string[]): LiveLayout => {
  return { ...layout, slots: layout.slots.map((slot) => (slot && ids.includes(slot) ? null : slot)) }
}
// Change the grid size. Cameras that no longer have a slot move into free slots first;
// only what still does not fit is dropped.
export const resizeLayout = (layout: LiveLayout, rows: number, columns: number): LiveLayout => {
  const size = rows * columns
  const kept = Array.from({ length: size }, (_, index) => layout.slots[index] ?? null)
  const overflow = layout.slots.slice(size).filter((slot): slot is string => slot !== null)
  const slots = kept.map((slot) => slot ?? overflow.shift() ?? null)
  return { ...layout, rows, columns, slots }
}
export const createLayout = (existing: LiveLayout[]): LiveLayout => {
  let number = existing.length + 1
  while (existing.some((layout) => layout.name === `Layout ${number}`)) number++
  return {
    id: `new-${Date.now()}-${number}`,
    name: `Layout ${number}`,
    description: null,
    rows: 2,
    columns: 2,
    isDefault: false,
    slots: Array.from({ length: 4 }, () => null),
  }
}

// ---- live/_components/camera-tile.tsx

const STATE: Record<StreamState, { label: string; hint: string | null }> = {
  live: { label: "Live", hint: null },
  disabled: { label: "Disabled", hint: "Camera is disabled" },
  "server-offline": { label: "Offline", hint: "Edge server is offline" },
}
// There is no real video yet: the tile is a placeholder for the WebRTC stream that the
// edge server will provide (EdgeServer.webrtcUrl).
export const CameraTile = ({
  tile,
  quality,
  className,
}: {
  tile: Tile
  quality: "sub" | "main"
  className?: string
}) => {
  const { label, hint } = STATE[tile.state]
  const Icon = tile.state === "live" ? VideoIcon : tile.state === "disabled" ? VideoOffIcon : ServerOffIcon
  // Cameras without a sub stream fall back to the main one.
  const stream = quality === "sub" && tile.hasSubStream ? "sub" : "main"

  return (
    <div
      role="group"
      aria-label={`${tile.name}, ${label}`}
      className={cn(
        "relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon className="size-8" />
        {hint && <span className="text-xs">{hint}</span>}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay">
          <StatusDot status={tile.state === "live" ? "live" : "offline"} className={cn(tile.state === "live" && "animate-pulse")} />
          {label}
        </Badge>
        <div className="flex items-center gap-2">
          {tile.isRecordingEnabled && (
            <Badge variant="overlay">
              <StatusDot status="danger" />
              REC
            </Badge>
          )}
          {tile.state === "live" && (
            <Badge variant="overlay" className="text-muted-foreground uppercase">
              {stream}
            </Badge>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2">
        <span className="block truncate text-sm font-medium">{tile.name}</span>
      </div>
    </div>
  )
}

// ---- live/_components/device-panel.tsx

const IconAction = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <Button variant="ghost" size="icon-xs" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}
// The side panel of the live page: choose the layout, then add or remove cameras in it.
export const DevicePanel = ({
  layouts,
  layout,
  servers,
  tiles,
  onSelectLayout,
  onNewLayout,
  onDeleteLayout,
  onAdd,
  onRemove,
}: {
  layouts: LiveLayout[]
  layout: LiveLayout
  servers: ServerNode[]
  tiles: Tile[]
  onSelectLayout: (id: string) => void
  onNewLayout: () => void
  onDeleteLayout: () => void
  onAdd: (ids: string[]) => void
  onRemove: (ids: string[]) => void
}) => {
  const [query, setQuery] = React.useState("")
  const inLayout = new Set(layout.slots)
  const full = freeSlots(layout) === 0
  const needle = query.trim().toLowerCase()

  const layoutItems = layouts.map((l) => ({ value: l.id, label: `${l.name} · ${l.rows}×${l.columns}` }))

  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Layout</span>
        <div className="flex items-center gap-2">
          <Select items={layoutItems} value={layout.id} onValueChange={(value) => onSelectLayout(String(value))}>
            <SelectTrigger className="min-w-0 flex-1" aria-label="Layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {layoutItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <IconAction label="New layout" onClick={onNewLayout}>
            <PlusIcon />
          </IconAction>
          <IconAction label="Delete layout" disabled={layouts.length === 1} onClick={onDeleteLayout}>
            <Trash2Icon />
          </IconAction>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Cameras</span>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cameras..."
            aria-label="Search cameras"
            className="pl-8"
          />
        </div>

        <div className="flex flex-col">
          {servers.map((server) => {
            const cameras = tiles.filter(
              (tile) =>
                tile.serverId === server.id && (!needle || `${tile.name} ${tile.analytic ?? ""}`.toLowerCase().includes(needle))
            )
            if (cameras.length === 0) return null
            const ids = cameras.map((tile) => tile.id)
            const placed = ids.filter((id) => inLayout.has(id)).length

            return (
              <Collapsible key={server.id} defaultOpen className="border-b last:border-b-0">
                <div className="flex items-center gap-2 py-2">
                  <CollapsibleTrigger
                    className="group flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium outline-none focus-visible:underline"
                  >
                    <ChevronDownIcon className="size-4 shrink-0 -rotate-90 text-muted-foreground transition-transform group-aria-expanded:rotate-0" />
                    <StatusDot status={server.online ? "live" : "offline"} />
                    <span className="truncate">{server.name}</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {placed}/{cameras.length}
                    </span>
                  </CollapsibleTrigger>
                  <IconAction label={`Add all ${server.name} cameras`} disabled={full || placed === cameras.length} onClick={() => onAdd(ids)}>
                    <ListPlusIcon />
                  </IconAction>
                  <IconAction label={`Remove all ${server.name} cameras`} disabled={placed === 0} onClick={() => onRemove(ids)}>
                    <ListMinusIcon />
                  </IconAction>
                </div>
                <CollapsibleContent>
                  <ul className="flex flex-col pb-2">
                    {cameras.map((tile) => {
                      const added = inLayout.has(tile.id)
                      return (
                        <li key={tile.id} className="flex items-center gap-2 py-1 pl-8">
                          <StatusDot status={tile.state === "live" ? "live" : "offline"} />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className={cn("truncate text-xs", !added && "text-muted-foreground")}>{tile.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {tile.state === "disabled" ? "Disabled" : tile.state === "server-offline" ? "Server offline" : tile.analytic ?? "No analytic"}
                            </span>
                          </div>
                          {added ? (
                            <IconAction label={`Remove ${tile.name} from layout`} onClick={() => onRemove([tile.id])}>
                              <MinusIcon />
                            </IconAction>
                          ) : (
                            <IconAction label={`Add ${tile.name} to layout`} disabled={full} onClick={() => onAdd([tile.id])}>
                              <PlusIcon />
                            </IconAction>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
          {needle && !tiles.some((tile) => `${tile.name} ${tile.analytic ?? ""}`.toLowerCase().includes(needle)) && (
            <p className="py-4 text-center text-xs text-muted-foreground">No cameras match.</p>
          )}
        </div>
        {full && <p className="text-xs text-muted-foreground">The layout is full. Remove a camera or pick a bigger grid.</p>}
      </section>
    </div>
  )
}

// ---- live/_components/live-view.tsx

type Quality = "sub" | "main"
const QUALITY_ITEMS = [
  { value: "sub", label: "Sub stream" },
  { value: "main", label: "Main stream" },
]
const gridValue = (rows: number, columns: number) => `${rows}x${columns}`
// The presets, plus the layout's own size when it is not one of them (e.g. a custom 2×4).
const gridItems = (rows: number, columns: number) => {
  const sizes = GRID_PRESETS.some(([r, c]) => r === rows && c === columns) ? GRID_PRESETS : [...GRID_PRESETS, [rows, columns]]
  return sizes.map(([r, c]) => ({ value: gridValue(r, c), label: `${r}×${c}` }))
}
export const LiveView = ({ data }: { data: LiveData }) => {
  const { servers, tiles } = data
  // Edits live in the browser for now; they will be saved automatically once there is a backend.
  const [layouts, setLayouts] = React.useState(data.layouts)
  const [layoutId, setLayoutId] = React.useState(data.layouts[0]?.id ?? "")
  const [quality, setQuality] = React.useState<Quality>("sub")
  const stage = React.useRef<HTMLDivElement>(null)

  const layout = layouts.find((l) => l.id === layoutId) ?? layouts[0]
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]))

  if (!layout) {
    return <p className="p-8 text-center text-xs text-muted-foreground">No layouts yet.</p>
  }

  const edit = (change: (current: typeof layout) => typeof layout) =>
    setLayouts((all) => all.map((l) => (l.id === layout.id ? change(l) : l)))

  return (
    <PageShell>
      <SidePanel>
        <DevicePanel
          layouts={layouts}
          layout={layout}
          servers={servers}
          tiles={tiles}
          onSelectLayout={(id) => {
            setLayoutId(id)
          }}
          onNewLayout={() => {
            const created = createLayout(layouts)
            setLayouts((all) => [...all, created])
            setLayoutId(created.id)
          }}
          onDeleteLayout={() => {
            const rest = layouts.filter((l) => l.id !== layout.id)
            setLayouts(rest)
            setLayoutId(rest[0].id)
          }}
          onAdd={(ids) => edit((l) => addCameras(l, ids))}
          onRemove={(ids) => edit((l) => removeCameras(l, ids))}
        />
      </SidePanel>

      <div ref={stage} className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Pick
            label="Grid"
            items={gridItems(layout.rows, layout.columns)}
            value={gridValue(layout.rows, layout.columns)}
            onChange={(size) => {
              const [rows, columns] = size.split("x").map(Number)
              edit((l) => resizeLayout(l, rows, columns))
            }}
          />
          <Pick label="Stream" items={QUALITY_ITEMS} value={quality} onChange={(next) => setQuality(next as Quality)} />
          <Button variant="outline" onClick={() => stage.current?.requestFullscreen?.()}>
            <MaximizeIcon />
            Fullscreen
          </Button>
        </div>

        <div
          className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
          style={
            {
              "--columns": `repeat(${layout.columns}, minmax(0, 1fr))`,
              "--rows": `repeat(${layout.rows}, minmax(0, 1fr))`,
            } as React.CSSProperties
          }
        >
          {layout.slots.map((id, position) => {
            const tile = id ? tileById.get(id) : null
            return tile ? (
              <CameraTile
                key={tile.id}
                tile={tile}
                quality={quality}
                className="lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ) : (
              <div
                key={`empty-${position}`}
                className="flex aspect-video items-center justify-center border-r border-b text-xs text-muted-foreground lg:aspect-auto lg:h-full lg:min-h-0"
              >
                Empty slot
              </div>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
