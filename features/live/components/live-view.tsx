"use client";
import { MaximizeIcon } from "lucide-react";
import { type CSSProperties, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { CameraTile } from "./camera-tile";
import { DevicePanel } from "./device-panel";
import {
  addCameras,
  createLayout,
  GRID_PRESETS,
  removeCameras,
  resizeLayout,
} from "../lib/edit-layout";
import type { LiveData, StreamQuality } from "../types";

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
  const { servers, tiles } = data;
  const [layouts, setLayouts] = useState(data.layouts);
  const [layoutId, setLayoutId] = useState(data.layouts[0]?.id ?? "");
  const [quality, setQuality] = useState<StreamQuality>("sub");
  const stage = useRef<HTMLDivElement>(null);
  const layout = layouts.find((l) => l.id === layoutId) ?? layouts[0];
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
  if (!layout) {
    return (
      <p className="p-8 text-center text-xs text-muted-foreground">
        No layouts yet.
      </p>
    );
  }
  const edit = (change: (current: typeof layout) => typeof layout) =>
    setLayouts((all) => all.map((l) => (l.id === layout.id ? change(l) : l)));
  return (
    <PageShell>
      <SidePanel>
        <DevicePanel
          layouts={layouts}
          layout={layout}
          servers={servers}
          tiles={tiles}
          onSelectLayout={(id) => {
            setLayoutId(id);
          }}
          onNewLayout={() => {
            const created = createLayout(layouts);
            setLayouts((all) => [...all, created]);
            setLayoutId(created.id);
          }}
          onDeleteLayout={() => {
            const rest = layouts.filter((l) => l.id !== layout.id);
            setLayouts(rest);
            setLayoutId(rest[0].id);
          }}
          onAdd={(ids) => edit((l) => addCameras(l, ids))}
          onRemove={(ids) => edit((l) => removeCameras(l, ids))}
        />
      </SidePanel>
      <div
        ref={stage}
        className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0"
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Pick
            label="Grid"
            items={gridItems(layout.rows, layout.columns)}
            value={gridValue(layout.rows, layout.columns)}
            onChange={(size) => {
              const [rows, columns] = size.split("x").map(Number);
              edit((l) => resizeLayout(l, rows, columns));
            }}
          />
          <Pick
            label="Stream"
            items={QUALITY_ITEMS}
            value={quality}
            onChange={(next) => setQuality(next as StreamQuality)}
          />
          <Button
            variant="outline"
            onClick={() => stage.current?.requestFullscreen?.()}
          >
            <MaximizeIcon />
            Fullscreen
          </Button>
        </div>
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
      </div>
    </PageShell>
  );
};
