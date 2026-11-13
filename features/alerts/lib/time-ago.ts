const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const timeAgo = (at: number, now: number) => {
  const elapsed = Math.max(0, now - at);
  if (elapsed < MINUTE_MS) return "now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < 24 * HOUR_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  return `${Math.floor(elapsed / (24 * HOUR_MS))}d ago`;
};
