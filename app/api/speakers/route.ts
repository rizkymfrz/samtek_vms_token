import { connection } from "next/server";
import { getSpeakers } from "@/features/speakers/services/get-speakers";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getSpeakers());
  } catch (error) {
    return errorResponse(error, "api/speakers");
  }
};
