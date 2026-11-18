"use client";
import {
  CctvIcon,
  ChartColumnIcon,
  MaximizeIcon,
  ScanFaceIcon,
  SignalIcon,
} from "lucide-react";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { CameraTile, type LiveData, type StreamQuality } from "@/features/live";
import { useAnalyticTiles } from "../hooks/use-analytic-tiles";
import { gridSize } from "../lib/analytic-grid";
import {
  type AnalyticGroup,
  COUNTING_STATS_SLUGS,
  FACE_RECOGNITION_SLUG,
} from "../lib/analytic-groups";

const QUALITY_ITEMS = [
  { value: "sub", label: "Sub stream" },
  { value: "main", label: "Main stream" },
];

export const AnalyticDetailView = ({
  group,
  live: initialLive,
  isLive,
  children,
}: {
  group: Pick<AnalyticGroup, "slug" | "title" | "analyticIds">;
  live: LiveData;
  isLive: boolean;
  children: ReactNode;
}) => {
  const tiles = useAnalyticTiles(initialLive, isLive, group.analyticIds);
  const [quality, setQuality] = useState<StreamQuality>("sub");
  const stage = useRef<HTMLDivElement>(null);
  const size = gridSize(tiles.length);
  return (
    <div className="flex min-h-full flex-1 flex-col lg:min-h-0 lg:flex-row">
      <div
        ref={stage}
        className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0"
      >
        <div className="flex flex-wrap items-center justify-start gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Fullscreen"
            title="Fullscreen"
            onClick={() => stage.current?.requestFullscreen?.()}
          >
            <MaximizeIcon />
          </Button>
          <Pick
            label="Stream"
            icon={SignalIcon}
            items={QUALITY_ITEMS}
            value={quality}
            onChange={(next) => setQuality(next as StreamQuality)}
          />
          {COUNTING_STATS_SLUGS.includes(group.slug) && (
            <Button
              variant="secondary"
              className="ml-auto"
              nativeButton={false}
              render={<Link href={`/analytics/${group.slug}/stats`} />}
            >
              <ChartColumnIcon />
              Statistics
            </Button>
          )}
          {group.slug === FACE_RECOGNITION_SLUG && (
            <Button
              variant="secondary"
              className="ml-auto"
              nativeButton={false}
              render={<Link href={`/analytics/${group.slug}/faces`} />}
            >
              <ScanFaceIcon />
              Manage faces
            </Button>
          )}
        </div>
        {tiles.length === 0 ? (
          <EmptyState
            icon={<CctvIcon />}
            title="No cameras"
            description={`No camera is using ${group.title} yet.`}
          />
        ) : (
          <div
            className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 md:grid-cols-(--columns) lg:min-h-0 lg:flex-1 lg:grid-rows-(--rows)"
            style={
              {
                "--columns": `repeat(${size}, minmax(0, 1fr))`,
                "--rows": `repeat(${size}, minmax(0, 1fr))`,
              } as CSSProperties
            }
          >
            {tiles.map((tile) => (
              <CameraTile
                key={tile.id}
                tile={tile}
                quality={quality}
                className="lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ))}
            {Array.from({ length: size * size - tiles.length }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="hidden border-r border-b md:block"
              />
            ))}
          </div>
        )}
      </div>
      <SidePanel side="right" isFixed>
        {children}
      </SidePanel>
    </div>
  );
};
