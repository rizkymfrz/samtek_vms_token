import { connection } from "next/server";
import { getServers } from "@/features/servers/services/get-servers";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getServers());
  } catch (error) {
    return errorResponse(error, "api/servers");
  }
};
