import { connection } from "next/server";
import { getCameras } from "@/features/cameras/services/get-cameras";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getCameras());
  } catch (error) {
    return errorResponse(error, "api/cameras");
  }
};
