const PRIVATE_HOST =
  /^(localhost|\[::1\]|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;

export const isPrivateHost = (hostname: string) => PRIVATE_HOST.test(hostname);

export const streamName = (
  deviceId: string,
  quality: "sub" | "main",
  hasSubStream: boolean,
) => `dev${deviceId}_${quality === "sub" && hasSubStream ? "sub" : "main"}`;

export const pickRelayUrl = (
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null },
  location: Pick<Location, "hostname" | "protocol">,
) => {
  const onLan = isPrivateHost(location.hostname);
  const url = onLan
    ? (relay.webrtcUrlLocal ?? relay.webrtcUrl)
    : (relay.webrtcUrl ?? relay.webrtcUrlLocal);
  if (!url) return null;
  if (location.protocol === "https:" && url.startsWith("http:")) return null;
  return url.replace(/\/+$/, "");
};
