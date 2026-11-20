"use client";
import { format } from "date-fns";
import { ArrowLeftRightIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import {
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import type { RecordingRange } from "@/features/edge-status";
import { cn } from "@/lib/utils";
import {
  clipRange,
  followWindow,
  MIN_WINDOW_MS,
  panWindow,
  ticksIn,
  tickStep,
  type TimeWindow,
  zoomWindow,
} from "../lib/recording-timeline";

const ZOOM_STEP = 2;
const WHEEL_SENSITIVITY = 0.002;
const DRAG_THRESHOLD_PX = 3;
const EDGE_FRACTION = 0.03;

const tickLabel = (time: number, dayEnd: number, step: number) =>
  time === dayEnd
    ? "24:00"
    : format(time, step < 60_000 ? "HH:mm:ss" : "HH:mm");

const labelShift = (fraction: number) =>
  fraction < EDGE_FRACTION
    ? "translate-x-0"
    : fraction > 1 - EDGE_FRACTION
      ? "-translate-x-full"
      : "-translate-x-1/2";

export const PlaybackTimeline = ({
  ranges,
  dayStart,
  dayEnd,
  position,
  onSeek,
}: {
  ranges: RecordingRange[];
  dayStart: number;
  dayEnd: number;
  position: number | null;
  onSeek: (time: number) => void;
}) => {
  const day: TimeWindow = { start: dayStart, end: dayEnd };
  const [window, setWindow] = useState(day);
  const track = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; window: TimeWindow; moved: boolean } | null>(
    null,
  );
  const latest = useRef(window);
  const previous = useRef<number | null>(null);
  const length = window.end - window.start;
  const isFull = length >= dayEnd - dayStart;
  const isMin = length <= MIN_WINDOW_MS;
  const step = tickStep(length);
  const timeAt = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect();
    return rect
      ? window.start + ((clientX - rect.left) / rect.width) * length
      : window.start;
  };
  const zoomBy = (factor: number, anchor = 0.5) =>
    setWindow((current) => zoomWindow(current, day, factor, anchor));
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const anchor = (event.clientX - rect.left) / rect.width;
      setWindow((current) =>
        zoomWindow(
          current,
          { start: dayStart, end: dayEnd },
          Math.exp(event.deltaY * WHEEL_SENSITIVITY),
          anchor,
        ),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [dayStart, dayEnd]);
  useEffect(() => {
    latest.current = window;
  }, [window]);
  useEffect(() => {
    const before = previous.current;
    previous.current = position;
    if (position === null || before === null) return;
    const { start, end } = latest.current;
    const wasInside = before >= start && before <= end;
    const isInside = position >= start && position <= end;
    if (wasInside && !isInside) {
      setWindow((current) =>
        followWindow(current, { start: dayStart, end: dayEnd }, position),
      );
    }
  }, [position, dayStart, dayEnd]);
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    drag.current = { x: event.clientX, window, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    const rect = track.current?.getBoundingClientRect();
    if (!start || !rect) return;
    const dx = event.clientX - start.x;
    if (!start.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    start.moved = true;
    setWindow(panWindow(start.window, day, (-dx / rect.width) * length));
  };
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const wasDrag = drag.current?.moved;
    drag.current = null;
    if (!wasDrag) onSeek(timeAt(event.clientX));
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={isFull}
          onClick={() => zoomBy(ZOOM_STEP)}
        >
          <ZoomOutIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={isMin}
          onClick={() => zoomBy(1 / ZOOM_STEP)}
        >
          <ZoomInIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Show the whole day"
          title="Show the whole day"
          disabled={isFull}
          onClick={() => setWindow(day)}
        >
          <ArrowLeftRightIcon />
        </Button>
      </div>
      <button
        ref={track}
        type="button"
        aria-label="Seek recording timeline"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onClick={onClick}
        className="relative h-8 w-full cursor-pointer touch-none overflow-hidden border bg-muted"
      >
        {ranges.map((range) => {
          const clip = clipRange(range, window);
          return (
            clip && (
              <span
                key={range.from}
                className="absolute inset-y-0 min-w-px bg-chart-3"
                style={{ left: `${clip.left}%`, width: `${clip.width}%` }}
              />
            )
          );
        })}
        {position !== null &&
          position >= window.start &&
          position <= window.end && (
            <span
              className="absolute inset-y-0 w-0.5 bg-foreground"
              style={{ left: `${((position - window.start) / length) * 100}%` }}
            />
          )}
      </button>
      <div className="relative h-4">
        {ticksIn(window, dayStart, step).map((time) => {
          const fraction = (time - window.start) / length;
          return (
            <span
              key={time}
              className={cn(
                "absolute top-0 text-xs text-muted-foreground tabular-nums",
                labelShift(fraction),
              )}
              style={{ left: `${fraction * 100}%` }}
            >
              {tickLabel(time, dayEnd, step)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
