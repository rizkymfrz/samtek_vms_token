import { formatDateTime } from "@/lib/format-date";

export const formatSeenAt = (at: number) => formatDateTime(at);
export const formatSimilarity = (similarity: number) => similarity.toFixed(3);

export const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;
