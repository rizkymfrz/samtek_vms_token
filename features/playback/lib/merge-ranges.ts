import type { RecordingRange } from "@/features/edge-status";

export const mergeRanges = (all: RecordingRange[][]): RecordingRange[] => {
  const sorted = all.flat().toSorted((a, b) => a.from - b.from);
  const merged: RecordingRange[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range.from <= last.to) {
      merged[merged.length - 1] = {
        from: last.from,
        to: Math.max(last.to, range.to),
      };
    } else {
      merged.push(range);
    }
  }
  return merged;
};

export const isCovered = (ranges: RecordingRange[], time: number) =>
  ranges.some((range) => time >= range.from && time < range.to);
