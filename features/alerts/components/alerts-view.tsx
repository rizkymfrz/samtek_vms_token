"use client";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
  useMemo,
  useState,
} from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { AlertDetailDialog } from "./alert-detail-dialog";
import { AlertsTable } from "./alerts-table";
import { AlertTile } from "./alert-tile";
import { FilterPanel } from "./filter-panel";
import {
  countByCamera,
  DEFAULT_FILTERS,
  filterAlerts,
  type Filters,
} from "../lib/filter-alerts";
import type { AlertRow, AlertsData } from "../types";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
];

export const DEFAULT_GRID = "3x4";

type View = "grid" | "list";

const VIEW_ITEMS = [
  { value: "grid", label: "Grid view" },
  { value: "list", label: "List view" },
];

const LIST_PAGE_SIZE = 20;

const gridItems = GRID_PRESETS.map(([rows, columns]) => ({
  value: `${rows}x${columns}`,
  label: `${rows}×${columns}`,
}));

export const AlertsView = ({
  data,
  filters,
  onFiltersChange,
  isLoading,
}: {
  data: AlertsData;
  filters: Filters;
  onFiltersChange: Dispatch<SetStateAction<Filters>>;
  isLoading: boolean;
}) => {
  useFailureToast(
    "Some edge servers did not respond",
    data.failures.map((failure) => `${failure.edgeName}: ${failure.message}`),
  );
  const [view, setView] = useState<View>("grid");
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, columns] = grid.split("x").map(Number);
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE;
  const matches = useMemo(
    () => filterAlerts(data.rows, filters, data.now),
    [data.rows, data.now, filters],
  );
  const cameras = useMemo(
    () => countByCamera(data.rows, filters, data.now),
    [data.rows, data.now, filters],
  );
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const visible = matches.slice(page * pageSize, (page + 1) * pageSize);
  const open: AlertRow | null =
    data.rows.find((row) => row.id === openId) ?? null;
  const change = (patch: Partial<Filters>) => {
    onFiltersChange((current) => ({ ...current, ...patch }));
    setPage(0);
  };
  return (
    <PageShell>
      <SidePanel>
        <FilterPanel
          filters={filters}
          titles={data.titles}
          cameras={cameras}
          onChange={change}
          onClear={() => {
            onFiltersChange(DEFAULT_FILTERS);
            setPage(0);
          }}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {data.isTruncated && (
            <Badge variant="secondary" className="mr-auto">
              <TriangleAlertIcon />
              Results limited. Narrow the time range to see older alerts.
            </Badge>
          )}
          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
            {isLoading
              ? "Loading..."
              : matches.length === 0
                ? "0 alerts"
                : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, matches.length)} of ${matches.length}`}
          </span>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Pick
            label="View"
            items={VIEW_ITEMS}
            value={view}
            onChange={(next) => {
              setView(next as View);
              setPage(0);
            }}
          />
          {view === "grid" && (
            <Pick
              label="Grid"
              items={gridItems}
              value={grid}
              onChange={(next) => {
                setGrid(next);
                setPage(0);
              }}
            />
          )}
        </div>
        {matches.length === 0 ? (
          <EmptyState
            icon={<BellIcon />}
            title="No alerts found"
            description="No alerts match the filters."
          />
        ) : view === "grid" ? (
          <div
            className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
            style={
              {
                "--columns": `repeat(${columns}, minmax(0, 1fr))`,
                "--rows": `repeat(${rows}, minmax(0, 1fr))`,
              } as CSSProperties
            }
          >
            {visible.map((alert) => (
              <AlertTile
                key={alert.id}
                alert={alert}
                onSelect={() => setOpenId(alert.id)}
                className="lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ))}
            {Array.from({ length: pageSize - visible.length }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="hidden border-r border-b lg:block"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
            <AlertsTable alerts={visible} onSelect={setOpenId} />
          </div>
        )}
      </div>
      <AlertDetailDialog alert={open} onClose={() => setOpenId(null)} />
    </PageShell>
  );
};
