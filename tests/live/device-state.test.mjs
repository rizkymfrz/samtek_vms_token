import assert from "node:assert/strict";
import { test } from "node:test";
import { deviceStateOf, isServerDown } from "../../lib/device-state.ts";

test("a disabled camera wins over every other condition", () => {
  assert.equal(
    deviceStateOf({
      isEnabled: false,
      isServerActive: false,
      isServerOnline: false,
      fault: "stream",
    }),
    "disabled",
  );
});

test("an inactive edge server is disabled, not offline", () => {
  assert.equal(
    deviceStateOf({ isServerActive: false, isServerOnline: false }),
    "server-disabled",
  );
});

test("an active edge server that is unreachable is offline", () => {
  assert.equal(
    deviceStateOf({ isServerActive: true, isServerOnline: false }),
    "server-offline",
  );
});

test("a stream fault and a device fault map to different states", () => {
  assert.equal(
    deviceStateOf({ isServerOnline: true, fault: "stream" }),
    "stream-offline",
  );
  assert.equal(
    deviceStateOf({ isServerOnline: true, fault: "device" }),
    "device-error",
  );
});

test("an online server without a fault is live", () => {
  assert.equal(deviceStateOf({ isServerOnline: true }), "live");
});

test("both server states count as the server being down", () => {
  assert.equal(isServerDown("server-offline"), true);
  assert.equal(isServerDown("server-disabled"), true);
  assert.equal(isServerDown("stream-offline"), false);
  assert.equal(isServerDown("live"), false);
});

test("a partial stream fault keeps the camera live", () => {
  assert.equal(
    deviceStateOf({ isServerOnline: true, fault: "partial" }),
    "live",
  );
});
