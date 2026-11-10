import { connection } from "next/server";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { UnauthorizedError } from "@/lib/auth/session";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getCurrentUser());
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/auth/me]", error);
    return Response.json({ error: "Failed to load user" }, { status: 502 });
  }
};
