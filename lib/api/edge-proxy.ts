import { UnauthorizedError } from "@/lib/auth/session";
import { EdgeError } from "./edge-client";

export const edgeErrorResponse = (error: unknown, scope: string) => {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    error instanceof EdgeError &&
    error.status !== undefined &&
    ((error.status >= 400 && error.status < 500) || error.status === 503)
  ) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(`[${scope}]`, error);
  return Response.json({ error: "Request failed" }, { status: 502 });
};
