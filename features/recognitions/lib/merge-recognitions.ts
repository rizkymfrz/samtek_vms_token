import type { RecognitionRow, RecognitionsData } from "../types";

export const addRecognition = (
  previous: RecognitionsData,
  row: RecognitionRow,
  since: number,
): RecognitionsData => {
  if (row.at < since || previous.rows.some((item) => item.id === row.id)) {
    return previous;
  }
  const rows = [row, ...previous.rows].sort(
    (a, b) => b.at - a.at || b.id.localeCompare(a.id),
  );
  return { ...previous, rows };
};
