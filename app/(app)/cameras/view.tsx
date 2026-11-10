"use client"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon, ServerOffIcon, Trash2Icon, VideoIcon, VideoOffIcon, XIcon } from "lucide-react"
import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { PageShell } from "../_components/page-shell"
import { Pick } from "../_components/pick"
import { SidePanel } from "../_components/side-panel"
import { StatusDot } from "../_components/status-dot"
import { analyticLabel, ANALYTICS } from "../_data/analytics-catalog"
import type { CameraData, CameraRecord, ServerOption } from "./page"

// ---- cameras/_data/edit.ts

export type StreamState = "live" | "disabled" | "server-offline"
// What the camera can do right now: it must be enabled and its edge server must be reachable.
export const cameraState = (camera: CameraRecord, servers: ServerOption[]): StreamState => {
  if (!camera.isEnabled) return "disabled"
  return servers.find((s) => s.id === camera.edgeServerId)?.online ? "live" : "server-offline"
}
// ---- filtering

export const ALL = "all"
export type Filters = { query: string; status: string; analytic: string; recording: string; server: string }
export const DEFAULT_FILTERS: Filters = { query: "", status: ALL, analytic: ALL, recording: ALL, server: ALL }
export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" ||
  filters.status !== ALL ||
  filters.analytic !== ALL ||
  filters.recording !== ALL ||
  filters.server !== ALL
export const filterCameras = (
  cameras: CameraRecord[],
  servers: ServerOption[],
  filters: Filters,
  analyticName: (id: string | null) => string
): CameraRecord[] => {
  const needle = filters.query.trim().toLowerCase()
  const serverName = new Map(servers.map((s) => [s.id, s.name]))
  return cameras.filter(
    (camera) =>
      (filters.status === ALL || cameraState(camera, servers) === filters.status) &&
      (filters.analytic === ALL || (filters.analytic === "none" ? camera.analyticId === null : camera.analyticId === filters.analytic)) &&
      (filters.recording === ALL || (filters.recording === "on") === camera.isRecordingEnabled) &&
      (filters.server === ALL || camera.edgeServerId === filters.server) &&
      (!needle ||
        `${camera.name} ${camera.deviceId} ${serverName.get(camera.edgeServerId) ?? ""} ${analyticName(camera.analyticId)}`
          .toLowerCase()
          .includes(needle))
  )
}
// ---- editing

export type Draft = {
  name: string
  deviceId: string
  edgeServerId: string
  sourceMain: string
  sourceSub: string
  analyticId: string | null
  isEnabled: boolean
  isRecordingEnabled: boolean
}
export type Errors = Partial<Record<"name" | "deviceId" | "edgeServerId" | "sourceMain" | "sourceSub", string>>
export const emptyDraft = (servers: ServerOption[]): Draft => ({
  name: "",
  deviceId: "",
  edgeServerId: servers[0]?.id ?? "",
  sourceMain: "",
  sourceSub: "",
  analyticId: null,
  isEnabled: true,
  isRecordingEnabled: false,
})
export const toDraft = (camera: CameraRecord): Draft => ({
  name: camera.name,
  deviceId: camera.deviceId,
  edgeServerId: camera.edgeServerId,
  sourceMain: camera.sourceMain,
  sourceSub: camera.sourceSub ?? "",
  analyticId: camera.analyticId,
  isEnabled: camera.isEnabled,
  isRecordingEnabled: camera.isRecordingEnabled,
})
const STREAM_URL = /^(rtsp|rtsps|http|https):\/\/\S+$/i
// Limits follow the column sizes of the Device model (name 100, deviceId 64), and the
// unique (edgeServerId, deviceId) pair.
export const validate = (draft: Draft, cameras: CameraRecord[], editingId: string | null): Errors => {
  const errors: Errors = {}
  const name = draft.name.trim()
  const deviceId = draft.deviceId.trim()

  if (!name) errors.name = "Name is required."
  else if (name.length > 100) errors.name = "Name can be at most 100 characters."

  if (!deviceId) errors.deviceId = "Device ID is required."
  else if (deviceId.length > 64) errors.deviceId = "Device ID can be at most 64 characters."
  else if (cameras.some((c) => c.id !== editingId && c.edgeServerId === draft.edgeServerId && c.deviceId === deviceId)) {
    errors.deviceId = "This edge server already has a camera with that ID."
  }

  if (!draft.edgeServerId) errors.edgeServerId = "Choose an edge server."

  if (!draft.sourceMain.trim()) errors.sourceMain = "The main stream is required."
  else if (!STREAM_URL.test(draft.sourceMain.trim())) errors.sourceMain = "Use an rtsp:// or http(s):// address."

  if (draft.sourceSub.trim() && !STREAM_URL.test(draft.sourceSub.trim())) {
    errors.sourceSub = "Use an rtsp:// or http(s):// address."
  }
  return errors
}
// Adds the camera (editingId null) or replaces the one being edited. Returns a new array.
export const saveCamera = (cameras: CameraRecord[], draft: Draft, editingId: string | null): CameraRecord[] => {
  const record = (id: string): CameraRecord => ({
    id,
    edgeServerId: draft.edgeServerId,
    deviceId: draft.deviceId.trim(),
    name: draft.name.trim(),
    isEnabled: draft.isEnabled,
    sourceMain: draft.sourceMain.trim(),
    sourceSub: draft.sourceSub.trim() || null,
    analyticId: draft.analyticId,
    isRecordingEnabled: draft.isRecordingEnabled,
  })
  if (editingId === null) {
    const nextId = String(Math.max(0, ...cameras.map((c) => Number(c.id) || 0)) + 1)
    return [...cameras, record(nextId)]
  }
  return cameras.map((c) => (c.id === editingId ? record(c.id) : c))
}
export const removeCamera = (cameras: CameraRecord[], id: string) => cameras.filter((c) => c.id !== id)
// Stream addresses can carry a user:password; never print those.
export const maskSource = (url: string | null): string => {
  if (!url) return "Not set"
  return url.replace(/^([a-z]+:\/\/)[^/@\s]*@/i, "$1")
}
// ---- the camera wall

// Grid sizes for the card view, as [rows, columns]. A page holds rows × columns cameras.
export const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
]
export const DEFAULT_GRID = "4x4"
export const LIST_PAGE_SIZE = 20
export const STATE_LABEL: Record<StreamState, string> = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
}

// ---- cameras/_components/camera-card.tsx

// One camera as a tile in the card view, laid out like a tile on the live wall.
export const CameraCard = ({
  name,
  subtitle,
  state,
  recording,
  onSelect,
  className,
}: {
  name: string
  subtitle: string
  state: StreamState
  recording: boolean
  onSelect: () => void
  className?: string
}) => {
  const Icon = state === "live" ? VideoIcon : state === "disabled" ? VideoOffIcon : ServerOffIcon

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${name}, ${STATE_LABEL[state]}`}
      className={cn(
        "relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none hover:ring-2 hover:ring-ring hover:ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <Icon className="size-8" />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay">
          <StatusDot status={state === "live" ? "live" : "offline"} />
          {STATE_LABEL[state]}
        </Badge>
        {recording && (
          <Badge variant="overlay">
            <StatusDot status="danger" />
            REC
          </Badge>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-2">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </button>
  )
}

// ---- cameras/_components/camera-filter-panel.tsx

const STATUS_ITEMS = [
  { value: ALL, label: "All statuses" },
  { value: "live", label: "Live" },
  { value: "disabled", label: "Disabled" },
  { value: "server-offline", label: "Server offline" },
]
const ANALYTIC_ITEMS = [
  { value: ALL, label: "All analytics" },
  { value: "none", label: "No analytic" },
  ...ANALYTICS.map((a) => ({ value: a.id, label: a.label })),
]
const RECORDING_ITEMS = [
  { value: ALL, label: "Recording: any" },
  { value: "on", label: "Recording on" },
  { value: "off", label: "Recording off" },
]
const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
// The side panel of the cameras page: filters on top, then the edge servers with their camera counts.
export const CameraFilterPanel = ({
  filters,
  servers,
  counts,
  onChange,
  onClear,
}: {
  filters: Filters
  servers: ServerOption[]
  // Cameras per edge server under the other filters.
  counts: Record<string, number>
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}) => {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const rows = [{ id: ALL, name: "All servers", online: null as boolean | null, count: total }, ...servers.map((s) => ({ id: s.id, name: s.name, online: s.online, count: counts[s.id] ?? 0 }))]

  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filters</span>
          {isFiltered(filters) && (
            <Button variant="ghost" size="xs" onClick={onClear}>
              <XIcon />
              Clear
            </Button>
          )}
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search cameras..."
            aria-label="Search cameras"
            className="pl-8"
          />
        </div>
        <FilterField label="Status">
          <Pick label="Status" items={STATUS_ITEMS} value={filters.status} onChange={(status) => onChange({ status })} className="w-full" />
        </FilterField>
        <FilterField label="Analytic">
          <Pick label="Analytic" items={ANALYTIC_ITEMS} value={filters.analytic} onChange={(analytic) => onChange({ analytic })} className="w-full" />
        </FilterField>
        <FilterField label="Recording">
          <Pick label="Recording" items={RECORDING_ITEMS} value={filters.recording} onChange={(recording) => onChange({ recording })} className="w-full" />
        </FilterField>
      </section>

      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Edge servers</span>
        <ul className="flex flex-col">
          {rows.map((row) => {
            const selected = filters.server === row.id
            return (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ server: selected ? ALL : row.id })}
                  className={cn(
                    "flex w-full items-center gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent",
                    selected && "bg-accent font-medium"
                  )}
                >
                  {row.online !== null && (
                    <StatusDot status={row.online ? "live" : "offline"} />
                  )}
                  <span className="flex-1 truncate">{row.name}</span>
                  <span className="text-muted-foreground tabular-nums">{row.count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

// ---- cameras/_components/camera-sheet.tsx

const SHEET_ANALYTIC_ITEMS = [{ value: "none", label: "No analytic" }, ...ANALYTICS.map((a) => ({ value: a.id, label: a.label }))]
// null: closed. "new": adding. A record: editing that camera.
export type SheetTarget = "new" | CameraRecord | null
const Form = ({
  target,
  cameras,
  servers,
  onSave,
  onDelete,
  onClose,
}: {
  target: "new" | CameraRecord
  cameras: CameraRecord[]
  servers: ServerOption[]
  onSave: (draft: Draft, id: string | null) => void
  onDelete: (id: string) => void
  onClose: () => void
}) => {
  const editing = target === "new" ? null : target
  const [draft, setDraft] = React.useState<Draft>(() => (editing ? toDraft(editing) : emptyDraft(servers)))
  const [submitted, setSubmitted] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const formId = React.useId()

  // Errors show after the first Save attempt, then stay in step with what is typed.
  const errors = submitted ? validate(draft, cameras, editing?.id ?? null) : {}
  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }))
  const serverItems = servers.map((s) => ({ value: s.id, label: s.name }))

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Edit camera" : "Add camera"}</SheetTitle>
        <SheetDescription>
          {editing ? `Device ${editing.deviceId}` : "Register a camera on an edge server."}
        </SheetDescription>
      </SheetHeader>

      <form
        id={formId}
        noValidate
        className="flex flex-col gap-4 p-4 pt-0"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (Object.keys(validate(draft, cameras, editing?.id ?? null)).length === 0) onSave(draft, editing?.id ?? null)
        }}
      >
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
          <Input id={`${formId}-name`} value={draft.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={!!errors.name} />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.deviceId}>
          <FieldLabel htmlFor={`${formId}-device`}>Device ID</FieldLabel>
          <Input
            id={`${formId}-device`}
            value={draft.deviceId}
            onChange={(e) => set({ deviceId: e.target.value })}
            placeholder="cam-001"
            aria-invalid={!!errors.deviceId}
          />
          {errors.deviceId && <FieldError>{errors.deviceId}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.edgeServerId}>
          <FieldLabel>Edge server</FieldLabel>
          <Pick label="Edge server" items={serverItems} value={draft.edgeServerId} onChange={(edgeServerId) => set({ edgeServerId })} className="w-full" />
          {errors.edgeServerId && <FieldError>{errors.edgeServerId}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Analytic</FieldLabel>
          <Pick
            label="Analytic"
            items={SHEET_ANALYTIC_ITEMS}
            value={draft.analyticId ?? "none"}
            onChange={(value) => set({ analyticId: value === "none" ? null : value })}
            className="w-full"
          />
        </Field>

        <Field data-invalid={!!errors.sourceMain}>
          <FieldLabel htmlFor={`${formId}-main`}>Main stream</FieldLabel>
          <Input
            id={`${formId}-main`}
            value={draft.sourceMain}
            onChange={(e) => set({ sourceMain: e.target.value })}
            placeholder="rtsp://10.0.0.10/stream1"
            aria-invalid={!!errors.sourceMain}
          />
          {errors.sourceMain && <FieldError>{errors.sourceMain}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.sourceSub}>
          <FieldLabel htmlFor={`${formId}-sub`}>Sub stream (optional)</FieldLabel>
          <Input
            id={`${formId}-sub`}
            value={draft.sourceSub}
            onChange={(e) => set({ sourceSub: e.target.value })}
            placeholder="rtsp://10.0.0.10/stream2"
            aria-invalid={!!errors.sourceSub}
          />
          {errors.sourceSub && <FieldError>{errors.sourceSub}</FieldError>}
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-enabled`} className="text-xs font-medium">
            Enabled
          </label>
          <Switch id={`${formId}-enabled`} checked={draft.isEnabled} onCheckedChange={(isEnabled) => set({ isEnabled })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-recording`} className="text-xs font-medium">
            Recording
          </label>
          <Switch id={`${formId}-recording`} checked={draft.isRecordingEnabled} onCheckedChange={(isRecordingEnabled) => set({ isRecordingEnabled })} />
        </div>

        {editing && (
          <p className="text-xs text-muted-foreground">
            Currently {maskSource(editing.sourceMain)}. Analytic parameters and perimeters are not editable here yet.
          </p>
        )}
      </form>

      <SheetFooter className="flex-row items-center justify-between">
        {editing ? (
          <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {editing ? "Save" : "Add camera"}
          </Button>
        </div>
      </SheetFooter>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {editing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The camera is removed from every layout and stops streaming. Alerts it already raised are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => editing && onDelete(editing.id)}>
              Delete camera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
export const CameraSheet = ({
  target,
  cameras,
  servers,
  onSave,
  onDelete,
  onClose,
}: {
  target: SheetTarget
  cameras: CameraRecord[]
  servers: ServerOption[]
  onSave: (draft: Draft, id: string | null) => void
  onDelete: (id: string) => void
  onClose: () => void
}) => {
  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {/* Keyed so each camera (or a new one) starts from a fresh form. */}
        {target && (
          <Form
            key={target === "new" ? "new" : target.id}
            target={target}
            cameras={cameras}
            servers={servers}
            onSave={onSave}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

// ---- cameras/_components/camera-table.tsx

// The list view: one camera per row, with switches for the two flags people change most.
export const CameraTable = ({
  cameras,
  servers,
  onSelect,
  onToggle,
}: {
  cameras: CameraRecord[]
  servers: ServerOption[]
  onSelect: (id: string) => void
  onToggle: (id: string, patch: Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>) => void
}) => {
  const serverName = new Map(servers.map((s) => [s.id, s.name]))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Camera</TableHead>
          <TableHead>Edge server</TableHead>
          <TableHead>Analytic</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Streams</TableHead>
          <TableHead>Enabled</TableHead>
          <TableHead>Recording</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cameras.map((camera) => {
          const state = cameraState(camera, servers)
          return (
            <TableRow
              key={camera.id}
              tabIndex={0}
              onClick={() => onSelect(camera.id)}
              onKeyDown={(event) => event.target === event.currentTarget && event.key === "Enter" && onSelect(camera.id)}
              className="cursor-pointer outline-none focus-visible:bg-muted"
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{camera.name}</span>
                  <span className="text-muted-foreground">{camera.deviceId}</span>
                </div>
              </TableCell>
              <TableCell>{serverName.get(camera.edgeServerId) ?? "Unknown"}</TableCell>
              <TableCell className={cn(!camera.analyticId && "text-muted-foreground")}>
                {camera.analyticId ? analyticLabel(camera.analyticId) : "None"}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <StatusDot status={state === "live" ? "live" : "offline"} />
                  {STATE_LABEL[state]}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{camera.sourceSub ? "Main + Sub" : "Main"}</TableCell>
              {/* The switches act on their own: a click must not also open the editor. */}
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={camera.isEnabled}
                  aria-label={`${camera.name} enabled`}
                  onCheckedChange={(isEnabled) => onToggle(camera.id, { isEnabled })}
                />
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={camera.isRecordingEnabled}
                  aria-label={`${camera.name} recording`}
                  onCheckedChange={(isRecordingEnabled) => onToggle(camera.id, { isRecordingEnabled })}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ---- cameras/_components/cameras-view.tsx

type View = "grid" | "list"
const VIEW_ITEMS = [
  { value: "grid", label: "Grid view" },
  { value: "list", label: "List view" },
]
const gridItems = GRID_PRESETS.map(([rows, columns]) => ({ value: `${rows}x${columns}`, label: `${rows}×${columns}` }))
const analyticName = (id: string | null) => (id ? analyticLabel(id) : "No analytic")
export const CamerasView = ({ data }: { data: CameraData }) => {
  const { servers } = data
  // Edits live in the browser for now; they will be saved to the backend once there is one.
  const [cameras, setCameras] = React.useState(data.cameras)
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS)
  const [view, setView] = React.useState<View>("grid")
  const [grid, setGrid] = React.useState(DEFAULT_GRID)
  const [page, setPage] = React.useState(0)
  const [sheet, setSheet] = React.useState<SheetTarget>(null)

  const [rows, columns] = grid.split("x").map(Number)
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE

  const matches = React.useMemo(() => filterCameras(cameras, servers, filters, analyticName), [cameras, servers, filters])
  // Server counts follow every filter except the server one, so the list stays in step with them.
  const counts = React.useMemo(() => {
    const others = filterCameras(cameras, servers, { ...filters, server: ALL }, analyticName)
    return Object.fromEntries(servers.map((s) => [s.id, others.filter((c) => c.edgeServerId === s.id).length]))
  }, [cameras, servers, filters])

  const pages = Math.max(1, Math.ceil(matches.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const visible = matches.slice(safePage * pageSize, (safePage + 1) * pageSize)
  const serverName = new Map(servers.map((s) => [s.id, s.name]))

  const change = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(0)
  }
  const toggle = (id: string, patch: Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>) =>
    setCameras((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  return (
    <PageShell>
      <SidePanel>
        <CameraFilterPanel
          filters={filters}
          servers={servers}
          counts={counts}
          onChange={change}
          onClear={() => {
            setFilters(DEFAULT_FILTERS)
            setPage(0)
          }}
        />
      </SidePanel>

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => setSheet("new")}>
            <PlusIcon />
            Add camera
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="mr-2 text-xs text-muted-foreground tabular-nums">
              {matches.length === 0
                ? "0 cameras"
                : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, matches.length)} of ${matches.length}`}
            </span>
            <Button variant="outline" size="icon" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
              <ChevronRightIcon />
            </Button>
            <Pick
              label="View"
              items={VIEW_ITEMS}
              value={view}
              onChange={(next) => {
                setView(next as View)
                setPage(0)
              }}
            />
            {view === "grid" && (
              <Pick
                label="Grid"
                items={gridItems}
                value={grid}
                onChange={(next) => {
                  setGrid(next)
                  setPage(0)
                }}
              />
            )}
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            {cameras.length === 0 ? "No cameras yet. Add the first one." : "No cameras match the filters."}
          </p>
        ) : view === "grid" ? (
          <div
            className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
            style={
              {
                "--columns": `repeat(${columns}, minmax(0, 1fr))`,
                "--rows": `repeat(${rows}, minmax(0, 1fr))`,
              } as React.CSSProperties
            }
          >
            {visible.map((camera) => (
              <CameraCard
                key={camera.id}
                name={camera.name}
                subtitle={`${serverName.get(camera.edgeServerId) ?? "Unknown"} · ${analyticName(camera.analyticId)}`}
                state={cameraState(camera, servers)}
                recording={camera.isRecordingEnabled}
                onSelect={() => setSheet(camera)}
                className="lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ))}
            {/* The last page can be short; empty cells keep the grid lines complete. */}
            {Array.from({ length: pageSize - visible.length }, (_, index) => (
              <div key={`empty-${index}`} className="hidden border-r border-b lg:block" />
            ))}
          </div>
        ) : (
          <div className="border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <CameraTable
              cameras={visible}
              servers={servers}
              onSelect={(id) => setSheet(cameras.find((c) => c.id === id) ?? null)}
              onToggle={toggle}
            />
          </div>
        )}
      </div>

      <CameraSheet
        target={sheet}
        cameras={cameras}
        servers={servers}
        onClose={() => setSheet(null)}
        onSave={(draft: Draft, id) => {
          setCameras((all) => saveCamera(all, draft, id))
          setSheet(null)
        }}
        onDelete={(id) => {
          setCameras((all) => removeCamera(all, id))
          setSheet(null)
        }}
      />
    </PageShell>
  )
}
