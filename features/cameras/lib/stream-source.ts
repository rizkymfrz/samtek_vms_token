const MAX_LENGTH = 2048;
const MAX_PORT = 65535;
const MAX_BODYWORN_CHANNEL = 63;
const MASKED_PASSWORD = "***";
const BODYWORN_SCHEME = "bodyworn://";
const BODYWORN_DEVICE = /^[A-Za-z0-9_-]{1,64}$/;
const BODYWORN_CHANNEL = /^[0-9]{1,2}$/;
const PASSWORD = /^[a-z][a-z0-9+.-]*:\/\/[^/?#@:]*:([^/?#@]*)@/i;
const FORBIDDEN = /[\u0000- \u007f]/;

export const STREAM_MESSAGE =
  "Use rtsp://host/path or bodyworn://<device>?channel=<0-63>&stream=main|sub.";

const isBodyworn = (value: string) => {
  const [device, query, ...extra] = value
    .slice(BODYWORN_SCHEME.length)
    .split("?");
  if (extra.length > 0 || !BODYWORN_DEVICE.test(device)) return false;
  if (query === undefined) return true;
  const seen = new Set<string>();
  return query.split("&").every((pair) => {
    const [key, entry, ...more] = pair.split("=");
    if (more.length > 0 || entry === undefined || seen.has(key)) return false;
    seen.add(key);
    return key === "channel"
      ? BODYWORN_CHANNEL.test(entry) && Number(entry) <= MAX_BODYWORN_CHANNEL
      : key === "stream" && (entry === "main" || entry === "sub");
  });
};

export const isStreamSource = (value: string) => {
  if (value.length === 0 || value.length > MAX_LENGTH) return false;
  if (FORBIDDEN.test(value)) return false;
  if (
    value.slice(0, BODYWORN_SCHEME.length).toLowerCase() === BODYWORN_SCHEME
  ) {
    return isBodyworn(value);
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "rtsp:" || url.hostname === "") return false;
  if (
    url.port !== "" &&
    (Number(url.port) < 1 || Number(url.port) > MAX_PORT)
  ) {
    return false;
  }
  return PASSWORD.exec(value)?.[1] !== MASKED_PASSWORD;
};
