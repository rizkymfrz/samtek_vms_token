import {
  type AreaShape,
  type LineShape,
  MAX_AREAS,
  MAX_LINES,
  type Perimeters,
  perimetersSchema,
  type Point,
} from "@/lib/api/perimeters";
import type { Selection } from "../types";

export const emptyPerimeters = (): Perimeters => ({ areas: [], lines: [] });

const nextName = (prefix: string, taken: string[]) => {
  let count = taken.length + 1;
  while (taken.includes(`${prefix} ${count}`)) count += 1;
  return `${prefix} ${count}`;
};

export const canAddLine = (perimeters: Perimeters) =>
  perimeters.lines.length < MAX_LINES;

export const canAddArea = (perimeters: Perimeters) =>
  perimeters.areas.length < MAX_AREAS;

export const addLine = (
  perimeters: Perimeters,
  start: Point,
  end: Point,
): Perimeters => ({
  ...perimeters,
  lines: [
    ...perimeters.lines,
    {
      name: nextName(
        "Line",
        perimeters.lines.map((line) => line.name),
      ),
      line: { x1: start.x, y1: start.y, x2: end.x, y2: end.y },
      direction_a_name: "Direction A",
      direction_b_name: "Direction B",
    },
  ],
});

export const addArea = (
  perimeters: Perimeters,
  polygon: Point[],
): Perimeters => ({
  ...perimeters,
  areas: [
    ...perimeters.areas,
    {
      name: nextName(
        "Area",
        perimeters.areas.map((area) => area.name),
      ),
      polygon,
    },
  ],
});

export const updateLine = (
  perimeters: Perimeters,
  index: number,
  patch: Partial<LineShape>,
): Perimeters => ({
  ...perimeters,
  lines: perimeters.lines.map((line, i) =>
    i === index ? { ...line, ...patch } : line,
  ),
});

export const updateArea = (
  perimeters: Perimeters,
  index: number,
  patch: Partial<AreaShape>,
): Perimeters => ({
  ...perimeters,
  areas: perimeters.areas.map((area, i) =>
    i === index ? { ...area, ...patch } : area,
  ),
});

export const movePoint = (
  perimeters: Perimeters,
  { kind, index }: NonNullable<Selection>,
  pointIndex: number,
  point: Point,
): Perimeters => {
  if (kind === "area") {
    return {
      ...perimeters,
      areas: perimeters.areas.map((area, i) =>
        i === index
          ? {
              ...area,
              polygon: area.polygon.map((p, j) =>
                j === pointIndex ? point : p,
              ),
            }
          : area,
      ),
    };
  }
  return {
    ...perimeters,
    lines: perimeters.lines.map((shape, i) =>
      i === index
        ? {
            ...shape,
            line:
              pointIndex === 0
                ? { ...shape.line, x1: point.x, y1: point.y }
                : { ...shape.line, x2: point.x, y2: point.y },
          }
        : shape,
    ),
  };
};

export const removeShape = (
  perimeters: Perimeters,
  { kind, index }: NonNullable<Selection>,
): Perimeters =>
  kind === "line"
    ? { ...perimeters, lines: perimeters.lines.filter((_, i) => i !== index) }
    : { ...perimeters, areas: perimeters.areas.filter((_, i) => i !== index) };

export const isSamePerimeters = (a: Perimeters, b: Perimeters) =>
  JSON.stringify(a) === JSON.stringify(b);

export const hasDuplicateNames = (perimeters: Perimeters) => {
  const names = [...perimeters.areas, ...perimeters.lines].map((shape) =>
    shape.name.trim().toLowerCase(),
  );
  return new Set(names).size !== names.length;
};

export const isValidPerimeters = (perimeters: Perimeters) =>
  perimetersSchema.safeParse(perimeters).success &&
  !hasDuplicateNames(perimeters);
