const USER_DATA_UNREGISTERED = 5;
const FRAME_TIME_VERSION = "1";
const TEXT_PATTERN = /^(\d+):(\d+)$/;

const FRAME_TIME_UUID = [
  0x4a, 0xdb, 0x9b, 0xdf, 0x5e, 0x83, 0x46, 0x9f, 0x8a, 0x34, 0xcf, 0xf1, 0xbf,
  0x01, 0x69, 0x81,
];

const isStartCode = (data: Uint8Array, at: number) =>
  data[at] === 0 && data[at + 1] === 0 && data[at + 2] === 1;

const seiBodyStart = (header: number) => {
  if ((header & 0x1f) === 6) return 1;
  if (header >> 7 === 0 && ((header >> 1) & 0x3f) === 39) return 2;
  return null;
};

const readSize = (nal: Uint8Array, at: number) => {
  let value = 0;
  let cursor = at;
  while (cursor < nal.length && nal[cursor] === 0xff) {
    value += 0xff;
    cursor += 1;
  }
  if (cursor >= nal.length) return null;
  return { value: value + nal[cursor], next: cursor + 1 };
};

const frameTimeOf = (nal: Uint8Array, start: number) => {
  let cursor = start;
  let found: number | null | undefined;
  while (cursor < nal.length) {
    if (nal[cursor] === 0x80 && cursor === nal.length - 1) break;
    const type = readSize(nal, cursor);
    if (!type) return found;
    const size = readSize(nal, type.next);
    if (!size) return found;
    const end = size.next + size.value;
    if (end > nal.length) return found;
    cursor = end;
    if (
      type.value !== USER_DATA_UNREGISTERED ||
      size.value < FRAME_TIME_UUID.length
    ) {
      continue;
    }
    const isOurs = FRAME_TIME_UUID.every(
      (byte, index) => nal[size.next + index] === byte,
    );
    if (!isOurs) continue;
    if (found !== undefined) return null;
    const text = String.fromCharCode(
      ...nal.subarray(size.next + FRAME_TIME_UUID.length, end),
    );
    const match = TEXT_PATTERN.exec(text);
    const wallMs = match ? Number(match[2]) : null;
    found =
      match && match[1] === FRAME_TIME_VERSION && Number.isSafeInteger(wallMs)
        ? wallMs
        : null;
  }
  return found;
};

export const parseFrameTime = (data: Uint8Array): number | null => {
  let found: number | null | undefined;
  let nalStart = -1;
  const flush = (end: number) => {
    if (nalStart < 0 || found === null) return;
    let last = end;
    while (last > nalStart && data[last - 1] === 0) last -= 1;
    if (last - nalStart < 2) return;
    const body = seiBodyStart(data[nalStart]);
    if (body === null) return;
    const result = frameTimeOf(data.subarray(nalStart, last), body);
    if (result === undefined) return;
    found = found === undefined && result !== null ? result : null;
  };
  for (let at = 0; at + 2 < data.length; at += 1) {
    if (!isStartCode(data, at)) continue;
    flush(at);
    nalStart = at + 3;
    at += 2;
  }
  flush(data.length);
  return found ?? null;
};
