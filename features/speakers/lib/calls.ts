export const CALL_STATUS = {
  success: { label: "Played", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  throttled: { label: "Throttled", variant: "secondary" },
  skipped: { label: "Skipped", variant: "outline" },
  skipped_schedule: { label: "Outside schedule", variant: "outline" },
  skipped_busy: { label: "Busy", variant: "outline" },
} as const;

type CallStatus = keyof typeof CALL_STATUS;

export const statusOf = (status: string) =>
  CALL_STATUS[status as CallStatus] ?? {
    label: status.replaceAll("_", " "),
    variant: "outline" as const,
  };

export const SOURCE_LABEL: Record<string, string> = {
  alarm: "Alarm",
  manual_test: "Manual test",
};

export const reasonText = (reason: string | null) =>
  reason ? reason.replaceAll("_", " ") : "—";

export const durationText = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
