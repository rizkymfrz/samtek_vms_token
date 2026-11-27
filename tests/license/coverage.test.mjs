import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coverageMessage,
  coverageOf,
  withLicenseMark,
} from "../../features/license/lib/coverage.ts";

const license = (patch = {}) => ({
  trusted: true,
  reason: "trusted",
  limited: true,
  term: "perpetual",
  licenseVersion: 1,
  lastAttestationAt: null,
  offlineUntil: null,
  features: [
    { feature: "motion", total: null, used: 1, analytics: ["motion"] },
  ],
  heldDevices: [],
  reportedAt: "2026-11-26T00:00:00.000Z",
  ...patch,
});

test("a covered analytic, no report or no analytic is fine", () => {
  assert.equal(coverageOf(license(), "motion"), null);
  assert.equal(coverageOf(null, "motion"), null);
  assert.equal(coverageOf(license(), null), null);
});

test("an analytic outside the features is not licensed", () => {
  assert.deepEqual(coverageOf(license(), "fire_smoke"), { kind: "unlicensed" });
});

test("an untrusted license is flagged with its reason", () => {
  assert.deepEqual(
    coverageOf(license({ trusted: false, reason: "no_license" }), "motion"),
    { kind: "untrusted", reason: "no_license" },
  );
});

test("an unlimited report does not restrict analytics", () => {
  assert.equal(coverageOf(license({ limited: false }), "fire_smoke"), null);
});

test("messages name the analytic and the cause", () => {
  assert.equal(
    coverageMessage({ kind: "unlicensed" }, "Fire and smoke"),
    "Fire and smoke is not included in the license of this edge server.",
  );
  assert.match(
    coverageMessage({ kind: "untrusted", reason: "no_license" }, "Motion"),
    /no license/,
  );
});

test("only unlicensed items get the mark", () => {
  const items = [
    { value: "motion", label: "Motion" },
    { value: "fire_smoke", label: "Fire and smoke" },
  ];
  assert.deepEqual(
    withLicenseMark(items, license()).map((item) => item.label),
    ["Motion", "Fire and smoke (not licensed)"],
  );
});
