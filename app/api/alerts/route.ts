import { getAlerts } from "@/features/alerts/services/get-alerts";
import { UnauthorizedError } from "@/lib/auth/session";

export const GET = async () => {
  try {
    return Response.json(await getAlerts());
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/alerts]", error);
    return Response.json({ error: "Failed to load alerts" }, { status: 502 });
  }
};
