import { titleCase } from "./format";
import type { BarItem } from "../types";

export const countBy = <T>(
  items: T[],
  key: (item: T) => string,
  limit?: number,
  label: (value: string) => string = titleCase,
): BarItem[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = key(item);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({
      label: label(name),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const withOther = (
  items: BarItem[],
  max: number,
  noun: string,
): BarItem[] => {
  if (items.length <= max + 1) return items;
  const rest = items.slice(max);
  return [
    ...items.slice(0, max),
    {
      label: `Other (${rest.length} ${noun})`,
      value: rest.reduce((sum, item) => sum + item.value, 0),
    },
  ];
};
