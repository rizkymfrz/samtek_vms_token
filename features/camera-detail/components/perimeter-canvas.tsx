"use client";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import {
  MAX_POLYGON_POINTS,
  MIN_POLYGON_POINTS,
  type Perimeters,
  type Point,
} from "@/lib/api/perimeters";
import { cn } from "@/lib/utils";
import type { Selection, Tool } from "../types";

const CLOSE_DISTANCE = 0.025;
const unit = (value: number) => Math.min(1, Math.max(0, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const toPoints = (points: Point[]) =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const percent = (value: number) => `${value * 100}%`;
const STROKE = "stroke-2 [vector-effect:non-scaling-stroke]";

const HALO =
  "stroke-[5px] stroke-background [vector-effect:non-scaling-stroke]";

const DRAFT = `${STROKE} animate-dash-flow stroke-chart-1 [filter:drop-shadow(0_0_3px_var(--chart-1))]`;

const DrawingLayer = ({
  perimeters,
  tool,
  selection,
  onSelect,
  onAddLine,
  onAddArea,
  onMovePoint,
}: {
  perimeters: Perimeters;
  tool: Tool;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onAddLine: (start: Point, end: Point) => void;
  onAddArea: (polygon: Point[]) => void;
  onMovePoint: (pointIndex: number, point: Point) => void;
}) => {
  const frame = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point | null>(null);
  const pointOf = (event: Pick<MouseEvent, "clientX" | "clientY">) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: unit((event.clientX - rect.left) / rect.width),
      y: unit((event.clientY - rect.top) / rect.height),
    };
  };
  const cancel = () => {
    setDraft([]);
    setCursor(null);
  };
  const finish = () => {
    if (draft.length >= MIN_POLYGON_POINTS) onAddArea(draft);
    cancel();
  };
  const place = (event: MouseEvent) => {
    const point = pointOf(event);
    if (!tool || !point) return;
    if (tool === "line") {
      const [start] = draft;
      if (!start) return setDraft([point]);
      if (distance(start, point) === 0) return;
      onAddLine(start, point);
      return cancel();
    }
    const [first] = draft;
    if (
      first &&
      draft.length >= MIN_POLYGON_POINTS &&
      distance(first, point) < CLOSE_DISTANCE
    ) {
      return finish();
    }
    if (draft.length < MAX_POLYGON_POINTS) setDraft([...draft, point]);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") cancel();
    if (event.key === "Enter" && tool === "polygon") finish();
  };
  const isDrawing = tool !== null;
  const handles: Point[] = (() => {
    if (isDrawing || !selection) return [];
    if (selection.kind === "area") {
      return perimeters.areas[selection.index]?.polygon ?? [];
    }
    const shape = perimeters.lines[selection.index]?.line;
    return shape
      ? [
          { x: shape.x1, y: shape.y1 },
          { x: shape.x2, y: shape.y2 },
        ]
      : [];
  })();
  const shapeEvents = (kind: "area" | "line", index: number) => ({
    onClick: (event: MouseEvent) => {
      if (isDrawing) return;
      event.stopPropagation();
      onSelect({ kind, index });
    },
  });
  const isSelected = (kind: "area" | "line", index: number) =>
    selection?.kind === kind && selection.index === index;
  return (
    <div
      ref={frame}
      role="group"
      aria-label="Perimeter drawing area"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="absolute inset-0 outline-none"
    >
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden
        className={cn(
          "absolute inset-0 size-full",
          isDrawing && "cursor-crosshair",
        )}
        onClick={(event) => {
          if (isDrawing) return place(event);
          onSelect(null);
        }}
        onMouseMove={(event) => isDrawing && setCursor(pointOf(event))}
        onMouseLeave={() => setCursor(null)}
      >
        {perimeters.areas.map((area, index) => (
          <polygon
            key={index}
            points={toPoints(area.polygon)}
            style={{ pointerEvents: isDrawing ? "none" : "auto" }}
            className={cn(
              STROKE,
              "cursor-pointer",
              isSelected("area", index)
                ? "fill-primary/25 stroke-primary"
                : "fill-chart-2/15 stroke-chart-2",
            )}
            {...shapeEvents("area", index)}
          />
        ))}
        {perimeters.lines.map((line, index) => (
          <g
            key={index}
            style={{ pointerEvents: isDrawing ? "none" : "auto" }}
            className="cursor-pointer"
            {...shapeEvents("line", index)}
          >
            <line
              {...line.line}
              className="stroke-transparent [stroke-width:12px] [vector-effect:non-scaling-stroke]"
            />
            <line
              {...line.line}
              className={cn(
                STROKE,
                isSelected("line", index) ? "stroke-primary" : "stroke-chart-2",
              )}
            />
          </g>
        ))}
        {tool === "polygon" && draft.length > 0 && (
          <>
            <polyline
              points={toPoints(cursor ? [...draft, cursor] : draft)}
              className={cn(HALO, "fill-none")}
            />
            <polyline
              points={toPoints(cursor ? [...draft, cursor] : draft)}
              className={cn(DRAFT, "fill-chart-1/10")}
              strokeDasharray="6 4"
            />
          </>
        )}
        {tool === "line" && draft[0] && cursor && (
          <>
            <line
              x1={draft[0].x}
              y1={draft[0].y}
              x2={cursor.x}
              y2={cursor.y}
              className={HALO}
            />
            <line
              x1={draft[0].x}
              y1={draft[0].y}
              x2={cursor.x}
              y2={cursor.y}
              className={DRAFT}
              strokeDasharray="6 4"
            />
          </>
        )}
      </svg>
      {[
        ...perimeters.areas.map((area, index) => ({
          key: `area-${index}`,
          name: area.name,
          at: area.polygon[0],
        })),
        ...perimeters.lines.map((line, index) => ({
          key: `line-${index}`,
          name: line.name,
          at: { x: line.line.x1, y: line.line.y1 },
        })),
      ].map(({ key, name, at }) => (
        <span
          key={key}
          style={{ left: percent(at.x), top: percent(at.y) }}
          className="pointer-events-none absolute max-w-1/2 -translate-y-full truncate rounded bg-background/70 px-1 text-xs"
        >
          {name}
        </span>
      ))}
      {handles.map((point, index) => (
        <span
          key={index}
          role="presentation"
          style={{ left: percent(point.x), top: percent(point.y) }}
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 cursor-move touch-none rounded-full border-2 border-primary bg-background"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const next = pointOf(event);
            if (next) onMovePoint(index, next);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
        />
      ))}
      {draft.map((point, index) => (
        <span
          key={index}
          style={{ left: percent(point.x), top: percent(point.y) }}
          className={cn(
            "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1 shadow-[0_0_8px_var(--chart-1)]",
            index === 0 ? "size-2" : "size-1",
          )}
        />
      ))}
    </div>
  );
};

export const PerimeterCanvas = ({
  children,
  ...props
}: {
  perimeters: Perimeters;
  tool: Tool;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onAddLine: (start: Point, end: Point) => void;
  onAddArea: (polygon: Point[]) => void;
  onMovePoint: (pointIndex: number, point: Point) => void;
  children: ReactNode;
}) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden border bg-sidebar">
      {children}
      <DrawingLayer key={props.tool ?? "select"} {...props} />
    </div>
  );
};
