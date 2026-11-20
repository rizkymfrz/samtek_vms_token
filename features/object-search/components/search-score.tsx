import { ScanSearchIcon } from "lucide-react";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { formatConfidence, formatSimilarity } from "../lib/format-score";
import type { SearchRow } from "../types";

export const SearchScore = ({ row }: { row: SearchRow }) =>
  row.confidence === null ? (
    <span
      className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums"
      title="Raw text-image similarity. Around 0.15 is a good match."
    >
      <ScanSearchIcon className="size-3 shrink-0" />
      sim {formatSimilarity(row.similarity)}
    </span>
  ) : (
    <Progress
      value={Math.round(row.confidence * 100)}
      variant="segmented"
      segments={10}
      aria-label="Match confidence"
      title={`Similarity ${formatSimilarity(row.similarity)}`}
      className="flex-nowrap items-center gap-2"
    >
      <ProgressValue className="ml-0 w-9 text-xs text-foreground">
        {() => formatConfidence(row.confidence ?? 0)}
      </ProgressValue>
    </Progress>
  );
