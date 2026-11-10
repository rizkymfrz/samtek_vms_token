"use client";
import { ServerOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanCamera } from "../types";

const ICON = {
  live: VideoIcon,
  disabled: VideoOffIcon,
  "server-offline": ServerOffIcon,
};

const STEP = 0.01;
const BIG_STEP = 0.05;
const DRAG_THRESHOLD = 3;

export const CameraMarker = ({
  camera,
  x,
  y,
  selected,
  onSelect,
  onMove,
  planBox,
}: {
  camera: PlanCamera;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  planBox: (clientX: number, clientY: number) => { x: number; y: number };
}) => {
  const Icon = ICON[camera.state];
  const drag = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  return (
    <button
      type="button"
      aria-label={`${camera.name}, ${camera.state === "live" ? "live" : camera.state === "disabled" ? "disabled" : "server offline"}${camera.alerts ? `, ${camera.alerts} alerts` : ""}`}
      aria-pressed={selected}
      title={camera.name}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      className={cn(
        "absolute z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        camera.state === "live" ? "text-chart-2" : "text-muted-foreground",
        selected
          ? "z-20 border-primary ring-2 ring-primary"
          : "hover:border-ring",
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        onSelect();
      }}
      onPointerMove={(event) => {
        const state = drag.current;
        if (!state) return;
        if (
          !state.moved &&
          Math.hypot(
            event.clientX - state.startX,
            event.clientY - state.startY,
          ) < DRAG_THRESHOLD
        )
          return;
        state.moved = true;
        const next = planBox(event.clientX, event.clientY);
        onMove(next.x, next.y);
      }}
      onPointerUp={(event) => {
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? BIG_STEP : STEP;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const move = delta[event.key];
        if (!move) return;
        event.preventDefault();
        onMove(x + move[0], y + move[1]);
      }}
    >
      <Icon className="size-4" />
      {camera.alerts > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-4 min-w-4 px-1 tabular-nums"
        >
          {camera.alerts}
        </Badge>
      )}
    </button>
  );
};
