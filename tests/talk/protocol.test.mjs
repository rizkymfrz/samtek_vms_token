import assert from "node:assert/strict";
import { test } from "node:test";
import { errorsOf, validatorFor } from "./contract.mjs";
import { buildEnvelope } from "../../features/edge-status/lib/envelope.ts";
import { ulid } from "../../features/edge-status/lib/ulid.ts";
import {
  CHUNK_SAMPLES,
  Chunker,
  createSessionId,
  decodeAudio,
  encodeAudio,
  floatToPcm16,
  isNewer,
  operatorOf,
  Resampler,
  SeqCounter,
  SESSION_ID,
  silentChunk,
} from "../../features/talk/lib/talk-protocol.ts";

const check = (type, data) => {
  const validate = validatorFor(type);
  const ok = validate(buildEnvelope(type, data));
  assert.ok(ok, errorsOf(validate).join("; "));
};

test("session ids follow the contract pattern", () => {
  const id = createSessionId("42", ulid());
  assert.match(id, SESSION_ID);
  assert.equal(operatorOf(id), "42");
  const odd = createSessionId("a b/ü".repeat(20), ulid());
  assert.match(odd, SESSION_ID);
  assert.ok(odd.length <= 64);
});

test("talk.start and talk.stop envelopes validate against the schema", () => {
  const data = {
    device_id: "bodycam-07",
    session_id: createSessionId("3", ulid()),
  };
  check("talk.start", data);
  check("talk.stop", data);
});

test("envelope has a fresh ULID, UTC ms timestamp, v1", () => {
  const a = buildEnvelope("talk.stop", {});
  const b = buildEnvelope("talk.stop", {});
  assert.equal(a.v, 1);
  assert.notEqual(a.id, b.id);
  assert.match(a.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.match(a.ts, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
});

test("PCM round trips through base64 and validates as talk.audio", () => {
  const pcm = Int16Array.from(
    { length: CHUNK_SAMPLES },
    (_, i) => ((i * 97) % 30000) - 15000,
  );
  const audio = encodeAudio(pcm);
  assert.deepEqual([...decodeAudio(audio)], [...pcm]);
  assert.equal(audio.length, Math.ceil((pcm.length * 2) / 3) * 4);
  check("talk.audio", { device_id: "d", session_id: "s", seq: 0, audio });
});

test("one second of audio fits the schema, more does not decode", () => {
  const full = new Int16Array(16000).fill(1234);
  check("talk.audio", {
    device_id: "d",
    session_id: "s",
    seq: 1,
    audio: encodeAudio(full),
  });
  assert.equal(decodeAudio(encodeAudio(new Int16Array(16001))), null);
});

test("decodeAudio rejects bad base64 and odd byte counts", () => {
  assert.equal(decodeAudio("not base64!"), null);
  assert.equal(decodeAudio(btoa("abc")), null);
  assert.equal(decodeAudio(""), null);
});

test("float to int16 clamps and keeps polarity", () => {
  const pcm = floatToPcm16(Float32Array.from([0, 1, -1, 2, -2, 0.5]));
  assert.deepEqual([...pcm], [0, 32767, -32768, 32767, -32768, 16384]);
});

test("PCM is little endian on the wire", () => {
  assert.equal(encodeAudio(Int16Array.from([1, -1])), "AQD//w==");
});

test("seq starts at 0 and rises by one", () => {
  const seq = new SeqCounter();
  assert.deepEqual([seq.take(), seq.take(), seq.take()], [0, 1, 2]);
  assert.ok(isNewer(null, 0));
  assert.ok(isNewer(4, 5));
  assert.ok(!isNewer(5, 5));
  assert.ok(!isNewer(5, 3));
});

test("chunker emits exact 40 ms chunks and keeps the remainder", () => {
  const chunker = new Chunker();
  assert.equal(CHUNK_SAMPLES, 640);
  assert.equal(chunker.push(new Int16Array(300)).length, 0);
  const out = chunker.push(new Int16Array(1000));
  assert.equal(out.length, 2);
  assert.ok(out.every((chunk) => chunk.length === 640));
  assert.equal(chunker.push(new Int16Array(620)).length, 1);
});

test("silent keepalive chunk is all zero PCM and a valid message", () => {
  const silence = silentChunk();
  assert.equal(silence.length, 640);
  assert.ok(silence.every((sample) => sample === 0));
  check("talk.audio", {
    device_id: "d",
    session_id: "s",
    seq: 7,
    audio: encodeAudio(silence),
  });
});

test("resampler 48 kHz to 16 kHz keeps length and a 440 Hz tone", () => {
  const resampler = new Resampler(48000);
  const tone = Float32Array.from(
    { length: 48000 },
    (_, i) => 0.5 * Math.sin((2 * Math.PI * 440 * i) / 48000),
  );
  const parts = [];
  for (let i = 0; i < tone.length; i += 960) {
    parts.push(...resampler.push(tone.subarray(i, i + 960)));
  }
  assert.ok(Math.abs(parts.length - 16000) <= 2, `got ${parts.length}`);
  const peak = Math.max(...parts.slice(100).map(Math.abs));
  assert.ok(peak > 0.45 && peak < 0.55, `peak ${peak}`);
});

test("resampler handles non integer ratios (44.1 kHz)", () => {
  const resampler = new Resampler(44100);
  let total = 0;
  for (let i = 0; i < 100; i++)
    total += resampler.push(new Float32Array(441)).length;
  assert.ok(Math.abs(total - 16000) <= 2, `got ${total}`);
});
