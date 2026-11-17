import { isLiveSource } from "@/config/env";
import { assignServerRoleInputSchema } from "@/features/users/schemas/user";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string; userId: string }> },
) => {
  const { serverId, userId } = await params;
  if (!isLiveSource || !isValidIds(serverId, userId)) {
    return new Response(null, { status: 404 });
  }
  const body = assignServerRoleInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  try {
    await callCentral(
      "put",
      `/v1/edge-servers/${serverId}/users/${userId}`,
      body.data,
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/edge-servers user role");
  }
};
