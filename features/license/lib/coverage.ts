import { isAxiosError } from "axios";
import { messageOf } from "@/lib/axios/browser-client";
import { reasonLabel } from "./quota";
import type { EdgeLicense } from "../types";

export type Coverage =
  { kind: "untrusted"; reason: string } | { kind: "unlicensed" };

export const coverageOf = (
  license: EdgeLicense | null | undefined,
  analyticId: string | null,
): Coverage | null => {
  if (!license || !analyticId) return null;
  if (!license.trusted) return { kind: "untrusted", reason: license.reason };
  if (!license.limited) return null;
  const covered = license.features.some((feature) =>
    feature.analytics.includes(analyticId),
  );
  return covered ? null : { kind: "unlicensed" };
};

export const coverageMessage = (coverage: Coverage, analyticName: string) =>
  coverage.kind === "untrusted"
    ? `The license on this edge server is not valid (${reasonLabel(coverage.reason).toLowerCase()}), so the edge server may reject ${analyticName}.`
    : `${analyticName} is not included in the license of this edge server.`;

export const withLicenseMark = <Item extends { value: string; label: string }>(
  items: Item[],
  license: EdgeLicense | null | undefined,
) =>
  items.map((item) =>
    coverageOf(license, item.value)?.kind === "unlicensed"
      ? { ...item, label: `${item.label} (not licensed)` }
      : item,
  );

const LICENSE_CODE = /^LICENSE/;

export const licenseErrorMessage = (error: unknown) => {
  const message = messageOf(error);
  const code = isAxiosError(error) ? error.response?.data?.code : null;
  return typeof code === "string" && LICENSE_CODE.test(code)
    ? `${message} Check the license on the edge server page.`
    : message;
};
