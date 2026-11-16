import assert from "node:assert/strict";
import { test } from "node:test";
import {
  errorsOf,
  exampleNames,
  readExample,
  validatorFor,
} from "./contract.mjs";
import {
  endText,
  isLive,
  reduceTalk,
  TALK_IDLE,
} from "../../features/talk/lib/talk-session.ts";
import {
  talkAudioSchema,
  talkResultSchema,
  talkStateSchema,
} from "../../features/talk/schemas/talk-message.ts";

const S = "op-1-X";
const started = reduceTalk(TALK_IDLE, { type: "start", sessionId: S });

test("start, connecting, active", () => {
  assert.equal(started.phase, "starting");
  const connecting = reduceTalk(started, {
    type: "result",
    sessionId: S,
    state: "connecting",
  });
  assert.equal(connecting.phase, "connecting");
  const active = reduceTalk(connecting, { type: "active", sessionId: S });
  assert.equal(active.phase, "active");
  assert.ok(isLive(active));
});

test("a duplicate start answer with state active is accepted", () => {
  const active = reduceTalk(started, {
    type: "result",
    sessionId: S,
    state: "active",
  });
  assert.equal(active.phase, "active");
});

test("talk.state active may overtake the result", () => {
  const active = reduceTalk(started, { type: "active", sessionId: S });
  assert.equal(active.phase, "active");
  const stale = reduceTalk(active, {
    type: "result",
    sessionId: S,
    state: "connecting",
  });
  assert.equal(stale.phase, "active");
});

for (const reason of [
  "stopped",
  "replaced",
  "idle",
  "failed",
  "device_removed",
]) {
  test(`ended with reason ${reason}`, () => {
    const active = reduceTalk(started, { type: "active", sessionId: S });
    const end = reduceTalk(active, {
      type: "ended",
      sessionId: S,
      reason,
      detail: "why",
    });
    assert.deepEqual(end, {
      phase: "ended",
      sessionId: S,
      reason,
      detail: "why",
    });
    assert.ok(!isLive(end));
    assert.ok(endText(reason, "why").length > 0);
  });
}

test("failed detail is shown, without inventing credentials", () => {
  assert.match(
    endText("failed", "the device did not answer within 30 s"),
    /did not answer/,
  );
  assert.doesNotMatch(endText("stopped", "secret"), /secret/);
});

test("refused command ends the session as rejected", () => {
  const end = reduceTalk(started, {
    type: "refused",
    sessionId: S,
    message: "no",
  });
  assert.equal(end.phase, "ended");
  assert.equal(end.reason, "rejected");
});

test("events for another session are ignored", () => {
  const same = reduceTalk(started, { type: "active", sessionId: "other" });
  assert.equal(same, started);
  const ended = reduceTalk(started, {
    type: "ended",
    sessionId: "other",
    reason: "replaced",
  });
  assert.equal(ended, started);
});

test("local ends cover edge offline, connection lost and timeout", () => {
  const active = reduceTalk(started, { type: "active", sessionId: S });
  for (const reason of [
    "edge_offline",
    "connection_lost",
    "timeout",
    "stopped",
  ]) {
    const end = reduceTalk(active, { type: "local", reason });
    assert.equal(end.phase, "ended");
    assert.equal(end.reason, reason);
  }
});

test("nothing revives an ended session", () => {
  const end = reduceTalk(started, {
    type: "ended",
    sessionId: S,
    reason: "stopped",
  });
  assert.equal(reduceTalk(end, { type: "active", sessionId: S }), end);
  assert.equal(reduceTalk(end, { type: "local", reason: "timeout" }), end);
  assert.equal(
    reduceTalk(TALK_IDLE, { type: "local", reason: "timeout" }),
    TALK_IDLE,
  );
});

test("contract examples pass JSON schema and the zod parsers", () => {
  const names = exampleNames();
  assert.ok(names.length >= 6, names.join());
  for (const name of names) {
    const example = readExample(name);
    if (name.startsWith("result.")) {
      assert.ok(talkResultSchema.safeParse(example.data?.talk).success, name);
      continue;
    }
    const validate = validatorFor(example.type);
    assert.ok(validate(example), `${name}: ${errorsOf(validate)}`);
    if (example.type === "talk.state") {
      assert.ok(talkStateSchema.safeParse(example).success, name);
    }
    if (example.type === "talk.audio") {
      assert.ok(talkAudioSchema.safeParse(example).success, name);
    }
  }
});

test("zod rejects ended without reason and active with reason", () => {
  const base = {
    type: "talk.state",
    id: "1",
    data: { device_id: "d", session_id: "s" },
  };
  assert.ok(
    !talkStateSchema.safeParse({
      ...base,
      data: { ...base.data, state: "ended" },
    }).success,
  );
  assert.ok(
    !talkStateSchema.safeParse({
      ...base,
      data: { ...base.data, state: "active", reason: "idle" },
    }).success,
  );
  assert.ok(
    talkStateSchema.safeParse({
      ...base,
      data: { ...base.data, state: "ended", reason: "idle" },
    }).success,
  );
});
