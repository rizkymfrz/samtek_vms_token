"use client";
import { CctvIcon, ClockIcon } from "lucide-react";
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
      className="aspect-square w-full"
    />
    <div className="flex min-w-0 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-1 text-xs font-medium">
        <CctvIcon className="size-3 shrink-0 text-muted-foreground" />
        <span className="truncate">{camera}</span>
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
        <ClockIcon className="size-3 shrink-0" />
        {formatSeenAt(row.seenAt)}
      </span>
      {row.label !== "person" && <Badge variant="outline">{row.label}</Badge>}
      <SearchScore row={row} />
    </div>
  </button>
);
