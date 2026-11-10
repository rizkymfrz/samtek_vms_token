"use client"
import { ArrowDownRightIcon, ArrowUpRightIcon, BellRingIcon, FlameIcon, HardHatIcon, type LucideIcon, ScanFaceIcon, ScanLineIcon, TriangleAlertIcon, UserCheckIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { RiskBadge } from "../_components/risk-badge"
import { StatusDot } from "../_components/status-dot"
import type { BarItem, Dashboard } from "./page"

// ---- dashboard/_components/format.ts

export const duration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

// ---- dashboard/_components/risk-config.ts

// Alarms are medium or high risk; high gets the alert color.
export const riskConfig = {
  medium: { label: "Medium", color: "var(--chart-3)" },
  high: { label: "High", color: "var(--destructive)" },
} satisfies ChartConfig

// ---- dashboard/_components/layout.ts

export const GRID_COLUMNS = 12
type Sized = { span: number }
// Split an ordered list of widgets into rows of at most 12 columns, choosing the
// break points that leave the least empty space overall (so five equal tiles become
// 3 + 2, not 4 + 1), then hand the leftover columns of each row to its widgets so
// every row ends flush with the right edge.
export const packRows = <T extends Sized>(items: T[]): (T & { cols: number })[][] => {
  const count = items.length
  if (count === 0) return []

  // best[i] = lowest cost of laying out the first i items.
  const best = Array<number>(count + 1).fill(Infinity)
  const from = Array<number>(count + 1).fill(0)
  best[0] = 0
  for (let end = 1; end <= count; end++) {
    let used = 0
    for (let start = end - 1; start >= 0; start--) {
      used += items[start].span
      if (used > GRID_COLUMNS) break
      // Squared leftover punishes one very short row; +1 prefers fewer rows on ties.
      const cost = best[start] + (GRID_COLUMNS - used) ** 2 + 1
      if (cost < best[end]) {
        best[end] = cost
        from[end] = start
      }
    }
  }

  const rows: T[][] = []
  for (let end = count; end > 0; end = from[end]) rows.unshift(items.slice(from[end], end))

  return rows.map((row) => {
    const cols = row.map((item) => item.span)
    let leftover = GRID_COLUMNS - cols.reduce((sum, span) => sum + span, 0)
    for (let index = 0; leftover > 0; index = (index + 1) % cols.length, leftover--) cols[index] += 1
    return row.map((item, index) => ({ ...item, cols: cols[index] }))
  })
}
// Written out in full so Tailwind can see every class.
const XL_SPAN: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
}
export const spanClass = (cols: number) => {
  return `${cols >= 5 ? "md:col-span-2 " : ""}${XL_SPAN[cols]}`
}

// ---- dashboard/_components/panel.tsx

// A dashboard widget: titled card whose body fills the tile.
export const Panel = ({
  title,
  description,
  className,
  children,
}: {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

// ---- dashboard/_components/no-data.tsx

export const NoData = ({ children = "No detections in the last 24 hours." }: { children?: React.ReactNode }) => {
  return <p className="py-8 text-center text-xs text-muted-foreground">{children}</p>
}

// ---- dashboard/_components/sparkline.tsx

const sparklineConfig = { value: { label: "Count", color: "var(--chart-2)" } } satisfies ChartConfig
export const Sparkline = ({ data }: { data: number[] }) => {
  return (
    <ChartContainer config={sparklineConfig} className="aspect-auto h-16 w-full">
      <AreaChart data={data.map((value) => ({ value }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="var(--color-value)"
          fillOpacity={0.1}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/kpi-card.tsx

export const KpiCard = ({
  label,
  value,
  icon: Icon,
  change,
  spark,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  // Percent change vs the previous 24 hours.
  change: number
  // Hourly values for the trend line.
  spark: number[]
}) => {
  const ChangeIcon = change < 0 ? ArrowDownRightIcon : ArrowUpRightIcon

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs">{label}</span>
          <Icon className="size-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{value}</span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <ChangeIcon className="size-3.5" />
            <span className="tabular-nums">{Math.abs(change)}%</span>
          </span>
        </div>
        <div className="mt-auto">
          <Sparkline data={spark} />
        </div>
      </CardContent>
    </Card>
  )
}

// ---- dashboard/_components/bar-list.tsx

// Horizontal bars for a single measure: label, bar, value at the tip.
export const BarList = ({
  items,
  format = String,
}: {
  items: BarItem[]
  format?: (value: number) => string
}) => {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span>{item.label}</span>
            <span className="font-medium tabular-nums">{format(item.value)}</span>
          </div>
          <div className="h-2 bg-muted">
            <div className="h-full bg-chart-2" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ---- dashboard/_components/heatmap.tsx

// Sequential scale: more alarms, more of the chart color mixed into the empty-cell color.
const tint = (count: number, max: number) =>
  `color-mix(in oklch, var(--chart-2) ${Math.round((count / max) * 100)}%, var(--muted))`
export const Heatmap = ({
  rows,
  hours,
}: {
  rows: Dashboard["heatmap"]
  hours: string[]
}) => {
  const max = Math.max(...rows.flatMap((row) => row.hours), 1)

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.device} className="grid grid-cols-[6rem_1fr] items-center gap-2">
          <span className="truncate text-xs text-muted-foreground">{row.device}</span>
          <div className="grid grid-cols-24 gap-0.5">
            {row.hours.map((count, index) => (
              <span
                key={index}
                className="h-4"
                style={{ backgroundColor: tint(count, max) }}
                title={`${row.device} · ${hours[index]} · ${count} ${count === 1 ? "alarm" : "alarms"}`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
        <span />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{hours[0]}</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map((step) => (
                <span key={step} className="size-2" style={{ backgroundColor: tint(step * max, max) }} />
              ))}
            </div>
            <span>More</span>
          </div>
          <span>{hours[hours.length - 1]}</span>
        </div>
      </div>
    </div>
  )
}

// ---- dashboard/_components/crowd-bullets.tsx

// Bullet bars: highest headcount seen at an alarm vs the configured limit (tick).
export const CrowdBullets = ({ areas }: { areas: Dashboard["crowd"]["areas"] }) => {
  return (
    <ul className="flex flex-col gap-4">
      {areas.map((area) => {
        const scale = Math.max(area.peak, area.max) * 1.1
        return (
          <li key={area.area} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span>{area.area}</span>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{area.peak}</span> / {area.max} people ·{" "}
                {area.alarms} {area.alarms === 1 ? "alarm" : "alarms"}
              </span>
            </div>
            <div className="relative h-2 bg-muted">
              <div className="h-full bg-chart-2" style={{ width: `${(area.peak / scale) * 100}%` }} />
              <span
                className="absolute inset-y-0 w-0.5 bg-foreground"
                style={{ left: `${(area.max / scale) * 100}%` }}
                title={`Limit: ${area.max}`}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ---- dashboard/_components/fire-status.tsx

// Fire is a circle, smoke a diamond, so the two never depend on color alone.
const MARKS = {
  fire: { label: "Fire", shape: "round", status: "danger" },
  smoke: { label: "Smoke", shape: "diamond", status: "caution" },
} as const
const Mark = ({ kind, className }: { kind: keyof typeof MARKS; className?: string }) => {
  return <StatusDot shape={MARKS[kind].shape} status={MARKS[kind].status} className={className} />
}
// The last 24 hours as a strip, with a marker at every alarm.
export const FireStatus = ({ fire }: { fire: Dashboard["fire"] }) => {
  const alarm = fire.total > 0

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FlameIcon className="size-4" />
            <span className="text-xs">Fire & smoke</span>
          </div>
          <span className={cn("text-xs font-medium", alarm ? "text-destructive" : "text-muted-foreground")}>
            {alarm ? `${fire.total} ${fire.total === 1 ? "alarm" : "alarms"}` : "All clear"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative h-4">
            <div className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-muted" />
            {[0.25, 0.5, 0.75].map((tick) => (
              <span
                key={tick}
                className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-border"
                style={{ left: `calc(4px + (100% - 8px) * ${tick})` }}
              />
            ))}
            <div className="absolute inset-x-1 inset-y-0">
              {fire.events.map((event) => (
                <span
                  key={event.id}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1"
                  style={{ left: `${event.position * 100}%` }}
                  title={`${MARKS[event.kind].label} · ${event.device} · ${event.time}`}
                >
                  <Mark kind={event.kind} className="block ring-2 ring-card" />
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            {fire.axis.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">
            {fire.last ? `Last: ${fire.last.device} · ${fire.last.time}` : "No fire or smoke alarms in 24 hours."}
          </span>
          <div className="flex shrink-0 items-center gap-4">
            <span className="flex items-center gap-2">
              <Mark kind="fire" />
              Fire <span className="font-medium tabular-nums">{fire.fire}</span>
            </span>
            <span className="flex items-center gap-2">
              <Mark kind="smoke" />
              Smoke <span className="font-medium tabular-nums">{fire.smoke}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---- dashboard/_components/new-persons.tsx

// Meter: how many of the people seen are new vs returning.
export const NewPersons = ({ value, total }: { value: number; total: number }) => {
  const share = total === 0 ? 0 : (value / total) * 100

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">of {total} people seen</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex h-2 gap-0.5">
          <span className="bg-chart-2" style={{ width: `${share}%` }} />
          <span className="flex-1 bg-muted" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>New</span>
          <span>Returning</span>
        </div>
      </div>
    </div>
  )
}

// ---- dashboard/_components/recent-alarms.tsx

export const RecentAlarms = ({ alarms }: { alarms: Dashboard["recentAlarms"] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Alarm</TableHead>
          <TableHead>Camera</TableHead>
          <TableHead>Object</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alarms.map((alarm) => (
          <TableRow key={alarm.id}>
            <TableCell className="tabular-nums">{alarm.time}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{alarm.title}</span>
                <span className="text-muted-foreground">{alarm.detail}</span>
              </div>
            </TableCell>
            <TableCell>{alarm.device}</TableCell>
            <TableCell>{alarm.object}</TableCell>
            <TableCell>
              <RiskBadge level={alarm.risk} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{alarm.score.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ---- dashboard/_components/recent-recognitions.tsx

const Row = ({ children }: { children: React.ReactNode }) => {
  return <li className="flex items-center justify-between gap-2 border-b py-2 last:border-b-0">{children}</li>
}
export const RecentFaces = ({ faces }: { faces: Dashboard["recentFaces"] }) => {
  return (
    <ul>
      {faces.map((face) => (
        <Row key={face.id}>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{face.name}</span>
            <span className="truncate text-muted-foreground">
              {face.device} · {face.time}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={face.group === "Unknown" ? "destructive" : "outline"}>{face.group}</Badge>
            <span className="w-8 text-right text-xs tabular-nums">{Math.round(face.similarity * 100)}%</span>
          </div>
        </Row>
      ))}
    </ul>
  )
}
export const RecentPlates = ({ plates }: { plates: Dashboard["recentPlates"] }) => {
  return (
    <ul>
      {plates.map((plate) => (
        <Row key={plate.id}>
          <div className="flex min-w-0 flex-col">
            <span className="font-medium tabular-nums">{plate.plate}</span>
            <span className="truncate text-muted-foreground">
              {plate.vehicle} · {plate.device}
            </span>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{plate.time}</span>
        </Row>
      ))}
    </ul>
  )
}

// ---- dashboard/_components/access-trend.tsx

const accessConfig = {
  outside: { label: "Outside whitelist", color: "var(--chart-3)" },
  stranger: { label: "Stranger", color: "var(--destructive)" },
} satisfies ChartConfig
export const AccessTrend = ({ data }: { data: Dashboard["access"]["timeline"] }) => {
  return (
    <ChartContainer config={accessConfig} className="aspect-auto h-44 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={5} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={24} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["outside", "stranger"] as const).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="access"
            fill={`var(--color-${key})`}
            // A surface-colored stroke gives the 2px gap between segments.
            stroke="var(--card)"
            strokeWidth={2}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/alarms-timeline.tsx

export const AlarmsTimeline = ({ data }: { data: Dashboard["timeline"] }) => {
  return (
    <ChartContainer config={riskConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={2} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["medium", "high"] as const).map((level) => (
          <Area
            key={level}
            dataKey={level}
            type="monotone"
            stackId="alarms"
            stroke={`var(--color-${level})`}
            strokeWidth={2}
            fill={`var(--color-${level})`}
            fillOpacity={0.35}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/counting-trend.tsx

// Two directions at most (e.g. Entry / Exit): a light and a dark step of the chart ramp.
const COLORS = ["var(--chart-1)", "var(--chart-4)"]
export const CountingTrend = ({ series, data }: Pick<Dashboard["counting"], "series" | "data">) => {
  const config: ChartConfig = Object.fromEntries(
    series.map((label, index) => [`s${index}`, { label, color: COLORS[index] }])
  )

  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={3} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((_, index) => (
          <Line
            key={index}
            dataKey={`s${index}`}
            type="monotone"
            stroke={`var(--color-s${index})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/donut-chart.tsx

// Where the ring sits vertically; the center label is placed at the same height.
const CENTER_Y = "45%"
// Part-to-whole for a handful of slices; the total sits in the middle.
export const DonutChart = ({
  config,
  data,
  unit,
  className,
}: {
  config: ChartConfig
  data: { key: string; count: number }[]
  unit: string
  className?: string
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const slices = data.map((item) => ({ ...item, fill: `var(--color-${item.key})` }))

  return (
    // Fixed height on the wrapper so the centre label stays on the donut even
    // when a grid stretches the wrapper's cell.
    <div className={cn("relative h-60 w-full", className)}>
      <ChartContainer config={config} className="aspect-auto size-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
          <Pie
            data={slices}
            dataKey="count"
            nameKey="key"
            innerRadius={56}
            outerRadius={80}
            // A surface-colored stroke gives the 2px gap between slices.
            stroke="var(--card)"
            strokeWidth={2}
            cy={CENTER_Y}
          />
          <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 flex-col items-center"
        style={{ top: CENTER_Y }}>
        <span className="text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

// ---- dashboard/_components/dust-trend.tsx

const dustConfig = { level: { label: "Dust level", color: "var(--chart-2)" } } satisfies ChartConfig
// Edge marks a dust alarm "high" from this level up.
const HIGH_RISK = 0.66
export const DustTrend = ({ data }: { data: Dashboard["dust"]["timeline"] }) => {
  return (
    <ChartContainer config={dustConfig} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={3} tickMargin={8} />
        <YAxis domain={[0, 1]} tickLine={false} axisLine={false} width={32} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `${Math.round(Number(value) * 100)}%`} />}
        />
        <ReferenceLine
          y={HIGH_RISK}
          stroke="var(--destructive)"
          strokeDasharray="4 4"
          label={{ value: "High risk", position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Line
          dataKey="level"
          type="monotone"
          stroke="var(--color-level)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-level)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/emotion-radar.tsx

const emotionConfig = { value: { label: "Faces", color: "var(--chart-2)" } } satisfies ChartConfig
export const EmotionRadar = ({ items }: { items: BarItem[] }) => {
  return (
    <ChartContainer config={emotionConfig} className="aspect-auto h-60 w-full">
      <RadarChart data={items.map((item) => ({ emotion: item.label, value: item.value }))}>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <PolarGrid />
        <PolarAngleAxis dataKey="emotion" />
        <Radar
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="var(--color-value)"
          fillOpacity={0.1}
          dot={{ r: 4, fill: "var(--color-value)", stroke: "var(--card)", strokeWidth: 2 }}
        />
      </RadarChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/ppe-trend.tsx

const ppeConfig = { violations: { label: "Violations", color: "var(--chart-2)" } } satisfies ChartConfig
export const PpeTrend = ({ data }: { data: Dashboard["ppe"]["timeline"] }) => {
  return (
    <ChartContainer config={ppeConfig} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={3} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="violations"
          type="monotone"
          stroke="var(--color-violations)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

// ---- dashboard/_components/risk-donut.tsx

export const RiskDonut = ({ data }: { data: Dashboard["riskTotals"] }) => {
  return (
    <DonutChart
      config={riskConfig}
      data={data.map((item) => ({ key: item.level, count: item.count }))}
      unit="alarms"
    />
  )
}

// ---- dashboard/_components/vehicle-donut.tsx

// Three steps of the chart ramp; "unknown" is a plate read without a vehicle detection.
const vehicleConfig = {
  car: { label: "Car", color: "var(--chart-1)" },
  motorbike: { label: "Motorbike", color: "var(--chart-3)" },
  unknown: { label: "Unknown", color: "var(--chart-5)" },
} satisfies ChartConfig
export const VehicleDonut = ({ types }: { types: Dashboard["vehicles"]["types"] }) => {
  return <DonutChart config={vehicleConfig} data={types} unit="reads" className="h-52" />
}

// ---- dashboard/_components/widgets.tsx

// One entry per widget. A widget says what it needs and how wide it wants to be (out of
// 12 columns); where it lands is decided by the layout, never by the widget.
//   section  - titled block, shown in SECTIONS order
//   group    - widgets that belong in the same row(s); packed on their own
//   span     - preferred width; the packer may widen it to fill the row
//   when     - false hides the widget (analytic not running)
export type Widget = {
  id: string
  section: (typeof SECTIONS)[number]
  group: string
  span: number
  when: (data: Dashboard) => boolean
  render: (data: Dashboard) => ReactNode
}
export const SECTIONS = ["Overview", "Safety", "Security", "Operations", "Vehicles"] as const
const Stats = ({ items }: { items: [value: number, label: string][] }) => {
  return (
    <div className="flex gap-8">
      {items.map(([value, label]) => (
        <div key={label} className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
const always = () => true
export const WIDGETS: Widget[] = [
  // ---- Overview: headline numbers, then the shared alarm views
  {
    id: "kpi-alarms", section: "Overview", group: "kpi", span: 3, when: always,
    render: (d) => (
      <KpiCard label="Alarms (24h)" value={d.kpis.alarms.value} change={d.kpis.alarms.change} icon={BellRingIcon}
        spark={d.timeline.map((b) => b.medium + b.high)} />
    ),
  },
  {
    id: "kpi-high", section: "Overview", group: "kpi", span: 3, when: always,
    render: (d) => (
      <KpiCard label="High risk" value={d.kpis.severe.value} change={d.kpis.severe.change} icon={TriangleAlertIcon}
        spark={d.timeline.map((b) => b.high)} />
    ),
  },
  {
    id: "kpi-counting", section: "Overview", group: "kpi", span: 3, when: (d) => d.modules.counting,
    render: (d) => (
      <KpiCard label="Objects counted (24h)" value={d.counting.total} change={d.counting.change} icon={ScanLineIcon}
        spark={d.counting.hourly} />
    ),
  },
  {
    id: "kpi-ppe", section: "Overview", group: "kpi", span: 3, when: (d) => d.modules.ppe,
    render: (d) => (
      <KpiCard label="PPE violations (24h)" value={d.ppe.total} change={d.ppe.change} icon={HardHatIcon}
        spark={d.ppe.timeline.map((b) => b.violations)} />
    ),
  },
  {
    id: "kpi-visitors", section: "Overview", group: "kpi", span: 3, when: (d) => d.modules.visitors,
    render: (d) => (
      <KpiCard label="New visitors (24h)" value={d.visitors.value} change={d.visitors.change} icon={UserCheckIcon}
        spark={d.visitors.hourly} />
    ),
  },
  {
    id: "kpi-recognitions", section: "Overview", group: "kpi", span: 3, when: (d) => d.hasRecognition,
    render: (d) => (
      <KpiCard label="Recognitions (24h)" value={d.kpis.recognitions.value} change={d.kpis.recognitions.change}
        icon={ScanFaceIcon} spark={d.recognitionsTimeline} />
    ),
  },
  {
    id: "new-persons", section: "Overview", group: "kpi", span: 3, when: (d) => d.modules.reid,
    render: (d) => (
      <Panel title="New persons">
        <NewPersons value={d.kpis.newPersons.value} total={d.kpis.newPersons.total} />
      </Panel>
    ),
  },
  {
    id: "alarms-timeline", section: "Overview", group: "main", span: 8, when: always,
    render: (d) => (
      <Panel title="Alarms per hour" description="Last 24 hours, by risk level">
        <AlarmsTimeline data={d.timeline} />
      </Panel>
    ),
  },
  {
    id: "risk", section: "Overview", group: "main", span: 4, when: always,
    render: (d) => (
      <Panel title="Risk levels" description="Share of alarms, last 24 hours">
        {d.kpis.alarms.value ? <RiskDonut data={d.riskTotals} /> : <NoData>No alarms.</NoData>}
      </Panel>
    ),
  },
  {
    id: "heatmap", section: "Overview", group: "breakdown", span: 6, when: always,
    render: (d) => (
      <Panel title="Activity by camera" description="Alarms per hour">
        {d.heatmap.length ? <Heatmap rows={d.heatmap} hours={d.timeline.map((b) => b.label)} /> : <NoData>No cameras raising alarms.</NoData>}
      </Panel>
    ),
  },
  {
    id: "alarms-by-type", section: "Overview", group: "breakdown", span: 3, when: always,
    render: (d) => (
      <Panel title="Alarms by type">
        {d.alarmsByKind.length ? <BarList items={d.alarmsByKind} /> : <NoData>No alarms.</NoData>}
      </Panel>
    ),
  },
  {
    id: "recognitions-by-type", section: "Overview", group: "breakdown", span: 3, when: (d) => d.hasRecognition,
    render: (d) => (
      <Panel title="Recognitions" description="By analytic">
        {d.recognitionsByType.length ? <BarList items={d.recognitionsByType} /> : <NoData />}
      </Panel>
    ),
  },
  {
    id: "recent-alarms", section: "Overview", group: "recent", span: 12, when: always,
    render: (d) => (
      <Panel title="Recent alarms">
        {d.recentAlarms.length ? <RecentAlarms alarms={d.recentAlarms} /> : <NoData>No alarms.</NoData>}
      </Panel>
    ),
  },

  // ---- Safety
  {
    id: "ppe-trend", section: "Safety", group: "ppe", span: 7, when: (d) => d.modules.ppe,
    render: (d) => (
      <Panel title="PPE violations per hour" description="Last 24 hours">
        <PpeTrend data={d.ppe.timeline} />
      </Panel>
    ),
  },
  {
    id: "ppe-items", section: "Safety", group: "ppe", span: 5, when: (d) => d.modules.ppe,
    render: (d) => (
      <Panel title="Missing PPE" description="By item, last 24 hours">
        {d.ppe.byItem.length ? <BarList items={d.ppe.byItem} /> : <NoData>No violations.</NoData>}
      </Panel>
    ),
  },
  {
    id: "fire", section: "Safety", group: "hazards", span: 4, when: (d) => d.modules.fire,
    render: (d) => <FireStatus fire={d.fire} />,
  },
  {
    id: "crowd", section: "Safety", group: "hazards", span: 4, when: (d) => d.modules.crowd,
    render: (d) => (
      <Panel title="Crowd density" description="Peak headcount at alarm vs limit">
        {d.crowd.areas.length ? <CrowdBullets areas={d.crowd.areas} /> : <NoData>No crowd alarms.</NoData>}
      </Panel>
    ),
  },
  {
    id: "dust", section: "Safety", group: "hazards", span: 4, when: (d) => d.modules.dust,
    render: (d) => (
      <Panel title="Dust level" description="Highest level per hour, while above the alarm threshold">
        {d.dust.total ? <DustTrend data={d.dust.timeline} /> : <NoData>No dust alarms.</NoData>}
      </Panel>
    ),
  },

  // ---- Security
  {
    id: "access", section: "Security", group: "people", span: 4, when: (d) => d.modules.access,
    render: (d) => (
      <Panel title="Access security" description="Face alarms per hour, last 24 hours">
        <div className="flex flex-col gap-4">
          <Stats items={[[d.access.stranger, "Strangers"], [d.access.outside, "Outside whitelist"]]} />
          {d.access.stranger + d.access.outside ? (
            <>
              <AccessTrend data={d.access.timeline} />
              <BarList items={d.access.byCamera} />
            </>
          ) : (
            <NoData>No access alarms.</NoData>
          )}
        </div>
      </Panel>
    ),
  },
  {
    id: "faces", section: "Security", group: "people", span: 4, when: (d) => d.modules.faceRecognition,
    render: (d) => (
      <Panel title="Recognized faces">
        {d.recentFaces.length ? <RecentFaces faces={d.recentFaces} /> : <NoData />}
      </Panel>
    ),
  },
  {
    id: "reid", section: "Security", group: "people", span: 4, when: (d) => d.modules.reid,
    render: (d) => (
      <Panel title="Person re-identification" description="Sightings, last 24 hours">
        <div className="flex flex-col gap-4">
          <Stats items={[[d.reid.sightings, "Sightings"], [d.reid.people, "Different people"]]} />
          {d.reid.byCamera.length ? <BarList items={d.reid.byCamera} /> : <NoData />}
        </div>
      </Panel>
    ),
  },
  {
    id: "face-attributes", section: "Security", group: "faces", span: 8, when: (d) => d.modules.faceAttribute,
    render: (d) => {
      // Emotion has its own radar widget.
      const attributes = Object.entries(d.attributes).filter(([name]) => name !== "Emotion")
      return (
        <Panel title="Face attributes" description="Detected faces, last 24 hours">
          <div className="grid gap-8 sm:grid-cols-2">
            {attributes.map(([name, items]) => (
              <div key={name} className="flex flex-col gap-4">
                <span className="text-xs font-medium text-muted-foreground">{name}</span>
                {items.length ? <BarList items={items} /> : <NoData />}
              </div>
            ))}
          </div>
        </Panel>
      )
    },
  },
  {
    id: "emotions", section: "Security", group: "faces", span: 4, when: (d) => d.modules.faceAttribute,
    render: (d) => (
      <Panel title="Emotions" description="Detected faces, last 24 hours">
        {d.attributes.Emotion.length ? <EmotionRadar items={d.attributes.Emotion} /> : <NoData />}
      </Panel>
    ),
  },

  // ---- Operations
  {
    id: "counting-trend", section: "Operations", group: "counting", span: 7, when: (d) => d.modules.counting,
    render: (d) => (
      <Panel title="Counting per hour" description="Objects crossing counting lines">
        {d.counting.series.length ? <CountingTrend series={d.counting.series} data={d.counting.data} /> : <NoData />}
      </Panel>
    ),
  },
  {
    id: "avg-stay", section: "Operations", group: "counting", span: 5, when: (d) => d.modules.counting,
    render: (d) => (
      <Panel title="Average stay" description="Seconds per object, by area">
        {d.counting.avgStay.length ? (
          <BarList items={d.counting.avgStay} format={(seconds) => `${seconds}s`} />
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "worker-absence", section: "Operations", group: "workforce", span: 6, when: (d) => d.modules.worker,
    render: (d) => (
      <Panel title="Worker absence" description="Time away from the area, last 24 hours">
        {d.absence.areas.length ? (
          <BarList
            items={d.absence.areas.map((a) => ({
              label: `${a.area} · ${a.events} ${a.events === 1 ? "absence" : "absences"}`,
              value: a.seconds,
            }))}
            format={duration}
          />
        ) : (
          <NoData>No absences.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "behavior", section: "Operations", group: "workforce", span: 6, when: (d) => d.modules.behavior,
    render: (d) => (
      <Panel title="Workplace behavior" description="Phone and sleep alarms, last 24 hours">
        <div className="flex flex-col gap-4">
          <Stats items={[[d.behavior.phone, "Phone calls"], [d.behavior.sleep, "Asleep on duty"]]} />
          {d.behavior.byCamera.length ? <BarList items={d.behavior.byCamera} /> : <NoData>No alarms.</NoData>}
        </div>
      </Panel>
    ),
  },

  // ---- Vehicles
  {
    id: "vehicles", section: "Vehicles", group: "plates", span: 8, when: (d) => d.modules.licensePlate,
    render: (d) => (
      <Panel title="Vehicles" description="Plate reads, last 24 hours">
        {d.vehicles.total ? (
          <div className="grid gap-8 sm:grid-cols-3">
            <VehicleDonut types={d.vehicles.types} />
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium text-muted-foreground">Color</span>
              <BarList items={d.vehicles.colors} />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium text-muted-foreground">Most seen plates</span>
              <BarList items={d.vehicles.topPlates} />
            </div>
          </div>
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "plates", section: "Vehicles", group: "plates", span: 4, when: (d) => d.modules.licensePlate,
    render: (d) => (
      <Panel title="License plates">
        {d.recentPlates.length ? <RecentPlates plates={d.recentPlates} /> : <NoData />}
      </Panel>
    ),
  },
]

// ---- dashboard/_components/dashboard-content.tsx (the rendering half)

export const DashboardView = ({ data }: { data: Dashboard }) => {
  const visible = WIDGETS.filter((widget) => widget.when(data))

  return (
    <div className="flex flex-col gap-8 p-4">
      {SECTIONS.map((section) => {
        const inSection = visible.filter((widget) => widget.section === section)
        if (inSection.length === 0) return null

        // Each group is packed on its own, in the order the registry lists them.
        const groups = [...new Set(inSection.map((widget) => widget.group))]
        const rows = groups.flatMap((group) => packRows(inSection.filter((widget) => widget.group === group)))

        return (
          <section key={section} className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">{section}</h2>
            {rows.map((row) => (
              // Cells stretch to the row's height, so the tops and bottoms line up.
              <div key={row.map((widget) => widget.id).join()} className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
                {row.map((widget) => (
                  <div key={widget.id} className={`flex min-w-0 flex-col ${spanClass(widget.cols)}`}>
                    {widget.render(data)}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
