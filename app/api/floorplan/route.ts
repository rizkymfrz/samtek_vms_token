import { connection } from "next/server";
import { getFloorplan } from "@/features/floorplan/services/get-floorplan";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getFloorplan());
  } catch (error) {
    return errorResponse(error, "api/floorplan");
  }
};
