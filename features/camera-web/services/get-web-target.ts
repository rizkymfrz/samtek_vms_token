import { getCameraDetail } from "@/features/camera-detail";
import { requireAccessToken } from "@/lib/auth/session";
import { type WebTarget, webTarget } from "../lib/web-target";

const TTL_MS = 60_000;
const cache = new Map<string, { target: WebTarget | null; expires: number }>();

export const getWebTarget = async (id: string) => {
  const token = await requireAccessToken();
  const key = `${token}:${id}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.target;
  const detail = await getCameraDetail(id);
  const target = detail ? webTarget(detail.sourceMain) : null;
  for (const [stale, entry] of cache) {
    if (entry.expires <= Date.now()) cache.delete(stale);
  }
  cache.set(key, { target, expires: Date.now() + TTL_MS });
  return target;
};
