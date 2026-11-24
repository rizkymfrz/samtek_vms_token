export const ALERT_BARS = [
  "bg-alert-1",
  "bg-alert-2",
  "bg-alert-3",
  "bg-alert-4",
  "bg-alert-5",
  "bg-alert-6",
  "bg-alert-7",
  "bg-alert-8",
] as const;

export const toneByTitle = (titles: string[]) =>
  new Map(
    [...new Set(titles)]
      .sort()
      .map((title, index) => [title, ALERT_BARS[index % ALERT_BARS.length]]),
  );
