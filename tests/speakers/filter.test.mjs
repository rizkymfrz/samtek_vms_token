import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ALL,
  applyState,
  countByServer,
  DEFAULT_FILTERS,
  filterSpeakers,
  isFiltered,
} from "../../features/speakers/lib/filter-speakers.ts";

const speaker = (id, patch = {}) => ({
  id,
  edgeServerId: "1",
  name: `Horn ${id}`,
  isEnabled: true,
  host: `192.168.77.${id}`,
  port: 5060,
  username: null,
  hasPassword: false,
  timeoutSeconds: 5,
  volume: 80,
  applyStatus: null,
  applyError: null,
  createdAt: "2026-11-27T03:00:00.000Z",
  ...patch,
});

const speakers = [
  speaker("1"),
  speaker("2", { isEnabled: false, edgeServerId: "2" }),
  speaker("3", { applyStatus: "rejected" }),
];

test("no filter keeps every speaker", () => {
  assert.equal(filterSpeakers(speakers, DEFAULT_FILTERS).length, 3);
  assert.equal(isFiltered(DEFAULT_FILTERS), false);
});

test("search matches the name and the host", () => {
  const byName = filterSpeakers(speakers, {
    ...DEFAULT_FILTERS,
    query: "horn 2",
  });
  const byHost = filterSpeakers(speakers, {
    ...DEFAULT_FILTERS,
    query: "77.3",
  });
  assert.deepEqual(
    byName.map((s) => s.id),
    ["2"],
  );
  assert.deepEqual(
    byHost.map((s) => s.id),
    ["3"],
  );
});

test("status and server narrow the list", () => {
  const disabled = filterSpeakers(speakers, {
    ...DEFAULT_FILTERS,
    status: "disabled",
  });
  const server = filterSpeakers(speakers, { ...DEFAULT_FILTERS, server: "1" });
  assert.deepEqual(
    disabled.map((s) => s.id),
    ["2"],
  );
  assert.deepEqual(
    server.map((s) => s.id),
    ["1", "3"],
  );
});

test("server counts ignore the server filter itself", () => {
  const counts = countByServer(speakers, { ...DEFAULT_FILTERS, server: "2" });
  assert.deepEqual(counts, { 1: 2, 2: 1 });
  assert.equal(ALL, "all");
});

test("a speaker without a reported result is pending", () => {
  assert.equal(applyState(speakers[0]), "pending");
  assert.equal(applyState(speakers[2]), "rejected");
});
