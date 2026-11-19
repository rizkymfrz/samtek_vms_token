import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFrameTime } from "../../features/live/lib/frame-time-sei.ts";

const UUID = [
  0x4a, 0xdb, 0x9b, 0xdf, 0x5e, 0x83, 0x46, 0x9f, 0x8a, 0x34, 0xcf, 0xf1, 0xbf,
  0x01, 0x69, 0x81,
];

const TIME = 1795062540000;
const ascii = (text) => [...text].map((char) => char.charCodeAt(0));

const sei = ({ header = [0x06], uuid = UUID, text = `1:${TIME}` } = {}) => {
  const body = [...uuid, ...ascii(text)];
  return [...header, 0x05, body.length, ...body, 0x80];
};

const H264_SLICE = [0x65, 0x88];
const START4 = [0, 0, 0, 1];
const START3 = [0, 0, 1];
const bytes = (...parts) => new Uint8Array(parts.flat());

test("the contract vector gives the frame time", () => {
  const vector = [
    0x00, 0x00, 0x00, 0x01, 0x06, 0x05, 0x1f, 0x4a, 0xdb, 0x9b, 0xdf, 0x5e,
    0x83, 0x46, 0x9f, 0x8a, 0x34, 0xcf, 0xf1, 0xbf, 0x01, 0x69, 0x81, 0x31,
    0x3a, 0x31, 0x37, 0x39, 0x35, 0x30, 0x36, 0x32, 0x35, 0x34, 0x30, 0x30,
    0x30, 0x30, 0x80, 0x00, 0x00, 0x00, 0x01, 0x65, 0x88,
  ];
  assert.equal(parseFrameTime(new Uint8Array(vector)), TIME);
});

test("an H.265 prefix SEI gives the frame time", () => {
  const packet = bytes(
    START4,
    sei({ header: [0x4e, 0x01] }),
    START4,
    [0x26, 0x01, 0xaf],
  );
  assert.equal(parseFrameTime(packet), TIME);
});

test("a 3-byte start code works", () => {
  assert.equal(parseFrameTime(bytes(START3, sei(), START3, H264_SLICE)), TIME);
});

test("a SEI after other NAL units is found", () => {
  const packet = bytes(
    START4,
    [0x67, 0x42, 0x00],
    START4,
    [0x68, 0xce],
    START3,
    sei(),
    START4,
    H264_SLICE,
  );
  assert.equal(parseFrameTime(packet), TIME);
});

test("a packet without SEI has no time", () => {
  assert.equal(parseFrameTime(bytes(START4, H264_SLICE)), null);
  assert.equal(parseFrameTime(new Uint8Array()), null);
});

test("a foreign UUID is ignored", () => {
  const other = [...UUID];
  other[15] = 0x82;
  assert.equal(
    parseFrameTime(bytes(START4, sei({ uuid: other }), START4, H264_SLICE)),
    null,
  );
});

test("a foreign SEI does not hide ours", () => {
  const other = [...UUID];
  other[0] = 0x00;
  const packet = bytes(
    START4,
    sei({ uuid: other }),
    START4,
    sei(),
    START4,
    H264_SLICE,
  );
  assert.equal(parseFrameTime(packet), TIME);
});

test("any version other than 1 is refused", () => {
  assert.equal(
    parseFrameTime(
      bytes(START4, sei({ text: `2:${TIME}` }), START4, H264_SLICE),
    ),
    null,
  );
});

test("a malformed time text is refused", () => {
  for (const text of ["1:abc", "1:", "1", `1:${TIME}x`, "1:-5"]) {
    assert.equal(parseFrameTime(bytes(START4, sei({ text }))), null, text);
  }
});

test("a truncated SEI has no time", () => {
  const full = sei();
  const cut = full.slice(0, full.length - 8);
  assert.equal(parseFrameTime(bytes(START4, cut)), null);
});

test("two SEI of ours mean no time", () => {
  const packet = bytes(START4, sei(), START4, sei(), START4, H264_SLICE);
  assert.equal(parseFrameTime(packet), null);
});

test("a SEI without trailing bytes still parses", () => {
  const trimmed = sei().slice(0, -1);
  assert.equal(parseFrameTime(bytes(START4, trimmed)), TIME);
});
