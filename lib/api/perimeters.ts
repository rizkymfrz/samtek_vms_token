import { z } from "zod";

const unit = z.number().min(0).max(1);
export const MAX_AREAS = 32;
export const MAX_LINES = 32;
export const MIN_POLYGON_POINTS = 3;
export const MAX_POLYGON_POINTS = 256;
const pointSchema = z.object({ x: unit, y: unit });

export const areaSchema = z.object({
  name: z.string().trim().min(1),
  polygon: z.array(pointSchema).min(MIN_POLYGON_POINTS).max(MAX_POLYGON_POINTS),
  max_stay_seconds: z.number().int().min(1).optional(),
});

export const lineSchema = z.object({
  name: z.string().trim().min(1),
  line: z
    .object({ x1: unit, y1: unit, x2: unit, y2: unit })
    .refine(({ x1, y1, x2, y2 }) => x1 !== x2 || y1 !== y2),
  direction_a_name: z.string().trim().min(1),
  direction_b_name: z.string().trim().min(1),
});

export const perimetersSchema = z.object({
  areas: z.array(areaSchema).max(MAX_AREAS).default([]),
  lines: z.array(lineSchema).max(MAX_LINES).default([]),
});

export type Point = z.output<typeof pointSchema>;
export type AreaShape = z.output<typeof areaSchema>;
export type LineShape = z.output<typeof lineSchema>;
export type Perimeters = z.output<typeof perimetersSchema>;
