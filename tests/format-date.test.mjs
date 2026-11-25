import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatShortDateTime,
  formatTime,
} from "../lib/format-date.ts";

const at = Date.UTC(2026, 8, 3, 7, 5, 9);

test("dates use the Jakarta time zone and fixed month names", () => {
  assert.equal(formatDate(at), "03 Sep 2026");
  assert.equal(formatDayMonth(at), "03 Sep");
});

test("times are 24 hour with seconds", () => {
  assert.equal(formatTime(at), "14:05:09");
  assert.equal(formatTime(Date.UTC(2026, 0, 1, 17, 0, 0)), "00:00:00");
});

test("date time joins the date and the time", () => {
  assert.equal(formatDateTime(at), "03 Sep 2026 14:05:09");
  assert.equal(formatShortDateTime(at), "03 Sep 14:05");
});

test("strings and dates give the same result", () => {
  assert.equal(
    formatDateTime(new Date(at).toISOString()),
    formatDateTime(new Date(at)),
  );
});
