"use client";
import { ScanSearchIcon, SearchIcon } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDeviceList } from "@/features/cameras";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { SearchCard } from "./search-card";
import { SearchDialog, type SearchTarget } from "./search-dialog";
import { useObjectSearch } from "../hooks/use-object-search";
import type { Submitted } from "../lib/filters";
import { MAX_QUERY_LENGTH, SearchInputError } from "../lib/validate-search";

const MIN_CONFIDENCE = 20;
const GRID = "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6";

const SearchSkeleton = () => (
  <div className="flex flex-col gap-4">
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Spinner />
      Searching. The first search after Edge starts can take a minute while the
      text model loads.
    </p>
    <div className={GRID}>
      {Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="aspect-square" />
      ))}
    </div>
  </div>
);

export const ObjectSearchView = () => {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [target, setTarget] = useState<SearchTarget | null>(null);
  const { data: devices } = useDeviceList();
  const search = useObjectSearch(submitted);
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
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = q.trim();
    if (text === "") return;
    setSubmitted((previous) => ({
      q: text,
      nonce: (previous?.nonce ?? 0) + 1,
    }));
  };
  const rows = (data?.rows ?? []).filter(
    (row) => row.confidence === null || row.confidence * 100 >= MIN_CONFIDENCE,
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
  const form = (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Describe an object, e.g. a man in a red shirt"
            aria-label="Search text"
            autoComplete="off"
            aria-invalid={inputError?.field === "q" || undefined}
          />
          {inputError?.field === "q" && (
            <span role="alert" className="text-xs text-destructive">
              {inputError.message}
            </span>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          aria-label="Search"
          disabled={q.trim() === ""}
        >
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
  if (submitted === null) {
    return (
      <div className="flex min-h-full min-w-0 flex-1 flex-col items-center justify-center gap-8 p-4 lg:h-[calc(100svh-var(--header-height))]">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded bg-primary text-primary-foreground">
            <ScanSearchIcon className="size-4" />
          </span>
          <h1 className="text-lg font-medium">Search objects by text</h1>
          <p className="text-xs text-muted-foreground">
            Describe what you are looking for.
          </p>
        </div>
        <div className="w-full max-w-2xl">{form}</div>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <div className="mx-auto w-full max-w-3xl">{form}</div>
      {search.isPending ? (
        <SearchSkeleton />
      ) : inputError && inputError.field !== "q" ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Invalid search"
          description={inputError.message}
        />
      ) : error && !inputError ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Failed to search objects"
          description="The search could not be completed. Try again."
        >
          <Button variant="secondary" onClick={() => void search.refetch()}>
            Try again
          </Button>
        </EmptyState>
      ) : isUnavailable ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Search is not available on this edge server"
          description="The text model is missing or failed to load, or the edge server does not run on Linux."
        />
      ) : data && rows.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title={
            hiddenCount > 0
              ? `All results are below ${MIN_CONFIDENCE}% confidence`
              : "No results"
          }
          description={
            hiddenCount > 0
              ? `${hiddenCount} person results are hidden below ${MIN_CONFIDENCE}% confidence.`
              : "Only cameras with the search index on are searched. Data is kept for 7 days by default."
          }
        />
      ) : data ? (
        <div className="flex flex-col gap-4">
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
