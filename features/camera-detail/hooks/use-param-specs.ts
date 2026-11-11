"use client";
import { type ParamSpec, useAnalyticCatalog } from "@/features/edge-status";
import { ANALYTIC_PARAM_SPECS } from "../lib/analytic-param-specs";

const RICH_KINDS = new Set<ParamSpec["kind"]>(["time", "range"]);

const withKnown = (announced: ParamSpec, known: ParamSpec[]): ParamSpec => {
  const match = known.find((spec) => spec.key === announced.key);
  if (!match) return announced;
  const kind = RICH_KINDS.has(match.kind) ? match.kind : announced.kind;
  const options =
    announced.kind === "list" && announced.options.length === 0
      ? match.options
      : announced.options;
  return { ...announced, kind, options };
};

export const useParamSpecs = (edgeId: string, analyticId: string | null) => {
  const catalog = useAnalyticCatalog(edgeId);
  if (!analyticId) return { specs: [] as ParamSpec[], isKnown: true };
  const announced =
    catalog.find((analytic) => analytic.id === analyticId)?.params ?? [];
  const known = ANALYTIC_PARAM_SPECS[analyticId];
  return {
    specs:
      announced.length > 0
        ? announced.map((spec) => withKnown(spec, known ?? []))
        : (known ?? []),
    isKnown: known !== undefined || catalog.length > 0,
  };
};
