"use client";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Grid3x3Icon,
  LoaderIcon,
  MaximizeIcon,
  MinimizeIcon,
  SignalIcon,
  VideoIcon,
} from "lucide-react";
import { type CSSProperties, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { useAlertMarkers } from "@/features/alerts";
import {
  dayBounds,
  PlaybackTimeline,
  snapToRange,
} from "@/features/camera-detail/playback";
import {
  addCameras,
  CameraTreePanel,
  gridItems,
  gridValue,
  type LiveData,
  pageCount,
  pageOf,
  removeCameras,
  resolveQuality,
  type StreamQuality,
  type Tile,
  useFullscreen,
  useLive,
  useLiveTiles,
} from "@/features/live";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import { cn } from "@/lib/utils";
import { PlaybackCalendar } from "./playback-calendar";
import { PlaybackControls } from "./playback-controls";
import { PlaybackTile } from "./playback-tile";
import { useCameraRanges } from "../hooks/use-camera-ranges";
import { usePlaybackClock } from "../hooks/use-playback-clock";
import { mergeRanges } from "../lib/merge-ranges";
import {
  playbackGridStore,
  playbackSelectionStore,
} from "../lib/selection-store";

const QUALITY_ITEMS = [
  { value: "sub", label: "Sub stream" },
  { value: "main", label: "Main stream" },
];

const streamOf = (quality: StreamQuality) => (tile: Tile) =>
  resolveQuality(undefined, quality, tile) === "main" ? "main" : "sub";

export const PlaybackView = ({
  data,
  isLive,
}: {
  data: LiveData;
  isLive: boolean;
}) => {
  const { data: live } = useLive(data, isLive);
  useFailureToast(
    "Some edge servers did not respond",
    live.failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const { servers, tiles } = useLiveTiles(live);
  const { status, value: selection } = usePersistedStore(
    playbackSelectionStore,
  );
  const { value: grid } = usePersistedStore(playbackGridStore);
  const [quality, setQuality] = useState<StreamQuality>("sub");
  const [pageIndex, setPageIndex] = useState(0);
  const [day, setDay] = useState(() => new Date());
  const clock = usePlaybackClock();
  const stage = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(stage);
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
  const cameraIds = selection.cameras.filter((id) => tileById.has(id));
  const pageSize = grid.rows * grid.columns;
  const pages = pageCount(cameraIds.length, pageSize);
  const page = Math.min(pageIndex, pages - 1);
  const visible = pageOf(cameraIds, page, pageSize).flatMap(
    (id) => tileById.get(id) ?? [],
  );
  const streamFor = streamOf(quality);
  const rangesById = useCameraRanges(visible, streamFor, day);
  const ranges = mergeRanges([...rangesById.values()]);
  const { from, to } = dayBounds(day);
  const alertMarkers = useAlertMarkers(
    day,
    visible.map((tile) => tile.name),
    isLive,
  );
  const hasOnline = visible.some((tile) => tile.state !== "server-offline");
  return (
    <PageShell>
      <SidePanel>
        <CameraTreePanel
          servers={servers}
          tiles={tiles}
          selected={cameraIds}
          placedLabel="in playback"
          readOnly={status !== "ready"}
          onAdd={(ids) =>
            playbackSelectionStore.update((state) => addCameras(state, ids))
          }
          onRemove={(ids) =>
            playbackSelectionStore.update((state) => removeCameras(state, ids))
          }
        />
        <PlaybackCalendar
          applied={day}
          onApply={(next) => {
            clock.reset();
            setDay(next);
          }}
        />
      </SidePanel>
      <div
        ref={stage}
        className="relative flex min-w-0 flex-1 flex-col bg-background lg:min-h-0"
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
                  playbackGridStore.update(() => ({ rows, columns }));
                }}
              />
              <Pick
                label="Stream"
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
                    onClick={() => setPageIndex(page - 1)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Next page"
                    disabled={page === pages - 1}
                    onClick={() => setPageIndex(page + 1)}
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
          {status !== "ready" ? (
            <EmptyState
              icon={<LoaderIcon className="animate-spin" />}
              title="Loading playback…"
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<VideoIcon />}
              title="No cameras in playback"
              description="Add cameras from the sidebar to watch recordings side by side."
            />
          ) : (
            <div
              className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
              style={
                {
                  "--columns": `repeat(${grid.columns}, minmax(0, 1fr))`,
                  "--rows": `repeat(${grid.rows}, minmax(0, 1fr))`,
                } as CSSProperties
              }
            >
              {visible.map((tile) => (
                <PlaybackTile
                  key={`${tile.id}:${streamFor(tile)}`}
                  tile={tile}
                  stream={streamFor(tile)}
                  ranges={rangesById.get(tile.id) ?? []}
                  clock={clock}
                  dayStart={from.getTime()}
                  dayEnd={to.getTime()}
                  className="lg:aspect-auto lg:h-full lg:min-h-0"
                />
              ))}
            </div>
          )}
          <div className={cn("flex flex-col gap-2", isFullscreen && "p-4")}>
            <div className="flex flex-wrap items-center gap-2">
              <PlaybackControls
                clock={clock}
                ranges={ranges}
                isDisabled={!hasOnline}
              />
              <Pick
                label="Alert type"
                icon={BellIcon}
                className="ml-auto"
                items={alertMarkers.items}
                value={alertMarkers.value}
                onChange={alertMarkers.onChange}
              />
            </div>
            <PlaybackTimeline
              key={from.getTime()}
              ranges={ranges}
              markers={alertMarkers.markers}
              dayStart={from.getTime()}
              dayEnd={to.getTime()}
              position={clock.position}
              onSeek={(time) => {
                const at = snapToRange(ranges, time);
                if (hasOnline && at !== null) clock.seek(at);
              }}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
};
