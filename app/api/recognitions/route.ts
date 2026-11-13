import { connection } from "next/server";
import { getRecognitions } from "@/features/recognitions/services/get-recognitions";
import { UnauthorizedError } from "@/lib/auth/session";

const RECOGNIZER = /^[a-z_]{1,64}$/;

const parseTime = (value: string | null) => {
  if (value === null) return null;
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? time : Number.NaN;
};

export const GET = async (request: Request) => {
  await connection();
  const params = new URL(request.url).searchParams;
  const recognizer = params.get("recognizer") ?? "";
  const since = parseTime(params.get("since"));
  const until = parseTime(params.get("until"));
  if (
    !RECOGNIZER.test(recognizer) ||
    since === null ||
    Number.isNaN(since) ||
    Number.isNaN(until) ||
    (until !== null && since >= until)
  ) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }
  try {
    return Response.json(await getRecognitions(recognizer, { since, until }));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/recognitions]", error);
    return Response.json(
      { error: "Failed to load recognitions" },
      { status: 502 },
    );
  }
};
