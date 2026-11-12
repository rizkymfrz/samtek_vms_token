import { connection } from "next/server";
import { getMap } from "@/features/map/services/get-map";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getMap());
  } catch (error) {
    return errorResponse(error, "api/map");
  }
};
