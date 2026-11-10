"use client"
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, SearchIcon, XIcon } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/layout/page-shell"
import { Pick } from "@/components/shared/pick"
import { RiskBadge } from "@/components/shared/risk-badge"
import { SidePanel } from "@/components/layout/side-panel"
import { StatusDot } from "@/components/shared/status-dot"
import type { AlertRow, AlertsData } from "../_data/alerts-source"

// ---- alerts/_data/filter.ts

export const ALL = "all"
export const RANGES = [
  { value: "1", label: "Last hour", hours: 1 },
  { value: "6", label: "Last 6 hours", hours: 6 },
  { value: "24", label: "Last 24 hours", hours: 24 },
  { value: "48", label: "Last 48 hours", hours: 48 },
]
export type Filters = { query: string; range: string; risk: string; title: string; camera: string }
export const DEFAULT_FILTERS: Filters = { query: "", range: "48", risk: ALL, title: ALL, camera: ALL }
// Only the range differs from "nothing selected", since it always has a value.
export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" ||
  filters.range !== DEFAULT_FILTERS.range ||
  filters.risk !== ALL ||
  filters.title !== ALL ||
  filters.camera !== ALL
export const filterAlerts = (rows: AlertRow[], filters: Filters, now: number): AlertRow[] => {
  const hours = RANGES.find((range) => range.value === filters.range)?.hours ?? 48
  const since = now - hours * 3_600_000
  const needle = filters.query.trim().toLowerCase()

  return rows.filter(
    (row) =>
      row.at > since &&
      (filters.risk === ALL || row.risk === filters.risk) &&
      (filters.title === ALL || row.title === filters.title) &&
      (filters.camera === ALL || row.camera === filters.camera) &&
      (!needle || `${row.title} ${row.description} ${row.camera} ${row.id} ${row.object}`.toLowerCase().includes(needle))
  )
}
// How many alerts each camera has under the other filters, so the camera list stays in
// step with them. Busiest first.
export const countByCamera = (rows: AlertRow[], filters: Filters, now: number) => {
  const counts = new Map<string, number>()
  for (const row of filterAlerts(rows, { ...filters, camera: ALL }, now)) {
    counts.set(row.camera, (counts.get(row.camera) ?? 0) + 1)
  }
  return [...counts].map(([camera, count]) => ({ camera, count })).sort((a, b) => b.count - a.count || a.camera.localeCompare(b.camera))
}
// Grid sizes for the alert wall, as [rows, columns]. A page holds rows × columns alerts.
export const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
]
export const DEFAULT_GRID = "3x4"

// ---- alerts/_components/alert-image.tsx

// The snapshot saved with the alarm (alarm_events.image_path, relative to the edge's evidence
// folder). Nothing serves those files yet, so this draws a placeholder in the snapshot's
// 16:9 frame; swap it for an <img> once there is an endpoint. Shared by the table and the sheet.
export const AlertImage = ({
  path,
  className,
  iconClassName,
}: {
  path: string
  className?: string
  iconClassName?: string
}) => {
  return (
    <div
      role="img"
      aria-label={`Snapshot ${path}`}
      className={cn("flex aspect-video items-center justify-center border bg-sidebar text-muted-foreground", className)}
    >
      <ImageIcon className={cn("size-4", iconClassName)} />
    </div>
  )
}

// ---- alerts/_components/alert-sheet.tsx

const Row = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-words">{value}</span>
    </div>
  )
}
// Everything one alarm_events row (and its alarm_details) holds.
export const AlertSheet = ({ alert, onClose }: { alert: AlertRow | null; onClose: () => void }) => {
  return (
    <Sheet open={alert !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {alert && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{alert.title}</SheetTitle>
                <RiskBadge level={alert.risk} />
              </div>
              <SheetDescription>{alert.description}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 p-4 pt-0">
              <div className="flex flex-col gap-2">
                <AlertImage path={alert.imagePath} className="w-full" />
                <span className="text-xs break-all text-muted-foreground">{alert.imagePath}</span>
              </div>

              <div className="flex flex-col">
                <Row label="Time" value={`${alert.date} ${alert.time}`} />
                <Row label="Camera" value={alert.camera} />
                <Row label="Analytic" value={alert.analytic} />
                <Row label="Object" value={alert.object} />
                <Row label="Score" value={alert.score.toFixed(2)} />
                <Row label="Perimeter" value={alert.perimeter} />
                <Row label="Track ID" value={alert.trackId === 0 ? "None" : String(alert.trackId)} />
                <Row label="Frame" value={alert.frame} />
                <Row label="Event ID" value={alert.id} />
              </div>

              {alert.details.length > 0 && (
                <div className="flex flex-col">
                  <span className="pb-2 text-sm font-medium">Details</span>
                  {alert.details.map((detail) => (
                    <Row key={detail.label} label={detail.label} value={detail.value} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ---- alerts/_components/alert-tile.tsx

// One alert as a snapshot tile, laid out like a camera tile on the live wall.
export const AlertTile = ({ alert, onSelect, className }: { alert: AlertRow; onSelect: () => void; className?: string }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${alert.title}, ${alert.camera}, ${alert.risk} risk, ${alert.time}`}
      className={cn(
        "group relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none hover:ring-2 hover:ring-ring hover:ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className
      )}
    >
      <AlertImage path={alert.imagePath} iconClassName="size-8" className="absolute inset-0 aspect-auto size-full border-0" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay" className="capitalize">
          <StatusDot status={alert.risk === "high" ? "danger" : "caution"} />
          {alert.risk}
        </Badge>
        <Badge variant="overlay" className="text-muted-foreground tabular-nums">
          {alert.time.slice(0, 5)} · {alert.date}
        </Badge>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col p-2">
        <span className="truncate text-sm font-medium">{alert.title}</span>
        <span className="truncate text-xs text-muted-foreground">{alert.camera}</span>
      </div>
    </button>
  )
}

// ---- alerts/_components/alerts-table.tsx

// The list view: one alert per row, with its snapshot thumbnail.
export const AlertsTable = ({ alerts, onSelect }: { alerts: AlertRow[]; onSelect: (id: string) => void }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Snapshot</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Alert</TableHead>
          <TableHead>Camera</TableHead>
          <TableHead>Object</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((row) => (
          <TableRow
            key={row.id}
            tabIndex={0}
            onClick={() => onSelect(row.id)}
            onKeyDown={(event) => event.key === "Enter" && onSelect(row.id)}
            className="cursor-pointer outline-none focus-visible:bg-muted"
          >
            <TableCell>
              <AlertImage path={row.imagePath} className="w-20" />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="flex flex-col">
                <span className="tabular-nums">{row.time}</span>
                <span className="text-muted-foreground">{row.date}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-72">
              <div className="flex flex-col">
                <span className="font-medium">{row.title}</span>
                <span className="truncate text-muted-foreground">{row.description}</span>
              </div>
            </TableCell>
            <TableCell>{row.camera}</TableCell>
            <TableCell>{row.object}</TableCell>
            <TableCell>
              <RiskBadge level={row.risk} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{row.score.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ---- alerts/_components/filter-panel.tsx

const RISK_ITEMS = [
  { value: ALL, label: "All risks" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
]
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
// The side panel of the alerts page: filters on top, then the cameras with their alert counts.
export const FilterPanel = ({
  filters,
  titles,
  cameras,
  onChange,
  onClear,
}: {
  filters: Filters
  titles: string[]
  cameras: { camera: string; count: number }[]
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}) => {
  const titleItems = [{ value: ALL, label: "All types" }, ...titles.map((title) => ({ value: title, label: title }))]
  const total = cameras.reduce((sum, item) => sum + item.count, 0)

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
            placeholder="Search alerts..."
            aria-label="Search alerts"
            className="pl-8"
          />
        </div>
        <Field label="Time range">
          <Pick label="Time range" items={RANGES} value={filters.range} onChange={(range) => onChange({ range })} className="w-full" />
        </Field>
        <Field label="Risk">
          <Pick label="Risk" items={RISK_ITEMS} value={filters.risk} onChange={(risk) => onChange({ risk })} className="w-full" />
        </Field>
        <Field label="Type">
          <Pick label="Type" items={titleItems} value={filters.title} onChange={(title) => onChange({ title })} className="w-full" />
        </Field>
      </section>

      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Cameras</span>
        <ul className="flex flex-col">
          {[{ camera: ALL, count: total }, ...cameras].map((item) => {
            const selected = filters.camera === item.camera
            return (
              <li key={item.camera}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ camera: selected ? ALL : item.camera })}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent",
                    selected && "bg-accent font-medium"
                  )}
                >
                  <span className="truncate">{item.camera === ALL ? "All cameras" : item.camera}</span>
                  <span className="text-muted-foreground tabular-nums">{item.count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

// ---- alerts/_components/alerts-view.tsx

type View = "grid" | "list"
const VIEW_ITEMS = [
  { value: "grid", label: "Grid view" },
  { value: "list", label: "List view" },
]
// The list shows this many rows per page; the grid shows rows × columns.
const LIST_PAGE_SIZE = 20
const gridItems = GRID_PRESETS.map(([rows, columns]) => ({ value: `${rows}x${columns}`, label: `${rows}×${columns}` }))
export const AlertsView = ({ data }: { data: AlertsData }) => {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS)
  const [view, setView] = React.useState<View>("grid")
  const [grid, setGrid] = React.useState(DEFAULT_GRID)
  const [page, setPage] = React.useState(0)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const [rows, columns] = grid.split("x").map(Number)
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE

  const matches = React.useMemo(() => filterAlerts(data.rows, filters, data.now), [data.rows, data.now, filters])
  const cameras = React.useMemo(() => countByCamera(data.rows, filters, data.now), [data.rows, data.now, filters])
  const pages = Math.max(1, Math.ceil(matches.length / pageSize))
  const visible = matches.slice(page * pageSize, (page + 1) * pageSize)
  const open: AlertRow | null = data.rows.find((row) => row.id === openId) ?? null

  const change = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(0)
  }

  return (
    <PageShell>
      <SidePanel>
        <FilterPanel
          filters={filters}
          titles={data.titles}
          cameras={cameras}
          onChange={change}
          onClear={() => {
            setFilters(DEFAULT_FILTERS)
            setPage(0)
          }}
        />
      </SidePanel>

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
            {matches.length === 0 ? "0 alerts" : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, matches.length)} of ${matches.length}`}
          </span>
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
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

        {matches.length === 0 ? (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            No alerts match the filters.
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
            {visible.map((alert) => (
              <AlertTile key={alert.id} alert={alert} onSelect={() => setOpenId(alert.id)} className="lg:aspect-auto lg:h-full lg:min-h-0" />
            ))}
            {/* The last page can be short; empty cells keep the grid lines complete. */}
            {Array.from({ length: pageSize - visible.length }, (_, index) => (
              <div key={`empty-${index}`} className="hidden border-r border-b lg:block" />
            ))}
          </div>
        ) : (
          <div className="border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <AlertsTable alerts={visible} onSelect={setOpenId} />
          </div>
        )}
      </div>

      <AlertSheet alert={open} onClose={() => setOpenId(null)} />
    </PageShell>
  )
}
