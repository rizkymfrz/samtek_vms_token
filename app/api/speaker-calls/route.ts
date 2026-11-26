import { connection } from "next/server";
import { getSpeakerCalls } from "@/features/speakers/services/get-speaker-calls";
import { edgeErrorResponse } from "@/lib/api/edge-proxy";

export const GET = async (request: Request) => {
  await connection();
  const edgeId = new URL(request.url).searchParams.get("edgeId");
  try {
    return Response.json(await getSpeakerCalls(edgeId));
  } catch (error) {
    return edgeErrorResponse(error, "api/speaker-calls");
  }
};
