"use client";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { Pick } from "@/components/shared/pick";
import { SidePanel } from "@/components/layout/side-panel";
import { analyticLabel } from "@/app/(app)/_data/analytics-catalog";
import { CameraCard } from "./camera-card";
import { CameraFilterPanel } from "./camera-filter-panel";
import { CameraSheet, type SheetTarget } from "./camera-sheet";
import { CameraTable } from "./camera-table";
import type { CameraData, CameraRecord } from "../types";
import { cameraState } from "../lib/camera-state";
import {
  ALL,
  DEFAULT_FILTERS,
  filterCameras,
  type Filters,
} from "../lib/filter-cameras";
import { saveCamera, removeCamera, type Draft } from "../lib/edit-camera";

export const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
];

export const DEFAULT_GRID = "4x4";
export const LIST_PAGE_SIZE = 20;

type View = "grid" | "list";

const VIEW_ITEMS = [
  { value: "grid", label: "Grid view" },
  { value: "list", label: "List view" },
];

const gridItems = GRID_PRESETS.map(([rows, columns]) => ({
  value: `${rows}x${columns}`,
  label: `${rows}×${columns}`,
}));

const analyticName = (id: string | null) =>
  id ? analyticLabel(id) : "No analytic";

export const CamerasView = ({ data }: { data: CameraData }) => {
  const { servers } = data;
  const [cameras, setCameras] = React.useState(data.cameras);
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = React.useState<View>("grid");
  const [grid, setGrid] = React.useState(DEFAULT_GRID);
  const [page, setPage] = React.useState(0);
  const [sheet, setSheet] = React.useState<SheetTarget>(null);
  const [rows, columns] = grid.split("x").map(Number);
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE;
  const matches = React.useMemo(
    () => filterCameras(cameras, servers, filters, analyticName),
    [cameras, servers, filters],
  );
  const counts = React.useMemo(() => {
    const others = filterCameras(
      cameras,
      servers,
      { ...filters, server: ALL },
      analyticName,
    );
    return Object.fromEntries(
      servers.map((s) => [
        s.id,
        others.filter((c) => c.edgeServerId === s.id).length,
      ]),
    );
  }, [cameras, servers, filters]);
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = matches.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const serverName = new Map(servers.map((s) => [s.id, s.name]));
  const change = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };
  const toggle = (
    id: string,
    patch: Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>,
  ) =>
    setCameras((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <PageShell>
      <SidePanel>
        <CameraFilterPanel
          filters={filters}
          servers={servers}
          counts={counts}
          onChange={change}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(0);
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
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
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
        </div>
        {matches.length === 0 ? (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            {cameras.length === 0
              ? "No cameras yet. Add the first one."
              : "No cameras match the filters."}
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
            {Array.from({ length: pageSize - visible.length }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="hidden border-r border-b lg:block"
              />
            ))}
          </div>
        ) : (
          <div className="border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <CameraTable
              cameras={visible}
              servers={servers}
              onSelect={(id) =>
                setSheet(cameras.find((c) => c.id === id) ?? null)
              }
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
          setCameras((all) => saveCamera(all, draft, id));
          setSheet(null);
        }}
        onDelete={(id) => {
          setCameras((all) => removeCamera(all, id));
          setSheet(null);
        }}
      />
    </PageShell>
  );
};
