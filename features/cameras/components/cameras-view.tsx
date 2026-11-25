"use client";
import {
  CctvIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Grid3x3Icon,
  LayoutGridIcon,
  PlusIcon,
  ScanSearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type CSSProperties, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { analyticLabel } from "@/config/analytics-catalog";
import { useDeviceFault, useServerOnline } from "@/features/edge-status";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { CameraCard } from "./camera-card";
import { CameraDialog, type DialogTarget } from "./camera-dialog";
import { CameraFilterPanel } from "./camera-filter-panel";
import { CameraTable } from "./camera-table";
import { ScanDialog } from "./scan-dialog";
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
import type { CameraData, CameraRecord } from "../types";

const GRID_PRESETS: [rows: number, columns: number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
];

const DEFAULT_GRID = "4x4";
const LIST_PAGE_SIZE = 20;

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
  const { failures } = current;
  useFailureToast(
    "Some edge servers did not respond",
    failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const serverOnline = useServerOnline();
  const fault = useDeviceFault();
  const cameras = useMemo(
    () =>
      current.cameras.map((camera) => ({
        ...camera,
        fault: fault(camera.edgeServerId, camera.id),
      })),
    [current.cameras, fault],
  );
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
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [initial, setInitial] = useState<Draft | null>(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CameraRecord | null>(null);
  const { save, remove, toggle, saveError, removeError, toggleError } =
    useCameraActions(isLive);
  useFailureToast("Failed to update the camera", [toggleError]);
  useFailureToast("Failed to delete the camera", [removeError]);
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
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setInitial(null);
                setDialog("new");
              }}
            >
              <PlusIcon />
              Add camera
            </Button>
            <Button variant="secondary" onClick={() => setIsScanOpen(true)}>
              <ScanSearchIcon />
              Scan cameras
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="mr-2 text-xs text-muted-foreground tabular-nums">
              {matches.length === 0
                ? "0 cameras"
                : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, matches.length)} of ${matches.length}`}
            </span>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next page"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRightIcon />
            </Button>
            <Pick
              label="View"
              icon={LayoutGridIcon}
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
                icon={Grid3x3Icon}
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
            icon={<CctvIcon />}
            title={cameras.length === 0 ? "No cameras" : "No cameras found"}
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
                id={camera.id}
                name={camera.name}
                subtitle={`${serverName.get(camera.edgeServerId) ?? "Unknown"} · ${analyticName(camera.analyticId)}`}
                state={cameraState(camera, servers)}
                recording={camera.isRecordingEnabled}
                onSelect={() => router.push(`/cameras/${camera.id}`)}
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
            <CameraTable
              cameras={visible}
              servers={servers}
              onSelect={(id) => router.push(`/cameras/${id}`)}
              onToggle={(id, patch) => toggle.mutate({ id, patch })}
              onDelete={setPendingDelete}
            />
          </div>
        )}
      </div>
      <CameraDialog
        target={dialog}
        initial={initial}
        servers={servers}
        onClose={() => {
          setDialog(null);
          setInitial(null);
          save.reset();
        }}
        isPending={save.isPending}
        error={saveError}
        onSave={async (draft: Draft, id) => {
          try {
            await save.mutateAsync({ draft, id });
            setDialog(null);
            setInitial(null);
          } catch {
            return;
          }
        }}
      />
      <ScanDialog
        isOpen={isScanOpen}
        servers={servers}
        onClose={() => setIsScanOpen(false)}
        onAdd={(draft) => {
          setIsScanOpen(false);
          setInitial(draft);
          setDialog("new");
        }}
      />
      <ConfirmDialog
        icon={Trash2Icon}
        variant="destructive"
        isOpen={pendingDelete !== null}
        title="Delete this camera?"
        description="The camera is removed from every layout and stops streaming. Alarms it already raised are kept."
        confirmLabel="Delete camera"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </PageShell>
  );
};
