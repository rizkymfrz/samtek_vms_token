"use client";
import { useRef } from "react";
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

export const PlanCanvas = ({
  plan,
  rooms,
  placements,
  cameras,
  selectedId,
  onSelect,
  onMove,
}: {
  plan: Floorplan;
  rooms: PlanRoom[];
  placements: FloorplanDevice[];
  cameras: Map<string, PlanCamera>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}) => {
  const box = useRef<HTMLDivElement>(null);
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
      className="relative min-h-96 flex-1 border bg-sidebar lg:min-h-0"
      style={{ containerType: "size" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={box}
          className="relative"
          style={{
            width: `min(100cqw, calc(100cqh * ${plan.width / plan.height}))`,
            aspectRatio: `${plan.width} / ${plan.height}`,
          }}
          onPointerDown={(event) =>
            event.target === event.currentTarget && onSelect(null)
          }
        >
          <svg
            viewBox={`0 0 ${plan.width} ${plan.height}`}
            className="absolute inset-0 size-full"
            role="img"
            aria-label={`${plan.name}, ${plan.level}`}
            onPointerDown={() => onSelect(null)}
          >
            <rect
              width={plan.width}
              height={plan.height}
              className="fill-background"
            />
            {rooms.map((room) => (
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
                    p.x * plan.width,
                    p.y * plan.height,
                    p.rotation,
                    p.fov,
                    plan.width * RANGE,
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
                onSelect={() => onSelect(p.id)}
                onMove={(x, y) => onMove(p.id, x, y)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
