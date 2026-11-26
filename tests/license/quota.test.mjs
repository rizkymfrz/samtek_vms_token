import assert from "node:assert/strict";
import { test } from "node:test";
import { quotaOf, reasonLabel } from "../../features/license/lib/quota.ts";

const license = (patch = {}) => ({
  trusted: true,
  reason: "trusted",
  limited: true,
  term: "perpetual",
  licenseVersion: 1,
  lastAttestationAt: null,
  offlineUntil: null,
  features: [
    {
      feature: "lpr",
      total: 2,
      used: 1,
      analytics: ["license_plate_recognition"],
    },
    { feature: "motion", total: null, used: 4, analytics: ["motion"] },
  ],
  heldDevices: [],
  reportedAt: "2026-11-26T00:00:00.000Z",
  ...patch,
});

test("quota counts what is left for a limited feature", () => {
  assert.deepEqual(quotaOf(license(), "license_plate_recognition"), {
    feature: "lpr",
    total: 2,
    used: 1,
    remaining: 1,
  });
});

test("no quota without a report, analytic, or limit", () => {
  assert.equal(quotaOf(null, "license_plate_recognition"), null);
  assert.equal(quotaOf(license(), null), null);
  assert.equal(quotaOf(license(), "motion"), null);
  assert.equal(quotaOf(license(), "face_recognition"), null);
});

test("quota is not enforced for untrusted or unlimited reports", () => {
  assert.equal(
    quotaOf(license({ trusted: false }), "license_plate_recognition"),
    null,
  );
  assert.equal(
    quotaOf(license({ limited: false }), "license_plate_recognition"),
    null,
  );
});

test("remaining never goes below zero", () => {
  const full = license({
    features: [{ feature: "lpr", total: 1, used: 3, analytics: ["a"] }],
  });
  assert.equal(quotaOf(full, "a")?.remaining, 0);
});

test("unknown reasons keep a readable label", () => {
  assert.equal(reasonLabel("trusted"), "Valid");
  assert.equal(reasonLabel("new_reason"), "new reason");
});
