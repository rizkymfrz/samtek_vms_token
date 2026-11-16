export const SAMPLE_RATE = 16_000;
export const CHUNK_MS = 40;
export const CHUNK_SAMPLES = (SAMPLE_RATE * CHUNK_MS) / 1000;
export const MAX_SAMPLES = 16_000;
export const SESSION_ID = /^[A-Za-z0-9._-]{1,64}$/;
const BASE64_CHUNK = 0x8000;

export const createSessionId = (userId: string, suffix: string) => {
  const safe = userId.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 24) || "user";
  return `op-${safe}-${suffix}`;
};

export const operatorOf = (sessionId: string) => {
  const match = /^op-(.+)-[0-9A-HJKMNP-TV-Z]{26}$/.exec(sessionId);
  return match ? match[1] : null;
};

export const floatToPcm16 = (input: Float32Array) => {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    out[i] =
      clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  }
  return out;
};

export const pcm16ToFloat = (input: Int16Array) => {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] / 0x8000;
  return out;
};

const isLittleEndian = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

export const pcmToBytes = (pcm: Int16Array) => {
  if (isLittleEndian) {
    return new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  }
  const bytes = new Uint8Array(pcm.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < pcm.length; i++) view.setInt16(i * 2, pcm[i], true);
  return bytes;
};

export const bytesToPcm = (bytes: Uint8Array) => {
  const out = new Int16Array(bytes.length >> 1);
  const view = new DataView(bytes.buffer, bytes.byteOffset, out.length * 2);
  for (let i = 0; i < out.length; i++) out[i] = view.getInt16(i * 2, true);
  return out;
};

export const encodeAudio = (pcm: Int16Array) => {
  const bytes = pcmToBytes(pcm);
  let binary = "";
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK));
  }
  return btoa(binary);
};

const BASE64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;

export const decodeAudio = (audio: string) => {
  if (!BASE64.test(audio)) return null;
  const binary = atob(audio);
  if (binary.length % 2 !== 0 || binary.length === 0) return null;
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const pcm = bytesToPcm(bytes);
  return pcm.length <= MAX_SAMPLES ? pcm : null;
};

export const silentChunk = (samples = CHUNK_SAMPLES) => new Int16Array(samples);

export class SeqCounter {
  private next = 0;
  take() {
    const seq = this.next;
    this.next = this.next >= 2_147_483_647 ? 0 : this.next + 1;
    return seq;
  }
}

export const isNewer = (last: number | null, seq: number) =>
  last === null || seq > last;

export class Resampler {
  private carry = new Float32Array(0);
  private position = 0;
  private readonly fromRate: number;
  private readonly toRate: number;
  constructor(fromRate: number, toRate = SAMPLE_RATE) {
    this.fromRate = fromRate;
    this.toRate = toRate;
  }
  push(input: Float32Array) {
    const source = new Float32Array(this.carry.length + input.length);
    source.set(this.carry);
    source.set(input, this.carry.length);
    if (this.fromRate === this.toRate) {
      this.carry = new Float32Array(0);
      return source;
    }
    const step = this.fromRate / this.toRate;
    const out: number[] = [];
    let pos = this.position;
    while (pos + step <= source.length) {
      const start = Math.floor(pos);
      const end = pos + step;
      let sum = 0;
      let weight = 0;
      for (let i = start; i < Math.ceil(end); i++) {
        const w = Math.min(i + 1, end) - Math.max(i, pos);
        sum += source[i] * w;
        weight += w;
      }
      out.push(weight > 0 ? sum / weight : 0);
      pos = end;
    }
    const consumed = Math.floor(pos);
    this.carry = source.slice(consumed);
    this.position = pos - consumed;
    return Float32Array.from(out);
  }
}

export class Chunker {
  private buffer = new Int16Array(0);
  private readonly size: number;
  constructor(size = CHUNK_SAMPLES) {
    this.size = size;
  }
  push(pcm: Int16Array) {
    const joined = new Int16Array(this.buffer.length + pcm.length);
    joined.set(this.buffer);
    joined.set(pcm, this.buffer.length);
    const chunks: Int16Array[] = [];
    let offset = 0;
    while (joined.length - offset >= this.size) {
      chunks.push(joined.slice(offset, offset + this.size));
      offset += this.size;
    }
    this.buffer = joined.slice(offset);
    return chunks;
  }
}
