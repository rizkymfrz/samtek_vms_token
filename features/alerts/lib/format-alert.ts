export { formatDayMonth as formatDate, formatTime } from "@/lib/format-date";

export const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());
