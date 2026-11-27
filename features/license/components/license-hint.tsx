"use client";
import { ANALYTICS } from "@/config/analytics-catalog";
import { useLicense } from "../hooks/use-license";
import { coverageMessage, coverageOf } from "../lib/coverage";
import { quotaOf } from "../lib/quota";

export const LicenseHint = ({
  serverId,
  analyticId,
  counted,
}: {
  serverId: string;
  analyticId: string | null;
  counted: boolean;
}) => {
  const { data } = useLicense(serverId);
  const coverage = coverageOf(data, analyticId);
  if (coverage) {
    const name =
      ANALYTICS.find((analytic) => analytic.id === analyticId)?.label ??
      "This analytic";
    return (
      <p role="alert" className="text-xs text-destructive">
        {coverageMessage(coverage, name)}
      </p>
    );
  }
  const quota = quotaOf(data, analyticId);
  if (!quota) return null;
  const full = quota.remaining === 0 && !counted;
  return (
    <p
      className={
        full ? "text-xs text-destructive" : "text-xs text-muted-foreground"
      }
    >
      {full
        ? `The license allows ${quota.total} enabled ${quota.total === 1 ? "camera" : "cameras"} for this analytic and all are in use.`
        : `${quota.used} of ${quota.total} licensed ${quota.total === 1 ? "camera" : "cameras"} in use for this analytic.`}
    </p>
  );
};
