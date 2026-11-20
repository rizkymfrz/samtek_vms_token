import type { StreamQuality } from "../types";

type Streams = { hasSubStream: boolean; hasThirdStream: boolean };

export const QUALITY_LABEL: Record<StreamQuality, string> = {
  main: "Main",
  sub: "Sub",
  third: "Third",
};

export const availableQualities = ({
  hasSubStream,
  hasThirdStream,
}: Streams): StreamQuality[] => [
  "main",
  ...(hasSubStream ? (["sub"] as const) : []),
  ...(hasThirdStream ? (["third"] as const) : []),
];

export const resolveQuality = (
  preferred: StreamQuality | undefined,
  fallback: StreamQuality,
  streams: Streams,
): StreamQuality => {
  const available = availableQualities(streams);
  if (preferred && available.includes(preferred)) return preferred;
  return available.includes(fallback) ? fallback : "main";
};
