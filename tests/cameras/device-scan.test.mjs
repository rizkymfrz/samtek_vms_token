import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defaultRange,
  draftFromResult,
  parseScanForm,
  reduceScan,
  SCAN_IDLE,
  streamSets,
} from "../../features/cameras/lib/device-scan.ts";

const result = (extra = {}) => ({
  scan_id: "s1",
  host: "192.168.1.9",
  port: 80,
  discovered_via: "tcp_scan",
  onvif: true,
  ...extra,
});

test("parseScanForm splits logins on the first colon", () => {
  const form = parseScanForm(
    "192.168.1.0/24",
    "80, 8080 80",
    "admin:a:b\nroot",
  );
  assert.equal(form.ok, true);
  assert.deepEqual(form.ports, [80, 8080]);
  assert.deepEqual(form.credentials, [
    { credentialId: "c1", username: "admin", password: "a:b" },
    { credentialId: "c2", username: "root", password: "" },
  ]);
});

test("parseScanForm rejects a bad range, port or too many logins", () => {
  assert.equal(parseScanForm("192.168.1.0", "80", "").ok, false);
  assert.equal(parseScanForm("300.1.1.0/24", "80", "").ok, false);
  assert.equal(parseScanForm("10.0.0.0/24", "0", "").ok, false);
  assert.equal(parseScanForm("10.0.0.0/24", "", "").ok, false);
  assert.equal(parseScanForm("10.0.0.0/24", "80", "a\n".repeat(9)).ok, false);
});

test("a scan only accepts messages with its own scan id", () => {
  let session = reduceScan(SCAN_IDLE, { type: "start", scanId: "s1" });
  session = reduceScan(session, {
    type: "result",
    data: result({ scan_id: "other" }),
  });
  assert.equal(session.results.length, 0);
  session = reduceScan(session, { type: "result", data: result() });
  session = reduceScan(session, {
    type: "result",
    data: result({ model: "X" }),
  });
  assert.equal(session.results.length, 1);
  assert.equal(session.results[0].model, "X");
  session = reduceScan(session, {
    type: "state",
    data: {
      scan_id: "s1",
      state: "completed",
      scanned: 254,
      total_hosts: 254,
      found: 1,
    },
  });
  assert.equal(session.phase, "completed");
});

test("a refusal ends a starting scan", () => {
  const session = reduceScan(
    reduceScan(SCAN_IDLE, { type: "start", scanId: "s1" }),
    { type: "refused", message: "unavailable" },
  );
  assert.equal(session.phase, "failed");
  assert.equal(session.error, "unavailable");
});

const profile = (token, uri) => ({ token, name: token, stream_uri: uri });
const servers = [{ id: "e1", name: "E", isActive: true, online: true }];
const logins = [{ credentialId: "c1", username: "admin", password: "p@ss" }];

test("a camera's first three profiles become main, sub and third", () => {
  const found = result({
    credential_id: "c1",
    model: "IPC322",
    profiles: [
      profile("a", "rtsp://192.168.1.9/media/video1"),
      profile("b", "rtsp://192.168.1.9/media/video2"),
      profile("c", "rtsp://192.168.1.9/media/video3"),
    ],
  });
  const sets = streamSets(found);
  assert.equal(sets.length, 1);
  const draft = draftFromResult(found, sets[0], logins, servers, "e1");
  assert.equal(draft.name, "IPC322");
  assert.equal(
    draft.sourceMain,
    "rtsp://admin:p%40ss@192.168.1.9/media/video1",
  );
  assert.equal(draft.sourceSub, "rtsp://admin:p%40ss@192.168.1.9/media/video2");
  assert.equal(
    draft.sourceThird,
    "rtsp://admin:p%40ss@192.168.1.9/media/video3",
  );
});

test("an NVR gives one set per channel from its s0, s1 and s2 profiles", () => {
  const found = result({
    model: "NVR",
    profiles: [
      profile("17/0/4/1/4/s0", "rtsp://h/c4/s0/live"),
      profile("17/0/4/1/4/s1", "rtsp://h/c4/s1/live"),
      profile("17/0/4/1/5/s0", "rtsp://h/c5/s0/live"),
    ],
  });
  const sets = streamSets(found);
  assert.equal(sets.length, 2);
  assert.equal(sets[0].sub, "rtsp://h/c4/s1/live");
  assert.equal(sets[1].sub, null);
  const draft = draftFromResult(found, sets[1], [], servers, "e1");
  assert.equal(draft.name, "NVR Channel 2");
  assert.equal(draft.sourceMain, "rtsp://h/c5/s0/live");
  assert.equal(draft.sourceSub, "");
});

test("without a stream address the main stream falls back to the bare host", () => {
  const found = result();
  const draft = draftFromResult(found, streamSets(found)[0], [], [], "e1");
  assert.equal(draft.sourceMain, "rtsp://192.168.1.9:554/");
  assert.equal(draft.sourceSub, "");
});

test("defaultRange turns the edge address into its /24", () => {
  assert.equal(defaultRange("192.168.1.80:8090"), "192.168.1.0/24");
  assert.equal(defaultRange("http://10.0.5.7:8090/x"), "10.0.5.0/24");
  assert.equal(defaultRange("edge.example.com:8090"), "");
  assert.equal(defaultRange("999.1.1.1"), "");
  assert.equal(defaultRange(null), "");
});
