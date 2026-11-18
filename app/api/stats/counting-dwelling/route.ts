import { connection } from "next/server";
import { STATS_BUCKETS } from "@/features/analytics/schemas/counting-stats";
import {
  EdgeNotFoundError,
  getCountingStats,
} from "@/features/analytics/services/get-counting-stats";
import type { StatsBucket } from "@/features/analytics/types";
import { UnauthorizedError } from "@/lib/auth/session";

const ID = /^[A-Za-z0-9_-]{1,64}$/;

const parseTime = (value: string | null) => {
  if (value === null) return null;
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? time : Number.NaN;
};

export const GET = async (request: Request) => {
  await connection();
  const params = new URL(request.url).searchParams;
  const edgeId = params.get("edge") ?? "";
  const deviceId = params.get("device") ?? "";
  const bucket = params.get("bucket") ?? "";
  const since = parseTime(params.get("since"));
  const until = parseTime(params.get("until"));
  const utcOffsetMinutes = Number(params.get("utcOffset") ?? "0");
  if (
    !ID.test(edgeId) ||
    !ID.test(deviceId) ||
    !STATS_BUCKETS.includes(bucket as StatsBucket) ||
    since === null ||
    Number.isNaN(since) ||
    Number.isNaN(until) ||
    (until !== null && since >= until) ||
    !Number.isInteger(utcOffsetMinutes) ||
    utcOffsetMinutes < -720 ||
    utcOffsetMinutes > 840
  ) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }
  try {
    return Response.json(
      await getCountingStats({
        edgeId,
        deviceId,
        bucket: bucket as StatsBucket,
        since,
        until,
        utcOffsetMinutes,
      }),
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof EdgeNotFoundError) {
      return Response.json({ error: "Edge not found" }, { status: 404 });
    }
    console.error("[api/stats/counting-dwelling]", error);
    return Response.json(
      { error: "Failed to load statistics" },
      { status: 502 },
    );
  }
};
