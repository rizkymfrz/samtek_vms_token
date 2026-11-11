import { z } from "zod";

export const paramValueSchema = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
]);

export const analyticParamsSchema = z.record(z.string(), paramValueSchema);

export type ParamValue = z.output<typeof paramValueSchema>;
export type AnalyticParams = z.output<typeof analyticParamsSchema>;
