"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { analyticLabel } from "@/config/analytics-catalog";
import { useServerOnline } from "@/features/edge-status";
import { CameraCard } from "./camera-card";
import { CameraDialog, type DialogTarget } from "./camera-dialog";
import { CameraFilterPanel } from "./camera-filter-panel";
import { CameraTable } from "./camera-table";
import { useCameraActions } from "../hooks/use-camera-actions";
import { useCameras } from "../hooks/use-cameras";
import { cameraState } from "../lib/camera-state";
import type { Draft } from "../lib/edit-camera";
import {
  ALL,
  DEFAULT_FILTERS,
  filterCameras,
  type Filters,
} from "../lib/filter-cameras";
import type { CameraData } from "../types";

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

export const CamerasView = ({
  data,
  isLive,
}: {
  data: CameraData;
  isLive: boolean;
}) => {
  const { data: current } = useCameras(data, isLive);
  const { cameras, failures } = current;
  const serverOnline = useServerOnline();
  const servers = useMemo(
    () =>
      current.servers.map((s) => ({
        ...s,
        online: serverOnline(s, s.online),
      })),
    [current.servers, serverOnline],
  );
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<View>("grid");
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const { save, remove, toggle, saveError, toggleError } =
    useCameraActions(isLive);
  const [rows, columns] = grid.split("x").map(Number);
  const pageSize = view === "grid" ? rows * columns : LIST_PAGE_SIZE;
  const matches = useMemo(
    () => filterCameras(cameras, servers, filters, analyticName),
    [cameras, servers, filters],
  );
  const counts = useMemo(() => {
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
        {failures.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Some edge servers did not respond</AlertTitle>
            <AlertDescription>
              {failures
                .map((failure) => `${failure.serverName}: ${failure.message}`)
                .join(" · ")}
            </AlertDescription>
          </Alert>
        )}
        {toggleError && (
          <Alert variant="destructive">
            <AlertTitle>Could not update the camera</AlertTitle>
            <AlertDescription>{toggleError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => setDialog("new")}>
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
          <EmptyState
            icon={<VideoIcon />}
            title={cameras.length === 0 ? "No cameras yet" : "No cameras found"}
            description={
              cameras.length === 0
                ? "Add the first one."
                : "No cameras match the filters."
            }
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
            {visible.map((camera) => (
              <CameraCard
                key={camera.id}
                name={camera.name}
                subtitle={`${serverName.get(camera.edgeServerId) ?? "Unknown"} · ${analyticName(camera.analyticId)}`}
                state={cameraState(camera, servers)}
                recording={camera.isRecordingEnabled}
                onSelect={() => setDialog(camera)}
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
            <CameraTable
              cameras={visible}
              servers={servers}
              onSelect={(id) =>
                setDialog(cameras.find((c) => c.id === id) ?? null)
              }
              onToggle={(id, patch) => toggle.mutate({ id, patch })}
            />
          </div>
        )}
      </div>
      <CameraDialog
        target={dialog}
        servers={servers}
        onClose={() => {
          setDialog(null);
          save.reset();
          remove.reset();
        }}
        isPending={save.isPending || remove.isPending}
        error={saveError}
        onSave={async (draft: Draft, id) => {
          try {
            await save.mutateAsync({ draft, id });
            setDialog(null);
          } catch {
            return;
          }
        }}
        onDelete={async (id) => {
          try {
            await remove.mutateAsync(id);
            setDialog(null);
          } catch {
            return;
          }
        }}
      />
    </PageShell>
  );
};
