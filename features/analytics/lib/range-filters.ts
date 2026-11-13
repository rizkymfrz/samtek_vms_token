import type { DateRange } from "react-day-picker";
import {
  CUSTOM_RANGE,
  DEFAULT_FILTERS,
  type Filters,
  toDateKey,
} from "@/features/alerts";

export const rangeFilters = (range: DateRange | undefined): Filters =>
  range?.from
    ? {
        ...DEFAULT_FILTERS,
        range: CUSTOM_RANGE,
        from: toDateKey(range.from),
        to: toDateKey(range.to ?? range.from),
      }
    : DEFAULT_FILTERS;
