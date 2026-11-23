import { cn } from "@/lib/utils";
import { toneOf } from "../lib/detection-status";
import type { DetectionObject } from "../types";

const MIN_CONFIDENCE = 0.3;

const LIMBS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
] as const;

export const PoseSkeleton = ({
  object,
  analyticId,
}: {
  object: DetectionObject;
  analyticId: string | null | undefined;
}) => {
  const points = object.keypoints;
  if (!points) return null;
  const shown = points.map(([x, y, confidence]) =>
    confidence >= MIN_CONFIDENCE ? { x, y } : null,
  );
  return (
    <div
      className={cn("absolute inset-0", toneOf(object, analyticId))}
      aria-hidden
    >
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        {LIMBS.map(([from, to]) => {
          const a = shown[from];
          const b = shown[to];
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {shown.map((point, index) =>
        point ? (
          <span
            key={index}
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
};
