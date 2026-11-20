"use client";
import {
  CctvIcon,
  ClockIcon,
  ListIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { useDeviceList } from "@/features/cameras";
import { useAllSearchIndex } from "@/features/edge-status";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { SearchCard } from "./search-card";
import { SearchDialog, type SearchTarget } from "./search-dialog";
import { useObjectSearch } from "../hooks/use-object-search";
import {
  ALL,
  DEFAULT_FILTERS,
  type Filters,
  LIMIT_ITEMS,
  RANGES,
  type Submitted,
} from "../lib/filters";
import {
  MAX_LABEL_LENGTH,
  MAX_QUERY_LENGTH,
  SearchInputError,
} from "../lib/validate-search";

const GRID = "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6";

const SearchSkeleton = () => (
  <div className="flex flex-col gap-4">
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Spinner />
      Searching. The first search after the edge starts can take a minute while
      the text model loads.
    </p>
    <div className={GRID}>
      {Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="aspect-[1/2]" />
      ))}
    </div>
  </div>
);

export const ObjectSearchView = () => {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [minConfidence, setMinConfidence] = useState(0);
  const [target, setTarget] = useState<SearchTarget | null>(null);
  const { data: devices } = useDeviceList();
  const search = useObjectSearch(submitted);
  const searchIndex = useAllSearchIndex();
  const retentionDays = [...searchIndex.values()]
    .filter((edge) => edge.isAvailable && edge.retentionDays !== null)
    .map((edge) => edge.retentionDays as number);
  const retention =
    retentionDays.length > 0 ? Math.min(...retentionDays) : null;
  const data = search.data;
  useFailureToast(
    "Some edge servers did not respond",
    (data?.failures ?? []).map(
      (failure) => `${failure.edgeName}: ${failure.message}`,
    ),
  );
  const cameras = useMemo(
    () =>
      new Map(
        (devices?.cameras ?? []).map((camera) => [
          `${camera.edgeServerId}:${camera.id}`,
          camera,
        ]),
      ),
    [devices],
  );
  const cameraItems = [
    { value: ALL, label: "All cameras" },
    ...[...cameras].map(([value, camera]) => ({ value, label: camera.name })),
  ];
  const submit = (next: Filters, text = q) => {
    const trimmed = text.trim();
    setFilters(next);
    if (trimmed === "") return;
    setSubmitted((previous) => ({
      q: trimmed,
      filters: next,
      nonce: (previous?.nonce ?? 0) + 1,
    }));
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(filters);
  };
  const change = (patch: Partial<Filters>) => submit({ ...filters, ...patch });
  const rows = (data?.rows ?? []).filter(
    (row) => row.confidence === null || row.confidence * 100 >= minConfidence,
  );
  const hasConfidence = (data?.rows ?? []).some(
    (row) => row.confidence !== null,
  );
  const hiddenCount = (data?.rows.length ?? 0) - rows.length;
  const error = search.error;
  const inputError = error instanceof SearchInputError ? error : null;
  const isUnavailable =
    data !== undefined &&
    data.edgeCount > 0 &&
    data.unavailable.length === data.edgeCount;
  const openRow = (row: (typeof rows)[number]) => {
    const camera = cameras.get(`${row.edgeId}:${row.deviceId}`);
    setTarget({
      row,
      camera: camera?.name ?? row.deviceId,
      stream: camera?.sourceSub ? "sub" : "main",
      analyticId: camera?.analyticId ?? null,
    });
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex max-w-3xl gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              maxLength={MAX_QUERY_LENGTH}
              placeholder="Describe an object, e.g. a man in a red shirt"
              aria-label="Search text"
              aria-invalid={inputError?.field === "q" || undefined}
            />
            {inputError?.field === "q" && (
              <span role="alert" className="text-xs text-destructive">
                {inputError.message}
              </span>
            )}
          </div>
          <Button type="submit" variant="secondary" disabled={q.trim() === ""}>
            <SearchIcon />
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Pick
            label="Camera"
            icon={CctvIcon}
            items={cameraItems}
            value={filters.camera}
            onChange={(camera) => change({ camera })}
            className="w-48"
          />
          <Pick
            label="Time range"
            icon={ClockIcon}
            items={RANGES}
            value={filters.range}
            onChange={(range) => change({ range })}
            className="w-44"
          />
          <Pick
            label="Result limit"
            icon={ListIcon}
            items={LIMIT_ITEMS}
            value={filters.limit}
            onChange={(limit) => change({ limit })}
            className="w-44"
          />
          <div className="flex flex-col gap-1">
            <Input
              value={filters.label}
              onChange={(event) =>
                setFilters({ ...filters, label: event.target.value })
              }
              maxLength={MAX_LABEL_LENGTH}
              placeholder="Label, e.g. person"
              aria-label="Label"
              aria-invalid={inputError?.field === "label" || undefined}
              className="w-44"
            />
            {inputError?.field === "label" && (
              <span role="alert" className="text-xs text-destructive">
                {inputError.message}
              </span>
            )}
          </div>
          {hasConfidence && (
            <div className="flex h-10 w-56 items-center gap-4 rounded border px-4">
              <TagIcon className="size-4 shrink-0 text-muted-foreground" />
              <Slider
                aria-label="Minimum person confidence"
                value={[minConfidence]}
                onValueChange={(value) =>
                  setMinConfidence(Array.isArray(value) ? value[0] : value)
                }
                min={0}
                max={100}
                step={5}
              />
              <span className="w-10 text-right text-xs tabular-nums">
                {minConfidence}%
              </span>
            </div>
          )}
        </div>
        {retention !== null && (
          <p className="text-xs text-muted-foreground">
            Search covers the last {retention} days.
          </p>
        )}
      </form>
      {search.isPending && submitted !== null ? (
        <SearchSkeleton />
      ) : submitted === null ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Search objects by text"
          description="Describe what you are looking for. Only cameras with the search index turned on have results, and only objects seen for at least 10 frames are indexed."
        />
      ) : inputError &&
        inputError.field !== "q" &&
        inputError.field !== "label" ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Invalid search"
          description={inputError.message}
        />
      ) : error && !inputError ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Search failed"
          description="The search request failed. Try again."
        >
          <Button variant="secondary" onClick={() => void search.refetch()}>
            Try again
          </Button>
        </EmptyState>
      ) : isUnavailable ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Search is not available on this edge"
          description="The text model is missing or failed to load, or the edge does not run on Linux."
        />
      ) : data && rows.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title={
            hiddenCount > 0
              ? "All results are below the threshold"
              : "No results"
          }
          description={
            hiddenCount > 0
              ? `${hiddenCount} results are hidden by the minimum confidence.`
              : "Only objects from cameras with the search index turned on are searchable, and only after they were seen for at least 10 frames. Indexed data is removed after the retention period (7 days by default)."
          }
        />
      ) : data ? (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            {rows.length} results, one per track. The same person can appear as
            several results.
            {hiddenCount > 0 && ` ${hiddenCount} hidden by the threshold.`}
            {search.isFetching && " Updating…"}
          </p>
          <div className={GRID}>
            {rows.map((row) => (
              <SearchCard
                key={row.id}
                row={row}
                camera={
                  cameras.get(`${row.edgeId}:${row.deviceId}`)?.name ??
                  row.deviceId
                }
                onOpen={() => openRow(row)}
              />
            ))}
          </div>
        </div>
      ) : null}
      <SearchDialog
        target={target}
        relays={data?.relays ?? {}}
        onClose={() => setTarget(null)}
      />
    </div>
  );
};
