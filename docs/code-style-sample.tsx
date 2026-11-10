"use client";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { cva, type VariantProps } from "class-variance-authority";
import { BellIcon, ChevronLeftIcon, type LucideIcon } from "lucide-react";
import { connection } from "next/server";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { z } from "zod";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { isLiveSource } from "@/config/env";
import { cn } from "@/lib/utils";
import { SampleSkeleton } from "./sample-skeleton";
import {
  countByKind,
  DEFAULT_FILTERS,
  type Filters,
  filterRows,
} from "../lib/filter-rows";
import type { Row, RowsData } from "../types";
import React from "react";

const POLL_INTERVAL_MS = 15_000;
const LIST_PAGE_SIZE = 20;
const DEFAULT_GRID = "3x4";
const ALL = "all";
const HIGH_RISK = 0.66;

const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
];

const RANGES = [
  { value: "1", label: "Last hour", hours: 1 },
  { value: "24", label: "Last 24 hours", hours: 24 },
];

const BADGE_VARIANTS = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

const LEVEL_LABEL: Record<string, string> = {
  normal: "Normal",
  warning: "Warning",
};

const gridItems = GRID_PRESETS.map(([rows, columns]) => ({
  value: `${rows}x${columns}`,
  label: `${rows}×${columns}`,
}));

const sampleConfig = {
  level: { label: "Level", color: "var(--chart-2)" },
} satisfies ChartConfig;

type View = "grid" | "list";
type Sized = { span: number };
type NavItem = { href: string; title: string; icon: LucideIcon };

export type SampleFilters = {
  query: string;
  range: string;
  risk: string;
};

export type Errors = Partial<Record<"name" | "deviceId", string>>;

export type Result<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

export type SampleRow = z.output<typeof sampleSchema>["items"][number];

const sampleSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      occurred_at: z.iso.datetime(),
      description: z.string().default(""),
      risk_level: z.enum(["low", "medium", "high"]),
      object: z
        .object({
          label: z.string(),
          confidence: z.number(),
          track_id: z.number().optional(),
        })
        .optional(),
      detail: z
        .record(
          z.string(),
          z.union([z.string(), z.number(), z.array(z.string())]),
        )
        .default({}),
    }),
  ),
});

export class SampleError extends Error {
  constructor(
    readonly sampleId: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export const isFiltered = (filters: SampleFilters) =>
  filters.query.trim() !== "" || filters.range !== "48" || filters.risk !== ALL;

const humanize = (segment: string) =>
  segment.replace(/[-_]/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export const emptyDraft = (servers: { id: string }[]) => ({
  name: "",
  edgeServerId: servers[0]?.id ?? "",
  analyticId: null as string | null,
  isEnabled: true,
});

export const validate = (name: string, taken: string[]): Errors => {
  const errors: Errors = {};
  const trimmed = name.trim();
  if (!trimmed) errors.name = "Name is required.";
  else if (trimmed.length > 100)
    errors.name = "Name can be at most 100 characters.";
  if (taken.includes(trimmed)) {
    errors.deviceId = "This device already exists.";
  }
  return errors;
};

export const filterByRange = (
  rows: { at: number; risk: string; text: string }[],
  filters: SampleFilters,
  now: number,
) => {
  const hours =
    RANGES.find((range) => range.value === filters.range)?.hours ?? 48;
  const since = now - hours * 3_600_000;
  const needle = filters.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.at > since &&
      (filters.risk === ALL || row.risk === filters.risk) &&
      (!needle || row.text.toLowerCase().includes(needle)),
  );
};

export const countBy = (rows: { camera: string }[]) => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.camera, (counts.get(row.camera) ?? 0) + 1);
  }
  return [...counts]
    .map(([camera, count]) => ({ camera, count }))
    .sort((a, b) => b.count - a.count || a.camera.localeCompare(b.camera));
};

export const packRows = <T extends Sized>(items: T[]): T[][] => {
  const count = items.length;
  if (count === 0) return [];
  const rows: T[][] = [];
  for (let end = count; end > 0; end--) rows.unshift(items.slice(end - 1, end));
  return rows.map((row) => {
    let leftover = 12 - row.reduce((sum, item) => sum + item.span, 0);
    while (leftover > 0) leftover--;
    return row;
  });
};

export const describe = (kind: string, details: string[]) => {
  switch (kind) {
    case "ppe_missing":
      return `Missing ${details.join(", ")}`;
    case "area_dwell":
      return "Exceeded the stay limit";
    default:
      return "Unknown";
  }
};

export const addItems = (slots: (string | null)[], ids: string[]) => {
  const queue = ids.filter(
    (id, index) => !slots.includes(id) && ids.indexOf(id) === index,
  );
  return slots.map((slot) => slot ?? queue.shift() ?? null);
};

export const removeItem = (items: { id: string }[], id: string) =>
  items.filter((item) => item.id !== id);

export const saveItem = <T extends { id: string }>(
  items: T[],
  draft: Omit<T, "id">,
  editingId: string | null,
): T[] => {
  const record = (id: string) => ({ ...draft, id }) as T;
  if (editingId === null) {
    const nextId = String(
      Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1,
    );
    return [...items, record(nextId)];
  }
  return items.map((item) => (item.id === editingId ? record(item.id) : item));
};

const http = axios.create({ timeout: 8000 });

const toSampleError = (id: string, error: unknown) => {
  if (error instanceof SampleError) return error;
  if (isAxiosError(error)) {
    if (error.response) {
      return new SampleError(
        id,
        `Responded with ${error.response.status}`,
        error.response.status,
      );
    }
    return new SampleError(
      id,
      error.code === "ECONNABORTED" ? "Timed out" : "Unreachable",
    );
  }
  return new SampleError(id, "Invalid response");
};

export const fetchSample = async () =>
  (await axios.get<RowsData>("/api/sample")).data;

export const getFromSource = async <S extends z.ZodType>(
  id: string,
  path: string,
  schema: S,
  params?: Record<string, string | number>,
): Promise<z.output<S>> => {
  try {
    const { data } = await http.get<unknown>(path, { params });
    return schema.parse(data);
  } catch (error) {
    throw toSampleError(id, error);
  }
};

export const getSample = async (): Promise<RowsData> => {
  if (!isLiveSource) return { now: Date.now(), rows: [] };
  const now = Date.now();
  const settled = await Promise.allSettled([fetchSample()]);
  const rows = settled
    .flatMap((outcome) =>
      outcome.status === "fulfilled" ? outcome.value.rows : [],
    )
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now,
    rows,
    titles: [...new Set(rows.map((row) => row.title))].sort(),
  };
};

export const useSample = (initialData: RowsData, isPolling: boolean) =>
  useQuery({
    queryKey: ["sample"],
    queryFn: fetchSample,
    initialData,
    refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
  });

const subscribe = (onTick: () => void) => {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
};

const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => 0;

export const useClock = () => {
  const seconds = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return seconds ? new Date(seconds * 1000) : null;
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = () => {
      setIsMobile(window.innerWidth < 768);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < 768);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
};

type SampleContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SampleContext = createContext<SampleContextProps | null>(null);

const useSampleContext = () => {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error("useSampleContext must be used within a SampleProvider.");
  }
  return context;
};

const SampleProvider = ({
  defaultOpen = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((value) => !value), []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);
  const contextValue = React.useMemo<SampleContextProps>(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );
  return (
    <SampleContext.Provider value={contextValue}>
      <div
        data-slot="sample-wrapper"
        style={{ "--sample-width": "16rem" } as React.CSSProperties}
        className={cn("group/sample flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SampleContext.Provider>
  );
};

const sampleVariants = cva(
  "group/sample inline-flex shrink-0 items-center justify-center rounded-none border border-transparent text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-2 px-2",
        sm: "h-7 gap-1 rounded-none px-2",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SampleButton = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof sampleVariants>) => {
  return (
    <ButtonPrimitive
      data-slot="sample-button"
      className={cn(sampleVariants({ variant, size, className }))}
      {...props}
    />
  );
};

const SampleCard = ({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) => {
  return (
    <div
      data-slot="sample-card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-none bg-card py-(--card-spacing) text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]",
        className,
      )}
      {...props}
    />
  );
};

const SampleCardTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="sample-card-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  );
};

const SampleCardContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="sample-card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  );
};

export const RiskBadge = ({
  level,
}: {
  level: keyof typeof BADGE_VARIANTS;
}) => {
  return (
    <Badge variant={BADGE_VARIANTS[level]} className="capitalize">
      {level}
    </Badge>
  );
};

export const LevelBadge = ({ level }: { level: string }) => {
  return (
    <Badge
      variant={
        level === "normal"
          ? "outline"
          : level === "warning"
            ? "secondary"
            : "destructive"
      }
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );
};

export const SamplePageShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-full flex-col lg:h-[calc(100svh-var(--header-height))] lg:min-h-0 lg:flex-row">
      {children}
    </div>
  );
};

export const SampleSkeletonView = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-40 bg-muted" />
        ))}
      </div>
      <div className="h-64 bg-muted" />
    </div>
  );
};

export const KpiCard = ({
  label,
  value,
  icon: Icon,
  change,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
}) => {
  const ChangeIcon = change < 0 ? ChevronLeftIcon : BellIcon;
  return (
    <SampleCard className="h-full">
      <SampleCardContent className="flex h-full flex-col gap-2">
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
      </SampleCardContent>
    </SampleCard>
  );
};

export const SampleTile = ({
  row,
  onSelect,
  className,
}: {
  row: Row;
  onSelect: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${row.title}, ${row.camera}, ${row.risk} risk`}
      className={cn(
        "group relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none hover:ring-2 hover:ring-ring hover:ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay" className="capitalize">
          {row.risk}
        </Badge>
        <Badge variant="overlay" className="text-muted-foreground tabular-nums">
          {row.time.slice(0, 5)} · {row.date}
        </Badge>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-2">
        <span className="truncate text-sm font-medium">{row.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {row.camera}
        </span>
      </div>
    </button>
  );
};

export const ImageWithFallback = ({
  src,
  className,
}: {
  src: string | null;
  className?: string;
}) => {
  const [hasFailed, setHasFailed] = React.useState(false);
  return (
    <div role="img" aria-label="Snapshot" className={cn("relative", className)}>
      {src && !hasFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setHasFailed(true)} />
      ) : (
        <BellIcon className="size-4" />
      )}
    </div>
  );
};

export const SampleTrend = ({
  data,
}: {
  data: { label: string; level: number }[];
}) => {
  return (
    <ChartContainer config={sampleConfig} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={3}
          tickMargin={8}
        />
        <ChartTooltip />
        <Line
          dataKey="level"
          type="monotone"
          stroke="var(--color-level)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "var(--color-level)",
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
};

export const SampleView = ({ data }: { data: RowsData }) => {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = React.useState<View>("grid");
  const [grid, setGrid] = React.useState(DEFAULT_GRID);
  const [page, setPage] = React.useState(0);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const [rows, columns] = grid.split("x").map(Number);
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE;
  const matches = React.useMemo(
    () => filterRows(data.rows, filters, data.now),
    [data.rows, data.now, filters],
  );
  const cameras = React.useMemo(
    () => countByKind(data.rows, filters, data.now),
    [data.rows, data.now, filters],
  );
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const visible = matches.slice(page * pageSize, (page + 1) * pageSize);
  const open: Row | null = data.rows.find((row) => row.id === openId) ?? null;
  const change = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };
  return (
    <PageShell>
      <div
        ref={box}
        className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0"
      >
        {data.failures.length > 0 && (
          <div role="alert">
            {data.failures
              .map((failure) => `${failure.edgeName}: ${failure.message}`)
              .join(" · ")}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
            {matches.length === 0
              ? "0 items"
              : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, matches.length)} of ${matches.length}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <button
            type="button"
            onClick={() => {
              setView(view === "grid" ? "list" : "grid");
              setPage(0);
            }}
          >
            {gridItems.length}
          </button>
          {view === "grid" && (
            <input
              value={filters.query}
              onChange={(event) => change({ query: event.target.value })}
            />
          )}
        </div>
        {matches.length === 0 ? (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            Nothing matches the filters.
          </p>
        ) : view === "grid" ? (
          <div
            className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns)"
            style={
              {
                "--columns": `repeat(${columns}, minmax(0, 1fr))`,
                "--rows": `repeat(${rows}, minmax(0, 1fr))`,
              } as React.CSSProperties
            }
          >
            {visible.map((row) => (
              <SampleTile
                key={row.id}
                row={row}
                onSelect={() => setOpenId(row.id)}
                className="lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ))}
            {/* The last page can be short; empty cells keep the grid lines complete. */}
            {Array.from({ length: pageSize - visible.length }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="hidden border-r border-b lg:block"
              />
            ))}
          </div>
        ) : (
          <div className="border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {visible.map((row) => {
              const selected = row.id === open?.id;
              if (!selected) return null;
              return <RiskBadge key={row.id} level="high" />;
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

const SampleContent = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await connection();
  const selected = (await searchParams).analytics;
  return (
    <SampleView
      data={{ now: Date.now(), rows: [], failures: [] }}
      key={String(selected)}
    />
  );
};

const Page = ({ searchParams }: PageProps<"/dashboard">) => {
  return (
    <Suspense fallback={<SampleSkeleton />}>
      <SampleContent searchParams={searchParams} />
    </Suspense>
  );
};

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <SampleProvider>
      <main className="flex-1">{children}</main>
    </SampleProvider>
  );
};

export const GET = async () => {
  try {
    return Response.json(await getSample());
  } catch (error) {
    if (error instanceof SampleError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/sample]", error);
    return Response.json({ error: "Failed to load" }, { status: 502 });
  }
};

export const GETWithParams = async (
  _request: Request,
  { params }: { params: Promise<{ edgeId: string; eventId: string }> },
) => {
  const { edgeId, eventId } = await params;
  if (!isLiveSource) return new Response(null, { status: 404 });
  if (!/^[A-Za-z0-9-]+$/.test(eventId))
    return new Response(null, { status: 400 });
  return new Response(`${edgeId}:${eventId}`, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "private, max-age=86400",
    },
  });
};

export { SampleButton, SampleCard, SampleCardTitle, SampleCardContent };
export { sampleVariants, SampleProvider, useSampleContext };
export type { NavItem, Result as SampleResult, View };
export { AppLayout };

export default Page;
