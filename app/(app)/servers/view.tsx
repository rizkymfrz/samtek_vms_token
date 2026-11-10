"use client"
import { CctvIcon, Loader2Icon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, RadarIcon, RotateCwIcon, ServerIcon, TagIcon, TerminalIcon, Trash2Icon } from "lucide-react"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PageShell } from "../_components/page-shell"
import { Pick } from "../_components/pick"
import { SidePanel } from "../_components/side-panel"
import { StatusDot } from "@/components/shared/status-dot"
import { createRandom } from "../_data/random"
import { type Discovered, type LogLine, type Metrics, type ServerGroup, type ServerRecord, type ServersData } from "./page"

// More devices a scan can turn up, handed out one per Scan.
const SCAN_POOL: Omit<Discovered, "registeredServerId">[] = [
  { id: "edge-c4d9", ip: "192.168.1.71", vendor: "SAMTEK Edge" },
  { id: "smartbox-e803", ip: "192.168.1.72", vendor: "SmartBox" },
  { id: "nvr-5b17", ip: "192.168.1.73", vendor: "Hikvision" },
]
const LOG_TEMPLATES: [level: "INFO" | "WARN" | "DEBUG", template: string][] = [
  ["INFO", "mqtt: published edge.state (devices=%d)"],
  ["INFO", "stream: webrtc session opened device=cam-%s"],
  ["DEBUG", "analytics: pipeline tick latency=%dms"],
  ["INFO", "recorder: segment closed device=cam-%s size=%dMB"],
  ["INFO", "stats: flushed object_counts rows=%d"],
  ["INFO", "health: heartbeat ok"],
  ["WARN", "recorder: disk free below 20%"],
  ["WARN", "stream: reconnecting device=cam-%s"],
]
// One log line; the same seed always gives the same line.
const logLine = (seed: number, at: number): LogLine => {
  const random = createRandom(seed)
  const [level, template] = LOG_TEMPLATES[Math.floor(random() * LOG_TEMPLATES.length)]
  const message = template.replace(/%([ds])/g, (_, kind: string) =>
    kind === "s" ? String(Math.floor(random() * 13) + 1).padStart(3, "0") : String(Math.floor(random() * 880) + 20)
  )
  return { id: seed, at, level, message }
}

// ---- servers/_data/edit.ts

// A server counts as reachable while its heartbeat is this fresh (same rule as Live View).
export const HEARTBEAT_SECONDS = 60
export const isOnline = (server: ServerRecord, now: number) =>
  server.isActive && server.lastSeenAt !== null && now - server.lastSeenAt < HEARTBEAT_SECONDS * 1000
// ---- reading the metrics

export type Level = "normal" | "warning" | "critical"
// CPU temperature in °C: warn from 70, critical from 80 (the dashed limit line on the chart).
export const TEMP_LIMIT = 80
export const tempLevel = (celsius: number): Level => (celsius >= TEMP_LIMIT ? "critical" : celsius >= 70 ? "warning" : "normal")
// Anything measured in percent (CPU, memory, storage): warn from 80, critical from 90.
export const percentLevel = (percent: number): Level => (percent >= 90 ? "critical" : percent >= 80 ? "warning" : "normal")
export const LEVEL_LABEL: Record<Level, string> = { normal: "Normal", warning: "Warning", critical: "Critical" }
export const storageTotals = (storage: { recordings: number; analytics: number; system: number; free: number }) => {
  const used = storage.recordings + storage.analytics + storage.system
  const total = used + storage.free
  return { used, total, percent: total === 0 ? 0 : Math.round((used / total) * 100) }
}
// ---- editing

export type Draft = {
  name: string
  code: string
  description: string
  groupId: string | null
  hostAddress: string
  localHostAddress: string
  webrtcUrl: string
  webrtcUrlLocal: string
  macAddress: string
  isActive: boolean
}
export type Errors = Partial<Record<"name" | "code" | "hostAddress" | "localHostAddress" | "webrtcUrl" | "webrtcUrlLocal" | "macAddress", string>>
export const emptyDraft = (): Draft => ({
  name: "",
  code: "",
  description: "",
  groupId: null,
  hostAddress: "",
  localHostAddress: "",
  webrtcUrl: "",
  webrtcUrlLocal: "",
  macAddress: "",
  isActive: true,
})
export const toDraft = (server: ServerRecord): Draft => ({
  name: server.name,
  code: server.code,
  description: server.description ?? "",
  groupId: server.groupId,
  hostAddress: server.hostAddress ?? "",
  localHostAddress: server.localHostAddress ?? "",
  webrtcUrl: server.webrtcUrl ?? "",
  webrtcUrlLocal: server.webrtcUrlLocal ?? "",
  macAddress: server.macAddress ?? "",
  isActive: server.isActive,
})
const HOST = /^[A-Za-z0-9.-]+(:\d{1,5})?$/
const HTTP_URL = /^https?:\/\/\S+$/i
const MAC = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/
// Limits follow the column sizes of the EdgeServer model (name and code 100, host 255, urls 2048, mac 32)
// and the unique `code`.
export const validate = (draft: Draft, servers: ServerRecord[], editingId: string | null): Errors => {
  const errors: Errors = {}
  const name = draft.name.trim()
  const code = draft.code.trim()

  if (!name) errors.name = "Name is required."
  else if (name.length > 100) errors.name = "Name can be at most 100 characters."

  if (!code) errors.code = "Code is required."
  else if (code.length > 100) errors.code = "Code can be at most 100 characters."
  else if (!/^[a-z0-9][a-z0-9-]*$/.test(code)) errors.code = "Use lowercase letters, numbers and dashes."
  else if (servers.some((s) => s.id !== editingId && s.code === code)) errors.code = "Another server already uses this code."

  for (const field of ["hostAddress", "localHostAddress"] as const) {
    const value = draft[field].trim()
    if (value && (value.length > 255 || !HOST.test(value))) errors[field] = "Use a host name or IP, optionally with :port."
  }
  for (const field of ["webrtcUrl", "webrtcUrlLocal"] as const) {
    const value = draft[field].trim()
    if (value && (value.length > 2048 || !HTTP_URL.test(value))) errors[field] = "Use an http:// or https:// address."
  }
  if (draft.macAddress.trim() && !MAC.test(draft.macAddress.trim())) errors.macAddress = "Use the form 00:1A:2B:3C:4D:5E."
  return errors
}
const orNull = (value: string) => value.trim() || null
export const saveServer = (servers: ServerRecord[], draft: Draft, editingId: string | null): ServerRecord[] => {
  if (editingId === null) {
    const id = String(Math.max(0, ...servers.map((s) => Number(s.id) || 0)) + 1)
    return [
      ...servers,
      {
        id,
        groupId: draft.groupId,
        name: draft.name.trim(),
        code: draft.code.trim(),
        description: orNull(draft.description),
        hostAddress: orNull(draft.hostAddress),
        localHostAddress: orNull(draft.localHostAddress),
        webrtcUrl: orNull(draft.webrtcUrl),
        webrtcUrlLocal: orNull(draft.webrtcUrlLocal),
        macAddress: orNull(draft.macAddress),
        isActive: draft.isActive,
        // A server added by hand has not reported in yet.
        lastSeenAt: null,
        vendor: "Custom",
        cameraCount: 0,
      },
    ]
  }
  return servers.map((s) =>
    s.id !== editingId
      ? s
      : {
          ...s,
          groupId: draft.groupId,
          name: draft.name.trim(),
          code: draft.code.trim(),
          description: orNull(draft.description),
          hostAddress: orNull(draft.hostAddress),
          localHostAddress: orNull(draft.localHostAddress),
          webrtcUrl: orNull(draft.webrtcUrl),
          webrtcUrlLocal: orNull(draft.webrtcUrlLocal),
          macAddress: orNull(draft.macAddress),
          isActive: draft.isActive,
        }
  )
}
// The database refuses to delete a server that still has cameras (Device.edgeServer is onDelete: Restrict).
export const canDelete = (server: ServerRecord) => server.cameraCount === 0
export const removeServer = (servers: ServerRecord[], id: string) => servers.filter((s) => s.id !== id)
// Turn a discovered device into a registered edge server. Returns the new lists and the new server's id.
export const registerDiscovered = (
  servers: ServerRecord[],
  discovered: Discovered[],
  discoveredId: string,
  now: number
): { servers: ServerRecord[]; discovered: Discovered[]; serverId: string | null } => {
  const found = discovered.find((d) => d.id === discoveredId)
  if (!found || found.registeredServerId) return { servers, discovered, serverId: null }
  const serverId = String(Math.max(0, ...servers.map((s) => Number(s.id) || 0)) + 1)
  const taken = new Set(servers.map((s) => s.code))
  const code = taken.has(found.id) ? `${found.id}-${serverId}` : found.id
  return {
    serverId,
    servers: [
      ...servers,
      {
        id: serverId,
        groupId: null,
        name: found.id,
        code,
        description: null,
        hostAddress: `${found.ip}:443`,
        localHostAddress: null,
        webrtcUrl: null,
        webrtcUrlLocal: null,
        macAddress: null,
        isActive: true,
        lastSeenAt: now,
        vendor: found.vendor,
        cameraCount: 0,
      },
    ],
    discovered: discovered.map((d) => (d.id === discoveredId ? { ...d, registeredServerId: serverId } : d)),
  }
}

// ---- servers/_components/log-sheet.tsx

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" })
const KEEP = 200
// A simulated log stream: a new line every two seconds while the panel is open, until paused.
const Stream = ({ serverId, online, startedAt }: { serverId: string; online: boolean; startedAt: number }) => {
  const base = Number(serverId.replace(/\D/g, "")) || 1
  const [lines, setLines] = React.useState<LogLine[]>(() =>
    Array.from({ length: 30 }, (_, index) => logLine(base * 1000 + index, startedAt - (30 - index) * 2000))
  )
  const [paused, setPaused] = React.useState(false)
  const end = React.useRef<HTMLDivElement>(null)
  const counter = React.useRef(30)

  React.useEffect(() => {
    if (paused || !online) return
    const timer = setInterval(() => {
      const index = counter.current++
      setLines((current) => [...current, logLine(base * 1000 + index, Date.now())].slice(-KEEP))
    }, 2000)
    return () => clearInterval(timer)
  }, [paused, online, base])

  React.useEffect(() => {
    if (!paused) end.current?.scrollIntoView({ block: "end" })
  }, [lines, paused])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-4 pt-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {!online ? "Offline: no new lines" : paused ? "Paused" : "Streaming"} · {lines.length} lines
        </span>
        <Button variant="outline" size="sm" disabled={!online} onClick={() => setPaused((value) => !value)}>
          {paused ? <PlayIcon /> : <PauseIcon />}
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto border bg-sidebar p-2 font-mono text-xs">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2 py-0.5">
            <span className="shrink-0 text-muted-foreground">{clock.format(line.at)}</span>
            {/* The level is spelled out, so it never depends on color alone. */}
            <span className={cn("w-12 shrink-0", line.level === "WARN" ? "text-destructive" : "text-muted-foreground")}>{line.level}</span>
            <span className="break-all">{line.message}</span>
          </div>
        ))}
        <div ref={end} />
      </div>
    </div>
  )
}
export const LogSheet = ({
  server,
  online,
  startedAt,
  onClose,
}: {
  server: { id: string; name: string } | null
  online: boolean
  startedAt: number
  onClose: () => void
}) => {
  return (
    <Sheet open={server !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl">
        {server && (
          <>
            <SheetHeader>
              <SheetTitle>Log stream</SheetTitle>
              <SheetDescription>{server.name}. Sample lines only, until the edge exposes its real log.</SheetDescription>
            </SheetHeader>
            <Stream key={server.id} serverId={server.id} online={online} startedAt={startedAt} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ---- servers/_components/metric-chart.tsx

const config = { value: { label: "Value", color: "var(--chart-2)" } } satisfies ChartConfig
// Readings are one per minute for the last hour, so the x axis is "minutes ago".
const X_TICKS = [-60, -45, -30, -15, 0]
const minuteLabel = (minute: number) => (minute === 0 ? "now" : `${minute}m`)
export const LevelBadge = ({ level }: { level: Level }) => {
  // The text carries the level, so the badge never relies on color alone.
  return (
    <Badge variant={level === "normal" ? "outline" : level === "warning" ? "secondary" : "destructive"}>{LEVEL_LABEL[level]}</Badge>
  )
}
// A card for one resource reading: title, big current value with its level, and a 60-minute area chart.
export const MetricChart = ({
  title,
  value,
  level,
  points,
  domain,
  ticks,
  unit,
  limit,
  footer,
  empty,
}: {
  title: string
  value: string
  level: Level
  points: number[]
  domain: [number, number]
  ticks: number[]
  unit: string
  // A value to draw as a dashed limit line.
  limit?: number
  footer: React.ReactNode
  // Shown instead of the chart when the server is not reporting.
  empty?: string
}) => {
  const data = points.map((point, index) => ({ minute: index - (points.length - 1), value: point }))

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">Last 60 min</span>
          </div>
          {!empty && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-semibold tabular-nums">{value}</span>
              <LevelBadge level={level} />
            </div>
          )}
        </div>

        {empty ? (
          <p className="flex min-h-40 flex-1 items-center justify-center border border-dashed text-xs text-muted-foreground">{empty}</p>
        ) : (
          <div className="relative min-h-40 flex-1">
            <ChartContainer config={config} className="absolute inset-0 aspect-auto size-full">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="minute"
                  type="number"
                  domain={[-60, 0]}
                  ticks={X_TICKS}
                  tickFormatter={minuteLabel}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="font-mono"
                />
                <YAxis
                  domain={domain}
                  ticks={ticks}
                  tickFormatter={(tick: number) => `${tick}${unit}`}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  className="font-mono"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, items) => {
                        const minute = Number(items?.[0]?.payload?.minute ?? 0)
                        return minute === 0 ? "now" : `${-minute} min ago`
                      }}
                      formatter={(v) => `${v}${unit}`}
                    />
                  }
                />
                {limit !== undefined && (
                  <ReferenceLine y={limit} stroke="var(--destructive)" strokeDasharray="4 4" />
                )}
                <Area
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="var(--color-value)"
                  fillOpacity={0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}

        {/* No footer when there is nothing to describe, and none when the server is not reporting. */}
        {!empty && footer && <div className="border-t pt-4 text-xs text-muted-foreground">{footer}</div>}
      </CardContent>
    </Card>
  )
}
// The small "Used / Available / Total" row under a chart.
export const Stats = ({ items }: { items: [label: string, value: string][] }) => {
  return (
    <div className="flex justify-between gap-4">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <span>{label}</span>
          <span className="text-sm font-medium text-foreground tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ---- servers/_components/server-form-sheet.tsx

// null: closed. "new": adding. A record: editing that server.
export type FormTarget = "new" | ServerRecord | null
type TextField = "name" | "code" | "description" | "hostAddress" | "localHostAddress" | "webrtcUrl" | "webrtcUrlLocal" | "macAddress"
const FIELDS: { key: TextField; label: string; placeholder?: string; hint?: string }[] = [
  { key: "name", label: "Name" },
  { key: "code", label: "Code", placeholder: "edge-main", hint: "Unique. Used to build the MQTT topics." },
  { key: "description", label: "Description", placeholder: "Main building" },
  { key: "hostAddress", label: "Host address", placeholder: "192.168.1.20:443" },
  { key: "localHostAddress", label: "Local host address", placeholder: "192.168.1.20:8889" },
  { key: "webrtcUrl", label: "WebRTC URL", placeholder: "https://edge.example.com/webrtc" },
  { key: "webrtcUrlLocal", label: "WebRTC URL (local network)", placeholder: "http://192.168.1.20:8889" },
  { key: "macAddress", label: "MAC address", placeholder: "00:1A:2B:3C:4D:5E" },
]
const Form = ({
  target,
  servers,
  groups,
  onSave,
  onClose,
}: {
  target: "new" | ServerRecord
  servers: ServerRecord[]
  groups: ServerGroup[]
  onSave: (draft: Draft, id: string | null) => void
  onClose: () => void
}) => {
  const editing = target === "new" ? null : target
  const [draft, setDraft] = React.useState<Draft>(() => (editing ? toDraft(editing) : emptyDraft()))
  const [submitted, setSubmitted] = React.useState(false)
  const formId = React.useId()

  // Errors show after the first Save attempt, then stay in step with what is typed.
  const errors = submitted ? validate(draft, servers, editing?.id ?? null) : {}
  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }))
  const groupItems = [{ value: "none", label: "No group" }, ...groups.map((g) => ({ value: g.id, label: g.name }))]

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Edit server" : "Add server"}</SheetTitle>
        <SheetDescription>{editing ? editing.code : "Register an edge server by hand."}</SheetDescription>
      </SheetHeader>

      <form
        id={formId}
        noValidate
        className="flex flex-col gap-4 p-4 pt-0"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (Object.keys(validate(draft, servers, editing?.id ?? null)).length === 0) onSave(draft, editing?.id ?? null)
        }}
      >
        {FIELDS.slice(0, 3).map((field) => (
          <Field key={field.key} data-invalid={!!errors[field.key as keyof typeof errors]}>
            <FieldLabel htmlFor={`${formId}-${field.key}`}>{field.label}</FieldLabel>
            <Input
              id={`${formId}-${field.key}`}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => set({ [field.key]: e.target.value })}
              aria-invalid={!!errors[field.key as keyof typeof errors]}
            />
            {field.hint && !errors[field.key as keyof typeof errors] && <FieldDescription>{field.hint}</FieldDescription>}
            {errors[field.key as keyof typeof errors] && <FieldError>{errors[field.key as keyof typeof errors]}</FieldError>}
          </Field>
        ))}

        <Field>
          <FieldLabel>Group</FieldLabel>
          <Pick
            label="Group"
            items={groupItems}
            value={draft.groupId ?? "none"}
            onChange={(value) => set({ groupId: value === "none" ? null : value })}
            className="w-full"
          />
        </Field>

        {FIELDS.slice(3).map((field) => (
          <Field key={field.key} data-invalid={!!errors[field.key as keyof typeof errors]}>
            <FieldLabel htmlFor={`${formId}-${field.key}`}>{field.label}</FieldLabel>
            <Input
              id={`${formId}-${field.key}`}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => set({ [field.key]: e.target.value })}
              aria-invalid={!!errors[field.key as keyof typeof errors]}
            />
            {errors[field.key as keyof typeof errors] && <FieldError>{errors[field.key as keyof typeof errors]}</FieldError>}
          </Field>
        ))}

        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-active`} className="text-xs font-medium">
            Active
          </label>
          <Switch id={`${formId}-active`} checked={draft.isActive} onCheckedChange={(isActive) => set({ isActive })} />
        </div>
      </form>

      <SheetFooter className="flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId}>
          {editing ? "Save" : "Add server"}
        </Button>
      </SheetFooter>
    </>
  )
}
export const ServerFormSheet = ({
  target,
  servers,
  groups,
  onSave,
  onClose,
}: {
  target: FormTarget
  servers: ServerRecord[]
  groups: ServerGroup[]
  onSave: (draft: Draft, id: string | null) => void
  onClose: () => void
}) => {
  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {/* Keyed so each server (or a new one) starts from a fresh form. */}
        {target && (
          <Form
            key={target === "new" ? "new" : target.id}
            target={target}
            servers={servers}
            groups={groups}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

// ---- servers/_components/server-list-panel.tsx

export type DiscoverTab = "registered" | "discovered"
// The side panel of the servers page: the registered servers, then devices a scan has found.
export const ServerListPanel = ({
  servers,
  online,
  selectedId,
  discovered,
  tab,
  scanning,
  onSelect,
  onAdd,
  onTab,
  onScan,
  onRegister,
}: {
  servers: ServerRecord[]
  online: Set<string>
  selectedId: string | null
  discovered: Discovered[]
  tab: DiscoverTab
  scanning: boolean
  onSelect: (id: string) => void
  onAdd: () => void
  onTab: (tab: DiscoverTab) => void
  onScan: () => void
  onRegister: (id: string) => void
}) => {
  const registered = discovered.filter((d) => d.registeredServerId)
  const pending = discovered.filter((d) => !d.registeredServerId)
  const shown = tab === "registered" ? registered : pending

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <span className="text-sm font-medium">Servers</span>
        <Button variant="outline" size="icon" aria-label="Add server" onClick={onAdd}>
          <PlusIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <span className="text-xs text-muted-foreground">Servers · {servers.length}</span>
        {servers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No servers yet.</p>}
        <ul className="flex flex-col gap-2">
          {servers.map((server) => (
            <li key={server.id}>
              <button
                type="button"
                aria-pressed={server.id === selectedId}
                onClick={() => onSelect(server.id)}
                className={cn(
                  "flex w-full items-center gap-2 border p-2 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  server.id === selectedId && "border-primary bg-accent"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                  <ServerIcon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">{server.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{server.vendor}</span>
                </span>
                {/* Online is a filled square, anything else an empty one, so the state shows without color. */}
                <StatusDot
                  shape="square"
                  status={online.has(server.id) ? "live" : "offline"}
                  role="img"
                  aria-label={online.has(server.id) ? "Online" : "Offline"}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Registered / Discovered</span>
          <Button variant="outline" size="sm" onClick={onScan} disabled={scanning}>
            {scanning ? <Loader2Icon className="animate-spin" /> : <RadarIcon />}
            {scanning ? "Scanning" : "Scan"}
          </Button>
        </div>
        <Tabs value={tab} onValueChange={(value) => onTab(value as DiscoverTab)}>
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="registered">Registered {registered.length}</TabsTrigger>
            <TabsTrigger value="discovered">Discovered {pending.length}</TabsTrigger>
          </TabsList>
        </Tabs>
        <ul className="flex flex-col gap-2">
          {shown.length === 0 && (
            <li className="py-4 text-center text-xs text-muted-foreground">
              {tab === "registered" ? "Nothing registered from a scan yet." : "No new devices. Scan the network to look again."}
            </li>
          )}
          {shown.map((device) => (
            <li key={device.id} className="flex items-center gap-2 border p-2">
              <CctvIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-medium">{device.id}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {device.ip} · {device.vendor}
                </span>
              </span>
              {device.registeredServerId ? (
                <Button variant="ghost" size="xs" onClick={() => onSelect(device.registeredServerId!)}>
                  Open
                </Button>
              ) : (
                <Button variant="outline" size="xs" onClick={() => onRegister(device.id)}>
                  Register
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---- servers/_components/storage-card.tsx

const tb = (value: number) => `${value.toFixed(2)} TB`
// Where the disk space goes, as one stacked bar. Colors are steps of the chart ramp, light to dark.
const PARTS = [
  { key: "recordings", label: "Recordings", color: "bg-chart-3" },
  { key: "analytics", label: "Analytics", color: "bg-chart-2" },
  { key: "system", label: "System", color: "bg-chart-1" },
  { key: "free", label: "Free", color: "bg-muted" },
] as const
export const StorageCard = ({ storage, empty }: { storage: Metrics["storage"]; empty?: string }) => {
  const { used, total, percent } = storageTotals(storage)

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-xs text-muted-foreground">Last 60 min</span>
          </div>
          {!empty && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-semibold tabular-nums">{percent}%</span>
              <LevelBadge level={percentLevel(percent)} />
            </div>
          )}
        </div>

        {empty ? (
          <p className="flex min-h-40 flex-1 items-center justify-center border border-dashed text-xs text-muted-foreground">{empty}</p>
        ) : (
          <>
            {/* A 2px gap of card color separates the segments. */}
            <div className="flex min-h-24 flex-1 gap-0.5" role="img" aria-label={`${percent}% of the disk is used`}>
              {PARTS.map((part) => (
                <div
                  key={part.key}
                  className={cn("h-full", part.color)}
                  style={{ width: `${(storage[part.key] / total) * 100}%` }}
                  title={`${part.label}: ${tb(storage[part.key])}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {PARTS.map((part) => (
                <div key={part.key} className="flex items-center gap-2">
                  <span className={cn("size-2 shrink-0", part.color)} />
                  <span className="flex-1 text-muted-foreground">{part.label}</span>
                  <span className="tabular-nums text-muted-foreground">{tb(storage[part.key])}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {!empty && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <Stats items={[["Used", tb(used)], ["Free", tb(storage.free)], ["Retention", `${storage.retentionDays} days`]]} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---- servers/_components/server-detail.tsx

const last = (points: number[]) => points[points.length - 1]
// The header (name, chips, actions) and the four resource cards of the selected server.
export const ServerDetail = ({
  server,
  groups,
  online,
  restarting,
  metrics,
  onLogs,
  onEdit,
  onRestart,
  onDelete,
}: {
  server: ServerRecord
  groups: ServerGroup[]
  online: boolean
  restarting: boolean
  // null until the server has reported once.
  metrics: Metrics | null
  onLogs: () => void
  onEdit: () => void
  onRestart: () => void
  onDelete: () => void
}) => {
  const [confirm, setConfirm] = React.useState<"restart" | "delete" | null>(null)
  const group = groups.find((g) => g.id === server.groupId)?.name
  const empty = !online ? "No data. The server is offline." : !metrics ? "Waiting for the first report." : undefined

  const temp = metrics ? last(metrics.cpuTemp) : 0
  const memory = metrics ? last(metrics.memory) : 0
  const cpu = metrics ? last(metrics.cpu) : 0
  const memoryUsed = metrics ? (memory / 100) * metrics.memoryTotalGb : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h2 className="text-base font-medium">{server.name}</h2>
            <span className="text-xs text-muted-foreground">
              {server.description ? `${server.description} · ` : ""}
              {server.cameraCount} {server.cameraCount === 1 ? "camera" : "cameras"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <StatusDot shape="square" status={online ? "live" : "offline"} />
              {restarting ? "Restarting" : online ? "Online" : "Offline"}
            </Badge>
            <Badge variant="outline">{server.vendor}</Badge>
            {group && (
              <Badge variant="secondary">
                <TagIcon />
                {group}
              </Badge>
            )}
            {server.hostAddress && (
              <Badge variant="outline" className="font-mono">
                {server.hostAddress}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onLogs}>
            <TerminalIcon />
            Log Stream
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <PencilIcon />
            Edit Server
          </Button>
          <Button variant="outline" disabled={restarting} onClick={() => setConfirm("restart")}>
            <RotateCwIcon className={cn(restarting && "animate-spin")} />
            Restart Server
          </Button>
          <Button variant="destructive" onClick={() => setConfirm("delete")}>
            <Trash2Icon />
            Delete Server
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:flex-1 lg:grid-cols-2 lg:auto-rows-fr">
        <MetricChart
          title="CPU Temperature"
          value={`${temp} °C`}
          level={tempLevel(temp)}
          points={metrics?.cpuTemp ?? []}
          domain={[40, 90]}
          ticks={[40, 65, 90]}
          unit="°C"
          limit={TEMP_LIMIT}
          empty={empty}
          footer={`Dashed line: limit ${TEMP_LIMIT} °C`}
        />
        <MetricChart
          title="Memory Usage"
          value={`${Math.round(memory)}%`}
          level={percentLevel(memory)}
          points={metrics?.memory ?? []}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          unit="%"
          empty={empty}
          footer={
            metrics && (
              <Stats
                items={[
                  ["Used", `${memoryUsed.toFixed(1)} GB`],
                  ["Available", `${(metrics.memoryTotalGb - memoryUsed).toFixed(1)} GB`],
                  ["Total", `${metrics.memoryTotalGb} GB`],
                ]}
              />
            )
          }
        />
        <MetricChart
          title="CPU Usage"
          value={`${Math.round(cpu)}%`}
          level={percentLevel(cpu)}
          points={metrics?.cpu ?? []}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          unit="%"
          empty={empty}
          footer={null}
        />
        <StorageCard
          storage={metrics?.storage ?? { recordings: 0, analytics: 0, system: 0, free: 0, retentionDays: 0 }}
          empty={empty}
        />
      </div>

      <AlertDialog open={confirm === "restart"} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart {server.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its {server.cameraCount} cameras stop streaming and analyzing until the server is back, which takes about a minute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirm(null)
                onRestart()
              }}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirm === "delete"} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {server.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete(server)
                ? "The server is removed from the system. This cannot be undone."
                : `It still has ${server.cameraCount} cameras. Move or delete them first; a server with cameras cannot be deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!canDelete(server)}
              onClick={() => {
                setConfirm(null)
                onDelete()
              }}
            >
              Delete server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---- servers/_components/servers-view.tsx

const RESTART_MS = 4000
const SCAN_MS = 1500
export const ServersView = ({ data }: { data: ServersData }) => {
  // Edits live in the browser for now; they will be saved to the backend once there is one.
  const [servers, setServers] = React.useState(data.servers)
  const [discovered, setDiscovered] = React.useState(data.discovered)
  const [selectedId, setSelectedId] = React.useState<string | null>(data.servers[0]?.id ?? null)
  const [tab, setTab] = React.useState<DiscoverTab>("discovered")
  const [scanning, setScanning] = React.useState(false)
  const [scanCount, setScanCount] = React.useState(0)
  const [restartingId, setRestartingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormTarget>(null)
  const [logsOpen, setLogsOpen] = React.useState(false)

  const online = React.useMemo(() => new Set(servers.filter((s) => isOnline(s, data.now)).map((s) => s.id)), [servers, data.now])
  const selected = servers.find((s) => s.id === selectedId) ?? null

  React.useEffect(() => {
    if (!restartingId) return
    const timer = setTimeout(() => setRestartingId(null), RESTART_MS)
    return () => clearTimeout(timer)
  }, [restartingId])

  React.useEffect(() => {
    if (!scanning) return
    // A scan turns up one more device each time, until the sample pool is used up.
    const timer = setTimeout(() => {
      const next = SCAN_POOL[scanCount]
      if (next) {
        setDiscovered((all) => (all.some((d) => d.id === next.id) ? all : [...all, { ...next, registeredServerId: null }]))
        setScanCount((count) => count + 1)
      }
      setScanning(false)
      setTab("discovered")
    }, SCAN_MS)
    return () => clearTimeout(timer)
  }, [scanning, scanCount])

  const save = (draft: Draft, id: string | null) => {
    const next = saveServer(servers, draft, id)
    setServers(next)
    if (id === null) setSelectedId(next[next.length - 1].id)
    setForm(null)
  }

  return (
    <PageShell>
      <SidePanel>
        <ServerListPanel
          servers={servers}
          online={online}
          selectedId={selectedId}
          discovered={discovered}
          tab={tab}
          scanning={scanning}
          onSelect={setSelectedId}
          onAdd={() => setForm("new")}
          onTab={setTab}
          onScan={() => setScanning(true)}
          onRegister={(deviceId) => {
            const result = registerDiscovered(servers, discovered, deviceId, data.now)
            if (!result.serverId) return
            setServers(result.servers)
            setDiscovered(result.discovered)
            setSelectedId(result.serverId)
            setTab("registered")
          }}
        />
      </SidePanel>

      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0 lg:overflow-y-auto">
        {selected ? (
          <ServerDetail
            key={selected.id}
            server={selected}
            groups={data.groups}
            online={online.has(selected.id)}
            restarting={restartingId === selected.id}
            metrics={data.metrics[selected.id] ?? null}
            onLogs={() => setLogsOpen(true)}
            onEdit={() => setForm(selected)}
            onRestart={() => setRestartingId(selected.id)}
            onDelete={() => {
              const rest = removeServer(servers, selected.id)
              setServers(rest)
              setSelectedId(rest[0]?.id ?? null)
            }}
          />
        ) : (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            {servers.length === 0 ? "No servers yet. Add one, or register a discovered device." : "Choose a server."}
          </p>
        )}
      </div>

      <ServerFormSheet target={form} servers={servers} groups={data.groups} onSave={save} onClose={() => setForm(null)} />
      <LogSheet
        server={logsOpen && selected ? { id: selected.id, name: selected.name } : null}
        online={selected ? online.has(selected.id) : false}
        startedAt={data.now}
        onClose={() => setLogsOpen(false)}
      />
    </PageShell>
  )
}
