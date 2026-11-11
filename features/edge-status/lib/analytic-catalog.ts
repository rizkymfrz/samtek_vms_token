import type { ParamValue } from "@/lib/api/analytic-params";
import type { AnnouncedAnalytic } from "../schemas/edge-message";
import type { AnalyticDescriptor, ParamKind, ParamSpec } from "../types";

type Announced = NonNullable<
  NonNullable<AnnouncedAnalytic["params_schema"]>["properties"]
>[string];

const kindOf = (spec: Announced): ParamKind => {
  switch (spec.type) {
    case "boolean":
      return "boolean";
    case "integer":
      return "integer";
    case "number":
      return "number";
    case "array":
      return "list";
    default:
      if (spec.enum?.length) return "choice";
      if (spec.format === "date") return "date";
      if (spec.format === "date-time") return "datetime";
      return "text";
  }
};

const fallbackOf = (value: unknown): ParamValue | null => {
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }
  return null;
};

const toSpec = (key: string, spec: Announced): ParamSpec => ({
  key,
  kind: kindOf(spec),
  options: spec.enum ?? spec.items?.enum ?? [],
  min: spec.minimum ?? null,
  max: spec.maximum ?? null,
  fallback: fallbackOf(spec.default),
});

export const toDescriptors = (
  analytics: AnnouncedAnalytic[],
): AnalyticDescriptor[] =>
  analytics.map((analytic) => ({
    id: analytic.id,
    name: analytic.name,
    params: Object.entries(analytic.params_schema?.properties ?? {}).map(
      ([key, spec]) => toSpec(key, spec),
    ),
  }));
