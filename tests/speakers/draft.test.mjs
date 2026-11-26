import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emptyDraft,
  speakerDraftSchema,
  toCreatePayload,
  toUpdatePayload,
} from "../../features/speakers/lib/edit-speaker.ts";

const valid = {
  ...emptyDraft(),
  serverId: "1",
  name: "Horn gate",
  host: "192.168.77.40",
};

const messages = (draft, editing = false) => {
  const result = speakerDraftSchema(editing).safeParse(draft);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

test("a new speaker needs an edge server", () => {
  assert.deepEqual(messages({ ...valid, serverId: null }), [
    "Edge server is required.",
  ]);
  assert.deepEqual(messages({ ...valid, serverId: null }, true), []);
});

test("the address must be an IPv4 address", () => {
  assert.deepEqual(messages({ ...valid, host: "horn.local" }), [
    "Enter an IPv4 address, e.g. 192.168.77.40.",
  ]);
  assert.deepEqual(messages({ ...valid, host: "300.1.1.1" }).length, 1);
});

test("port, timeout and volume stay in range", () => {
  assert.deepEqual(messages({ ...valid, port: "70000" }), [
    "Port must be between 1 and 65535.",
  ]);
  assert.deepEqual(messages({ ...valid, timeoutSeconds: "0" }), [
    "Timeout must be between 0.1 and 60 seconds.",
  ]);
  assert.deepEqual(messages({ ...valid, volume: "101" }), [
    "Volume must be between 0 and 100.",
  ]);
});

test("a create payload leaves out empty credentials", () => {
  assert.deepEqual(toCreatePayload(valid), {
    name: "Horn gate",
    host: "192.168.77.40",
    port: 5060,
    username: undefined,
    password: undefined,
    timeoutSeconds: 5,
    volume: 80,
    isEnabled: true,
  });
});

test("an update payload sends only what changed", () => {
  const original = {
    id: "7",
    edgeServerId: "1",
    name: "Horn gate",
    isEnabled: true,
    host: "192.168.77.40",
    port: 5060,
    username: "100",
    hasPassword: true,
    timeoutSeconds: 5,
    volume: 80,
    applyStatus: null,
    applyError: null,
    createdAt: "2026-11-27T03:00:00.000Z",
  };
  const draft = { ...valid, username: "100", volume: "60", password: "" };
  const payload = toUpdatePayload(draft, original);
  assert.equal(payload.volume, 60);
  assert.equal(payload.password, undefined);
  assert.equal(payload.username, undefined);
  assert.equal(payload.name, undefined);
});
