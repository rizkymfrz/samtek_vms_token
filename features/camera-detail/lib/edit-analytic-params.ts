import type { ParamSpec } from "@/features/edge-status";
import type { AnalyticParams, ParamValue } from "@/lib/api/analytic-params";

export const paramLabel = (key: string) =>
  key.replace(/[-_]/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export const paramError = (
  spec: ParamSpec,
  value: ParamValue | undefined,
): string | null => {
  if (typeof value !== "number") return null;
  if (spec.kind === "integer" && !Number.isInteger(value)) {
    return "Use a whole number.";
  }
  if (spec.min !== null && value < spec.min) return `At least ${spec.min}.`;
  if (spec.max !== null && value > spec.max) return `At most ${spec.max}.`;
  return null;
};

export const isValidParams = (specs: ParamSpec[], params: AnalyticParams) =>
  specs.every((spec) => paramError(spec, params[spec.key]) === null);

export const setParam = (
  params: AnalyticParams,
  key: string,
  value: ParamValue | undefined,
): AnalyticParams => {
  const rest = Object.fromEntries(
    Object.entries(params).filter(([name]) => name !== key),
  );
  return value === undefined ? rest : { ...rest, [key]: value };
};

export const isSameParams = (a: AnalyticParams, b: AnalyticParams) =>
  JSON.stringify(Object.entries(a).sort(([x], [y]) => x.localeCompare(y))) ===
  JSON.stringify(Object.entries(b).sort(([x], [y]) => x.localeCompare(y)));
