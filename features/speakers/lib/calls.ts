export const CALL_STATUS = {
  success: { label: "Played", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  throttled: { label: "Throttled", variant: "secondary" },
  skipped: { label: "Skipped", variant: "outline" },
  skipped_schedule: { label: "Outside schedule", variant: "outline" },
  skipped_busy: { label: "Busy", variant: "outline" },
} as const;

type CallStatus = keyof typeof CALL_STATUS;

const sentenceCase = (value: string) => {
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const statusOf = (status: string) =>
  CALL_STATUS[status as CallStatus] ?? {
    label: sentenceCase(status),
    variant: "outline" as const,
  };

export const SOURCE_LABEL: Record<string, string> = {
  alarm: "Alarm",
  manual_test: "Manual test",
};

export const reasonText = (reason: string | null) =>
  reason ? sentenceCase(reason) : "—";

export const durationText = (ms: number) =>
  ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
