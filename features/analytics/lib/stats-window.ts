import type { DateRange } from "react-day-picker";

const MAX_OFFSET_MINUTES = 840;
const MIN_OFFSET_MINUTES = -720;

const dayStart = (date: Date, offsetDays = 0) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + offsetDays,
  ).getTime();

export const statsWindow = (range: DateRange | undefined, now: number) => {
  const from = range?.from ?? new Date(now);
  const since = dayStart(from);
  const end = dayStart(range?.to ?? from, 1);
  return { since, until: end > now ? null : end };
};

export const windowKey = (range: DateRange | undefined) =>
  range?.from
    ? `${dayStart(range.from)}:${dayStart(range.to ?? range.from)}`
    : "today";

export const browserOffsetMinutes = () =>
  Math.min(
    MAX_OFFSET_MINUTES,
    Math.max(MIN_OFFSET_MINUTES, -new Date().getTimezoneOffset()),
  );
