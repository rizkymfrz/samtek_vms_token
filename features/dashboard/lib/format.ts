export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
const TIME_ZONE = "Asia/Jakarta";

export const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export const clockSeconds = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export const titleCase = (value: string): string =>
  value.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export const plainLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const delta = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);

export const duration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60
    ? `${minutes}m ${seconds % 60}s`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
