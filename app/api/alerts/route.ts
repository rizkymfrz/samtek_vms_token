import { connection } from "next/server";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { UnauthorizedError } from "@/lib/auth/session";

const parseTime = (value: string | null) => {
  if (value === null) return null;
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? time : Number.NaN;
};

export const GET = async (request: Request) => {
  await connection();
  const params = new URL(request.url).searchParams;
  const since = parseTime(params.get("since"));
  const until = parseTime(params.get("until"));
  if (
    Number.isNaN(since) ||
    Number.isNaN(until) ||
    (since === null && until !== null) ||
    (since !== null && until !== null && since >= until)
  ) {
    return Response.json({ error: "Invalid time range" }, { status: 400 });
  }
  try {
    return Response.json(
      await getAlerts(since === null ? undefined : { since, until }),
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/alerts]", error);
    return Response.json({ error: "Failed to load alerts" }, { status: 502 });
  }
};
