import { format } from "date-fns";

export const formatSeenAt = (at: number) => format(at, "dd MMM yyyy HH:mm:ss");
export const formatSimilarity = (similarity: number) => similarity.toFixed(3);

export const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;
