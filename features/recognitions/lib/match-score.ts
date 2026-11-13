const MATCH_THRESHOLD = 0.35;
const STRONG_MATCH = 0.7;

export const matchPercent = (similarity: number) =>
  Math.round(
    Math.min(
      Math.max(
        (similarity - MATCH_THRESHOLD) / (STRONG_MATCH - MATCH_THRESHOLD),
        0,
      ),
      1,
    ) * 100,
  );
