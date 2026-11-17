import { connection } from "next/server";
import { getPermissions } from "@/features/users/services/get-permissions";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getPermissions());
  } catch (error) {
    return errorResponse(error, "api/permissions");
  }
};
