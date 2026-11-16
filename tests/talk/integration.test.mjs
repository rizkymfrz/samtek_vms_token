import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import mqtt from "mqtt";
import { errorsOf, validatorFor } from "./contract.mjs";
import { buildEnvelope } from "../../features/edge-status/lib/envelope.ts";
import { ulid } from "../../features/edge-status/lib/ulid.ts";
import {
  createSessionId,
  decodeAudio,
  encodeAudio,
  isNewer,
  SeqCounter,
  silentChunk,
} from "../../features/talk/lib/talk-protocol.ts";
import { reduceTalk, TALK_IDLE } from "../../features/talk/lib/talk-session.ts";
import {
  talkAudioSchema,
  talkResultSchema,
  talkStateSchema,
} from "../../features/talk/schemas/talk-message.ts";

const PORT = 18_830;
const URL = `mqtt://127.0.0.1:${PORT}`;
const EDGE = "edge-test";
const DOWN = `samtek/v1/${EDGE}/down`;
const UP = `samtek/v1/${EDGE}/up`;
const IDLE_MS = 700;
const ACTIVE_DELAY_MS = 80;

let broker;

const waitFor = async (predicate, ms = 3000, what = "condition") => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error(`timed out waiting for ${what}`);
};

const connect = (options = {}) =>
  new Promise((resolve, reject) => {
    const client = mqtt.connect(URL, {
      reconnectPeriod: 0,
      clean: true,
      ...options,
    });
    client.once("connect", () => resolve(client));
    client.once("error", reject);
  });

const checkWire = (topic, json) => {
  const validate = validatorFor(json.type);
  assert.ok(
    validate(json),
    `${topic} ${json.type}: ${errorsOf(validate).join("; ")}`,
  );
};

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), "talk-broker-"));
  const conf = join(dir, "mosquitto.conf");
  writeFileSync(
    conf,
    `listener ${PORT} 127.0.0.1\nallow_anonymous true\npersistence false\n`,
  );
  broker = spawn("mosquitto", ["-c", conf], { stdio: "ignore" });
  await waitFor(
    () => broker.exitCode === null && broker.pid !== undefined,
    2000,
    "broker",
  );
  await new Promise((r) => setTimeout(r, 400));
});

after(() => broker?.kill());

const startFakeEdge = async () => {
  const will = {
    topic: UP,
    payload: JSON.stringify({
      v: 1,
      type: "edge.state",
      data: { edge_id: EDGE, online: false },
    }),
    qos: 1,
    retain: true,
  };
  const client = await connect({ clientId: "fake-edge", will });
  await client.subscribeAsync(DOWN, { qos: 1 });
  const sessions = new Map();
  let isClosed = false;
  client.on("close", () => {
    isClosed = true;
    for (const session of sessions.values()) clearTimeout(session.idle);
  });
  const publishUp = (type, data, extra = {}) =>
    isClosed ||
    client.publish(
      UP,
      JSON.stringify({ ...buildEnvelope(type, data), ...extra }),
      { qos: type === "talk.audio" ? 0 : 1 },
    );
  const end = (deviceId, session, reason, detail) => {
    clearTimeout(session.idle);
    sessions.delete(deviceId);
    publishUp("talk.state", {
      device_id: deviceId,
      session_id: session.id,
      state: "ended",
      reason,
      ...(detail && { detail }),
    });
  };
  const armIdle = (deviceId, session) => {
    clearTimeout(session.idle);
    session.idle = setTimeout(() => end(deviceId, session, "idle"), IDLE_MS);
  };
  client.on("message", (_topic, payload) => {
    const msg = JSON.parse(payload.toString());
    checkWire(DOWN, msg);
    const { device_id: deviceId, session_id: id } = msg.data;
    if (msg.type === "talk.start") {
      const current = sessions.get(deviceId);
      if (current && current.id === id) {
        publishUp(
          "result",
          {
            ok: true,
            talk: { device_id: deviceId, session_id: id, state: current.state },
          },
          { reply_to: msg.id },
        );
        return;
      }
      if (deviceId === "nope") {
        publishUp(
          "result",
          {
            ok: false,
            error: { code: "unavailable", message: "device is not running" },
          },
          { reply_to: msg.id },
        );
        return;
      }
      if (current) end(deviceId, current, "replaced");
      const session = {
        id,
        state: "connecting",
        rx: null,
        tx: new SeqCounter(),
      };
      sessions.set(deviceId, session);
      publishUp(
        "result",
        {
          ok: true,
          talk: { device_id: deviceId, session_id: id, state: "connecting" },
        },
        { reply_to: msg.id },
      );
      setTimeout(() => {
        if (isClosed || sessions.get(deviceId) !== session) return;
        if (deviceId === "bad") {
          end(
            deviceId,
            session,
            "failed",
            "the device did not answer within 30 s",
          );
          return;
        }
        session.state = "active";
        armIdle(deviceId, session);
        publishUp("talk.state", {
          device_id: deviceId,
          session_id: id,
          state: "active",
        });
      }, ACTIVE_DELAY_MS);
    } else if (msg.type === "talk.stop") {
      const session = sessions.get(deviceId);
      publishUp("result", { ok: true }, { reply_to: msg.id });
      if (session && session.id === id) end(deviceId, session, "stopped");
    } else if (msg.type === "talk.audio") {
      const session = sessions.get(deviceId);
      if (!session || session.id !== id || session.state !== "active") return;
      if (!isNewer(session.rx, msg.data.seq) || !decodeAudio(msg.data.audio))
        return;
      session.rx = msg.data.seq;
      armIdle(deviceId, session);
      publishUp("talk.audio", {
        device_id: deviceId,
        session_id: id,
        seq: session.tx.take(),
        audio: msg.data.audio,
      });
    }
  });
  await client.publishAsync(
    UP,
    JSON.stringify({
      ...buildEnvelope("edge.state", {
        edge_id: EDGE,
        online: true,
        devices: [
          {
            device_id: "bodycam-07",
            enabled: true,
            mode: "live_only",
            status: "running",
            talk: { supported: true },
          },
        ],
      }),
    }),
    { qos: 1, retain: true },
  );
  return client;
};

const startOperator = async (name) => {
  const client = await connect({ clientId: `op-${name}` });
  await client.subscribeAsync("samtek/v1/+/up", { qos: 1 });
  const op = {
    client,
    session: TALK_IDLE,
    rx: [],
    rxLast: null,
    edgeOnline: true,
    results: new Map(),
    seq: new SeqCounter(),
    times: new Map(),
  };
  client.on("message", (topic, payload) => {
    const json = JSON.parse(payload.toString());
    if (json.type !== "edge.state") checkWire(topic, json);
    if (json.type === "edge.state") {
      op.edgeOnline = json.data.online;
      if (!op.edgeOnline)
        op.session = reduceTalk(op.session, {
          type: "local",
          reason: "edge_offline",
        });
    } else if (json.type === "result") {
      op.results.set(json.reply_to, json.data);
    } else if (json.type === "talk.state") {
      const state = talkStateSchema.parse(json).data;
      op.session = reduceTalk(
        op.session,
        state.state === "active"
          ? { type: "active", sessionId: state.session_id }
          : {
              type: "ended",
              sessionId: state.session_id,
              reason: state.reason,
              detail: state.detail,
            },
      );
    } else if (json.type === "talk.audio") {
      const audio = talkAudioSchema.parse(json).data;
      if (
        audio.session_id === op.session.sessionId &&
        isNewer(op.rxLast, audio.seq)
      ) {
        op.rxLast = audio.seq;
        op.rx.push({
          seq: audio.seq,
          pcm: decodeAudio(audio.audio),
          at: performance.now(),
        });
      }
    }
  });
  op.start = async (deviceId, sessionId = createSessionId(name, ulid())) => {
    op.session = reduceTalk(TALK_IDLE, { type: "start", sessionId });
    op.rxLast = null;
    op.seq = new SeqCounter();
    const message = buildEnvelope("talk.start", {
      device_id: deviceId,
      session_id: sessionId,
    });
    await client.publishAsync(DOWN, JSON.stringify(message), { qos: 1 });
    await waitFor(() => op.results.has(message.id), 2000, "start result");
    const result = op.results.get(message.id);
    if (!result.ok) {
      op.session = reduceTalk(op.session, {
        type: "refused",
        sessionId,
        message: result.error.message,
      });
      return result;
    }
    const parsed = talkResultSchema.parse(result.talk);
    op.session = reduceTalk(op.session, {
      type: "result",
      sessionId,
      state: parsed.state,
    });
    return result;
  };
  op.audio = (deviceId, pcm) => {
    const seq = op.seq.take();
    op.times.set(seq, performance.now());
    return client.publishAsync(
      DOWN,
      JSON.stringify(
        buildEnvelope("talk.audio", {
          device_id: deviceId,
          session_id: op.session.sessionId,
          seq,
          audio: encodeAudio(pcm),
        }),
      ),
      { qos: 0 },
    );
  };
  op.stop = async (deviceId) => {
    await client.publishAsync(
      DOWN,
      JSON.stringify(
        buildEnvelope("talk.stop", {
          device_id: deviceId,
          session_id: op.session.sessionId,
        }),
      ),
      { qos: 1 },
    );
  };
  return op;
};

test("full session: start, connecting, active, echo, stop", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("1");
  const result = await op.start("bodycam-07");
  assert.equal(result.talk.state, "connecting");
  assert.equal(op.session.phase, "connecting");
  await waitFor(() => op.session.phase === "active", 3000, "active");
  const tone = Int16Array.from({ length: 640 }, (_, i) =>
    Math.round(8000 * Math.sin(i / 5)),
  );
  for (let i = 0; i < 25; i++) {
    await op.audio("bodycam-07", i % 5 === 4 ? silentChunk() : tone);
    await new Promise((r) => setTimeout(r, 40));
  }
  await waitFor(() => op.rx.length >= 25, 3000, "echo of 25 chunks");
  assert.deepEqual(
    op.rx.map((c) => c.seq),
    Array.from({ length: 25 }, (_, i) => i),
  );
  assert.deepEqual([...op.rx[0].pcm], [...tone]);
  const latencies = op.rx.map((c) => c.at - op.times.get(c.seq));
  console.log(
    `# broker round trip (down+up, QoS 0): median ${[...latencies].sort((a, b) => a - b)[12].toFixed(1)} ms, max ${Math.max(...latencies).toFixed(1)} ms`,
  );
  await op.stop("bodycam-07");
  await waitFor(() => op.session.phase === "ended", 2000, "ended");
  assert.equal(op.session.reason, "stopped");
  await op.stop("bodycam-07");
  await op.client.endAsync();
  await edge.endAsync();
});

test("unavailable device is refused with no session", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("2");
  const result = await op.start("nope");
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "unavailable");
  assert.equal(op.session.phase, "ended");
  assert.equal(op.session.reason, "rejected");
  await op.client.endAsync();
  await edge.endAsync();
});

test("device that never answers ends as failed with detail", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("3");
  await op.start("bad");
  await waitFor(() => op.session.phase === "ended", 3000, "failed");
  assert.equal(op.session.reason, "failed");
  assert.match(op.session.detail, /did not answer/);
  await op.client.endAsync();
  await edge.endAsync();
});

test("a second operator replaces the first", async () => {
  const edge = await startFakeEdge();
  const a = await startOperator("a");
  const b = await startOperator("b");
  await a.start("bodycam-07");
  await waitFor(() => a.session.phase === "active");
  const first = a.session.sessionId;
  await b.start("bodycam-07");
  await waitFor(() => a.session.phase === "ended", 3000, "replaced");
  assert.equal(a.session.reason, "replaced");
  assert.equal(a.session.sessionId, first);
  await waitFor(() => b.session.phase === "active");
  await Promise.all([
    a.client.endAsync(),
    b.client.endAsync(),
    edge.endAsync(),
  ]);
});

test("same session_id twice does not reopen and answers its state", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("4");
  const id = createSessionId("4", ulid());
  await op.start("bodycam-07", id);
  await waitFor(() => op.session.phase === "active");
  const again = await op.start("bodycam-07", id);
  assert.equal(again.talk.state, "active");
  await op.client.endAsync();
  await edge.endAsync();
});

test("no audio for the idle window ends the session as idle; keepalive prevents it", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("5");
  await op.start("bodycam-07");
  await waitFor(() => op.session.phase === "active");
  for (let i = 0; i < 12; i++) {
    await op.audio("bodycam-07", silentChunk());
    await new Promise((r) => setTimeout(r, IDLE_MS / 4));
  }
  assert.equal(op.session.phase, "active");
  await waitFor(() => op.session.phase === "ended", IDLE_MS * 3, "idle");
  assert.equal(op.session.reason, "idle");
  await op.client.endAsync();
  await edge.endAsync();
});

test("edge going offline ends the local session", async () => {
  const edge = await startFakeEdge();
  const op = await startOperator("6");
  await op.start("bodycam-07");
  await waitFor(() => op.session.phase === "active");
  edge.stream.destroy();
  await waitFor(() => op.session.phase === "ended", 3000, "edge offline");
  assert.equal(op.session.reason, "edge_offline");
  await op.client.endAsync();
});
