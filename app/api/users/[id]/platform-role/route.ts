import { isLiveSource } from "@/config/env";
import { assignRoleInputSchema } from "@/features/users/schemas/user";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isLiveSource || !isValidIds(id)) {
    return new Response(null, { status: 404 });
  }
  const body = assignRoleInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success || (body.data.roleId && !isValidIds(body.data.roleId))) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  try {
    await callCentral("put", `/v1/users/${id}/platform-role`, body.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/users role");
  }
};
