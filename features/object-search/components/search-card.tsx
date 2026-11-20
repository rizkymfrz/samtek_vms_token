"use client";
import { Badge } from "@/components/ui/badge";
import { SearchCrop } from "./search-crop";
import { SearchScore } from "./search-score";
import { formatSeenAt } from "../lib/format-score";
import type { SearchRow } from "../types";

export const SearchCard = ({
  row,
  camera,
  onOpen,
}: {
  row: SearchRow;
  camera: string;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex min-w-0 flex-col gap-2 rounded border bg-card p-2 text-left transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
  >
    <SearchCrop
      edgeId={row.edgeId}
      resultId={row.resultId}
      hasCrop={row.hasCrop}
      className="w-full"
    />
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-xs font-medium">{camera}</span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatSeenAt(row.seenAt)}
      </span>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{row.label}</Badge>
        <SearchScore row={row} />
      </div>
    </div>
  </button>
);
