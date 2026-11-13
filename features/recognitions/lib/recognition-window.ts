import type { DateRange } from "react-day-picker";

const HOUR_MS = 3_600_000;
export const DEFAULT_HOURS = 168;

const dayStart = (date: Date, offsetDays = 0) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + offsetDays,
  ).getTime();

export const recognitionWindow = (
  range: DateRange | undefined,
  now: number,
) => {
  if (!range?.from)
    return { since: now - DEFAULT_HOURS * HOUR_MS, until: null };
  const since = dayStart(range.from);
  const end = dayStart(range.to ?? range.from, 1);
  return { since, until: end > now ? null : end };
};

export const windowKey = (range: DateRange | undefined) =>
  range?.from
    ? `custom:${dayStart(range.from)}:${dayStart(range.to ?? range.from)}`
    : `last:${DEFAULT_HOURS}`;
