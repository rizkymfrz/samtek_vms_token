"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CameraMarker } from "./camera-marker";
import { coneGeometry, pointToPlan } from "../lib/edit-placements";
import type {
  Floorplan,
  FloorplanDevice,
  PlanCamera,
  PlanRoom,
} from "../types";

const RANGE = 0.12;
const DEFAULT_SIZE = { width: 1000, height: 600 };

export const PlanCanvas = ({
  plan,
  imageSrc,
  rooms,
  placements,
  cameras,
  selectedId,
  openIds,
  onSelect,
  onOpenChange,
  onMove,
}: {
  plan: Floorplan;
  imageSrc: string | null;
  rooms: PlanRoom[];
  placements: FloorplanDevice[];
  cameras: Map<string, PlanCamera>;
  selectedId: string | null;
  openIds: string[];
  onSelect: (id: string | null) => void;
  onOpenChange: (id: string, open: boolean) => void;
  onMove: (id: string, x: number, y: number) => void;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const measure = (element: HTMLImageElement) => {
    if (element.naturalWidth > 0 && element.naturalHeight > 0)
      setSize({ width: element.naturalWidth, height: element.naturalHeight });
  };
  useEffect(() => {
    if (image.current?.complete) measure(image.current);
  }, []);
  const toPlan = (clientX: number, clientY: number) => {
    const rect = box.current?.getBoundingClientRect();
    return pointToPlan(
      clientX,
      clientY,
      rect ?? { left: 0, top: 0, width: 0, height: 0 },
    );
  };
  return (
    <div
      className="relative min-h-96 flex-1 overflow-hidden rounded border bg-sidebar lg:min-h-0"
      style={{ containerType: "size" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={box}
          className="relative"
          style={{
            width: `min(100cqw, calc(100cqh * ${size.width / size.height}))`,
            aspectRatio: `${size.width} / ${size.height}`,
          }}
          onPointerDown={(event) =>
            event.target === event.currentTarget && onSelect(null)
          }
        >
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- authenticated proxy route, not optimizable
            <img
              ref={image}
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full select-none"
              onLoad={(event) => measure(event.currentTarget)}
            />
          )}
          <svg
            viewBox={`0 0 ${size.width} ${size.height}`}
            className="absolute inset-0 size-full"
            role="img"
            aria-label={plan.label}
            onPointerDown={() => onSelect(null)}
          >
            {!imageSrc && (
              <rect
                width={size.width}
                height={size.height}
                className="fill-background"
              />
            )}
            {!imageSrc &&
              rooms.map((room) => (
                <g key={room.label}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    strokeWidth={2}
                    className="fill-card stroke-border"
                  />
                  <text
                    x={room.x + 14}
                    y={room.y + 28}
                    fontSize={16}
                    className="fill-muted-foreground"
                  >
                    {room.label}
                  </text>
                </g>
              ))}
            {placements.map((p) => {
              const camera = cameras.get(p.deviceRecordId);
              if (!camera) return null;
              const selected = p.id === selectedId;
              return (
                <path
                  key={p.id}
                  d={coneGeometry(
                    p.x * size.width,
                    p.y * size.height,
                    p.rotation,
                    p.fieldOfView,
                    size.width * RANGE,
                  )}
                  strokeWidth={1.5}
                  fillOpacity={selected ? 0.35 : 0.18}
                  strokeOpacity={selected ? 0.9 : 0.5}
                  className={cn(
                    "pointer-events-none",
                    camera.state === "live"
                      ? "fill-chart-2 stroke-chart-2"
                      : "fill-muted-foreground stroke-muted-foreground",
                  )}
                />
              );
            })}
          </svg>
          {placements.map((p) => {
            const camera = cameras.get(p.deviceRecordId);
            if (!camera) return null;
            return (
              <CameraMarker
                key={p.id}
                camera={camera}
                x={p.x}
                y={p.y}
                selected={p.id === selectedId}
                planBox={toPlan}
                isOpen={openIds.includes(p.id)}
                onSelect={() => onSelect(p.id)}
                onOpen={() => {
                  onSelect(p.id);
                  onOpenChange(p.id, true);
                }}
                onClose={() => onOpenChange(p.id, false)}
                onMove={(x, y) => onMove(p.id, x, y)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
