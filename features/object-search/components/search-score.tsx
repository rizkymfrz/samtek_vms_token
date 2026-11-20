import { Badge } from "@/components/ui/badge";
import { formatConfidence, formatSimilarity } from "../lib/format-score";
import type { SearchRow } from "../types";

export const SearchScore = ({ row }: { row: SearchRow }) =>
  row.confidence === null ? (
    <span
      className="text-xs text-muted-foreground tabular-nums"
      title="Raw text-image similarity. Around 0.15 is a good match."
    >
      sim {formatSimilarity(row.similarity)}
    </span>
  ) : (
    <Badge title={`Similarity ${formatSimilarity(row.similarity)}`}>
      {formatConfidence(row.confidence)}
    </Badge>
  );
