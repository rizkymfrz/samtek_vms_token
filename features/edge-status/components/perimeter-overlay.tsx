import type { Perimeters, Point } from "@/lib/api/perimeters";

const STROKE = "stroke-2 [vector-effect:non-scaling-stroke]";

const HALO =
  "stroke-[5px] stroke-background [vector-effect:non-scaling-stroke]";

const SHAPE_COLORS = [
  { stroke: "stroke-detect-red", fill: "fill-detect-red/15" },
  { stroke: "stroke-detect-green", fill: "fill-detect-green/15" },
  { stroke: "stroke-detect-blue", fill: "fill-detect-blue/15" },
] as const;

const colorOf = (index: number) => SHAPE_COLORS[index % SHAPE_COLORS.length];

const toPoints = (points: Point[]) =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const percent = (value: number) => `${value * 100}%`;

export const hasPerimeters = (perimeters: Perimeters | null | undefined) =>
  perimeters !== null &&
  perimeters !== undefined &&
  perimeters.areas.length + perimeters.lines.length > 0;

export const PerimeterOverlay = ({
  perimeters,
}: {
  perimeters: Perimeters;
}) => {
  const labels = [
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
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 size-full"
      >
        {perimeters.areas.map((area, index) => {
          const color = colorOf(index);
          return (
            <polygon
              key={index}
              points={toPoints(area.polygon)}
              className={`${STROKE} ${color.fill} ${color.stroke}`}
            />
          );
        })}
        {perimeters.lines.map((line, index) => (
          <g key={index}>
            <line {...line.line} className={HALO} />
            <line
              {...line.line}
              className={`${STROKE} ${colorOf(perimeters.areas.length + index).stroke}`}
            />
          </g>
        ))}
      </svg>
      {labels.map(({ key, name, at }) => (
        <span
          key={key}
          style={{ left: percent(at.x), top: percent(at.y) }}
          className="absolute max-w-1/2 -translate-y-full truncate rounded bg-background/70 px-1 text-xs"
        >
          {name}
        </span>
      ))}
    </div>
  );
};
