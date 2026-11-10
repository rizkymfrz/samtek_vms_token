export type Level = "normal" | "warning" | "critical";

export const TEMP_LIMIT = 80;

export const tempLevel = (celsius: number): Level =>
  celsius >= TEMP_LIMIT ? "critical" : celsius >= 70 ? "warning" : "normal";

export const percentLevel = (percent: number): Level =>
  percent >= 90 ? "critical" : percent >= 80 ? "warning" : "normal";

export const LEVEL_LABEL: Record<Level, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
};

export const storageTotals = (storage: {
  recordings: number;
  analytics: number;
  system: number;
  free: number;
}) => {
  const used = storage.recordings + storage.analytics + storage.system;
  const total = used + storage.free;
  return {
    used,
    total,
    percent: total === 0 ? 0 : Math.round((used / total) * 100),
  };
};
