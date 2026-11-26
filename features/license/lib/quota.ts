import type { EdgeLicense, LicenseFeature } from "../types";

export type Quota = {
  feature: string;
  total: number;
  used: number;
  remaining: number;
};

export const quotaOf = (
  license: EdgeLicense | null | undefined,
  analyticId: string | null,
): Quota | null => {
  if (!license || !analyticId || !license.trusted || !license.limited) {
    return null;
  }
  const found = license.features.find(
    (feature) =>
      feature.total !== null && feature.analytics.includes(analyticId),
  );
  if (!found || found.total === null) return null;
  return {
    feature: found.feature,
    total: found.total,
    used: found.used,
    remaining: Math.max(found.total - found.used, 0),
  };
};

export const usageOf = (feature: LicenseFeature) =>
  feature.total === null ? "Unlimited" : `${feature.used} of ${feature.total}`;

const REASON_LABEL: Record<string, string> = {
  trusted: "Valid",
  no_license: "No license",
  rejected: "Rejected by the license server",
  missing_term: "License term missing",
  malformed_claims: "License is malformed",
  stale_token: "License is outdated",
  window_expired: "Offline period expired",
  clock_reset: "Clock was reset",
  clock_before_anchor: "Clock is behind the license",
  tpm_unavailable: "TPM unavailable",
};

export const reasonLabel = (reason: string) =>
  REASON_LABEL[reason] ?? reason.replaceAll("_", " ");

export const TERM_LABEL = {
  perpetual: "Perpetual",
  fixed: "Fixed term",
} as const;

const FEATURE_LABEL: Record<string, string> = {
  lpr: "License plate recognition",
  face_recognition: "Face recognition",
  face_capture: "Face capture",
  reid: "Person re-identification",
  ppe: "PPE violation",
  counting_dwelling: "Counting and dwelling",
  crowd_monitoring: "Crowd monitoring",
  sleep_on_duty: "Sleep on duty",
  worker_dwelling: "Worker dwelling",
  motion: "Motion",
  dust_spreading: "Dust spreading",
  fire_smoke: "Fire and smoke",
  phone_calling: "Phone calling",
  cat_detection: "Cat detection",
};

export const featureLabel = (feature: string) => {
  const text = feature.replaceAll("_", " ");
  return FEATURE_LABEL[feature] ?? text.charAt(0).toUpperCase() + text.slice(1);
};
