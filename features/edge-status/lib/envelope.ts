import { ulid } from "./ulid";

export const buildEnvelope = (
  type: string,
  data: Record<string, unknown>,
  now = new Date(),
) => ({
  v: 1,
  type,
  id: ulid(now.getTime()),
  ts: now.toISOString(),
  data,
});
