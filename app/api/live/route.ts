import { connection } from "next/server";
import { getLive } from "@/features/live/services/get-live";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getLive());
  } catch (error) {
    return errorResponse(error, "api/live");
  }
};
