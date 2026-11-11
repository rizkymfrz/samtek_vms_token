const SIGNALING_TIMEOUT_MS = 20_000;

export const requestAnswer = async (
  baseUrl: string,
  app: string,
  stream: string,
  offer: string,
  signal: AbortSignal,
) => {
  const response = await fetch(
    `${baseUrl}/index/api/webrtc?app=${encodeURIComponent(app)}&stream=${encodeURIComponent(stream)}&type=play`,
    {
      method: "POST",
      body: offer,
      signal: AbortSignal.any([
        signal,
        AbortSignal.timeout(SIGNALING_TIMEOUT_MS),
      ]),
    },
  );
  const body = (await response.json()) as { code?: number; sdp?: string };
  if (body.code !== 0 || !body.sdp) throw new Error("stream not available");
  return body.sdp;
};
