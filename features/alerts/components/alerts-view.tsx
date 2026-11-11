"use client";
import { BellIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

export const AlertsView = ({ data }: { data: AlertsData }) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
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
    setFilters((current) => ({ ...current, ...patch }));
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
            setFilters(DEFAULT_FILTERS);
            setPage(0);
          }}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        {data.failures.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Some edge servers did not respond</AlertTitle>
            <AlertDescription>
              {data.failures
                .map((failure) => `${failure.edgeName}: ${failure.message}`)
                .join(" · ")}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
            {matches.length === 0
              ? "0 alerts"
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
          <Button
            variant="outline"
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
          <div className="overflow-hidden rounded border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <AlertsTable alerts={visible} onSelect={setOpenId} />
          </div>
        )}
      </div>
      <AlertDetailDialog alert={open} onClose={() => setOpenId(null)} />
    </PageShell>
  );
};
