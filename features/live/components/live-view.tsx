"use client";
import {
  LayoutGridIcon,
  LoaderIcon,
  MaximizeIcon,
  PlusIcon,
} from "lucide-react";
import { type CSSProperties, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useServerOnline } from "@/features/edge-status";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { CameraTile } from "./camera-tile";
import { DevicePanel } from "./device-panel";
import { useLayout } from "../hooks/use-layout";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { useLive } from "../hooks/use-live";
import { addCameras, GRID_PRESETS, removeCameras } from "../lib/edit-layout";
import type { LiveData, LiveLayout, StreamQuality, Tile } from "../types";

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

export const LiveView = ({
  data,
  isLive,
}: {
  data: LiveData;
  isLive: boolean;
}) => {
  const { data: live } = useLive(data, isLive);
  const { layouts, failures } = live;
  useFailureToast(
    "Some edge servers did not respond",
    failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const serverOnline = useServerOnline();
  const servers = useMemo(
    () =>
      live.servers.map((s) => ({ ...s, online: serverOnline(s, s.online) })),
    [live.servers, serverOnline],
  );
  const tiles = useMemo(() => {
    const online = new Map(servers.map((s) => [s.id, s.online]));
    return live.tiles.map((tile): Tile =>
      tile.state === "disabled"
        ? tile
        : {
            ...tile,
            state: online.get(tile.serverId) ? "live" : "server-offline",
          },
    );
  }, [live.tiles, servers]);
  const actions = useLayoutActions(isLive);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [quality, setQuality] = useState<StreamQuality>("sub");
  const stage = useRef<HTMLDivElement>(null);
  const summary = layouts.find((l) => l.id === pickedId) ?? layouts[0] ?? null;
  const { data: detail } = useLayout(
    summary?.id ?? null,
    summary ? data.details[summary.id] : undefined,
    isLive,
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
            title="No layouts yet"
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
    slots: Array.from({ length: summary.rows * summary.columns }, () => null),
  };
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
          onDeleteLayout={() =>
            actions.remove.mutate(summary.id, {
              onSuccess: () =>
                setPickedId(
                  layouts.find((l) => l.id !== summary.id)?.id ?? null,
                ),
            })
          }
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
        className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0"
      >
        {actions.error && (
          <Alert variant="destructive">
            <AlertTitle>Could not update the layout</AlertTitle>
            <AlertDescription>{actions.error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Pick
            label="Grid"
            items={gridItems(layout.rows, layout.columns)}
            value={gridValue(layout.rows, layout.columns)}
            onChange={(size) => {
              const [rows, columns] = size.split("x").map(Number);
              if (detail)
                actions.resize.mutate({ layout: detail, rows, columns });
            }}
          />
          <Pick
            label="Stream"
            items={QUALITY_ITEMS}
            value={quality}
            onChange={(next) => setQuality(next as StreamQuality)}
          />
          <Button
            variant="secondary"
            size="icon"
            className="ml-auto"
            aria-label="Fullscreen"
            title="Fullscreen"
            onClick={() => stage.current?.requestFullscreen?.()}
          >
            <MaximizeIcon />
          </Button>
        </div>
        {detail ? (
          <div
            className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
            style={
              {
                "--columns": `repeat(${layout.columns}, minmax(0, 1fr))`,
                "--rows": `repeat(${layout.rows}, minmax(0, 1fr))`,
              } as CSSProperties
            }
          >
            {layout.slots.map((id, position) => {
              const tile = id ? tileById.get(id) : null;
              return tile ? (
                <CameraTile
                  key={tile.id}
                  tile={tile}
                  quality={quality}
                  className="lg:aspect-auto lg:h-full lg:min-h-0"
                />
              ) : (
                <div
                  key={`empty-${position}`}
                  className="flex aspect-video items-center justify-center border-r border-b text-xs text-muted-foreground lg:aspect-auto lg:h-full lg:min-h-0"
                >
                  Empty slot
                </div>
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
    </PageShell>
  );
};
