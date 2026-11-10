export const GRID_COLUMNS = 12;

type Sized = { span: number };

export const packRows = <T extends Sized>(
  items: T[],
): (T & { cols: number })[][] => {
  const count = items.length;
  if (count === 0) return [];
  const best = Array<number>(count + 1).fill(Infinity);
  const from = Array<number>(count + 1).fill(0);
  best[0] = 0;
  for (let end = 1; end <= count; end++) {
    let used = 0;
    for (let start = end - 1; start >= 0; start--) {
      used += items[start].span;
      if (used > GRID_COLUMNS) break;
      // Squared leftover punishes one very short row; +1 prefers fewer rows on ties.
      const cost = best[start] + (GRID_COLUMNS - used) ** 2 + 1;
      if (cost < best[end]) {
        best[end] = cost;
        from[end] = start;
      }
    }
  }
  const rows: T[][] = [];
  for (let end = count; end > 0; end = from[end])
    rows.unshift(items.slice(from[end], end));
  return rows.map((row) => {
    const cols = row.map((item) => item.span);
    let leftover = GRID_COLUMNS - cols.reduce((sum, span) => sum + span, 0);
    for (
      let index = 0;
      leftover > 0;
      index = (index + 1) % cols.length, leftover--
    )
      cols[index] += 1;
    return row.map((item, index) => ({ ...item, cols: cols[index] }));
  });
};

const XL_SPAN: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
};

export const spanClass = (cols: number) => {
  return `${cols >= 5 ? "md:col-span-2 " : ""}${XL_SPAN[cols]}`;
};
