"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { analyticLabel } from "@/config/analytics-catalog";
import { formatDateTime } from "@/lib/format-date";
import { useLicense } from "../hooks/use-license";
import { featureLabel, reasonLabel, TERM_LABEL, usageOf } from "../lib/quota";

export const LicenseCard = ({
  serverId,
  online,
}: {
  serverId: string;
  online: boolean;
}) => {
  const { data: license, isPending, isError } = useLicense(serverId);
  const empty = isPending
    ? "Loading license…"
    : isError
      ? "Failed to load the license."
      : !license
        ? "No license reports."
        : null;
  return (
    <Card className="lg:col-span-2">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">License</span>
            <span className="text-xs text-muted-foreground">
              {license
                ? `Reported ${formatDateTime(license.reportedAt)}${online ? "" : " (edge server offline)"}`
                : "Last report from the edge server"}
            </span>
          </div>
          {license && (
            <Badge variant={license.trusted ? "outline" : "destructive"}>
              {reasonLabel(license.reason)}
            </Badge>
          )}
        </div>
        {license ? (
          <>
            <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <Info
                label="Term"
                value={license.term ? TERM_LABEL[license.term] : "—"}
              />
              <Info
                label="Enforcement"
                value={license.limited ? "Limited" : "Not enforced"}
              />
              <Info
                label="Last check"
                value={
                  license.lastAttestationAt
                    ? formatDateTime(license.lastAttestationAt)
                    : "—"
                }
              />
              <Info
                label="Valid offline until"
                value={
                  license.offlineUntil
                    ? formatDateTime(license.offlineUntil)
                    : "—"
                }
              />
            </dl>
            {license.features.length > 0 && (
              <ul className="flex flex-col divide-y rounded border text-xs">
                {license.features.map((feature) => (
                  <li
                    key={feature.feature}
                    className="flex items-center justify-between gap-4 p-2"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium">
                        {featureLabel(feature.feature)}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {feature.analytics.map(analyticLabel).join(", ")}
                      </span>
                    </div>
                    <span className="shrink-0 tabular-nums">
                      {usageOf(feature)}
                      {feature.total !== null &&
                        feature.used >= feature.total && (
                          <Badge variant="secondary" className="ml-2">
                            Full
                          </Badge>
                        )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {license.heldDevices.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {license.heldDevices.length} camera
                {license.heldDevices.length === 1 ? " is" : "s are"} not
                analyzing because of the license.
              </p>
            )}
          </>
        ) : (
          <p className="flex min-h-20 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
            {empty}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium">{value}</dd>
  </div>
);
