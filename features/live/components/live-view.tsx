"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Grid3x3Icon,
  LayoutGridIcon,
  LoaderIcon,
  MaximizeIcon,
  MinimizeIcon,
  PlusIcon,
  SignalIcon,
  Trash2Icon,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { TileSlot } from "@/components/shared/tile-slot";
import { Button } from "@/components/ui/button";
import { PtzPanel, setPtzCamera } from "@/features/ptz";
import { useDeviceDrag } from "@/hooks/use-device-drag";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import { cn } from "@/lib/utils";
import { CameraTile } from "./camera-tile";
import { DevicePanel } from "./device-panel";
import { DragPreview } from "./drag-preview";
import { useFullscreen } from "../hooks/use-fullscreen";
import { useLayout } from "../hooks/use-layout";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { useLive } from "../hooks/use-live";
import { useLiveTiles } from "../hooks/use-live-tiles";
import {
  addCameras,
  GRID_PRESETS,
  pageCount,
  pageOf,
  placeCamera,
  removeCameras,
} from "../lib/edit-layout";
import { gridPreferenceStore } from "../lib/grid-preference-store";
import type { LiveData, LiveLayout, StreamQuality } from "../types";

const QUALITY_ITEMS = [
  { value: "sub", label: "Sub stream" },
  { value: "main", label: "Main stream" },
];

const gridValue = (rows: number, columns: number) => `${rows}x${columns}`;

const gridItems = (rows: number, columns: number) => {
  const sizes = GRID_PRESETS.some(([r, c]) => r === rows && c === columns)
    ? GRID_PRESETS
    : [...GRID_PRESETS, [rows, columns]];
  return sizes.map(([r, c]) => ({
    value: gridValue(r, c),
    label: `${r}×${c}`,
  }));
};

export const LiveView = ({ data }: { data: LiveData }) => {
  const { data: live } = useLive(data);
  const { layouts, failures } = live;
  useFailureToast(
    "Some edge servers did not respond",
    failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const { servers, tiles } = useLiveTiles(live);
  const actions = useLayoutActions();
  const isDragging = useDeviceDrag();
  useFailureToast("Failed to update the layout", [actions.error]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageState, setPageState] = useState({ layoutId: "", index: 0 });
  const { value: grid } = usePersistedStore(gridPreferenceStore);
  const [quality, setQuality] = useState<StreamQuality>("sub");
  const stage = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(stage);
  useEffect(() => () => setPtzCamera(null), []);
  const summary = layouts.find((l) => l.id === pickedId) ?? layouts[0] ?? null;
  const { data: detail } = useLayout(
    summary?.id ?? null,
    summary ? data.details[summary.id] : undefined,
  );
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
  const createLayout = () =>
    actions.create.mutate(layouts, {
      onSuccess: (created) => setPickedId(created.id),
    });
  if (!summary) {
    return (
      <PageShell>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <EmptyState
            icon={<LayoutGridIcon />}
            title="No layouts"
            description="Create a layout to start watching cameras."
          >
            {actions.error && (
              <p className="text-xs text-destructive">{actions.error}</p>
            )}
            <Button onClick={createLayout} disabled={actions.create.isPending}>
              <PlusIcon />
              Create layout
            </Button>
          </EmptyState>
        </div>
      </PageShell>
    );
  }
  const layout: LiveLayout = detail ?? {
    ...summary,
    cameras: [],
  };
  const pageSize = grid.rows * grid.columns;
  const cameraIds = layout.cameras;
  const pages = pageCount(cameraIds.length, pageSize);
  const page = Math.min(
    pageState.layoutId === layout.id ? pageState.index : 0,
    pages - 1,
  );
  const goToPage = (index: number) =>
    setPageState({ layoutId: layout.id, index });
  const visible: (string | null)[] = Array.from(
    { length: pageSize },
    (_, position) => pageOf(cameraIds, page, pageSize)[position] ?? null,
  );
  return (
    <PageShell>
      <SidePanel>
        <DevicePanel
          layouts={layouts}
          layout={layout}
          servers={servers}
          tiles={tiles}
          readOnly={!detail}
          onSelectLayout={setPickedId}
          onNewLayout={createLayout}
          onDeleteLayout={() => setIsDeleting(true)}
          onAdd={(ids) =>
            detail &&
            actions.changeSlots.mutate({
              layout: detail,
              next: addCameras(detail, ids),
            })
          }
          onRemove={(ids) =>
            detail &&
            actions.changeSlots.mutate({
              layout: detail,
              next: removeCameras(detail, ids),
            })
          }
        />
      </SidePanel>
      <div
        ref={stage}
        className="relative flex min-w-0 flex-1 flex-col bg-background lg:min-h-0 lg:flex-row"
      >
        <div
          className={cn(
            "relative flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0",
            isFullscreen && "gap-0 p-0",
          )}
        >
          <div
            className={cn(
              isFullscreen
                ? "group/bar absolute inset-x-0 top-0 z-10 h-3"
                : "contents",
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center justify-end gap-2",
                isFullscreen &&
                  "-translate-y-full border-b bg-background/90 p-2 backdrop-blur-md transition-transform group-hover/bar:translate-y-0 has-[:focus-visible]:translate-y-0 has-[[aria-expanded=true]]:translate-y-0",
              )}
            >
              <Pick
                label="Grid"
                icon={Grid3x3Icon}
                items={gridItems(grid.rows, grid.columns)}
                value={gridValue(grid.rows, grid.columns)}
                onChange={(size) => {
                  const [rows, columns] = size.split("x").map(Number);
                  gridPreferenceStore.update(() => ({ rows, columns }));
                }}
              />
              <Pick
                label="Stream quality"
                icon={SignalIcon}
                items={QUALITY_ITEMS}
                value={quality}
                onChange={(next) => setQuality(next as StreamQuality)}
              />
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Previous page"
                    disabled={page === 0}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Next page"
                    disabled={page === pages - 1}
                    onClick={() => goToPage(page + 1)}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="ml-auto"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
              </Button>
            </div>
          </div>
          {detail ? (
            <div
              className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
              style={
                {
                  "--columns": `repeat(${grid.columns}, minmax(0, 1fr))`,
                  "--rows": `repeat(${grid.rows}, minmax(0, 1fr))`,
                } as CSSProperties
              }
            >
              {visible.map((id, position) => {
                const tile = id ? tileById.get(id) : null;
                return (
                  <TileSlot
                    key={tile ? tile.id : `empty-${position}`}
                    cameraId={tile?.id ?? null}
                    dragPreview={
                      tile && <DragPreview id={tile.id} name={tile.name} />
                    }
                    isDragging={isDragging}
                    onPlace={(cameraId) =>
                      actions.changeSlots.mutate({
                        layout: detail,
                        next: placeCamera(
                          detail,
                          cameraId,
                          page * pageSize + position,
                        ),
                      })
                    }
                  >
                    {tile ? (
                      <CameraTile
                        tile={tile}
                        quality={quality}
                        hasPtz
                        className="lg:aspect-auto lg:h-full lg:min-h-0"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center border-r border-b text-xs text-muted-foreground lg:aspect-auto lg:h-full lg:min-h-0">
                        Empty slot
                      </div>
                    )}
                  </TileSlot>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<LoaderIcon className="animate-spin" />}
              title="Loading layout…"
            />
          )}
        </div>
        <PtzPanel />
        <ConfirmDialog
          icon={Trash2Icon}
          variant="destructive"
          isOpen={isDeleting}
          title="Delete this layout?"
          description="The layout is removed, but its cameras are kept."
          confirmLabel="Delete layout"
          onConfirm={() => {
            setIsDeleting(false);
            actions.remove.mutate(summary.id, {
              onSuccess: () =>
                setPickedId(
                  layouts.find((l) => l.id !== summary.id)?.id ?? null,
                ),
            });
          }}
          onClose={() => setIsDeleting(false)}
        />
      </div>
    </PageShell>
  );
};
