"use client";
import { ScanSearchIcon } from "lucide-react";
import { useId } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { MultiSelect } from "@/components/shared/multi-select";
import { ToggleCard } from "@/components/shared/toggle-card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type ParamSpec,
  type SearchIndexStatus,
  useAnalyticCatalog,
  useEdgeSearchIndex,
} from "@/features/edge-status";
import {
  MAX_SEARCH_INTERVAL,
  MIN_SEARCH_INTERVAL,
} from "@/lib/api/search-index";
import type { DetailDraft } from "../lib/detail-draft";
import type { CameraDetail } from "../types";

const STATUS: Record<
  SearchIndexStatus["status"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  disabled: { label: "Off", variant: "outline" },
  starting: { label: "Starting", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  unavailable: { label: "Unavailable", variant: "destructive" },
};

const labelOptions = (
  specs: ParamSpec[],
  params: DetailDraft["analyticParams"],
) => {
  const watched = params.labels;
  if (Array.isArray(watched) && watched.length > 0) return watched;
  const spec = specs.find((candidate) => candidate.key === "labels");
  if (spec && Array.isArray(spec.fallback) && spec.fallback.length > 0)
    return spec.fallback;
  return spec?.options ?? [];
};

const hint = (retentionDays: number | null) => {
  const base =
    "Find this camera's objects by text. Changing this restarts analysis.";
  return retentionDays === null
    ? base
    : `${base} Kept for ${retentionDays} ${retentionDays === 1 ? "day" : "days"}.`;
};

export const SearchIndexFields = ({
  detail,
  form,
  specs,
}: {
  detail: CameraDetail;
  form: UseFormReturn<DetailDraft>;
  specs: ParamSpec[];
}) => {
  const formId = useId();
  const { control } = form;
  const analyticId = useWatch({ control, name: "analyticId" });
  const params = useWatch({ control, name: "analyticParams" });
  const config = useWatch({ control, name: "searchIndex" });
  const edge = useEdgeSearchIndex(detail.edgeServerId);
  const catalog = useAnalyticCatalog(detail.edgeServerId);
  const isSupported =
    detail.searchIndex !== undefined &&
    edge?.isAvailable === true &&
    catalog.find((analytic) => analytic.id === analyticId)
      ?.supportsSearchIndex === true;
  if (!isSupported) return null;
  const status = edge?.devices.get(detail.id);
  const applyError =
    detail.applyError?.field?.startsWith("search_index") === true
      ? detail.applyError.message
      : null;
  const labelsError = form.formState.errors.searchIndex?.labels?.message;
  const intervalError =
    form.formState.errors.searchIndex?.intervalSeconds === undefined
      ? null
      : `Enter a whole number from ${MIN_SEARCH_INTERVAL} to ${MAX_SEARCH_INTERVAL}.`;
  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="searchIndex.isEnabled"
        render={({ field }) => (
          <ToggleCard
            id={`${formId}-search`}
            icon={<ScanSearchIcon />}
            label="Object search"
            description={hint(edge?.retentionDays ?? null)}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      {status && status.status !== "active" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Index status
          <Badge variant={STATUS[status.status].variant}>
            {STATUS[status.status].label}
          </Badge>
          {status.status === "unavailable" && status.detail && (
            <span title={status.detail}>{status.detail}</span>
          )}
        </div>
      )}
      {applyError && (
        <span role="alert" className="text-xs text-destructive">
          {applyError}
        </span>
      )}
      {config.isEnabled && (
        <>
          <Field data-invalid={!!labelsError}>
            <FieldLabel>Labels to index</FieldLabel>
            <Controller
              control={control}
              name="searchIndex.labels"
              render={({ field }) => (
                <MultiSelect
                  options={labelOptions(specs, params)}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Add label…"
                />
              )}
            />
            {labelsError && <FieldError>{labelsError}</FieldError>}
          </Field>
          <Field data-invalid={!!intervalError}>
            <FieldLabel htmlFor={`${formId}-interval`}>
              Seconds between indexing
            </FieldLabel>
            <Controller
              control={control}
              name="searchIndex.intervalSeconds"
              render={({ field }) => (
                <Input
                  id={`${formId}-interval`}
                  type="number"
                  min={MIN_SEARCH_INTERVAL}
                  max={MAX_SEARCH_INTERVAL}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  aria-invalid={!!intervalError}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber)
                  }
                />
              )}
            />
            {intervalError && <FieldError>{intervalError}</FieldError>}
          </Field>
        </>
      )}
    </div>
  );
};
