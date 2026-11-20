import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampWindow,
  clipRange,
  followWindow,
  MIN_WINDOW_MS,
  panWindow,
  ticksIn,
  tickStep,
  zoomWindow,
} from "../../features/camera-detail/lib/recording-timeline.ts";

const HOUR = 3_600_000;
const day = { start: 0, end: 24 * HOUR };

test("zooming in around the middle halves the window", () => {
  const next = zoomWindow(day, day, 0.5, 0.5);
  assert.equal(next.end - next.start, 12 * HOUR);
  assert.equal(next.start, 6 * HOUR);
});

test("zooming keeps the time under the pointer fixed", () => {
  const window = { start: 6 * HOUR, end: 18 * HOUR };
  const next = zoomWindow(window, day, 0.5, 0.25);
  assert.equal(next.start + 0.25 * (next.end - next.start), 9 * HOUR);
});

test("the window never gets shorter than the minimum or longer than the day", () => {
  const tiny = zoomWindow({ start: 0, end: 20_000 }, day, 0.01, 0.5);
  assert.equal(tiny.end - tiny.start, MIN_WINDOW_MS);
  assert.deepEqual(zoomWindow(day, day, 4, 0.5), day);
});

test("panning and clamping stay inside the day", () => {
  const window = { start: HOUR, end: 2 * HOUR };
  assert.deepEqual(panWindow(window, day, -5 * HOUR), {
    start: 0,
    end: HOUR,
  });
  assert.deepEqual(panWindow(window, day, 99 * HOUR), {
    start: 23 * HOUR,
    end: 24 * HOUR,
  });
  assert.deepEqual(clampWindow({ start: -5, end: 5 }, day), {
    start: 0,
    end: MIN_WINDOW_MS,
  });
});

test("following moves the window only when the time left it", () => {
  const window = { start: HOUR, end: 2 * HOUR };
  assert.equal(followWindow(window, day, 1.5 * HOUR), window);
  const moved = followWindow(window, day, 3 * HOUR);
  assert.equal(moved.end - moved.start, HOUR);
  assert.ok(moved.start <= 3 * HOUR && 3 * HOUR <= moved.end);
});

test("tick spacing follows the zoom level", () => {
  assert.equal(tickStep(24 * HOUR), 3 * HOUR);
  assert.equal(tickStep(30_000), 5_000);
  assert.equal(tickStep(MIN_WINDOW_MS), 5_000);
  assert.equal(tickStep(8_000), 1_000);
});

test("ticks are aligned to the day start", () => {
  const ticks = ticksIn({ start: 70_000, end: 130_000 }, 0, 30_000);
  assert.deepEqual(ticks, [90_000, 120_000]);
});

test("a short gap between recordings shows once zoomed in", () => {
  const window = { start: 0, end: 60_000 };
  const first = clipRange({ from: 0, to: 20_000 }, window);
  const second = clipRange({ from: 25_000, to: 60_000 }, window);
  assert.ok(first && second);
  assert.ok(second.left - (first.left + first.width) > 8);
  assert.equal(clipRange({ from: 70_000, to: 80_000 }, window), null);
});
