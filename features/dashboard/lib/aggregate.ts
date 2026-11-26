import type { BarItem } from "../types";

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
